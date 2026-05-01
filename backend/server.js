const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const DeletionRequest = require('./models/DeletionRequest');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/delete-request', async (req, res) => {
  try {
    const { email, project, reason } = req.body;

    if (!email || !project || !reason) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Generate a random ticket ID
    const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newRequest = new DeletionRequest({
      email,
      project,
      reason,
      ticketId
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Request ticket has been raised successfully.',
      ticketId
    });
  } catch (error) {
    console.error('Error creating deletion request:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
