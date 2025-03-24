import mongoose from 'mongoose';
import { Submission } from './models/Submission.models.js';
import { Hackathon } from './models/Hackathon.model.js';
import evaluationService from './services/evaluationService.js';
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
 * Main test function for the Evaluation Service
 */
async function testEvaluationService() {
  try {
    console.log('Testing Evaluation Service...');
    
    console.log('Looking for a submission with a valid Cloudinary file URL...');
    
    // Find a submission with a Cloudinary URL that actually exists
    const submission = await Submission.findOne({ 
      'files.fileUrl': /cloudinary/ 
    });
    
    if (!submission) {
      console.log('No submissions with Cloudinary URLs found for testing.');
      // Test with default criteria and first available submission
      const anySubmission = await Submission.findOne();
      if (!anySubmission) {
        console.log('No submissions found at all. Exiting test.');
        return;
      }
      
      console.log(`Using first available submission: ${anySubmission._id}`);
      
      // Use default criteria for testing
      const defaultCriteria = [
        'Originality and Innovation',
        'Technical Implementation',
        'Impact and Usefulness',
        'Presentation and Documentation'
      ];
      
      console.log(`Using default criteria: ${defaultCriteria.join(', ')}`);
      console.log(`Testing evaluation of submission ${anySubmission._id} with default criteria...`);
      
      // Evaluate the submission using the service
      const evaluationResult = await evaluationService.evaluateSubmission(anySubmission._id, defaultCriteria);
      
      console.log('Evaluation completed successfully');
      console.log('Evaluation result:', evaluationResult);
      return;
    }
    
    console.log(`Found submission with Cloudinary URL: ${submission._id}`);
    console.log('Files:');
    submission.files.forEach((file, index) => {
      console.log(`  ${index + 1}: ${file.format} - ${file.fileUrl}`);
    });
    
    // Get the associated hackathon if it exists
    const hackathon = submission.hackathonId ? 
      await Hackathon.findById(submission.hackathonId) : null;
    
    // Use default criteria if no hackathon or no criteria available
    if (!hackathon || !hackathon.criteria || hackathon.criteria.length === 0) {
      console.log('No hackathon found or hackathon has no evaluation criteria. Using default criteria.');
      
      // Use default criteria for testing
      const defaultCriteria = [
        'Originality and Innovation',
        'Technical Implementation',
        'Impact and Usefulness',
        'Presentation and Documentation'
      ];
      
      console.log(`Using default criteria: ${defaultCriteria.join(', ')}`);
      console.log(`Testing evaluation of submission ${submission._id} with default criteria...`);
      
      // Evaluate the submission using the service
      const evaluationResult = await evaluationService.evaluateSubmission(submission._id, defaultCriteria);
      
      console.log('Evaluation completed successfully');
      console.log('Evaluation result:', evaluationResult);
    } else {
      console.log(`Found hackathon: ${hackathon.title}`);
      console.log(`Hackathon has ${hackathon.criteria.length} evaluation criteria`);
      console.log(`Criteria: ${hackathon.criteria.join(', ')}`);
      
      console.log(`Testing evaluation of submission ${submission._id} with hackathon criteria...`);
      
      // Evaluate the submission using the service
      const evaluationResult = await evaluationService.evaluateSubmission(submission._id, hackathon.criteria);
      
      console.log('Evaluation completed successfully');
      console.log('Evaluation result:', evaluationResult);
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Run the test
connectDB()
  .then(async () => {
    try {
      await testEvaluationService();
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      // Close the MongoDB connection
      await mongoose.connection.close();
      console.log('Closed MongoDB connection');
    }
  });
