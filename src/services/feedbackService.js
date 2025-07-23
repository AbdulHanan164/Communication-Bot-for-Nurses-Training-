// src/services/feedbackService.js
import { generateFeedback } from './geminiService';

export const generateDynamicFeedback = async (conversation, personaPrompt) => {
    if (!conversation || conversation.filter(line => line.speaker === 'user').length < 1) {
        return {
            cultural: { score: 0, notes: "The conversation was too short to provide meaningful feedback. Please try interacting with the patient.", goodExample: "N/A", improvementExample: "N/A" },
            pronunciation: { score: 0, words: [] },
            grammar: { score: 0, fluency: "N/A", fillerWords: 0, notes: "Not enough speech to analyze." },
            lineByLineFeedback: []
        };
    }

    let feedback = await generateFeedback(personaPrompt, conversation);

    if (!feedback) {
        return {
            cultural: { score: 0, notes: "An error occurred while analyzing the conversation. Please check your API key and network connection.", goodExample: "N/A", improvementExample: "N/A" },
            pronunciation: { score: 0, words: [] },
            grammar: { score: 0, fluency: "N/A", fillerWords: 0, notes: "Could not analyze grammar." },
            lineByLineFeedback: []
        };
    }
    
    // Safeguard for empty strings
    if (feedback.cultural) {
        if (!feedback.cultural.goodExample) {
            feedback.cultural.goodExample = "No specific good example was identified, but the overall tone was professional.";
        }
        if (!feedback.cultural.improvementExample) {
            feedback.cultural.improvementExample = "No specific area for improvement was identified. Continue to practice active listening.";
        }
    }

    return feedback;
};
