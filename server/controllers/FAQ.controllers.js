import { FAQ } from "../models/FAQ.models.js";   // Import the FAQ model
// Controller to get all FAQs
export const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find(); // Fetch all FAQs from the database

        // Transform data into an array of question-answer objects
        const formattedFAQs = faqs.flatMap(faq => 
            faq.questions.map((question, index) => ({
                question,
                answer: faq.answers[index] || "Not answered yet"
            }))
        );

        res.status(200).json({ 
            success: true, 
            data: formattedFAQs 
        });
    } 
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching FAQs", error });
    }
};
