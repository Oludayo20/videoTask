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
