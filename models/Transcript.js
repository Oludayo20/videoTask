const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  transcript: {
    type: Array,
    required: true
  },
  uploadKey: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transcript', transcriptSchema);
