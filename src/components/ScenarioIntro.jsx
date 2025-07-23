// src/components/ScenarioIntro.jsx
import React, { useEffect } from 'react';

const ScenarioIntro = ({ scenario, onStart, onBack }) => {
    // Pre-warm the speech synthesis engine when the component mounts.
    useEffect(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-xl max-w-2xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">{scenario.title}</h2>
            <p className="text-lg text-gray-700 mb-6">with <span className="font-semibold">{scenario.patient}</span></p>
            
            <div className="text-left space-y-4 mb-8">
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">Context:</h3>
                    <p className="text-gray-600">{scenario.context}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">Language Focus:</h3>
                    <p className="text-gray-600">{scenario.languageFocus}</p>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button onClick={onBack} className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors">Back</button>
                <button onClick={onStart} className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">Start Simulation</button>
            </div>
        </div>
    );
};

export default ScenarioIntro;
