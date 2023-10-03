````markdown
# Video Upload API Documentation

Welcome to the Video Upload API documentation for HNGxVideoStreaming. This API allows you to manage video uploads, transcriptions, and streaming. Below are the available endpoints and their descriptions.

## Base URL

The base URL for all API endpoints is `https://blue-alert-caiman.cyclic.cloud/api`.

## Endpoints

### Start Video Upload

- **URL**: `/startUpload`
- **Method**: `POST`
- **Description**: Start a new video upload operation.
- **Request Body**:
  - `fileName` (string): The name of the file to upload.
- **Response**:
  - `uploadKey` (string): A unique key for the upload context.
- **Example**:
  ```http
  POST /video/startUpload?fileName=myvideo.mp4
  ```
````

### Upload Video Chunks

- **URL**: `/UploadChunks`
- **Method**: `POST`
- **Description**: Upload video chunks for an ongoing upload operation.
- **Request Body**:
  - `uploadKey` (string): The unique key for the upload context and Binary video chunk data.
- **Response**: Information about the upload operation.
- **Example**:
  ```http
  POST /video/UploadChunks?uploadKey=your_upload_key_here
  ```

### Complete Video Upload

- **URL**: `/UploadComplete`
- **Method**: `POST`
- **Description**: Complete a video upload, merge chunks, and extract audio.
- **Parameters**:
  - `uploadKey` (string): The unique key for the upload context.
- **Response**:
  - `videoUrl` (string): The URL to access the uploaded video.
  - `transcribe` (array): An array of transcribed data.
- **Example**:
  ```http
  POST /video/UploadComplete?uploadKey=your_upload_key_here
  ```

### Stream Video

- **URL**: `/StreamVideo/{uploadKey}`
- **Method**: `GET`
- **Description**: Stream a video by providing the upload key.
- **Parameters**:
  - `uploadKey` (string): The unique key for the upload context.
- **Response**: Video stream.
- **Example**:

  ```http
  GET /video/StreamVideo/your_upload_key_here
  ```

  ### Stream All Video

- **URL**: `/StreamAllVideo`
- **Method**: `GET`
- **Description**: Stream a video by providing the upload key.
- **Response**: Video stream.
- **Example**:
  ```http
  GET /video/StreamAllVideo
  ```

## Error Handling

- If an error occurs, the API will return an error response with details in the `ErrorMessage` field.
- HTTP status codes will indicate the success or failure of each request.

- PS: To test the audio play a sound on your system while recording

## A React code example

### A React code to upload chunk

import React, { useState } from 'react';
import axios from 'axios';

const VideoUploader = () => {
const [video, setVideo] = useState(null);

const handleVideoChange = (event) => {
const selectedVideo = event.target.files[0];
setVideo(selectedVideo);
};

const handleUpload = async () => {
const chunkSize = 2024 \* 2024; // 1MB chunk size (adjust as needed)
const totalChunks = Math.ceil(video.size / chunkSize);
let currentChunk = 1;

    const fileReader = new FileReader();

    fileReader.onloadend = async () => {
      const chunkData = fileReader.result;

      try {
        const response = await axios.post(
          'http://localhost:3500/api/video/uploadChunks',
          {
            uploadKey: 'helpMeOut-8vdwm',
            chunkData: chunkData,
            chunkIndex: currentChunk
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        console.log('Video URL:', response);
      } catch (error) {
        console.error('Error uploading video:', error);
      }

      if (currentChunk < totalChunks) {
        currentChunk++;
        readNextChunk();
      }
    };

    const readNextChunk = () => {
      const start = (currentChunk - 1) * chunkSize;
      const end = Math.min(start + chunkSize, video.size);
      const blob = video.slice(start, end);
      fileReader.readAsArrayBuffer(blob);
    };

    readNextChunk();

};

const complete = async () => {
try {
const response = await axios.post(
'http://localhost:3500/api/video/uploadComplete',
{
uploadKey: 'helpMeOut-8vdwm'
}
);

      console.log('Video URL:', response);
    } catch (error) {
      console.error('Error uploading video:', error);
    }

};

return (

<div>
<input type="file" onChange={handleVideoChange} accept="video/*" />
<button onClick={handleUpload}>Upload Video</button>
<button onClick={complete}>complete</button>
</div>
);
};

export default VideoUploader;

### To Stream Video

import React, { useEffect, useRef, useState } from 'react';

const VideoPlayer = () => {
const videoRef = useRef(null);
const [transcript, setTranscript] = useState('');

useEffect(() => {
if (videoRef.current) {
}
}, []);

return (

<div>
<h2>Transcript:</h2>
<p>{transcript}</p>

      <h2>Video:</h2>
      <video ref={videoRef} width="640" height="360" controls autoPlay>
        <source
          src={'http://localhost:3500/api/video/streamVideo/helpMeOut-8vdwm'}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>

);
};

export default VideoPlayer;
