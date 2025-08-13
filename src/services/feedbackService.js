// src/services/feedbackService.js
import { generateFeedback } from './aiService.js'; // Corrected import

export const generateDynamicFeedback = async (conversation, personaPrompt) => {
    if (!conversation || conversation.filter(line => line.speaker === 'user').length < 1) {
        return {
            cultural: { score: 0, notes: "The conversation was too short to provide meaningful feedback.", goodExample: "N/A", improvementExample: "N/A" },
            pronunciation: { score: 0, words: [] },
            grammar: { score: 0, fluency: "N/A", fillerWords: 0, notes: "Not enough speech to analyze." },
            lineByLineFeedback: []
        };
    }

    const feedback = await generateFeedback(personaPrompt, conversation);

    if (!feedback) {
        return {
            cultural: { score: 0, notes: "An error occurred while analyzing the conversation. Please check your API key and network connection.", goodExample: "N/A", improvementExample: "N/A" },
            pronunciation: { score: 0, words: [] },
            grammar: { score: 0, fluency: "N/A", fillerWords: 0, notes: "Could not analyze grammar." },
            lineByLineFeedback: []
        };
    }
    
    return feedback;
};
