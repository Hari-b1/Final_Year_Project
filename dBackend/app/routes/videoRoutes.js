// videoRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import VideoController from '../controllers/VideoController.js';
import VideoMetadataManager from '../models/Video/VideoMetadataManager.js';
import { FileProcessor } from '../models/Video/FileProcessor.js';
import config from '../models/Video/config.js';
import auth from '../middlewares/auth.js';
import { dirname } from 'path';

// Setup storage for video upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Make sure to create the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Create instances of the controllers
const metadataManager = new VideoMetadataManager();
const fileProcessor = new FileProcessor();
// const config = { processedDir: 'processed_videos', thumbnailsDir: 'thumbnails' };
const videoController = new VideoController(metadataManager, fileProcessor, config);

// Route to upload video
router.post('/upload', auth, upload.single('videoFile'), (req, res) => {
  console.log('File uploaded:', req.file);
  videoController.uploadVideo(req, res);
});

// Route to get video metadata
router.get('/videos/:id', auth, (req, res) => {
  console.log('Fetching metadata for video ID:', req.params.id);
  videoController.getVideoMetadata(req, res);
});

// Route to serve the video stream
router.get('/stream/:id/:file',auth, (req, res) => {
  videoController.serveStreamFile(req, res);
});

// Route to serve the video file
router.get('/videos/:id',auth, (req, res) => {
  videoController.serveVideoFile(req, res);
});

// Route to serve the video thumbnail
router.get('/thumbnails/:filename',auth, (req, res) => {
  videoController.serveThumbnail(req, res);
});

// Route to get video previews
router.get('/previews', auth, (req, res) => {
  videoController.getVideoPreviews(req, res);
});

// Route to get categories
router.get('/categories',auth, (req, res) => {
  videoController.getCategories(req, res);
});

// Route to get featured videos
router.get('/featured',auth, (req, res) => {
  videoController.getFeaturedVideos(req, res);
});

export default router;
