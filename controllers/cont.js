const fs = require('fs-extra');
const streamToBuffer = require('fast-stream-to-buffer');
const path = require('path');
const os = require('os');
const axios = require('axios');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const OpenAI = require('openai');

const openAi = new OpenAI({
  apiKey: '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'
});

const userHomeDir = os.homedir();
const downloadFolderPath = path.join(userHomeDir, 'Downloads');

// const receiveVideoChunks = async (req, res) => {
//   try {
//     const { videoId, isLastChunk, chunkIndex } = req.body;
//     const chunkData = req.file.buffer;
//     const directoryPath = path.join(downloadFolderPath, 'uploads');
//     const chunkFilePath = path.join(
//       directoryPath,
//       `${videoId}_${Date.now()}-${chunkIndex}.tmp`
//     );

//     if (!fsPromises.existsSync(directoryPath)) {
//       await fsPromises.mkdir(directoryPath, { recursive: true });
//     }

//     await fsPromises.writeFile(chunkFilePath, chunkData);

//     if (isLastChunk) {
//       const videoPath = path.join(downloadFolderPath, `${videoId}.mp4`);
//       const tempFiles = await fsPromises.readdir(directoryPath);

//       // Sort temp files based on index
//       tempFiles.sort((a, b) => {
//         const indexA = parseInt(a.split('_')[1].split('.')[0]);
//         const indexB = parseInt(b.split('_')[1].split('.')[0]);
//         return indexA - indexB;
//       });

//       const writeStream = fs.createWriteStream(videoPath);

//       for (const tempFile of tempFiles) {
//         const data = await fsPromises.readFile(
//           path.join(directoryPath, tempFile)
//         );
//         writeStream.write(data);
//         await fsPromises.unlink(path.join(directoryPath, tempFile));
//       }

//       writeStream.end();

//       writeStream.on('finish', async () => {
//         await fsPromises.rmdir(directoryPath, { recursive: true });
//         res
//           .status(200)
//           .json({ message: 'Video received and saved successfully' });
//       });
//     } else {
//       res.status(200).json({ message: 'Chunk received successfully' });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const receiveVideoChunks = async (req, res) => {
//   try {
//     const { videoId, isLastChunk, chunkIndex } = req.body;
//     const chunkData = req.file.buffer;

//     const directoryPath = path.join(downloadFolderPath, 'uploads');
//     const chunkFilePath = path.join(
//       directoryPath,
//       `${videoId}_${Date.now()}-${chunkIndex}.tmp`
//     );

//     if (!fs.existsSync(directoryPath)) {
//       fs.mkdirSync(directoryPath, { recursive: true });
//     }

//     fs.writeFileSync(chunkFilePath, chunkData);

//     if (isLastChunk) {
//       const videoPath = path.join(downloadFolderPath, `${videoId}.mp4`);
//       const tempFiles = fs.readdirSync(directoryPath).sort((a, b) => {
//         const indexA = parseInt(a.split('_')[1].split('.')[0]);
//         const indexB = parseInt(b.split('_')[1].split('.')[0]);
//         return indexA - indexB;
//       });

//       const writeStream = fs.createWriteStream(videoPath);

//       for (const tempFile of tempFiles) {
//         const data = fs.readFileSync(path.join(directoryPath, tempFile));
//         writeStream.write(data);
//         // fs.unlinkSync(path.join(directoryPath, tempFile));
//       }

//       writeStream.end();

//       writeStream.on('finish', async () => {
//         // fs.rmdirSync(directoryPath, { recursive: true });
//         // res
//         //   .status(200)
//         //   .json({ message: 'Video received and saved successfully' });

//         await transcribeVideo(videoId, videoPath);
//       });
//     } else {
//       res.status(200).json({ message: 'Chunk received successfully' });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const receiveVideoChunks = async (req, res) => {
  try {
    const { videoId, isLastChunk, chunkIndex } = req.body;
    const chunkData = req.file.buffer;
    const directoryPath = path.join(downloadFolderPath, 'uploads');

    const chunkFilePath = path.join(
      directoryPath,
      `${videoId}_${Date.now()}-${chunkIndex}.tmp`
    );

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    fs.writeFileSync(chunkFilePath, chunkData);

    const outputFilePath = path.join(downloadFolderPath, `${videoId}.mp4`);

    if (isLastChunk == true) {
      const tempFiles = fs.readdirSync(directoryPath).sort((a, b) => {
        const indexA = parseInt(a.split('_')[1].split('.')[0]);
        const indexB = parseInt(b.split('_')[1].split('.')[0]);
        return indexA - indexB;
      });

      const writeStream = fs.createWriteStream(outputFilePath);

      for (const tempFile of tempFiles) {
        const data = fs.readFileSync(path.join(directoryPath, tempFile));
        writeStream.write(data);
        // fs.unlinkSync(path.join(directoryPath, tempFile));
      }

      writeStream.end();

      writeStream.on('finish', () => {
        // fs.rmdirSync(directoryPath, { recursive: true });
        res.status(200).json({ message: 'Video transcription in process' });
      });
    } else {
      res.status(200).json({ message: 'Chunk received successfully' });
    }

    transcribeVideo(outputFilePath, videoId);
  } catch (error) {
    console.error('Error:', error);
    // res.status(500).json({ error: 'Internal server error' });
  }
};

const transcribeVideo = async (videoPath, videoId) => {
  // Convert video to audio (assuming videoPath is the path to the video file)
  const audioFilePath = path.join(downloadFolderPath, `${videoId}.mp3`);
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
    // res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  receiveVideoChunks
};
