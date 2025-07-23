// src/components/FeedbackView.jsx
import React, { useState, useEffect } from 'react';

const SpeakButton = ({ text }) => {
    const handleSpeak = (textToSpeak) => {
        if (!window.speechSynthesis || !textToSpeak) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const ukVoice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-GB');
        if (ukVoice) utterance.voice = ukVoice;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <button onClick={() => handleSpeak(text)} className="ml-2 text-gray-500 hover:text-blue-600" title="Listen">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 7a1 1 0 00-2 0v6a1 1 0 102 0V7zM10 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1zm4 2a1 1 0 10-2 0v4a1 1 0 102 0V7z" />
                <path fillRule="evenodd" d="M2 9a1 1 0 011-1h.01c.552 0 1 .448 1 1v.01a1 1 0 01-1 1H3a1 1 0 01-1-1V9zm14 0a1 1 0 011-1h.01c.552 0 1 .448 1 1v.01a1 1 0 01-1 1H17a1 1 0 01-1-1V9z" clipRule="evenodd" />
            </svg>
        </button>
    );
};

const ConversationReview = ({ userConversation, lineByLineFeedback, idealConversation }) => {
    const [activeTranscript, setActiveTranscript] = useState('user');
    const [isPlaying, setIsPlaying] = useState(false);
    const feedbackMap = lineByLineFeedback ? new Map(lineByLineFeedback.map(item => [item.userLine.toLowerCase(), item.suggestion])) : new Map();

    const handlePlayAudio = () => {
        if (!window.speechSynthesis) { alert("Your browser does not support text-to-speech."); return; }
        if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
        const fullTranscript = idealConversation.map(line => `${line.speaker}: ${line.text}`).join('. ');
        const utterance = new SpeechSynthesisUtterance(fullTranscript);
        const ukVoice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-GB');
        if (ukVoice) utterance.voice = ukVoice;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    };
    
    useEffect(() => { return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); }; }, []);

    return (
        <div className="mt-8 pt-6 border-t">
            <h3 className="text-xl font-bold text-center mb-4">Replay & Reflection</h3>
            <div className="flex justify-center mb-2 border border-gray-300 rounded-lg p-1 w-max mx-auto">
                <button onClick={() => setActiveTranscript('user')} className={`px-4 py-1 text-sm font-medium rounded-md ${activeTranscript === 'user' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Your Conversation</button>
                <button onClick={() => setActiveTranscript('ideal')} className={`px-4 py-1 text-sm font-medium rounded-md ${activeTranscript === 'ideal' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Model Transcript</button>
            </div>
            
            {activeTranscript === 'user' && (
                 <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6"><div className="font-semibold text-gray-800 border-b pb-2 mb-2">Your Conversation Line</div><div className="font-semibold text-gray-800 border-b pb-2 mb-2">Suggested Improvement</div></div>
                    {userConversation.map((line, index) => {
                        const isUserLine = line.speaker === 'user';
                        const suggestion = isUserLine ? feedbackMap.get(line.text.toLowerCase()) : null;
                        return (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 py-2 border-b">
                                <div>
                                    <div className="flex items-center">
                                        <p className={isUserLine ? 'text-blue-700 font-semibold' : 'text-gray-800'}>{isUserLine ? 'You (Nurse):' : 'Patient:'}</p>
                                        <SpeakButton text={line.text} />
                                    </div>
                                    <p className="italic">{line.text}</p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                    {isUserLine && suggestion && (
                                        <div className="bg-yellow-100 p-2 rounded-md">
                                            <div className="flex items-center">
                                                <p className="text-sm text-yellow-900 flex-grow">{suggestion}</p>
                                                <SpeakButton text={suggestion} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTranscript === 'ideal' && (
                <div>
                    <div className="bg-gray-50 p-4 rounded-lg border max-h-80 overflow-y-auto">
                        {idealConversation.map((line, index) => (<p key={index} className="mb-2"><strong className={line.speaker.includes('Nurse') ? 'text-blue-700' : 'text-gray-800'}>{line.speaker}:</strong> {line.text}</p>))}
                    </div>
                    <div className="text-center mt-4">
                         <button onClick={handlePlayAudio} className={`py-2 px-4 rounded-lg font-semibold flex items-center gap-2 transition-colors mx-auto ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}>{isPlaying ? '■ Stop Playback' : '▶ Listen to Model'}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ title, isActive, onClick, color }) => { const activeClasses = `border-${color}-500 text-${color}-600`; const inactiveClasses = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'; return (<button onClick={onClick} className={`py-4 px-1 text-center border-b-2 font-medium text-sm flex-1 ${isActive ? activeClasses : inactiveClasses}`}>{title}</button>); };
const CulturalFeedback = ({ data }) => (<div><h3 className="text-xl font-semibold mb-3 text-green-700">Cultural Communication Accuracy</h3>{!data ? <p>No data available.</p> : <> <p className="text-lg mb-4">Overall Score: <span className="font-bold">{data.score}/100</span></p><p className="mb-4">{data.notes}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-green-100 p-3 rounded-lg"><p className="font-semibold">Good Example:</p><p className="italic">"{data.goodExample}"</p></div><div className="bg-red-100 p-3 rounded-lg"><p className="font-semibold">Area for Improvement:</p><p className="italic">"{data.improvementExample}"</p></div></div></>}</div>);
const PronunciationFeedback = ({ data }) => (<div><h3 className="text-xl font-semibold mb-3 text-blue-700">Pronunciation & Intonation</h3>{!data ? <p>No data available.</p> : <> <p className="text-lg mb-4">Accuracy Score: <span className="font-bold">{data.score}/100</span></p><p className="font-semibold mb-2">Key Words to Practice:</p><ul className="space-y-3">{data.words && data.words.map((item, index) => (<li key={index} className="bg-blue-100 p-3 rounded-lg"><p className="font-bold text-lg">"{item.word}"</p><p>{item.issue}</p><p className="text-sm text-blue-800"><strong>Suggestion:</strong> {item.tip}</p></li>))}</ul></>}</div>);
const GrammarFeedback = ({ data }) => (<div><h3 className="text-xl font-semibold mb-3 text-yellow-700">Grammar & Fluency</h3>{!data ? <p>No data available.</p> : <> <p className="text-lg mb-4">Clarity Score: <span className="font-bold">{data.score}/100</span></p><div className="space-y-2"><p><strong>Fluency:</strong> <span className="font-medium">{data.fluency}</span></p><p><strong>Filler Words Used:</strong> <span className="font-medium">{data.fillerWords}</span></p><p className="mt-4 bg-yellow-100 p-3 rounded-lg">{data.notes}</p></div></>}</div>);


const FeedbackView = ({ feedback, userConversation, idealConversation, onFinish }) => {
    const [activeTab, setActiveTab] = useState('cultural');
    if (!feedback) {
        return <div className="text-center p-8"><h2 className="text-2xl font-semibold">Generating Feedback...</h2><p>Please wait while we analyze your conversation.</p></div>
    }
    const renderTabContent = () => {
        switch (activeTab) {
            case 'cultural': return <CulturalFeedback data={feedback.cultural} />;
            case 'pronunciation': return <PronunciationFeedback data={feedback.pronunciation} />;
            case 'grammar': return <GrammarFeedback data={feedback.grammar} />;
            default: return null;
        }
    };
    return (<div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto p-6"><h2 className="text-2xl font-bold text-center mb-6">Scenario Feedback</h2><div className="flex border-b mb-6"><TabButton title="Cultural Communication" isActive={activeTab === 'cultural'} onClick={() => setActiveTab('cultural')} color="green" /><TabButton title="Pronunciation & Intonation" isActive={activeTab === 'pronunciation'} onClick={() => setActiveTab('pronunciation')} color="blue" /><TabButton title="Grammar & Fluency" isActive={activeTab === 'grammar'} onClick={() => setActiveTab('grammar')} color="yellow" /></div><div className="p-4 bg-gray-50 rounded-lg min-h-[250px]">{renderTabContent()}</div><ConversationReview userConversation={userConversation} lineByLineFeedback={feedback.lineByLineFeedback} idealConversation={idealConversation} /><div className="text-center mt-8"><button onClick={onFinish} className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 text-lg">Return to Scenarios</button></div></div>);
};

export default FeedbackView;
