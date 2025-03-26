import mongoose from 'mongoose';
import { Submission } from './models/Submission.models.js';
import { Hackathon } from './models/Hackathon.model.js';
import mediaProcessingService from './services/mediaProcessingService.js';
import llmService from './services/llmService.js';
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

/**
 * Extracts text from all media files in a submission
 * @param {Object} submission - Submission document
 * @returns {Promise<string>} - Combined extracted text
 */
async function extractTextFromSubmission(submission) {
  const extractedTexts = [];
  
  console.log(`Processing ${submission.files.length} files for extraction`);
  
  for (const file of submission.files) {
    const { format, fileUrl } = file;
    
    // Determine real format based on URL pattern
    const detectedFormat = detectFileFormat(fileUrl);
    console.log(`Processing ${detectedFormat} file: ${fileUrl}`);
    
    try {
      const extractedText = await mediaProcessingService.extractTextFromMedia(fileUrl, detectedFormat);
      console.log(`Successfully extracted ${extractedText.length} characters`);
      extractedTexts.push(extractedText);
    } catch (error) {
      console.error(`Error extracting text: ${error.message}`);
      // Continue with other files if one fails
    }
  }
  
  // Combine all extracted texts with the submission description
  let combinedContent = submission.description || '';
  extractedTexts.forEach(text => {
    if (text && text.trim()) {
      combinedContent += `\n\n${text}`;
    }
  });
  
  return combinedContent;
}

/**
 * Determine the real format of a file based on URL
 * @param {string} url - File URL
 * @returns {string} - Detected format
 */
function detectFileFormat(url) {
  const lowerUrl = url.toLowerCase();
  
  // Check URL path for format hints
  if (lowerUrl.includes('/image/upload/')) {
    if (lowerUrl.endsWith('.pdf')) return 'File';
    if (lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) return 'Image';
    return 'Image'; // Default for image path
  }
  
  if (lowerUrl.includes('/video/upload/')) {
    if (lowerUrl.endsWith('.mp3')) return 'Audio';
    if (lowerUrl.endsWith('.mp4')) return 'Video';
    return 'Video'; // Default for video path
  }
  
  if (lowerUrl.includes('/raw/upload/')) {
    return 'File'; // Text files should be treated as general files
  }
  
  // Check file extensions
  if (lowerUrl.endsWith('.pdf')) return 'File';
  if (lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) return 'Image';
  if (lowerUrl.endsWith('.mp3') || lowerUrl.endsWith('.wav')) return 'Audio';
  if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.avi') || lowerUrl.endsWith('.mov')) return 'Video';
  
  // Default
  return 'File';
}

/**
 * Evaluate a submission using the LLM service
 * @param {string} content - Extracted content to evaluate
 * @param {Array} criteria - Evaluation criteria
 * @param {string} hackathonName - Name of the hackathon
 * @returns {Promise<Object>} Evaluation results
 */
async function evaluateSubmission(content, criteria, hackathonName) {
  console.log(`Evaluating content (${content.length} characters) against ${criteria.length} criteria`);
  
  const evaluationResults = [];
  let totalScore = 0;
  
  for (const criterion of criteria) {
    console.log(`Evaluating criterion: ${criterion}`);
    const startTime = Date.now();
    
    const score = await llmService.evaluateCriterion(
      content,
      criterion,
      hackathonName
    );
    
    const endTime = Date.now();
    console.log(`Evaluation completed in ${(endTime - startTime) / 1000} seconds`);
    
    evaluationResults.push({
      parameter: criterion,
      score
    });
    
    totalScore += score;
  }
  
  // Calculate average score
  const averageScore = Math.round(totalScore / criteria.length);
  
  return {
    scores: evaluationResults,
    totalScore: averageScore,
    grade: determineGrade(averageScore),
    result: determineResult(averageScore)
  };
}

/**
 * Determine grade based on score
 * @param {number} score - Score from 0-100
 * @returns {string} - Grade (Low, Mid, High)
 */
function determineGrade(score) {
  if (score < 40) return 'Low';
  if (score < 75) return 'Mid';
  return 'High';
}

/**
 * Determine result based on score
 * @param {number} score - Score from 0-100
 * @returns {string} - Result category
 */
function determineResult(score) {
  if (score < 40) return 'Rejected';
  if (score < 75) return 'Revisit to check its potential';
  return 'Shortlisted for the final';
}

// Main test function
async function testIntegratedEvaluation() {
  try {
    console.log('Testing Integrated Media Processing and LLM Evaluation...');
    
    // Find a submission to test with
    const submissions = await Submission.find()
      .populate({
        path: 'hackathonId',
        select: 'evaluationCriteria name'
      })
      .limit(1);
    
    if (submissions.length === 0) {
      console.log('No submissions found in the database. Cannot proceed with testing.');
      return;
    }
    
    const submission = submissions[0];
    console.log(`Testing with submission ID: ${submission._id}`);
    
    // Make sure there's evaluation criteria available
    let evaluationCriteria = [];
    let hackathonName = '';
    
    if (submission.hackathonId && submission.hackathonId.evaluationCriteria) {
      evaluationCriteria = submission.hackathonId.evaluationCriteria;
      hackathonName = submission.hackathonId.name;
      console.log(`Using hackathon criteria: ${evaluationCriteria.join(', ')}`);
    } else {
      // Use default criteria if none available
      evaluationCriteria = [
        'Originality and Innovation',
        'Technical Implementation',
        'Impact and Usefulness',
        'Presentation and Documentation'
      ];
      hackathonName = 'Test Hackathon';
      console.log(`Using default criteria: ${evaluationCriteria.join(', ')}`);
    }
    
    // Extract text from the submission files
    console.log('\nExtracting text from submission files...');
    const startExtractionTime = Date.now();
    const extractedContent = await extractTextFromSubmission(submission);
    const endExtractionTime = Date.now();
    
    console.log(`Extraction completed in ${(endExtractionTime - startExtractionTime) / 1000} seconds`);
    console.log(`Total extracted content: ${extractedContent.length} characters`);
    console.log(`Content preview: ${extractedContent.substring(0, 200)}...`);
    
    // Evaluate the submission
    console.log('\nEvaluating submission content...');
    const startEvalTime = Date.now();
    const evaluationResults = await evaluateSubmission(
      extractedContent,
      evaluationCriteria,
      hackathonName
    );
    const endEvalTime = Date.now();
    
    console.log(`Evaluation completed in ${(endEvalTime - startEvalTime) / 1000} seconds`);
    
    // Display results
    console.log('\nEvaluation Results:');
    console.log(`Total Score: ${evaluationResults.totalScore}`);
    console.log(`Grade: ${evaluationResults.grade}`);
    console.log(`Result: ${evaluationResults.result}`);
    
    console.log('\nIndividual Criterion Scores:');
    evaluationResults.scores.forEach(score => {
      console.log(`- ${score.parameter}: ${score.score}`);
    });
    
    console.log('\nIntegrated evaluation test completed successfully!');
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
  testIntegratedEvaluation();
});
