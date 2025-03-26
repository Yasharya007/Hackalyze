import express from 'express';
import evaluationService from '../services/evaluationService.js';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

/**
 * @route POST /api/evaluation/submission/:id
 * @desc Evaluate a single submission using LLM and update scores in database
 * @access Admin only
 */
router.post('/submission/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const submissionId = req.params.id;
    
    if (!submissionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Submission ID is required' 
      });
    }
    
    console.log(`Starting evaluation for submission: ${submissionId}`);
    const result = await evaluationService.evaluateSubmission(submissionId);
    
    res.status(200).json({
      success: true,
      message: 'Submission evaluated successfully',
      data: {
        submissionId: result._id,
        scores: result.scores
      }
    });
  } catch (error) {
    console.error('Evaluation route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to evaluate submission',
      error: error.stack
    });
  }
});

/**
 * @route POST /api/evaluation/batch
 * @desc Evaluate multiple submissions in batch mode
 * @access Admin only
 */
router.post('/batch', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { submissionIds } = req.body;
    
    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid array of submission IDs is required'
      });
    }
    
    console.log(`Starting batch evaluation for ${submissionIds.length} submissions`);
    const results = await evaluationService.evaluateMultipleSubmissions(submissionIds);
    
    res.status(200).json({
      success: true,
      message: 'Batch evaluation completed',
      data: {
        totalProcessed: submissionIds.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        results
      }
    });
  } catch (error) {
    console.error('Batch evaluation route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process batch evaluation',
      error: error.stack
    });
  }
});

export default router;
