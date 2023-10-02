const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const OpenAI = require('openai');

const openAi = new OpenAI({
  apiKey: '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'
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
      writeStream.on('finish', () => {
        // fs.rmdirSync(directoryPath, { recursive: true });
        res.status(200).json({ message: 'Video transcription in process' });

        transcribeVideo(outputFilePath, uploadKey);

        resolve;
      });
    });

    // writeStream.on('finish', () => {
    //   // fs.rmdirSync(directoryPath, { recursive: true });
    //   res.status(200).json({ message: 'Video transcription in process' });

    //   transcribeVideo(outputFilePath, uploadKey);
    // });

    res
      .status(200)
      .json({ message: 'video transcript and saved successfully' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const transcribeVideo = async (videoPath, uploadKey) => {
  // Convert video to audio (assuming videoPath is the path to the video file)
  const audioFilePath = path.join(downloadFolderPath, `${uploadKey}.mp3`);
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('mp3')
      .on('end', resolve)
      .on('error', reject)
      .save(audioFilePath);
  });

  try {
    console.log(audioFilePath);
    const transcription = await openAi.audio.transcription.create({
      file: audioFilePath,
      model: 'whisper-1'
    });

    // Whisper API response contains the transcription result
    console.log(transcription);

    // Delete the temporary audio file
    // fs.unlinkSync(audioFilePath);

    // res.status(200).json({ transcription: transcriptionResult });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const streamBackVideo = async (req, res) => {
  const stat = fs.statSync(videoFilePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoFilePath, { start, end });
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };

    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const headers = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(200, headers);
    fs.createReadStream(videoFilePath).pipe(res);
  }
};

module.exports = {
  startUpload,
  uploadChunk,
  uploadComplete,
  streamBackVideo
};
