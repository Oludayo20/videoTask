````markdown
# Video Upload API Documentation

Welcome to the Video Upload API documentation for HNGxVideoStreaming. This API allows you to manage video uploads, transcriptions, and streaming. Below are the available endpoints and their descriptions.

## Base URL

The base URL for all API endpoints is `https://blue-alert-caiman.cyclic.cloud/`.

## Endpoints

### Start Video Upload

- **URL**: `/startUpload`
- **Method**: `POST`
- **Description**: Start a new video upload operation.
- **Parameters**:
  - `fileName` (string): The name of the file to upload.
- **Response**:
  - `uploadKey` (string): A unique key for the upload context.
- **Example**:
  ```http
  POST /VideoUpload/startUpload?fileName=myvideo.mp4
  ```
````

### Upload Video Chunks

- **URL**: `/UploadChunks`
- **Method**: `POST`
- **Description**: Upload video chunks for an ongoing upload operation.
- **Parameters**:
  - `uploadKey` (string): The unique key for the upload context.
- **Request Body**: Binary video chunk data.
- **Response**: Information about the upload operation.
- **Example**:
  ```http
  POST /VideoUpload/UploadChunks?uploadKey=your_upload_key_here
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
  POST /VideoUpload/UploadComplete?uploadKey=your_upload_key_here
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
  GET /VideoUpload/StreamVideo/your_upload_key_here
  ```

### Delete Video

- **URL**: `/DeleteVideo`
- **Method**: `DELETE`
- **Description**: Delete a video and associated data.
- **Parameters**:
  - `uploadKey` (string): The unique key for the upload context.
- **Response**: Information about the deletion operation.
- **Example**:
  ```http
  DELETE /VideoUpload/DeleteVideo?uploadKey=your_upload_key_here
  ```

### Get All Uploads

- **URL**: `/get-all`
- **Method**: `GET`
- **Description**: Get a list of all uploaded videos and their associated data.
- **Response**: A list of uploaded video contexts with links.
- **Example**:
  ```http
  GET /VideoUpload/get-all
  ```

## Error Handling

- If an error occurs, the API will return an error response with details in the `ErrorMessage` field.
- HTTP status codes will indicate the success or failure of each request.

- PS: To test the audio play a sound on your system while recording
