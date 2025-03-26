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
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

// Google Cloud imports
import { SpeechClient } from '@google-cloud/speech';
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Storage } from '@google-cloud/storage';

// Load environment variables
dotenv.config();

const pipeline = promisify(stream.pipeline);
const execPromise = promisify(exec);

// Configure ffmpeg with static binary path
ffmpeg.setFfmpegPath(ffmpegPath);

// Get Cloudinary credentials from environment variables
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

// Google Cloud configuration
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const GOOGLE_CLOUD_STORAGE_BUCKET = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'hackalyze-media-processing';

// Supported languages including Indic languages
const SUPPORTED_LANGUAGES = {
  english: 'en-US',
  hindi: 'hi-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  bengali: 'bn-IN',
  gujarati: 'gu-IN',
  marathi: 'mr-IN',
  punjabi: 'pa-IN',
  urdu: 'ur-IN'
};

/**
 * Service for extracting text from various media formats
 */
class MediaProcessingService {
  constructor() {
    // Initialize Google Cloud clients if credentials are available
    this.initializeGoogleCloudClients();
  }

  /**
   * Initialize Google Cloud clients if credentials are available
   */
  initializeGoogleCloudClients() {
    try {
      if (GOOGLE_APPLICATION_CREDENTIALS) {
        // Either parse the credentials from environment variable or load from file path
        let credentials;
        try {
          if (GOOGLE_APPLICATION_CREDENTIALS.startsWith('{')) {
            // Looks like JSON string
            credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS);
          } else {
            // Assume it's a file path
            const credentialsPath = GOOGLE_APPLICATION_CREDENTIALS;
            if (fs.existsSync(credentialsPath)) {
              credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
              console.log('Successfully loaded credentials from file');
            } else {
              throw new Error(`Credentials file not found at: ${credentialsPath}`);
            }
          }
        } catch (parseError) {
          console.error('Error parsing Google Cloud credentials:', parseError);
          throw parseError;
        }

        const clientConfig = {
          projectId: GOOGLE_CLOUD_PROJECT_ID || credentials.project_id,
          credentials
        };

        // Initialize each client separately with error handling
        try {
          this.visionClient = new ImageAnnotatorClient(clientConfig);
          console.log('Google Cloud Vision client initialized successfully');
        } catch (visionError) {
          console.error('Failed to initialize Vision API client:', visionError);
          this.visionClient = null;
        }

        try {
          this.speechClient = new SpeechClient(clientConfig);
          console.log('Google Cloud Speech client initialized successfully');
        } catch (speechError) {
          console.error('Failed to initialize Speech API client:', speechError);
          this.speechClient = null;
        }

        try {
          this.videoIntelligenceClient = new VideoIntelligenceServiceClient(clientConfig);
          console.log('Google Cloud Video Intelligence client initialized successfully');
        } catch (videoError) {
          console.error('Failed to initialize Video Intelligence API client:', videoError);
          this.videoIntelligenceClient = null;
        }

        try {
          this.storageClient = new Storage(clientConfig);
          console.log('Google Cloud Storage client initialized successfully');
        } catch (storageError) {
          console.error('Failed to initialize Storage client:', storageError);
          this.storageClient = null;
        }
        
      } else {
        console.log('Google Cloud credentials not found. Will use fallback methods.');
      }
    } catch (error) {
      console.error('Error initializing Google Cloud clients:', error);
      console.log('Will use fallback methods for media processing');
    }
  }

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
        // Use the enhanced PDF text extraction method based on image processing
        return await this.extractTextFromPdfEnhanced(filePath);
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
   * Enhanced PDF text extraction using page-by-page image processing
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromPdfEnhanced(filePath) {
    try {
      console.log('Using enhanced PDF text extraction (page-by-page image processing with pdf-to-img)');
      
      // Import the pdf function from pdf-to-img
      const { pdf } = await import('pdf-to-img');
      
      // Get PDF document with high scale for better quality
      const document = await pdf(filePath, { scale: 3.0 });
      console.log(`PDF has ${document.length} pages. Processing each page as an image...`);
      
      // Process each page
      let allPageText = [];
      let pageNum = 1;
      
      // Process pages as image streams
      for await (const imageBuffer of document) {
        try {
          console.log(`Processing page ${pageNum}...`);
          
          // Save the image buffer to a temporary file
          const tempImagePath = path.join(os.tmpdir(), `pdf-page-${Date.now()}-${pageNum}.png`);
          await fsPromises.writeFile(tempImagePath, imageBuffer);
          
          console.log(`Extracting text from page ${pageNum} image (${tempImagePath})`);
          
          // Use our existing image text extraction capability
          const pageText = await this.extractTextFromImage(tempImagePath);
          
          // Add page number for context
          allPageText.push(`[Page ${pageNum}]\n${pageText}`);
          
          // Clean up the temporary image file
          await fsPromises.unlink(tempImagePath).catch(e => 
            console.warn(`Warning: Could not delete temporary page image: ${e.message}`)
          );
          
          pageNum++;
        } catch (pageError) {
          console.error(`Error processing page ${pageNum}:`, pageError);
          allPageText.push(`[Page ${pageNum}: Error extracting text: ${pageError.message}]`);
          pageNum++;
        }
      }
      
      // Combine all page texts
      const fullText = allPageText.join('\n\n');
      console.log(`Extracted ${fullText.length} characters from ${document.length} PDF pages`);
      
      return fullText || '[PDF contained no extractable text]';
    } catch (error) {
      console.error('Error in enhanced PDF text extraction:', error);
      
      // Fallback to basic text extraction if the image approach fails
      try {
        console.log('Falling back to basic text extraction for PDF');
        const textContent = await fsPromises.readFile(filePath, 'utf8');
        if (textContent && textContent.length > 0) {
          return textContent;
        }
      } catch (readError) {
        console.error('Fallback text extraction failed:', readError);
      }
      
      return `[PDF text extraction error: ${error.message}]`;
    }
  }
  
  /**
   * Extract text from an image using Google Cloud Vision API or Tesseract.js as fallback
   * @param {string} filePath - Path to the image file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromImage(filePath) {
    try {
      // Try Google Cloud Vision API first if available
      if (this.visionClient) {
        console.log('Using Google Cloud Vision API for image text extraction');
        return await this.extractTextFromImageWithGoogleVision(filePath);
      } else {
        console.log('Google Cloud Vision API not available. Using Tesseract.js fallback.');
        return await this.extractTextFromImageWithTesseract(filePath);
      }
    } catch (error) {
      console.error('Error extracting text from image:', error);
      // Try Tesseract fallback if Google Vision fails
      try {
        console.log('Google Cloud Vision failed. Falling back to Tesseract.js');
        return await this.extractTextFromImageWithTesseract(filePath);
      } catch (fallbackError) {
        console.error('All image text extraction methods failed:', fallbackError);
        return `[Image text extraction error: ${error.message}]`;
      }
    }
  }
  
  /**
   * Extract text from an image using Google Cloud Vision API
   * @param {string} filePath - Path to the image file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromImageWithGoogleVision(filePath) {
    try {
      console.log('Reading image file for Google Cloud Vision API');
      const imageContent = await fsPromises.readFile(filePath);
      
      // Configure the request for multiple language detection
      const features = [
        { type: 'TEXT_DETECTION' },
        { type: 'DOCUMENT_TEXT_DETECTION' }
      ];
      
      const imageContext = {
        languageHints: Object.values(SUPPORTED_LANGUAGES)
      };
      
      const request = {
        image: {
          content: imageContent.toString('base64')
        },
        features,
        imageContext
      };
      
      console.log('Sending request to Google Cloud Vision API');
      const [result] = await this.visionClient.annotateImage(request);
      
      if (result.error) {
        console.error('Error from Google Cloud Vision API:', result.error);
        throw new Error(result.error.message);
      }
      
      // Get the full text from the response
      // Try document text detection first (better for structured documents)
      let extractedText = '';
      if (result.fullTextAnnotation && result.fullTextAnnotation.text) {
        extractedText = result.fullTextAnnotation.text;
        console.log('Successfully extracted text using DOCUMENT_TEXT_DETECTION');
      } 
      // Fallback to regular text detection
      else if (result.textAnnotations && result.textAnnotations.length > 0) {
        extractedText = result.textAnnotations[0].description;
        console.log('Successfully extracted text using TEXT_DETECTION');
      }
      
      // Clean up the text (remove excessive newlines, etc.)
      extractedText = this.cleanExtractedText(extractedText);
      
      console.log(`Extracted ${extractedText.length} characters of text from image using Google Cloud Vision`);
      return extractedText || '[No text detected in image]';
    } catch (error) {
      console.error('Error in Google Cloud Vision API text extraction:', error);
      throw error; // Let the caller handle the fallback
    }
  }
  
  /**
   * Extract text from an image using Tesseract.js as fallback
   * @param {string} filePath - Path to the image file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromImageWithTesseract(filePath) {
    try {
      console.log('Using Tesseract.js for OCR as fallback method');
      // Use Tesseract.js for OCR
      const worker = await createWorker({
        logger: m => console.log(m)
      });
      
      // Configure for multiple languages including Indic languages
      // Note: This requires the appropriate language data files
      await worker.load();
      
      // Try to load multiple languages if available
      try {
        // First try with multiple languages
        const langString = 'eng+hin+tam+tel+kan+mal+ben+guj+mar+pan';
        await worker.loadLanguage(langString);
        await worker.initialize(langString);
      } catch (langError) {
        console.warn('Could not load all languages, falling back to English only:', langError.message);
        // Fallback to English only
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
      }
      
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      
      const extractedText = this.cleanExtractedText(text);
      console.log(`Extracted ${extractedText.length} characters of text from image using Tesseract.js`);
      return extractedText || '[No text detected in image with Tesseract]';
    } catch (error) {
      console.error('Error extracting text with Tesseract:', error);
      
      // Simplified fallback method if the above fails
      try {
        console.log('Attempting simplified Tesseract OCR method...');
        const { createWorker } = await import('tesseract.js');
        const simplifiedWorker = await createWorker();
        const result = await simplifiedWorker.recognize(filePath);
        await simplifiedWorker.terminate();
        const extractedText = this.cleanExtractedText(result.data.text);
        return extractedText || '[No text detected with simplified Tesseract method]';
      } catch (fallbackError) {
        console.error('All Tesseract OCR methods failed:', fallbackError);
        throw error; // Let the caller handle it
      }
    }
  }
  
  /**
   * Clean up extracted text (remove excessive whitespace, normalize)
   * @param {string} text - Raw extracted text
   * @returns {string} - Cleaned text
   */
  cleanExtractedText(text) {
    if (!text) return '';
    
    // Replace multiple newlines with a single one
    let cleaned = text.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  /**
   * Extract text from an audio file using Google Cloud Speech-to-Text
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromAudio(filePath) {
    try {
      // Check if the Google Cloud Speech client is available
      if (!this.speechClient) {
        console.log('Google Cloud Speech client not available. Using fallback method.');
        return this.extractTextFromAudioFallback(filePath);
      }
      
      console.log('Speech client is available, attempting to process audio file');
      
      // Read the audio file
      const audioBytes = await fsPromises.readFile(filePath);
      
      // Get audio format and convert if necessary
      let audioInfo;
      try {
        audioInfo = await this.getAudioInfo(filePath);
        console.log(`Audio info: Format=${audioInfo.format}, SampleRate=${audioInfo.sampleRate}, Channels=${audioInfo.channels}`);
      } catch (audioInfoError) {
        console.error('Failed to get audio info:', audioInfoError);
        // Default values if we can't detect
        audioInfo = { format: 'UNKNOWN', sampleRate: 16000, channels: 1 };
      }
      
      // Convert to a supported format if needed
      let processedFilePath = filePath;
      if (!['WAV', 'FLAC', 'OGG'].includes(audioInfo.format)) {
        console.log(`Converting audio from ${audioInfo.format} to WAV format for Google Cloud Speech`);
        try {
          processedFilePath = await this.convertAudioToWav(filePath);
          console.log(`Converted audio file saved at: ${processedFilePath}`);
        } catch (conversionError) {
          console.error('Audio conversion failed:', conversionError);
          return this.extractTextFromAudioFallback(filePath);
        }
      }
      
      // Read the processed audio file
      console.log('Reading processed audio file');
      const processedAudioBytes = await fsPromises.readFile(processedFilePath);
      
      // Set appropriate encoding based on the audio format
      const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: audioInfo.sampleRate || 16000,
        // Enable multi-language detection with emphasis on specified languages
        languageCode: 'en-US', // Primary language
        alternativeLanguageCodes: Object.values(SUPPORTED_LANGUAGES).slice(0, 4), // Limit to a few languages to avoid API limitations
        enableAutomaticPunctuation: true,
        model: 'default'
      };
      
      const audio = {
        content: processedAudioBytes.toString('base64')
      };
      
      const request = {
        config,
        audio
      };
      
      console.log('Sending request to Google Cloud Speech-to-Text with multi-language support');
      console.log('Request config:', JSON.stringify(config, null, 2));
      
      try {
        const [response] = await this.speechClient.recognize(request);
        
        // Clean up temporary file if created
        if (processedFilePath !== filePath) {
          await fsPromises.unlink(processedFilePath).catch(e => console.error(`Error removing temp file: ${e.message}`));
        }
        
        // Extract transcription from response
        if (!response.results || response.results.length === 0) {
          console.warn('Speech API returned empty results');
          return '[No speech detected in audio]';
        }
        
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');
        
        console.log(`Transcription complete. Length: ${transcription.length} characters`);
        return transcription || '[No speech detected in audio]';
      } catch (apiError) {
        console.error('Google Cloud Speech API error:', apiError);
        // Clean up temp file even on error
        if (processedFilePath !== filePath) {
          await fsPromises.unlink(processedFilePath).catch(() => {});
        }
        return `[Audio transcription error: ${apiError.message}]`;
      }
    } catch (error) {
      console.error('Error extracting text from audio:', error);
      // Try fallback method
      return this.extractTextFromAudioFallback(filePath);
    }
  }

  /**
   * Fallback method for audio transcription when Google Cloud is unavailable
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<string>} - Message indicating fallback
   */
  async extractTextFromAudioFallback(filePath) {
    console.log('Using audio transcription fallback method');
    try {
      // Try to get some basic information about the audio file
      const audioInfo = await this.getAudioInfo(filePath).catch(() => null);
      
      if (audioInfo) {
        const durationMinutes = Math.floor(audioInfo.duration / 60);
        const durationSeconds = Math.floor(audioInfo.duration % 60);
        
        return `[This is an audio file (${audioInfo.format}) with duration of approximately ${durationMinutes}m${durationSeconds}s. ` +
          `The content could not be automatically transcribed due to Speech-to-Text API limitations. ` +
          `The audio has ${audioInfo.channels} channel(s) at ${audioInfo.sampleRate}Hz.]`;
      }
      
      return '[This is an audio file that may contain spoken content. ' +
        'Audio content could not be automatically transcribed at this time.]';
    } catch (error) {
      return '[Audio file detected. Contents could not be automatically transcribed.]';
    }
  }
  
  /**
   * Extract text from a video file using Google Cloud Video Intelligence
   * @param {string} filePath - Path to the video file
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromVideo(filePath) {
    try {
      // First try to extract audio from video for transcription
      const audioTrackText = await this.extractAudioFromVideoAndTranscribe(filePath);
      
      // If Google Cloud Video Intelligence client is not available, return audio track text only
      if (!this.videoIntelligenceClient) {
        console.log('Google Cloud Video Intelligence client not available. Using audio track only.');
        return audioTrackText || '[No audio track found in video]';
      }
      
      // Upload video to Google Cloud Storage for processing
      const gcsUri = await this.uploadFileToGcs(filePath);
      console.log(`Uploaded video to Google Cloud Storage: ${gcsUri}`);
      
      // Configure video intelligence features
      const request = {
        inputUri: gcsUri,
        features: ['TEXT_DETECTION', 'SPEECH_TRANSCRIPTION'],
        videoContext: {
          speechTranscriptionConfig: {
            languageCode: 'en-US',
            alternativeLanguageCodes: Object.values(SUPPORTED_LANGUAGES), // Add support for Indic languages
            enableAutomaticPunctuation: true,
          },
        },
      };
      
      console.log('Sending request to Google Cloud Video Intelligence with multi-language support');
      const [operation] = await this.videoIntelligenceClient.annotateVideo(request);
      console.log('Waiting for operation to complete...');
      
      const [operationResult] = await operation.promise();
      const annotations = operationResult.annotationResults[0];
      
      let textDetections = '';
      if (annotations.textAnnotations && annotations.textAnnotations.length > 0) {
        textDetections = annotations.textAnnotations
          .map(annotation => annotation.text)
          .join('\n');
        
        console.log(`Detected ${annotations.textAnnotations.length} text segments in video`);
      }
      
      let speechTranscription = '';
      if (annotations.speechTranscriptions && annotations.speechTranscriptions.length > 0) {
        speechTranscription = annotations.speechTranscriptions
          .map(transcription => 
            transcription.alternatives[0].transcript
          )
          .join(' ');
        
        console.log(`Speech transcription complete. Length: ${speechTranscription.length} characters`);
      }
      
      // Clean up GCS file
      await this.deleteFileFromGcs(filePath);
      
      // Combine all text sources
      const combinedText = [
        textDetections ? `== TEXT DETECTED IN VIDEO ==\n${textDetections}` : '',
        speechTranscription ? `== SPEECH TRANSCRIPTION ==\n${speechTranscription}` : '',
        audioTrackText ? `== AUDIO TRACK TRANSCRIPTION ==\n${audioTrackText}` : ''
      ].filter(Boolean).join('\n\n');
      
      return combinedText || '[No text or speech detected in video]';
    } catch (error) {
      console.error('Error extracting text from video:', error);
      // Try fallback method - just extract audio
      return this.extractAudioFromVideoAndTranscribe(filePath);
    }
  }
  
  /**
   * Extract audio from a video file and transcribe it
   * @param {string} videoPath - Path to the video file
   * @returns {Promise<string>} - Transcribed text from audio
   */
  async extractAudioFromVideoAndTranscribe(videoPath) {
    try {
      console.log('Extracting audio from video file');
      const audioPath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);
      
      // Extract audio using ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .outputOptions(['-ab 160k', '-ac 2', '-ar 44100', '-vn'])
          .save(audioPath)
          .on('end', () => {
            console.log('Audio extraction complete');
            resolve();
          })
          .on('error', (err) => {
            console.error('Error extracting audio:', err);
            reject(err);
          });
      });
      
      // Transcribe the extracted audio
      const transcription = await this.extractTextFromAudio(audioPath);
      
      // Clean up temporary audio file
      await fsPromises.unlink(audioPath).catch(e => console.error(`Error removing temp audio file: ${e.message}`));
      
      return transcription;
    } catch (error) {
      console.error('Error extracting and transcribing audio from video:', error);
      return `[Error extracting audio from video: ${error.message}]`;
    }
  }
  
  /**
   * Get information about an audio file using ffmpeg
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<Object>} - Audio information (format, duration, sampleRate)
   */
  async getAudioInfo(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, info) => {
        if (err) {
          console.error('Error getting audio info:', err);
          return reject(err);
        }
        
        const audioStream = info.streams.find(stream => stream.codec_type === 'audio');
        if (!audioStream) {
          return reject(new Error('No audio stream found'));
        }
        
        resolve({
          format: info.format.format_name.toUpperCase(),
          duration: parseFloat(info.format.duration || 0),
          sampleRate: parseInt(audioStream.sample_rate || 44100, 10),
          channels: parseInt(audioStream.channels || 2, 10)
        });
      });
    });
  }
  
  /**
   * Convert an audio file to WAV format using ffmpeg
   * @param {string} inputPath - Path to the input audio file
   * @returns {Promise<string>} - Path to the converted WAV file
   */
  async convertAudioToWav(inputPath) {
    const outputPath = path.join(os.tmpdir(), `converted-${Date.now()}.wav`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(['-acodec pcm_s16le', '-ac 1', '-ar 16000'])
        .save(outputPath)
        .on('end', () => {
          console.log(`Audio conversion complete: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error converting audio:', err);
          reject(err);
        });
    });
  }
  
  /**
   * Upload a file to Google Cloud Storage
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - GCS URI of the uploaded file
   */
  async uploadFileToGcs(filePath) {
    if (!this.storageClient) {
      throw new Error('Google Cloud Storage client not initialized');
    }
    
    const bucket = this.storageClient.bucket(GOOGLE_CLOUD_STORAGE_BUCKET);
    const fileName = `tmp-${Date.now()}-${path.basename(filePath)}`;
    
    await bucket.upload(filePath, {
      destination: fileName,
      metadata: {
        cacheControl: 'private, max-age=0'
      }
    });
    
    return `gs://${GOOGLE_CLOUD_STORAGE_BUCKET}/${fileName}`;
  }
  
  /**
   * Delete a file from Google Cloud Storage
   * @param {string} filePath - Path to the local file (used to generate GCS filename)
   * @returns {Promise<void>}
   */
  async deleteFileFromGcs(filePath) {
    if (!this.storageClient) {
      return;
    }
    
    try {
      const bucket = this.storageClient.bucket(GOOGLE_CLOUD_STORAGE_BUCKET);
      const fileName = `tmp-${Date.now()}-${path.basename(filePath)}`;
      await bucket.file(fileName).delete();
      console.log(`Deleted file from GCS: ${fileName}`);
    } catch (error) {
      console.error('Error deleting file from GCS:', error);
    }
  }

}

// Export an instance of the MediaProcessingService class
export default new MediaProcessingService();