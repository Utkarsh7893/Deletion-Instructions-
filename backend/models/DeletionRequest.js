const mongoose = require('mongoose');

const deletionRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  project: {
    type: String,
    required: true,
    enum: ['lifeStream', 'agroSenseIoT', 'Centsible']
  },
  reason: {
    type: String,
    required: true
  },
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DeletionRequest', deletionRequestSchema);
