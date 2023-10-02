const os = require('os');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const userHomeDir = os.homedir();
const downloadFolderPath = path.join(userHomeDir, 'Downloads');

const convertVideoToMp3 = async ({ uploadKey, videoPath }) => {
  const audioFilePath = path.join(downloadFolderPath, `${uploadKey}.mp3`);

  console.log('vid', audioFilePath);

  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('mp3')
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

  return audioFilePath;
};

module.exports = {
  convertVideoToMp3
};
