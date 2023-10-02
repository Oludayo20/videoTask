const express = require('express');
const { receiveVideoChunks } = require('../controllers/cont');

const router = express.Router();

const multer = require('multer');
// Multer Configuration
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

// router.get('/createVideo', videoController.generateVideoId);
router.post(
  '/uploadVideo/:videoId',
  upload.single('chunkData'),
  receiveVideoChunks
);

module.exports = router;
