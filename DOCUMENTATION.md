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

## A HTML and JavaScript code example

- steps to start
- click on start upload to get key
- click on initiate Recording
- click on Start Recording
- after some minutes click on Stop Recording
- check the console for the response url to the video and transcript
  <html>
  <head>
      <meta charset="UTF-8" />
      <title>Screen Recording with client
          side javascript</title>
  </head>
  <body>

      <button class="btn btn-primary" @onclick="IncrementCount">Click me</button>
      <button class="start-btn">Start Recording</button>
      <button class="stop-btn">Stop Recording</button>
      <button class="btn btn-primary" onclick="rec()" id="startButton">initiate Recording</button>
      <button class="btn btn-primary" id="start button" onclick="startUpload('karo')">start upload to get key</button>
      <div id="resopnseId"></div>
      <script>
          var uploadKey = "";
          var baseApiUrl = "https://richkazz.bsite.net";
          var start = document.querySelector('.start-btn');
          var stop = document.querySelector('.stop-btn');
          async function startUpload(fileName) {
              const requestUri = `${baseApiUrl}/VideoUpload/startUpload?fileName=${fileName}`;
              const response = await fetch(requestUri, {
                  method: 'POST'
              });
              var res = await response.json();
              uploadKey = res.data.uploadKey;
              console.log(res);
              return res;
          }

          async function uploadChunks(uploadKey, chunkData) {
              const requestUri = `${baseApiUrl}/VideoUpload/UploadChunks?uploadKey=${uploadKey}`;
              const response = await fetch(requestUri, {
                  method: 'POST',
                  body: chunkData
              });
              return await response.json();;
          }

          async function uploadComplete(uploadKey) {
              const requestUri = `${baseApiUrl}/VideoUpload/UploadComplete?uploadKey=${uploadKey}`;
              const response = await fetch(requestUri, {
                  method: 'POST'
              });
              var res = await response.json();
              document.getElementById("resopnseId").innerHTML = res.data.videoUrl;
              console.log(res);
              return response;;
          }

          const record = document.getElementById("startButton");
          let videoId = undefined;
          // Function to convert a Blob to a byte array
          function blobToByteArray(blob, callback) {
              const reader = new FileReader();

              reader.onload = function (event) {
                  const arrayBuffer = event.target.result;
                  const byteArray = new Uint8Array(arrayBuffer);
                  callback(byteArray);
              };

              reader.readAsArrayBuffer(blob);
          }
          // Function to start screen recording

          var data = [];
          var isUploadComplete = false;
          function rec() {
              const gdmOptions = {
                  video: {
                      displaySurface: "window",
                  },
                  audio: {
                      echoCancellation: true,
                      noiseSuppression: true,
                      sampleRate: 44100,
                      suppressLocalAudioPlayback: true,
                  },
                  surfaceSwitching: "include",
                  selfBrowserSurface: "exclude",
                  systemAudio: "exclude",
              };
              // In order record the screen with system audio
              var recording = navigator.mediaDevices.getDisplayMedia({
                  video: {
                      mediaSource: 'screen',
                  },
                  audio: true,
              })
                  .then(async (e) => {

                      // For recording the mic audio
                      let audio = await navigator.mediaDevices.getUserMedia({
                          audio: true, video: false
                      })



                      // Combine both video/audio stream with MediaStream object
                      let combine = new MediaStream(
                          [...e.getTracks(), ...audio.getTracks()])

                      /* Record the captured mediastream
                      with MediaRecorder constructor */
                      let recorder = new MediaRecorder(combine);

                      start.addEventListener('click', (e) => {

                          // Starts the recording when clicked
                          recorder.start(4000);
                          alert("recording started")

                          // For a fresh start
                          data = []
                      });

                      stop.addEventListener('click', (e) => {

                          // Stops the recording
                          recorder.stop();
                          alert("recording stopped")
                      });

                      /* Push the recorded data to data array
                      when data available */
                      recorder.ondataavailable = (e) => {
                          data.push(e.data);

                          blobToByteArray(e.data, (arr) => {
                              console.log(arr);
                              uploadChunks(uploadKey, arr).then(() => {
                                  if(isUploadComplete){
                                      var result = uploadComplete(uploadKey);
                                  }

                                  console.log(result);
                              });
                          })
                      };
                      recorder.onstop = () => {

                          /* Convert the recorded audio to
                          blob type mp4 media */
                          let blobData = new Blob(data, { type: 'video/mp4' });
                          isUploadComplete = true;

                      };
                  });

          }
      </script>

  </body>

</html>

- PS: To test the audio play a sound on your system while recording
