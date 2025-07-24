// src/services/aiService.js

const DEEPSEEK_API_KEY = "sk-09f6406f3b1840458e6e2ff3d025c81a"; // Your DeepSeek API key
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-coder"; // Using the most intelligent model for all tasks

// A generic function to call the DeepSeek API
const callDeepSeekAPI = async (messages, useJsonFormat = false) => {
    const payload = {
        model: DEEPSEEK_MODEL,
        messages: messages,
    };

    if (useJsonFormat) {
        payload.response_format = { type: "json_object" };
    }

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("DeepSeek API Error Response:", errorBody);
            throw new Error(`API request failed with status ${response.status}`);
        }
        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        console.error("Failed to call DeepSeek API:", error);
        return null;
    }
};

// Function for getting a chat response during the simulation
export const getDynamicAIResponse = async (personaPrompt, chatHistory, userText) => {
    const messages = [
        { "role": "system", "content": `You are an AI role-playing as a character. ${personaPrompt}. Your responses must be short, natural, and stay in character. Do not say the nurse's lines.` },
        ...chatHistory.map(line => ({
            role: line.speaker === 'user' ? 'user' : 'assistant',
            content: line.text
        })),
        { "role": "user", "content": userText }
    ];
    
    const aiText = await callDeepSeekAPI(messages);
    return aiText || "I'm sorry, could you rephrase that?";
};


// Function for generating the structured feedback JSON
export const generateFeedback = async (personaPrompt, conversation) => {
    const transcript = conversation.map(line => `${line.speaker === 'user' ? 'Nurse' : 'Patient'}: ${line.text}`).join('\n');
    
    const prompt = `
        You are an expert clinical communication coach. Analyze the nurse's performance in the following transcript based on the scenario context.
        
        Scenario Context: "${personaPrompt}"
        
        Transcript:
        ${transcript}

        Provide a complete analysis by filling out all fields in the JSON schema.

        CRITICAL INSTRUCTIONS:
        1.  Every single string field in the JSON MUST contain meaningful text. DO NOT return empty strings.
        2.  The "lineByLineFeedback" array MUST contain an object for EVERY line the nurse spoke. If a line was good, the suggestion should be a positive affirmation like 'This was a clear and appropriate question.'
        3. The "pronunciation.words" array should identify 1-2 words that might be challenging for a non-native speaker, even if pronounced correctly, and offer a tip. If pronunciation is perfect, the array can be empty but must exist.
        4. The "grammar.notes" field MUST provide specific examples of grammatical errors, filler words, or incomplete sentences from the transcript.

        Example of a perfect JSON response:
        {
          "cultural": { "score": 85, "notes": "The nurse showed good empathy by acknowledging the patient's anxiety.", "goodExample": "hello how are you", "improvementExample": "Instead of asking 'what are you doing', try a more open question like 'How are you feeling at the moment?'" },
          "pronunciation": { "score": 90, "words": [{ "word": "gastroscopy", "issue": "Slightly rushed pronunciation.", "tip": "Break it down: gas-TROS-co-py." }] },
          "grammar": { "score": 75, "fluency": "Okay", "fillerWords": 2, "notes": "The phrase 'how are you been' is grammatically incorrect. Also, some sentences were a bit fragmented." },
          "lineByLineFeedback": [
              { "userLine": "hello how are you", "suggestion": "A good, friendly opening. Adding the patient's name would make it even better." },
              { "userLine": "how are you been", "suggestion": "This is grammatically incorrect. The correct phrasing would be 'How have you been?' or simply 'How are you?'" }
          ]
        }
    `;

    const messages = [
        { "role": "system", "content": "You are an expert clinical communication coach for nurses. Your task is to analyze a conversation transcript and provide structured feedback as a JSON object. You must respond with only the JSON object and nothing else." },
        { "role": "user", "content": prompt }
    ];

    const feedbackText = await callDeepSeekAPI(messages, true);

    if (!feedbackText) {
        return null;
    }

    try {
        const feedback = JSON.parse(feedbackText);
        if (!feedback.pronunciation || !feedback.pronunciation.words) {
            feedback.pronunciation = { score: feedback.pronunciation?.score || 0, words: [] };
        }
        if (!feedback.lineByLineFeedback) {
            feedback.lineByLineFeedback = [];
        }
        return feedback;
    } catch (e) {
        console.error("Failed to parse the feedback JSON from DeepSeek:", e);
        return null;
    }
};
