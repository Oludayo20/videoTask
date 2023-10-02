const express = require('express');
const {
  uploadChunk,
  startUpload,
  uploadComplete,
  streamBackVideo
} = require('../controllers/videoController');

const router = express.Router();

const multer = require('multer');
// Multer Configuration
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

router.post('/startUpload', startUpload);
router.post('/uploadChunks', upload.single('chunkData'), uploadChunk);
router.post('/uploadComplete', uploadComplete);
router.get('/streamVideo', streamBackVideo);

module.exports = router;
