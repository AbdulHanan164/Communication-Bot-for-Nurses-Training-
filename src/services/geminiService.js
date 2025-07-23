// src/services/geminiService.js

// --- PART 1: GEMINI FOR LIVE CONVERSATION ---

const GEMINI_API_KEY = "AIzaSyDGSTzn0GJq3jCif6wfRBg5O4bwsBaGjwY"; // Using your provided API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`; // Using gemini-2.0-flash model

const callGeminiAPI = async (payload) => {
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Gemini API Error Response:", errorBody);
            throw new Error(`API request failed with status ${response.status}`);
        }
        const result = await response.json();
        if (!result.candidates || !result.candidates[0].content || !result.candidates[0].content.parts) {
            return null;
        }
        return result.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Failed to call Gemini API:", error);
        return null;
    }
};

export const getDynamicAIResponse = async (personaPrompt, chatHistory, userText) => {
    const prompt = `${personaPrompt} A nurse is talking to you. This is the conversation so far:\n${chatHistory.map(line => `${line.speaker}: ${line.text}`).join('\n')}\nThe nurse just said: "${userText}"\nYour response must be in character. Do NOT say the nurse's lines. Keep your response short, natural, and to the point.`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    
    let aiText = await callGeminiAPI(payload);
    
    if (!aiText || aiText.toLowerCase().includes("i'm not sure what to say")) {
        const simplerPrompt = `${personaPrompt} The nurse said: "${userText}". How would you reply in character?`;
        const simplerPayload = { contents: [{ role: "user", parts: [{ text: simplerPrompt }] }] };
        aiText = await callGeminiAPI(simplerPayload);
    }

    return aiText || "Could you please rephrase that?";
};


// --- PART 2: DEEPSEEK FOR FEEDBACK GENERATION ---

const DEEPSEEK_API_KEY = "sk-09f6406f3b1840458e6e2ff3d025c81a"; // Your DeepSeek API key
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

const callDeepSeekAPI = async (prompt) => {
    const payload = {
        model: "deepseek-coder", // Using the more intelligent model
        messages: [
            { "role": "system", "content": "You are an expert clinical communication coach for nurses. Your task is to analyze a conversation transcript and provide structured feedback as a JSON object. You must respond with only the JSON object and nothing else." },
            { "role": "user", "content": prompt }
        ],
        response_format: { type: "json_object" }
    };

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

    const feedbackText = await callDeepSeekAPI(prompt);

    if (!feedbackText) {
        return {
            cultural: { score: 0, notes: "Error generating feedback.", goodExample: "N/A", improvementExample: "N/A" },
            pronunciation: { score: 0, words: [] },
            grammar: { score: 0, fluency: "N/A", fillerWords: 0, notes: "Error generating feedback." },
            lineByLineFeedback: []
        };
    }

    try {
        const feedback = JSON.parse(feedbackText);
        // Safeguard against missing or empty arrays which can cause rendering issues
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
