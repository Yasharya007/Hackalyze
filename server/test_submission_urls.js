import mongoose from 'mongoose';
import { Submission } from './models/Submission.models.js';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Connect to the database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB for testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Check if a URL is accessible
 * @param {string} url - URL to check
 * @returns {Promise<object>} Result with status and message
 */
async function checkUrlAccess(url) {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return {
      accessible: true,
      status: response.status,
      message: 'OK'
    };
  } catch (error) {
    return {
      accessible: false,
      status: error.response?.status || 'Unknown',
      message: error.message
    };
  }
}

/**
 * Determine the real format of a file based on URL and path
 * @param {string} url - File URL
 * @returns {string} - Detected format
 */
function detectFileFormat(url) {
  const lowerUrl = url.toLowerCase();
  
  // Check URL path for format hints
  if (lowerUrl.includes('/image/upload/')) {
    if (lowerUrl.endsWith('.pdf')) return 'PDF';
    if (lowerUrl.endsWith('.png')) return 'Image';
    if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) return 'Image';
    return 'Image'; // Default for image path
  }
  
  if (lowerUrl.includes('/video/upload/')) {
    if (lowerUrl.endsWith('.mp3')) return 'Audio';
    if (lowerUrl.endsWith('.mp4')) return 'Video';
    return 'Video'; // Default for video path
  }
  
  if (lowerUrl.includes('/raw/upload/')) {
    return 'Text'; // Probably a text file
  }
  
  // Check file extensions
  if (lowerUrl.endsWith('.pdf')) return 'PDF';
  if (lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) return 'Image';
  if (lowerUrl.endsWith('.mp3') || lowerUrl.endsWith('.wav')) return 'Audio';
  if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.avi') || lowerUrl.endsWith('.mov')) return 'Video';
  
  // Default
  return 'Unknown';
}

// Test function to retrieve submission URLs
async function testRetrieveSubmissionUrls() {
  try {
    console.log('Testing retrieval of submission URLs from database...');
    
    // Find all submissions
    const submissions = await Submission.find()
      .select('files description')
      .limit(10);
    
    console.log(`Found ${submissions.length} submissions in the database.`);
    
    // Display each submission's files and test accessibility
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      console.log(`\nSubmission ${i + 1}:`);
      console.log(`Description: ${submission.description?.substring(0, 100) || 'No description'}...`);
      console.log(`Number of files: ${submission.files.length}`);
      
      // Display file details and test each URL
      for (let j = 0; j < submission.files.length; j++) {
        const file = submission.files[j];
        console.log(`  File ${j + 1}:`);
        console.log(`    DB Format: ${file.format}`);
        
        // Detect real format based on URL
        const detectedFormat = detectFileFormat(file.fileUrl);
        console.log(`    Detected Format: ${detectedFormat}`);
        console.log(`    URL: ${file.fileUrl}`);
        
        // Test URL accessibility
        console.log(`    Testing URL accessibility...`);
        const accessResult = await checkUrlAccess(file.fileUrl);
        console.log(`    Status: ${accessResult.status} (${accessResult.accessible ? 'Accessible' : 'Not accessible'})`);
        if (!accessResult.accessible) {
          console.log(`    Error: ${accessResult.message}`);
        }
      }
    }
    
    console.log('\nURL retrieval and accessibility test completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Closed MongoDB connection');
  }
}

// Run the test
connectDB().then(() => {
  testRetrieveSubmissionUrls();
});
