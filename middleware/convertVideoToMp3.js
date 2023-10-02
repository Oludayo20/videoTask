const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const userHomeDir = os.homedir();
const downloadFolderPath = path.join(userHomeDir, 'Downloads');

const convertVideoToMp3 = async ({ uploadKey, videoPath }) => {
  const audioFilePath = path.join(downloadFolderPath, `${uploadKey}.mp3`);

  try {
    // Attempt to access the file
    await fs.access(audioFilePath);
    console.log(`MP3 file with uploadKey '${uploadKey}' already exists.`);
  } catch (error) {
    // File doesn't exist, proceed with conversion
    console.log(`Converting video to MP3 for uploadKey '${uploadKey}'...`);
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .toFormat('mp3')
        .audioBitrate('64k') // Lower bitrate for faster conversion
        .on('end', () => {
          console.log('Conversion finished successfully');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error:', err);
          reject(err);
        })
        .save(audioFilePath);
    });
  }

  return audioFilePath;
};

module.exports = {
  convertVideoToMp3
};
