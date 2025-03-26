import llmService from './services/llmService.js';

// Sample test function
async function testGeminiService() {
  try {
    console.log('Testing Gemini LLM Service...');
    
    // Sample submission text
    const sampleSubmissionText = `
      Our project is a smart water management system that uses IoT sensors to monitor water usage in buildings.
      The system detects leaks in real-time and automatically shuts off the water supply to prevent damage.
      We've also created a mobile app that allows users to track their water consumption, set conservation goals,
      and receive alerts when unusual usage patterns are detected. Our solution has been tested in 5 commercial
      buildings and has shown to reduce water waste by 30% on average.
    `;
    
    // Sample criteria
    const criteria = [
      "Innovation and originality of the idea",
      "Technical complexity and implementation",
      "Potential social impact and problem-solving ability",
      "Presentation quality and clarity"
    ];
    
    // Test each criterion
    for (const criterion of criteria) {
      console.log(`\nEvaluating criterion: "${criterion}"`);
      const startTime = Date.now();
      
      try {
        const score = await llmService.evaluateCriterion(sampleSubmissionText, criterion);
        const endTime = Date.now();
        console.log(`Score: ${score}/100`);
        console.log(`Evaluation took ${(endTime - startTime) / 1000} seconds`);
      } catch (criterionError) {
        console.error(`Error evaluating criterion "${criterion}":`, criterionError.message);
      }
    }
    
    console.log('\nGemini LLM Service test completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testGeminiService();
