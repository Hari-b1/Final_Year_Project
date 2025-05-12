/**
 * VideoController.js
 * Handles video-related API requests for a Netflix-like streaming platform
 */
import VideoMetadataManager from '../models/Video/VideoMetadataManager.js';
import { FileProcessor, processingOptions } from '../models/Video/FileProcessor.js';



import path from 'path';
import fs from 'fs';

class VideoController {
  /**
   * Constructor for VideoController
   * @param {VideoMetadataManager} metadataManager - Instance of VideoMetadataManager
   * @param {FileProcessor} fileProcessor - Instance of FileProcessor
   * @param {Object} config - Configuration object
   */
  constructor(metadataManager, fileProcessor, config) {
    this.metadataManager = metadataManager;
    this.fileProcessor = fileProcessor;
    this.config = config;
  }

  /**
   * Handle video upload and processing
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadVideo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const uploadedFile = req.file;
      const fileExt = path.extname(uploadedFile.originalname).toLowerCase();
      
      // Check if the file is a video
      const supportedVideoFormats = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
      if (!supportedVideoFormats.includes(fileExt)) {
        fs.unlinkSync(uploadedFile.path); // Delete the invalid file
        return res.status(400).json({ error: 'Unsupported file format. Please upload a video file.' });
      }
      
      // Create a unique video ID from the filename without extension
      const videoId = path.parse(uploadedFile.filename).name;
      
      // Get video information and metadata from request
      const { 
        title = uploadedFile.originalname, 
        description = '', 
        category = 'uncategorized',
        uploaderId,
        quality = 'medium', // low, medium, high, or adaptive
        processingType = 'streaming' // streaming, convert, encrypt
      } = req.body;
      
      // Setup paths and processing options
      let outputPath;
      let outputFormat;
      let processOptions;
      
      // Configure output based on processing type and quality
      if (processingType === 'streaming') {
        // For streaming, create HLS format by default
        const streamingDir = this.fileProcessor.setupStreamingDirectory(videoId);
        outputPath = path.join(streamingDir, 'playlist.m3u8');
        outputFormat = 'hls';
        processOptions = [...processingOptions.streaming.hls];
      } else {
        // For regular conversion
        const qualityMap = {
          'low': 'toMp4Low',
          'medium': 'toMp4Medium', 
          'high': 'toMp4High'
        };
        
        const format = qualityMap[quality] || 'toMp4Medium';
        outputPath = path.join(this.config.processedDir, `${videoId}.mp4`);
        outputFormat = format;
        processOptions = [...processingOptions.convert.video[format]];
      }
      
      // Start processing
      console.log(`Processing video ${videoId} with options:`, {
        processingType,
        quality,
        outputFormat
      });
      
      // Process the file
      await this.fileProcessor.processFile(uploadedFile.path, outputPath, processOptions);
      
      // Generate thumbnail after processing
      let thumbnailPath = '';
      try {
        thumbnailPath = await this.fileProcessor.generateThumbnail(uploadedFile.path, videoId);
        console.log(`Thumbnail generated at ${thumbnailPath}`);
      } catch (err) {
        console.error('Thumbnail generation failed:', err);
      }
      
      // Calculate streaming URL
      let streamingUrl;
      if (processingType === 'streaming') {
        streamingUrl = `/api/stream/${videoId}/playlist.m3u8`;
      } else {
        streamingUrl = `/api/videos/${videoId}`;
      }
      
      // Create rich metadata for streaming platform
      const metadata = {
        videoId,
        title,
        description,
        category,
        uploaderId: uploaderId || 'anonymous',
        uploadTimestamp: new Date().toISOString(),
        processingType,
        quality,
        duration: 0, // We'll extract this in a future enhancement
        fileSize: uploadedFile.size,
        originalFilename: uploadedFile.originalname,
        streamingUrl,
        thumbnailUrl: thumbnailPath ? `/api/thumbnails/${videoId}.jpg` : null,
        views: 0,
        likes: 0,
        status: 'available'
      };
      
      // Save to metadata manager
      this.metadataManager.setVideoMetadata(videoId, metadata);
      
      // Optionally delete the original file to save space
      if (req.body.deleteOriginal === 'true') {
        fs.unlinkSync(uploadedFile.path);
      }
      
      res.json({
        success: true,
        message: 'Video processed successfully',
        videoId,
        metadata,
        streamingUrl
      });
    } catch (error) {
      console.error('Error processing video:', error);
      res.status(500).json({ error: 'Failed to process video', details: error.message });
    }
  }

  /**
   * Get metadata for a specific video
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getVideoMetadata(req, res) {
    const videoId = req.params.id;
    const metadata = this.metadataManager.getVideoMetadata(videoId);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(metadata);
  }

  /**
   * Get all videos with filtering and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllVideos(req, res) {
    try {
      const { category, uploaderId, limit = 50, offset = 0 } = req.query;
      
      const filters = {};
      if (category) filters.category = category;
      if (uploaderId) filters.uploaderId = uploaderId;
      
      const videos = this.metadataManager.getAllVideos(filters);
      
      // Pagination
      const paginatedVideos = videos.slice(offset, offset + limit);
      
      res.json({
        total: videos.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        videos: paginatedVideos
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve videos', details: error.message });
    }
  }

  /**
   * Search for videos
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  searchVideos(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const results = this.metadataManager.searchVideos(query);
      
      res.json({
        query,
        total: results.length,
        results
      });
    } catch (error) {
      res.status(500).json({ error: 'Search failed', details: error.message });
    }
  }

  /**
   * Update video metadata
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateVideo(req, res) {
    try {
      const videoId = req.params.id;
      const currentMetadata = this.metadataManager.getVideoMetadata(videoId);
      
      if (!currentMetadata) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Only allow updating certain fields
      const allowedFields = ['title', 'description', 'category'];
      const updates = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid updates provided' });
      }
      
      // Update metadata
      const updatedMetadata = this.metadataManager.updateVideoMetadata(videoId, updates);
      
      res.json({
        success: true,
        message: 'Video updated successfully',
        metadata: updatedMetadata
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update video', details: error.message });
    }
  }

  /**
   * Delete a video and its associated files
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteVideo(req, res) {
    try {
      const videoId = req.params.id;
      const metadata = this.metadataManager.getVideoMetadata(videoId);
      
      if (!metadata) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Delete processed files
      this.fileProcessor.deleteProcessedFiles(videoId, metadata);
      
      // Delete metadata
      this.metadataManager.deleteVideoMetadata(videoId);
      
      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete video', details: error.message });
    }
  }

  /**
   * Serve video stream file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  serveStreamFile(req, res) {
    const videoId = req.params.id;
    const file = req.params.file;
    const filePath = path.join(this.config.processedDir, videoId, file);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Stream file not found' });
    }
    
    // Set appropriate content type
    if (file.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (file.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/MP2T');
    } else if (file.endsWith('.mpd')) {
      res.setHeader('Content-Type', 'application/dash+xml');
    }
    
    res.sendFile(filePath);
  }

  /**
   * Serve direct video file and increment view count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  serveVideoFile(req, res) {
    const videoId = req.params.id;
    const filePath = path.join(this.config.processedDir, `${videoId}.mp4`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Update view count
    this.metadataManager.incrementViews(videoId);
    
    res.sendFile(filePath);
  }

  /**
   * Serve video thumbnail
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  serveThumbnail(req, res) {
    const filePath = path.join(this.config.thumbnailsDir, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }
    
    res.sendFile(filePath);
  }

  /**
   * Get categories and their video counts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCategories(req, res) {
    try {
      const categories = this.metadataManager.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve categories', details: error.message });
    }
  }

  /**
   * Get featured/recommended videos
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getFeaturedVideos(req, res) {
    try {
      const { limit = 5 } = req.query;
      const featuredVideos = this.metadataManager.getFeaturedVideos(parseInt(limit));
      
      res.json({
        featured: featuredVideos
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve featured videos', details: error.message });
    }
  }

  /**
   * Get video previews with thumbnails and video links
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getVideoPreviews(req, res) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const videos = this.metadataManager.getAllVideos({});
      
      // Pagination
      const paginatedVideos = videos.slice(offset, offset + limit);
      
      // Format the response with only necessary preview information
      const previews = paginatedVideos.map(video => ({
        videoId: video.videoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        streamingUrl: video.streamingUrl,
        duration: video.duration,
        views: video.views,
        uploadTimestamp: video.uploadTimestamp
      }));
      
      res.json({
        total: videos.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        previews
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve video previews', details: error.message });
    }
  }
}

export default VideoController;