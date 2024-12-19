const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Google Drive setup
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // Path to your Google Cloud credentials
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

// Endpoint to upload video
app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const fileMetadata = {
      name: req.file.originalname || 'recording.webm',
      parents: [process.env.DRIVE_FOLDER_ID], // Parent folder in Google Drive
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(filePath),
    };

    // Upload the file to Google Drive
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Clean up the local file after upload
    fs.unlinkSync(filePath);

    res.status(200).json({ success: true, fileId: response.data.id });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
