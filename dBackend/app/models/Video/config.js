/**
 * config.js
 * Configuration settings for the Netflix-like streaming platform
 */
import path from 'path';
import { getDirName } from '../../utils/path.js';

const { __dirname } = getDirName(import.meta.url);



// Base directory for all storage
const storageBase = path.join(__dirname, 'storage');

// Configuration object
const config = {
  port: process.env.PORT || 3000,
  
  // Storage directories
  uploadDir: path.join(storageBase, 'uploads'),
  processedDir: path.join(storageBase, 'processed'),
  metadataDir: path.join(storageBase, 'metadata'),
  thumbnailsDir: path.join(storageBase, 'thumbnails'),
  
  // Upload limits
  maxFileSize: 500 * 1024 * 1024, // 500MB max file size
  
  // MongoDB connection (for future implementation)

  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
};

export default config;

