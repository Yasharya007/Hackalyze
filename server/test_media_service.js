import mediaProcessingService from './services/mediaProcessingService.js';
import mongoose from 'mongoose';
import { Submission } from './models/Submission.models.js';
import dotenv from 'dotenv';

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

// Sample test function
async function testMediaProcessingService() {
  try {
    console.log('Testing Media Processing Service...');
    
    // Get some real submission files from the database
    const submissions = await Submission.find()
      .select('files')
      .limit(5);
    
    if (submissions.length === 0) {
      console.log('No submissions found in the database. Testing with placeholder data.');
      await testWithPlaceholderData();
      return;
    }
    
    console.log(`Found ${submissions.length} submissions with ${submissions.reduce((count, sub) => count + sub.files.length, 0)} files`);
    
    // Test each format type if available
    const formatTests = {
      File: false,
      Image: false,
      Audio: false,
      Video: false
    };
    
    // Iterate through each submission's files
    for (const submission of submissions) {
      for (const file of submission.files) {
        const { format, fileUrl } = file;
        
        // Skip if we've already tested this format
        if (formatTests[format]) continue;
        
        console.log(`\nTesting text extraction from ${format.toLowerCase()}:`);
        console.log(`URL: ${fileUrl}`);
        
        try {
          const startTime = Date.now();
          const extractedText = await mediaProcessingService.extractTextFromMedia(fileUrl, format);
          const endTime = Date.now();
          
          console.log(`Extracted ${extractedText.length} characters of text`);
          console.log(`Text preview: ${extractedText.substring(0, 200)}...`);
          console.log(`Extraction took ${(endTime - startTime) / 1000} seconds`);
          
          // Mark this format as tested
          formatTests[format] = true;
        } catch (error) {
          console.error(`Error extracting text from ${format}:`, error.message);
        }
      }
    }
    
    // Count how many formats were successfully tested
    const testedFormatsCount = Object.values(formatTests).filter(Boolean).length;
    console.log(`\nTested ${testedFormatsCount} out of 4 file formats`);
    
    console.log('\nMedia Processing Service test completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Closed MongoDB connection');
  }
}

// Fallback test with placeholder data if no submissions are found
async function testWithPlaceholderData() {
  console.log('Using placeholder data for testing...');
  
  // Test with a sample text file from GitHub
  const textFileUrl = 'https://raw.githubusercontent.com/mathiasbynens/utf8.js/master/README.md';
  console.log('\nTesting text extraction from text file:');
  try {
    const startTime = Date.now();
    console.log(`Downloading and processing: ${textFileUrl}`);
    const extractedTextFromFile = await mediaProcessingService.extractTextFromMedia(textFileUrl, 'File');
    const endTime = Date.now();
    
    console.log(`Extracted ${extractedTextFromFile.length} characters of text`);
    console.log(`Text preview: ${extractedTextFromFile.substring(0, 200)}...`);
    console.log(`Extraction took ${(endTime - startTime) / 1000} seconds`);
  } catch (error) {
    console.error('Error extracting text from file:', error.message);
  }
}

// Run the test
connectDB().then(() => {
  testMediaProcessingService();
});
