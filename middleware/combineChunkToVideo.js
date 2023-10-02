const fs = require('fs').promises;
const path = require('path');

const os = require('os');

const userHomeDir = os.homedir();
const downloadFolderPath = path.join(userHomeDir, 'Downloads');

const chunkFolder = path.join(downloadFolderPath, 'uploads');
const videoFolder = downloadFolderPath;

const combineChunksToVideo = async (videoId, totalChunks) => {
  try {
    const chunkBuffers = [];

    // Read each chunk file asynchronously and store its buffer
    for (let i = 1; i < totalChunks; i++) {
      const chunkFilePath = path.join(chunkFolder, `${videoId}_${i}.chunk`);
      const chunkBuffer = await fs.readFile(chunkFilePath);
      chunkBuffers.push(chunkBuffer);
    }

    // Concatenate chunk buffers into a single buffer
    const combinedBuffer = Buffer.concat(chunkBuffers);

    // Write the combined buffer to the video file asynchronously
    const videoFilePath = path.join(videoFolder, `${videoId}.mp4`);
    await fs.writeFile(videoFilePath, combinedBuffer);

    // Clean up: remove individual chunk files asynchronously
    const unlinkPromises = Array.from({ length: totalChunks }, (_, i) => {
      const chunkFilePath = path.join(
        chunkFolder,
        `${videoId}_${(i += 1)}.chunk`
      );
      return fs.unlink(chunkFilePath);
    });

    await Promise.all(unlinkPromises);

    // Print success message only when the video is created
    console.log(`Video ${videoId}.mp4 created successfully.`);

    return videoFilePath; // Optionally, you can return the video file path
  } catch (error) {
    console.error('Error combining chunks:', error);
    throw error; // Rethrow the error to be caught by the caller or global error handler
  }
};

module.exports = {
  combineChunksToVideo
};
