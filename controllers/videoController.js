const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const Transcript = require('../models/Transcript');
const { transcriptVideo } = require('../middleware/transcriptV');
const { convertVideoToMp3 } = require('../middleware/convertVideoToMp3');

const userHomeDir = os.homedir();
const downloadFolderPath = path.join(userHomeDir, 'Downloads');
const chunkDirectoryPath = path.join(downloadFolderPath, 'uploads');
const videoDirectoryPath = path.join(downloadFolderPath, 'helpMeOut');

const transcriptVid = async ({ videoPath, uploadKey }) => {
  // Check for duplicate uploadKey
  const duplicateUploadKey = await Transcript.findOne({ uploadKey })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicateUploadKey) {
    throw Error('Transcript already exists');
  }

  try {
    const audio = await convertVideoToMp3({ videoPath, uploadKey });

    const transcript = await transcriptVideo(audio);

    // Create and store new transcript
    const trans = await Transcript.create({
      transcript,
      uploadKey
    });

    if (trans) {
      // Delete the temporary files
      fs.unlinkSync(audio);
      fs.rmdirSync(chunkDirectoryPath, { recursive: true });
      return trans;
    }
  } catch (error) {
    throw error;
  }
};

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

    if (!uploadKey && chunkIndex && chunkData) {
      res.status(400).json({ error: 'Data not complete' });
    }

    const chunkFilePath = path.join(
      chunkDirectoryPath,
      `${uploadKey}_${Date.now()}-${chunkIndex}.tmp`
    );

    if (!fs.existsSync(chunkDirectoryPath)) {
      await fs.mkdir(chunkDirectoryPath, { recursive: true });
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

  if (!uploadKey) {
    res.status(400).json({ error: 'No uploadKey' });
  }

  if (!fs.existsSync(videoDirectoryPath)) {
    await fs.mkdir(videoDirectoryPath, { recursive: true });
  }

  try {
    const outputFilePath = path.join(videoDirectoryPath, `${uploadKey}.mp4`);

    const tempFiles = fs.readdirSync(chunkDirectoryPath).sort((a, b) => {
      const indexA = parseInt(a.split('_')[1].split('.')[0]);
      const indexB = parseInt(b.split('_')[1].split('.')[0]);
      return indexA - indexB;
    });

    const writeStream = fs.createWriteStream(outputFilePath);

    for (const tempFile of tempFiles) {
      const data = fs.readFileSync(path.join(chunkDirectoryPath, tempFile));
      await writeStream.write(data);
    }

    writeStream.end();

    await new Promise((resolve) => {
      writeStream.on('finish', async () => {
        const rTrans = await transcriptVid({
          videoPath: outputFilePath,
          uploadKey: uploadKey
        });
        resolve(rTrans);
      });
    });

    res
      .status(200)
      .json({ message: 'video transcript and saved successfully' });
  } catch (error) {
    fs.rmdirSync(videoDirectoryPath, { recursive: true });
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const streamBackVideo = async (req, res) => {
  const { uploadKey } = req.params;
  const videoFilePath = path.join(videoDirectoryPath, `${uploadKey}.mp4`);

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
      'Content-Type': 'video/mp4'
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

const streamAllVideos = async (req, res) => {
  try {
    const tempFiles = fs.readdirSync(videoDirectoryPath).sort((a, b) => {
      const indexA = parseInt(a.split('_')[1].split('.')[0]);
      const indexB = parseInt(b.split('_')[1].split('.')[0]);
      return indexA - indexB;
    });

    for (const tempFile of tempFiles) {
      const videoFilePath = path.join(videoDirectoryPath, tempFile);
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
        'Content-Type': 'video/mp4'
      };

      res.writeHead(206, headers);
      // First, send the transcript data as a JSON object

      const stream = fs.createReadStream(videoFilePath, { start, end });
      stream.pipe(res);
    }

    const transcript = await Transcript.find().lean();
    if (transcript) {
      res.write(JSON.stringify({ transcript }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  startUpload,
  uploadChunk,
  uploadComplete,
  streamBackVideo,
  streamAllVideos
};
