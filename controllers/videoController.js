const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const OpenAIApi = require('openai');
const openai = new OpenAIApi({
  apiKey: 'process.env.API_KEY'
});
// const openai = new OpenAIApi(configuration);

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
        // fs.rmdirSync(directoryPath, { recursive: true });
        res.status(200).json({ message: 'Video transcription in process' });

        await transcribeVideo(outputFilePath, uploadKey);

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
  const audioFilePath = path.join(downloadFolderPath, `${uploadKey}.wav`);
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('wav')
      .on('end', resolve)
      .on('error', reject)
      .save(audioFilePath);
  });

  try {
    const transcript = await openai.createTranscription(
      fs.createReadStream(filename),
      'whisper-1'
    );

    const transcriptionText = transcript.data; // Extracting the transcription content

    // Create a JSON object to hold the transcript
    const transcriptData = {
      transcript: transcriptionText
    };

    // Specify the file path where you want to store the transcript
    const transcriptFilePath = path.join(
      downloadFolderPath,
      `${uploadKey}.txt`
    );

    // Write the transcript content to the local disk
    await fs.writeFile(
      transcriptFilePath,
      JSON.stringify(transcriptData, null, 2)
    );

    // Delete the temporary audio file
    // fs.unlinkSync(audioFilePath);

    res.status(200).json({ message: 'transcription done' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const streamBackVideo = async (req, res) => {
  const { uploadKey } = req.params;

  console.log(uploadKey);

  try {
    const videoFilePath = path.join(downloadFolderPath, `${uploadKey}.mp4`);

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
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  startUpload,
  uploadChunk,
  uploadComplete,
  streamBackVideo
};
