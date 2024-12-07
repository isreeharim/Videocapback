const express = require("express");
const multer = require("multer");
const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Multer configuration
const upload = multer({ dest: "uploads/" });

// Google Drive API setup
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json", // Replace with your credentials file
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const drive = google.drive({ version: "v3", auth });

// Endpoint to upload video
app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Upload file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: req.file.mimetype,
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath),
      },
    });

    // Delete the file locally after upload
    fs.unlinkSync(filePath);

    res.status(200).json({ success: true, fileId: response.data.id });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
