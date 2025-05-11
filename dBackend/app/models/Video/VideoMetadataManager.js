/**
 * VideoMetadataManager.js
 * Class for managing video metadata for a Netflix-like streaming platform
 */
import path from 'path';
import fs from 'fs';
import EventEmitter from 'events';


class VideoMetadataManager extends EventEmitter {
  metadataDir = 'metadata';
  constructor() {
    super();
    this.videos = new Map();
    
    // Create metadata directory if it doesn't exist
    if (!fs.existsSync(this.metadataDir)) {
      fs.mkdirSync(this.metadataDir, { recursive: true });
    }
    
    this.loadExistingMetadata();
  }

  /**
   * Load all existing metadata from the metadata directory
   */
  loadExistingMetadata() {
    try {
      const files = fs.readdirSync(this.metadataDir);
      files.forEach(file => {
        if (path.extname(file) === '.json') {
          const data = JSON.parse(fs.readFileSync(path.join(this.metadataDir, file), 'utf8'));
          const id = path.basename(file, '.json');
          this.videos.set(id, data);
        }
      });
      console.log(`Loaded ${this.videos.size} videos from metadata storage`);
    } catch (err) {
      console.error('Error loading existing metadata:', err);
    }
  }

  /**
   * Create or update video metadata
   * @param {string} id - Unique video ID
   * @param {Object} metadata - Video metadata object
   * @returns {Object} Updated metadata
   */
  setVideoMetadata(id, metadata) {
    const updatedMetadata = {
      ...metadata,
      lastUpdated: new Date().toISOString()
    };
    
    this.videos.set(id, updatedMetadata);
    
    // Write to filesystem
    const metadataPath = path.join(this.metadataDir, `${id}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2));
    
    this.emit('metadataUpdated', id, updatedMetadata);
    return updatedMetadata;
  }

  /**
   * Get metadata for a specific video
   * @param {string} id - Video ID
   * @returns {Object|undefined} Video metadata or undefined if not found
   */
  getVideoMetadata(id) {
    return this.videos.get(id);
  }

  /**
   * Get all videos with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Array} Array of video metadata objects
   */
  getAllVideos(filters = {}) {
    let result = Array.from(this.videos.values());
    
    // Apply filters
    if (filters.category) {
      result = result.filter(video => video.category === filters.category);
    }
    
    if (filters.uploaderId) {
      result = result.filter(video => video.uploaderId === filters.uploaderId);
    }
    
    // Sort by upload date, newest first by default
    result.sort((a, b) => new Date(b.uploadTimestamp) - new Date(a.uploadTimestamp));
    
    return result;
  }

  /**
   * Search videos by title or description
   * @param {string} query - Search query
   * @returns {Array} Array of matching video metadata objects
   */
  searchVideos(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.videos.values()).filter(video => 
      (video.title && video.title.toLowerCase().includes(lowerQuery)) || 
      (video.description && video.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Update specific fields in a video's metadata
   * @param {string} id - Video ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated metadata or null if video not found
   */
  updateVideoMetadata(id, updates) {
    if (!this.videos.has(id)) {
      return null;
    }
    
    const currentMetadata = this.videos.get(id);
    const updatedMetadata = { ...currentMetadata, ...updates };
    
    return this.setVideoMetadata(id, updatedMetadata);
  }

  /**
   * Increment the view count for a video
   * @param {string} id - Video ID
   * @returns {boolean} True if successful, false if video not found
   */
  incrementViews(id) {
    if (!this.videos.has(id)) {
      return false;
    }
    
    const metadata = this.videos.get(id);
    metadata.views = (metadata.views || 0) + 1;
    this.setVideoMetadata(id, metadata);
    return true;
  }

  /**
   * Delete video metadata
   * @param {string} id - Video ID
   * @returns {boolean} True if successful, false if video not found
   */
  deleteVideoMetadata(id) {
    if (this.videos.has(id)) {
      const videoData = this.videos.get(id);
      this.videos.delete(id);
      
      // Remove from filesystem
      const metadataPath = path.join(this.metadataDir, `${id}.json`);
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }
      
      this.emit('metadataDeleted', id, videoData);
      return true;
    }
    return false;
  }
  
  /**
   * Get unique categories and their video counts
   * @returns {Array} Array of category objects with name and count
   */
  getCategories() {
    const videos = this.getAllVideos();
    const categories = [...new Set(videos.map(video => video.category || 'uncategorized'))];
    
    return categories.map(category => {
      return {
        name: category,
        count: videos.filter(video => (video.category || 'uncategorized') === category).length
      };
    });
  }
  
  /**
   * Get featured videos (most viewed)
   * @param {number} limit - Maximum number of videos to return
   * @returns {Array} Array of featured video metadata
   */
  getFeaturedVideos(limit = 5) {
    const videos = this.getAllVideos();
    
    // In a real system, you'd have sophisticated recommendation algorithms
    // For now, we'll use most viewed videos as "featured"
    return [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }
}

export default VideoMetadataManager;