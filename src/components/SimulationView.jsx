// src/components/SimulationView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { aiPersonas } from '../data/scenarios';
import { getDynamicAIResponse } from '../services/aiService.js'; // Corrected import path

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-GB';
}

const SimulationView = ({ scenario, onBack, onFinish }) => {
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isPatientSpeaking, setIsPatientSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const finalTranscriptRef = useRef('');
  const chatEndRef = useRef(null);
  const persona = aiPersonas[scenario.id];

  useEffect(() => {
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {};
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation, isAiThinking]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => v.lang === 'en-GB');
    if (ukVoice) {
        utterance.voice = ukVoice;
    } else {
        console.warn("UK English voice not found, using default.");
    }
    utterance.onstart = () => setIsPatientSpeaking(true);
    utterance.onend = () => setIsPatientSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  
  const handleAIResponse = async (userText, chatHistory) => {
      setIsAiThinking(true);
      try {
        const aiText = await getDynamicAIResponse(persona.prompt, chatHistory, userText);
        setConversation(prev => [...prev, { speaker: 'patient', text: aiText }]);
        speak(aiText);
      } catch (error) {
        console.error("AI response error:", error);
        const errorMessage = "Sorry, I'm having a bit of trouble hearing you. Could you try again?";
        setConversation(prev => [...prev, { speaker: 'patient', text: errorMessage }]);
        speak(errorMessage);
      } finally {
        setIsAiThinking(false);
      }
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }
        setInterimTranscript(interim);
        if (final) {
            finalTranscriptRef.current += final + ' ';
        }
    };

    return () => { if(recognition) recognition.onresult = null; }
  }, []);

  const toggleListening = () => {
    if (isListening) {
        recognition.stop();
        setIsListening(false);
        setInterimTranscript('');

        const userText = finalTranscriptRef.current.trim();
        if (userText) {
            const updatedConversation = [...conversation, { speaker: 'user', text: userText }];
            setConversation(updatedConversation);
            handleAIResponse(userText, updatedConversation);
        }
        finalTranscriptRef.current = '';

    } else {
        if (!recognition) {
            alert("Speech recognition is not supported.");
            return;
        }
        finalTranscriptRef.current = ''; // Clear previous transcript
        recognition.start();
        setIsListening(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-3xl mx-auto flex flex-col h-[80vh]">
      <div className="p-4 border-b flex justify-between items-center"><button onClick={onBack} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"> &larr; Back </button><div className="text-center"><h2 className="text-xl font-semibold">{scenario.patient}</h2><p className="text-sm text-gray-500">{scenario.title}</p></div><button onClick={() => onFinish(conversation)} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"> Finish </button></div>
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">{conversation.map((entry, index) => (<div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'} mb-4`}><div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${entry.speaker === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>{entry.text}</div></div>))}{isAiThinking && (<div className="flex justify-start mb-4"><div className="rounded-lg px-4 py-2 bg-gray-300 text-black"><span className="italic">{persona.name} is thinking...</span></div></div>)}<div ref={chatEndRef} /></div>
      
      {isListening && (
          <div className="p-4 border-t text-center bg-yellow-100">
              <p className="text-gray-600 italic">Listening... (Click mic to stop)</p>
              <p className="text-gray-800 font-medium mt-1">{finalTranscriptRef.current}<span className="text-gray-500">{interimTranscript}</span></p>
          </div>
      )}

      <div className="p-4 border-t flex justify-center items-center">
          <button onClick={toggleListening} disabled={isPatientSpeaking || isAiThinking} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'} text-white disabled:bg-gray-400 disabled:cursor-not-allowed`}>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zM13 4a3 3 0 00-3-3A3 3 0 007 4v6a3 3 0 006 0V4z" /><path d="M10 15a5 5 0 005-5h-2a3 3 0 11-6 0H5a5 5 0 005 5z" /><path d="M10 15a5 5 0 005-5h-1.5a3.5 3.5 0 11-7 0H5a5 5 0 005 5z" /></svg>
          </button>
      </div>
    </div>
  );
};

export default SimulationView;
