const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const { combineChunksToVideo } = require('../middleware/combineChunkToVideo');
const os = require('os');

const userHomeDir = os.homedir();
const downloadFolderPath = path.join(userHomeDir, 'Downloads');

const generateVideoId = (req, res) => {
  const randomId = Math.random().toString(36).substring(7);
  const videoId = `helpMeOut-${randomId}`;
  res.status(200).json({ videoId });
};

const receiveVideoChunks = async (req, res) => {
  if (!req.file) {
    // Handle the case where no file was uploaded
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const chunkData = req.file.buffer;
  const { videoId, chunkIndex, isLastChunk } = req.body;

  console.log(chunkData);
  console.log(req.body);

  const directoryPath = path.join(downloadFolderPath, 'uploads');

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  const chunkFilePath = path.join(
    directoryPath,
    `${videoId}_${chunkIndex}.chunk`
  );

  fs.appendFileSync(chunkFilePath, chunkData);

  if (isLastChunk) {
    const totalChunks = chunkIndex;
    combineChunksToVideo(videoId, totalChunks);

    // const processedVideoFilePath = path.join(directoryPath, `${videoId}.mp4`);

    // // Combine all chunks into a single video file
    // const combinedBuffer = fs.readFileSync(chunkFilePath);
    // fs.writeFileSync(processedVideoFilePath, combinedBuffer);

    // const videoUrl = `${req.protocol}://${req.get(
    //   'host'
    // )}/videos/${videoId}.mp4`;
    // res.json({ videoUrl });
  } else {
    res.status(200).json({ message: 'Chunk received successfully' });
  }
};

// const receiveVideoChunks = (req, res) => {
//   const { videoId, chunkData, isLastChunk } = req.body;

//   // Save video chunks to disk
//   const chunkFilePath = path.join(__dirname, `./uploads/${videoId}.chunk`);
//   fs.appendFileSync(chunkFilePath, chunkData);

//   if (isLastChunk) {
//     // All chunks received, process the video
//     const processedVideoFilePath = path.join(
//       __dirname,
//       `./uploads/${videoId}.mp4`
//     );

//     // Use RabbitMQ for video processing (example command)
//     const process = spawn('python3', [
//       'process_video.py',
//       chunkFilePath,
//       processedVideoFilePath
//     ]);

//     process.on('exit', (code) => {
//       if (code === 0) {
//         // Video processed successfully, create a URL for it
//         const videoUrl = `${req.protocol}://${req.get(
//           'host'
//         )}/videos/${videoId}.mp4`;
//         res.json({ videoUrl });
//       } else {
//         res.status(500).json({ error: 'Video processing failed' });
//       }
//     });
//   } else {
//     res.json({ message: 'Chunk received successfully' });
//   }
// };

module.exports = {
  generateVideoId,
  receiveVideoChunks
};
