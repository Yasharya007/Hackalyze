import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Service to interact with Google's Gemini AI for submission evaluation
 */
class LLMService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    // Initialize Gemini client
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Evaluate a submission against a specific criterion
   * @param {string} submissionText - The extracted text from the submission
   * @param {string} criterion - The evaluation criterion
   * @param {string} hackathonTitle - Optional title of the hackathon for context
   * @returns {Promise<Object>} - Object containing the score between 0-100
   */
  async evaluateCriterion(submissionText, criterion, hackathonTitle = '') {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key is not configured');
      }

      // Get the Gemini model
      const geminiModel = this.genAI.getGenerativeModel({ model: this.model });
      
      // Create prompt for evaluation
      const prompt = this.constructPrompt(submissionText, criterion, hackathonTitle);
      
      // Generate content
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();
      
      // Extract the score from the response
      const scoreMatch = responseText.match(/(\d+)/);
      
      if (scoreMatch && scoreMatch[0]) {
        const score = parseInt(scoreMatch[0], 10);
        // Ensure score is within 0-100 range
        return { 
          score: Math.min(Math.max(score, 0), 100) 
        };
      }
      
      console.log(`Could not extract score from response: "${responseText}"`);
      return { score: 0 };
    } catch (error) {
      console.error('Error evaluating criterion with Gemini:', error);
      throw error;
    }
  }

  /**
   * Construct the prompt for the LLM to evaluate a submission
   * @param {string} submissionText - The extracted text from the submission
   * @param {string} criterion - The evaluation criterion
   * @param {string} hackathonTitle - Optional title of the hackathon for context
   * @returns {string} - The formatted prompt
   */
  constructPrompt(submissionText, criterion, hackathonTitle = '') {
    const contextPrefix = hackathonTitle ? 
      `You are evaluating a submission for the "${hackathonTitle}" hackathon based on the following criterion:` :
      `You are evaluating a hackathon submission based on the following criterion:`;
    
    return `
${contextPrefix}
"${criterion}"

Here is the submission text:
"""
${submissionText.substring(0, 25000)} ${submissionText.length > 25000 ? '... (content truncated for brevity)' : ''}
"""

Based solely on this criterion, rate the submission on a scale of 0-100, where:
- 0-20: Poor (Does not meet the criterion at all)
- 21-40: Below Average (Barely meets the criterion)
- 41-60: Average (Partially meets the criterion)
- 61-80: Good (Largely meets the criterion)
- 81-100: Excellent (Completely fulfills the criterion)

Be objective and fair in your evaluation.
Respond with ONLY a number between 0-100.
`;
  }
}

export default new LLMService();
