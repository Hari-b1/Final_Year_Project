/**
 * FileProcessor.js
 * Handles file processing operations using ffmpeg for a Netflix-like streaming platform
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import config from './config.js';

export class FileProcessor {
  constructor() {
    this.config = config;
    
    // Create necessary directories
    [
      this.config.uploadDir, 
      this.config.processedDir, 
      this.config.thumbnailsDir
    ].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Process file with ffmpeg
   * @param {string} inputPath - Path to input file
   * @param {string} outputPath - Path for output file
   * @param {Array} options - ffmpeg command line options
   * @returns {Promise} Promise that resolves when processing is complete
   */
  processFile(inputPath, outputPath, options = []) {
    return new Promise((resolve, reject) => {
      const args = ['-i', inputPath, ...options, outputPath];
      
      const ffmpeg = spawn('ffmpeg', args);
      
      let progress = '';
      
      ffmpeg.stderr.on('data', (data) => {
        progress += data.toString();
        // Extract progress information if needed
        console.log(`ffmpeg: ${data}`);
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(progress);
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Generate thumbnail from video
   * @param {string} videoPath - Path to video file
   * @param {string} videoId - Unique video ID
   * @returns {Promise<string>} Path to the generated thumbnail
   */
  generateThumbnail(videoPath, videoId) {
    const thumbnailPath = path.join(this.config.thumbnailsDir, `${videoId}.jpg`);
    
    // Extract frame at 5 seconds into the video
    const args = [
      '-i', videoPath,
      '-ss', '00:00:05', // 5 seconds in
      '-vframes', '1',
      '-vf', 'scale=640:-1',
      thumbnailPath
    ];
    
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(thumbnailPath);
        } else {
          reject(new Error(`Thumbnail generation failed with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Setup streaming directory for a video
   * @param {string} videoId - Unique video ID
   * @returns {string} Path to the streaming directory
   */
  setupStreamingDirectory(videoId) {
    const streamingDir = path.join(this.config.processedDir, videoId);
    
    if (!fs.existsSync(streamingDir)) {
      fs.mkdirSync(streamingDir, { recursive: true });
    }
    
    return streamingDir;
  }

  /**
   * Delete all processed files for a video
   * @param {string} videoId - Unique video ID
   * @param {Object} metadata - Video metadata
   */
  deleteProcessedFiles(videoId, metadata) {
    // Delete the processed video file(s)
    if (metadata && metadata.processingType === 'streaming') {
      const videoDir = path.join(this.config.processedDir, videoId);
      if (fs.existsSync(videoDir)) {
        fs.rmSync(videoDir, { recursive: true, force: true });
      }
    } else {
      const videoPath = path.join(this.config.processedDir, `${videoId}.mp4`);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    
    // Delete thumbnail if exists
    const thumbnailPath = path.join(this.config.thumbnailsDir, `${videoId}.jpg`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
  }
}

// Export processing options for ffmpeg
export const processingOptions = {
  streaming: {
    // HLS streaming format - creates multiple quality versions and playlist
    hls: [
      '-profile:v', 'baseline', // Baseline profile for broader compatibility
      '-level', '3.0',
      '-start_number', '0',
      '-hls_time', '10', // 10-second segments
      '-hls_list_size', '0', // Keep all segments in the playlist
      '-f', 'hls' // HLS format
    ],
    // DASH streaming format
    dash: [
      '-profile:v', 'baseline',
      '-level', '3.0',
      '-bf', '1', // Use B-frames
      '-keyint_min', '48',
      '-g', '48', // GOP size
      '-sc_threshold', '0',
      '-f', 'dash'
    ]
  },
  convert: {
    video: {
      // Standard MP4 with different quality options
      toMp4Low: ['-c:v', 'libx264', '-crf', '28', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-vf', 'scale=640:-2'],
      toMp4Medium: ['-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-vf', 'scale=1280:-2'],
      toMp4High: ['-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '256k', '-vf', 'scale=1920:-2'],
      toWebm: ['-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '2M', '-c:a', 'libopus', '-b:a', '128k']
    },
    audio: {
      toMp3: ['-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k'],
      toAac: ['-vn', '-c:a', 'aac', '-b:a', '192k']
    }
  },
  encrypt: ['-c:v', 'libx264', '-preset', 'medium', '-c:a', 'aac', '-hls_key_info_file', 'enc.keyinfo']
};

