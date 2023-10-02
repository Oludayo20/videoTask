const express = require('express');
const {
  uploadChunk,
  startUpload,
  uploadComplete,
  streamBackVideo,
  streamAllVideos
} = require('../controllers/videoController');

const router = express.Router();

const multer = require('multer');
// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/startUpload', startUpload);
router.post('/uploadChunks', upload.single('chunkData'), uploadChunk);
router.post('/uploadComplete', uploadComplete);
router.get('/streamVideo/:uploadKey', streamBackVideo);
router.get('/streamAllVideos', streamAllVideos);

module.exports = router;
