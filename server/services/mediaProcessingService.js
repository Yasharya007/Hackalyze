import axios from 'axios';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import os from 'os';
import stream from 'stream';
import { promisify } from 'util';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import { fileTypeFromBuffer } from 'file-type';

// Load environment variables
dotenv.config();

const pipeline = promisify(stream.pipeline);
const execPromise = promisify(exec);

// Get Cloudinary credentials from environment variables
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

/**
 * Service for extracting text from various media formats
 */
class MediaProcessingService {
  /**
   * Extract text content from a file based on its format
   * @param {string} fileUrl - URL to the file (e.g., Cloudinary URL)
   * @param {string} format - File format (Audio, Video, File, Image)
   * @returns {Promise<string>} - Extracted text content
   */
  async extractTextFromMedia(fileUrl, format) {
    try {
      console.log(`Processing ${format} from URL: ${fileUrl}`);
      
      // Check if this is a Cloudinary URL and add auth if needed
      const authenticatedUrl = this.getAuthenticatedUrl(fileUrl);
      
      // Download the file to a temporary location
      const tempFilePath = await this.downloadFile(authenticatedUrl);
      
      // Detect real file type from content if possible
      const detectedFormat = await this.detectFileFormat(tempFilePath, format, fileUrl);
      console.log(`Detected format: ${detectedFormat}`);
      
      // Extract text based on detected format
      let extractedText = '';
      const startTime = Date.now();
      
      switch (detectedFormat) {
        case 'PDF':
        case 'File':
          extractedText = await this.extractTextFromFile(tempFilePath, fileUrl);
          break;
        case 'Image':
          extractedText = await this.extractTextFromImage(tempFilePath);
          break;
        case 'Audio':
          extractedText = await this.extractTextFromAudio(tempFilePath);
          break;
        case 'Video':
          extractedText = await this.extractTextFromVideo(tempFilePath);
          break;
        default:
          extractedText = `[Unable to extract text from file type: ${format}]`;
      }
      
      const endTime = Date.now();
      console.log(`Extracted ${extractedText.length} characters of text`);
      console.log(`Text preview: ${extractedText.substring(0, 100)}...`);
      console.log(`Extraction took ${(endTime - startTime) / 1000} seconds`);
      
      // Clean up temporary file
      try {
        await fsPromises.unlink(tempFilePath);
      } catch (error) {
        console.error(`Error removing temp file: ${error.message}`);
      }
      
      return extractedText;
    } catch (error) {
      console.error(`Error extracting text from ${format}:`, error);
      return `Error extracting text: ${error.message}`;
    }
  }
  
  /**
   * Detect file format based on file content and extension
   * Similar to detect_file_type in model.py
   * @param {string} filePath - Path to the downloaded file
   * @param {string} providedFormat - Format provided in the request
   * @param {string} fileUrl - Original URL of the file
   * @returns {Promise<string>} - Detected format
   */
  async detectFileFormat(filePath, providedFormat, fileUrl) {
    try {
      // Try to detect file type from content
      const fileBuffer = await fsPromises.readFile(filePath);
      const fileType = await fileTypeFromBuffer(fileBuffer);
      
      // Get extension from URL or filename
      const urlExt = path.extname(fileUrl || '').toLowerCase();
      const fileExt = path.extname(filePath).toLowerCase();
      const extension = urlExt || fileExt;
      
      // Use content-based detection if available
      if (fileType) {
        const mime = fileType.mime;
        
        if (mime.startsWith('image/')) return 'Image';
        if (mime.startsWith('audio/')) return 'Audio';
        if (mime.startsWith('video/')) return 'Video';
        if (mime === 'application/pdf') return 'PDF';
      }
      
      // Fall back to extension-based detection similar to model.py
      if (['.pdf'].includes(extension)) return 'PDF';
      if (['.txt', '.csv', '.md', '.json', '.xml', '.html'].includes(extension)) return 'File';
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'].includes(extension)) return 'Image';
      if (['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'].includes(extension)) return 'Audio';
      if (['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'].includes(extension)) return 'Video';
      
      // Check URL patterns from Cloudinary
      if (fileUrl) {
        if (fileUrl.includes('/image/upload/')) {
          if (fileUrl.endsWith('.pdf')) return 'PDF';
          return 'Image';
        }
        if (fileUrl.includes('/video/upload/')) {
          if (fileUrl.endsWith('.mp3')) return 'Audio';
          return 'Video';
        }
        if (fileUrl.includes('/raw/upload/')) return 'File';
      }
      
      // If all else fails, use the provided format or default to File
      return providedFormat || 'File';
    } catch (error) {
      console.error('Error detecting file format:', error);
      return providedFormat || 'File';
    }
  }
  
  /**
   * Get authenticated URL for Cloudinary resources if needed
   * @param {string} url - Original URL
   * @returns {string} - Authenticated URL or original URL
   */
  getAuthenticatedUrl(url) {
    // Currently, all Cloudinary URLs are publicly accessible
    // This method can be enhanced later if authentication is needed
    return url;
  }
  
  /**
   * Download a file from a URL to a temporary location
   * @param {string} url - URL to download from
   * @returns {Promise<string>} - Path to the downloaded file
   */
  async downloadFile(url) {
    try {
      // Create a temporary file path
      const tempFilePath = path.join(os.tmpdir(), `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      
      // Download the file using Axios
      const response = await axios.get(url, { responseType: 'stream' });
      
      // Pipe the response to the temporary file
      await pipeline(response.data, fs.createWriteStream(tempFilePath));
      
      return tempFilePath;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
  
  /**
   * Extract text from a file (PDF or text file)
   * @param {string} filePath - Path to the file
   * @param {string} fileUrl - Original URL of the file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromFile(filePath, fileUrl) {
    try {
      const extension = path.extname(filePath).toLowerCase();
      const urlExt = fileUrl ? path.extname(fileUrl).toLowerCase() : '';
      
      // Check if it's a PDF file
      if (extension === '.pdf' || urlExt === '.pdf' || fileUrl?.includes('/image/upload/') && fileUrl?.endsWith('.pdf')) {
        const pdf = await import('pdf-parse');
        return await pdf.default(await fsPromises.readFile(filePath));
      }
      
      // For text-based files, read the content directly
      const textContent = await fsPromises.readFile(filePath, 'utf8');
      return textContent;
    } catch (error) {
      console.error('Error extracting text from file:', error);
      
      // Try reading with different encodings if utf8 fails
      try {
        const textContent = await fsPromises.readFile(filePath, 'latin1');
        return textContent;
      } catch (fallbackError) {
        console.error('Fallback encoding also failed:', fallbackError);
        return `[Unable to extract text from file: ${error.message}]`;
      }
    }
  }
  
  /**
   * Extract text from a PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromPdf(filePath) {
    try {
      const pdf = await import('pdf-parse');
      const dataBuffer = await fsPromises.readFile(filePath);
      const pdfData = await pdf.default(dataBuffer);
      return pdfData.text || '[PDF contained no extractable text]';
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return `[PDF text extraction error: ${error.message}]`;
    }
  }
  
  /**
   * Extract text from an image using OCR
   * @param {string} filePath - Path to the image file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromImage(filePath) {
    try {
      // Use Tesseract.js for OCR
      // Create Tesseract worker with multi-language support
      const worker = await createWorker();
      // Load multiple languages including English and Indic languages
      await worker.loadLanguage('eng+hin+tam+tel+kan+mal+ben+guj+mar+ori+pan');
      await worker.initialize('eng+hin+tam+tel+kan+mal+ben+guj+mar+ori+pan');
      
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      
      return text || '[No text detected in image]';
    } catch (error) {
      console.error('Error extracting text from image:', error);
      return `[Image text extraction error: ${error.message}]`;
    }
  }
  /**
   * Extract text from an audio file
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromAudio(filePath) {
    try {
      // Note: In model.py, this uses Sarvam AI's speech-to-text API
      // For now, we'll return a placeholder since we don't have a JS equivalent
      return '[Audio transcription requires a speech-to-text service. Consider using Google Cloud Speech-to-Text, AWS Transcribe, or other services.]';
    } catch (error) {
      console.error('Error extracting text from audio:', error);
      return `[Audio text extraction error: ${error.message}]`;
    }
  }
  
  /**
   * Extract text from a video file
   * @param {string} filePath - Path to the video file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromVideo(filePath) {
    try {
      // In model.py, this extracts audio from video and processes the audio
      // For now, we'll return a placeholder
      return '[Video transcription requires extracting audio and using a speech-to-text service. Consider FFMPEG for audio extraction and Google Cloud Speech-to-Text, AWS Transcribe, or other services.]';
    } catch (error) {
      console.error('Error extracting text from video:', error);
      return `[Video text extraction error: ${error.message}]`;
    }
  }
}

// Export an instance of the MediaProcessingService class
export default new MediaProcessingService();