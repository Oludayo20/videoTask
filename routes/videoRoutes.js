const express = require('express');
const {
  receiveVideoChunks,
  startUpload,
  streamBackVideo
} = require('../controllers/videoController');

const router = express.Router();

const multer = require('multer');
// Multer Configuration
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

router.post('/startUpload', startUpload);
// router.get('/streamVideo', generateVideoId);
router.post(
  '/uploadVideo/:uploadKey',
  upload.single('chunkData'),
  receiveVideoChunks
);

module.exports = router;
