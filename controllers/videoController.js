const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const Transcript = require('../models/Transcript');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const OpenAIApi = require('openai');
const openai = new OpenAIApi({
  apiKey: process.env.API_KEY
});

const userHomeDir = os.homedir();
const downloadFolderPath = path.join(userHomeDir, 'Downloads');
const directoryPath = path.join(downloadFolderPath, 'uploads');

const startUpload = (req, res) => {
  const { fileName } = req.body;

  const randomId = Math.random().toString(36).substring(7);
  const uploadKey = `helpMeOut-${fileName}-${randomId}`;
  res.status(200).json({ uploadKey });
};

const uploadChunk = async (req, res) => {
  try {
    const { uploadKey, chunkIndex } = req.body;
    const chunkData = req.file.buffer;

    const chunkFilePath = path.join(
      directoryPath,
      `${uploadKey}_${Date.now()}-${chunkIndex}.tmp`
    );

    if (!fs.existsSync(directoryPath)) {
      await fs.mkdir(directoryPath, { recursive: true });
    }

    await fs.writeFile(chunkFilePath, chunkData);

    res.status(200).json({ message: 'Chunk received successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const uploadComplete = async (req, res) => {
  const { uploadKey } = req.body;
  console.log(req.body);

  try {
    const outputFilePath = path.join(downloadFolderPath, `${uploadKey}.mp4`);

    const tempFiles = fs.readdirSync(directoryPath).sort((a, b) => {
      const indexA = parseInt(a.split('_')[1].split('.')[0]);
      const indexB = parseInt(b.split('_')[1].split('.')[0]);
      return indexA - indexB;
    });

    const writeStream = fs.createWriteStream(outputFilePath);

    for (const tempFile of tempFiles) {
      const data = fs.readFileSync(path.join(directoryPath, tempFile));
      await writeStream.write(data);
      // fs.unlinkSync(path.join(directoryPath, tempFile));
    }

    writeStream.end();

    await new Promise((resolve) => {
      writeStream.on('finish', async () => {
        await transcribeVideo(outputFilePath, uploadKey);

        resolve;
      });
    });

    // res
    //   .status(200)
    //   .json({ message: 'video transcript and saved successfully' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const transcribeVideo = async (videoPath, uploadKey) => {
  const audioFilePath = path.join(downloadFolderPath, `${uploadKey}.mp3`);

  // Check for duplicate uploadKey
  const duplicateUploadKey = await Transcript.findOne({ uploadKey })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicateUploadKey) {
    return res.status(409).json({ message: 'Transcript already exist' });
  }

  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('mp3')
      .on('end', resolve)
      .on('error', reject)
      .save(audioFilePath);
  });

  try {
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-1'
    });

    const transcriptionText = transcript.data; // Extracting the transcription content

    console.log(transcriptionText);

    // Create and store new transcript
    const trans = await Transcript.create(userObject);

    if (trans) {
      //created
      res.status(201).json({
        message: `New transcript with the uploadKey: ${uploadKey} created`
      });
    }

    // Delete the temporary files
    fs.unlinkSync(audioFilePath);
    fs.rmdirSync(directoryPath, { recursive: true });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const streamBackVideo = async (req, res) => {
  const { uploadKey } = req.params;
  const videoFilePath = path.join(downloadFolderPath, `${uploadKey}.mp4`);

  try {
    const range = req.headers.range;
    const videoSize = fs.statSync(videoFilePath).size;
    const chunkSize = 1 * 1e6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunkSize, videoSize - 1);
    const videoLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': videoLength,
      'Content-Type': 'video/mp4' // Corrected Content-Type to 'video/mp4'
    };

    const transcript = await Transcript.findOne({ uploadKey })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

    res.writeHead(206, headers);
    // First, send the transcript data as a JSON object
    res.write(JSON.stringify({ transcript }));

    const stream = fs.createReadStream(videoFilePath, { start, end });
    stream.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  startUpload,
  uploadChunk,
  uploadComplete,
  streamBackVideo
};
