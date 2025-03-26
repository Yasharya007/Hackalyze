import { Submission } from '../models/Submission.models.js';
import { Hackathon } from '../models/Hackathon.model.js';
import mediaProcessingService from './mediaProcessingService.js';
import llmService from './llmService.js';

/**
 * Service for evaluating hackathon submissions using the LLM API
 * Processes media files, extracts text, and scores submissions
 */
class EvaluationService {
  /**
   * Evaluate a submission and update the database with scores
   * @param {string} submissionId - MongoDB ID of the submission to evaluate
   * @param {Array<string>} [customCriteria] - Optional array of custom criteria to use instead of hackathon criteria
   * @returns {Promise<Object>} - Updated submission with scores
   */
  async evaluateSubmission(submissionId, customCriteria = null) {
    try {
      console.log(`Starting evaluation for submission: ${submissionId}`);
      
      // Step 1: Fetch the submission from the database
      const submission = await Submission.findById(submissionId)
        .populate({
          path: 'hackathonId',
          select: 'criteria title'
        });
      
      if (!submission) {
        throw new Error(`Submission with ID ${submissionId} not found`);
      }
      
      // If custom criteria are provided, use those instead of fetching from hackathon
      let evaluationCriteria;
      let hackathonTitle;
      
      if (customCriteria && customCriteria.length > 0) {
        evaluationCriteria = customCriteria;
        hackathonTitle = submission.hackathonId?.title || 'Unknown Hackathon';
        console.log(`Using ${evaluationCriteria.length} custom evaluation criteria`);
      } else {
        // Step 2: Check if there are evaluation criteria in the hackathon
        if (!submission.hackathonId || !submission.hackathonId.criteria || submission.hackathonId.criteria.length === 0) {
          throw new Error('No evaluation criteria found for this hackathon');
        }
        
        evaluationCriteria = submission.hackathonId.criteria;
        hackathonTitle = submission.hackathonId.title;
        console.log(`Found ${evaluationCriteria.length} evaluation criteria for hackathon: ${hackathonTitle}`);
      }
      
      // Step 3: Extract text from all submission files
      const extractedTexts = [];
      console.log(`Processing ${submission.files.length} files for extraction`);
      
      for (const file of submission.files) {
        try {
          const { format, fileUrl } = file;
          console.log(`Extracting text from ${format} file: ${fileUrl}`);
          
          const extractedText = await mediaProcessingService.extractTextFromMedia(fileUrl, format);
          extractedTexts.push(extractedText);
          console.log(`Successfully extracted ${extractedText.length} characters`);
        } catch (error) {
          console.error(`Error extracting text: ${error.message}`);
          // Continue with other files if one fails
        }
      }
      
      // Step 4: Combine extracted text with submission description
      const submissionText = [
        submission.description || '',
        ...extractedTexts
      ].join('\n\n');
      
      console.log(`Combined text length: ${submissionText.length} characters`);
      console.log(`Text preview: ${submissionText.substring(0, 200)}...`);
      
      // Step 5: Evaluate the content against each criterion
      const scores = [];
      
      for (const criterion of evaluationCriteria) {
        try {
          console.log(`Evaluating criterion: ${criterion}`);
          // Updated to match llmService's signature (submissionText, criterion)
          const startTime = Date.now();
          const result = await llmService.evaluateCriterion(submissionText, criterion, hackathonTitle);
          const endTime = Date.now();
          
          console.log(`Evaluation for "${criterion}" completed: Score ${result.score} (${(endTime - startTime) / 1000}s)`);
          
          scores.push({
            parameter: criterion,
            score: result.score
          });
        } catch (error) {
          console.error(`Error evaluating criterion "${criterion}": ${error.message}`);
          // Add a zero score with error message if evaluation fails
          scores.push({
            parameter: criterion,
            score: 0
          });
        }
      }
      
      // Step 6: Update the submission with scores but don't modify status
      console.log(`Saving ${scores.length} criterion scores to submission`);
      
      const updatedSubmission = await Submission.findByIdAndUpdate(
        submissionId,
        { scores },
        { new: true }
      );
      
      return updatedSubmission;
    } catch (error) {
      console.error('Evaluation error:', error);
      throw error;
    }
  }

  /**
   * Evaluate a submission with custom parameters and their weights
   * @param {Object} submission - The submission object to evaluate
   * @param {Array} parameters - Array of parameters with weights
   * @param {string} hackathonTitle - Title of the hackathon
   * @returns {Promise<Object>} - Evaluation results with scores and weighted total
   */
  async evaluateSubmissionWithParameters(submission, parameters, hackathonTitle) {
    try {
      console.log(`Starting parameter-based evaluation for submission: ${submission._id}`);
      
      // Step 1: Extract text from all submission files
      const extractedTexts = [];
      console.log(`Processing ${submission.files.length} files for extraction`);
      
      for (const file of submission.files) {
        try {
          const { format, fileUrl } = file;
          console.log(`Extracting text from ${format} file: ${fileUrl}`);
          
          const extractedText = await mediaProcessingService.extractTextFromMedia(fileUrl, format);
          extractedTexts.push(extractedText);
          console.log(`Successfully extracted ${extractedText.length} characters`);
        } catch (error) {
          console.error(`Error extracting text: ${error.message}`);
          // Continue with other files if one fails
        }
      }
      
      // Step 2: Combine extracted text with submission description
      const submissionText = [
        submission.description || '',
        ...extractedTexts
      ].join('\n\n');
      
      console.log(`Combined text length: ${submissionText.length} characters`);
      
      // Step 3: Evaluate the content against each parameter
      const scores = [];
      let totalWeightedScore = 0;
      
      for (const param of parameters) {
        try {
          console.log(`Evaluating parameter: ${param.name} (weight: ${param.weight}%)`);
          
          const startTime = Date.now();
          const result = await llmService.evaluateCriterion(submissionText, param.name, hackathonTitle);
          const endTime = Date.now();
          
          // Calculate weighted score
          const weightedScore = (result.score * param.weight) / 100;
          totalWeightedScore += weightedScore;
          
          console.log(`Evaluation for "${param.name}" completed: Score ${result.score}, Weighted: ${weightedScore.toFixed(2)} (${(endTime - startTime) / 1000}s)`);
          
          scores.push({
            parameter: param.name,
            score: result.score,
            weight: param.weight,
            weightedScore: weightedScore
          });
        } catch (error) {
          console.error(`Error evaluating parameter "${param.name}": ${error.message}`);
          // Add a zero score with error message if evaluation fails
          scores.push({
            parameter: param.name,
            score: 0,
            weight: param.weight,
            weightedScore: 0,
            error: error.message
          });
        }
      }
      
      // Step 4: Save the evaluation results in the database
      const evaluationUpdate = {
        AIscores: scores.map(score => ({
          parameter: score.parameter,
          score: score.score
        })),
        totalAIScore: Math.round(totalWeightedScore)
      };
      
      await Submission.findByIdAndUpdate(
        submission._id,
        evaluationUpdate,
        { new: false }
      );
      
      // Return the evaluation results
      return {
        submissionId: submission._id,
        scores,
        totalScore: Math.round(totalWeightedScore)
      };
    } catch (error) {
      console.error('Parameter-based evaluation error:', error);
      throw error;
    }
  }
}

export default new EvaluationService();
