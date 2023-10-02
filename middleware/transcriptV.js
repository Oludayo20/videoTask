const fs = require('fs-extra');

const axios = require('axios');
const API_KEY = process.env.API_KEY;

const transcriptVideo = async (audioFilePath) => {
  try {
    const audioData = fs.readFileSync(audioFilePath);

    // Prepare the headers for the API request
    const headers = {
      'Content-Type': 'application/octet-stream',
      Authorization: `Token ${API_KEY}`
    };

    // Send a POST request to Deepgram API for transcription
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      audioData,
      {
        headers: headers,
        params: {
          punctuate: true,
          format: 'mp3',
          language: 'en-US'
        }
      }
    );

    console.log(response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  transcriptVideo
};
