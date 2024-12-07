const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

app.use(morgan('dev')); // Logging
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Multer configuration for file uploads
const upload = multer({ dest: '/tmp/' });

// API route for file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('Handling /api/upload POST request...');

  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    // Read the uploaded file
    const fileStream = fs.createReadStream(req.file.path);

    // Prepare form data for Pinata
    const formData = new FormData();
    formData.append('file', fileStream, req.file.originalname);

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      },
    );

    // Cleanup temporary file
    fs.unlinkSync(req.file.path);

    // Respond with the CID
    res.status(200).json({ cid: response.data.IpfsHash });
  } catch (err) {
    console.error('Pinata upload failed:', err.message);
    res.status(500).json({ error: 'Failed to upload to Pinata', details: err.message });
  }
});

// Middleware for 404 and error handling
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
