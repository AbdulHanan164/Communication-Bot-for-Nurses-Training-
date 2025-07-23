// src/components/DashboardView.jsx
import React from 'react';

const SkillBar = ({ label, score, color }) => (<div className="mb-4"><div className="flex justify-between mb-1"><span className="text-base font-medium text-gray-700">{label}</span><span className="text-sm font-medium text-gray-700">{score}%</span></div><div className="w-full bg-gray-200 rounded-full h-4"><div className={`${color} h-4 rounded-full`} style={{ width: `${score}%` }}></div></div></div>);

const DashboardView = ({ sessionHistory, onBack }) => {
    if (sessionHistory.length === 0) {
        return ( <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-4xl mx-auto"><h2 className="text-2xl font-bold mb-4">Your Dashboard is Empty</h2><p className="text-gray-600 mb-6">Complete a scenario to see your progress and get personalized recommendations.</p><button onClick={onBack} className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 text-lg">Start a Scenario</button></div>)
    }
    const calculateAverage = (key) => {
        if (!sessionHistory || sessionHistory.length === 0) return 0;
        const total = sessionHistory.reduce((acc, session) => acc + session.feedback[key].score, 0);
        return Math.round(total / sessionHistory.length);
    };
    const averages = { cultural: calculateAverage('cultural'), pronunciation: calculateAverage('pronunciation'), grammar: calculateAverage('grammar') };
    return (
        <div className="bg-white rounded-lg shadow-xl max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8">My Learning Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-gray-50 rounded-lg"><h3 className="text-xl font-semibold mb-4">Overall Skill Metrics</h3><SkillBar label="Cultural Communication" score={averages.cultural} color="bg-green-500" /><SkillBar label="Pronunciation & Intonation" score={averages.pronunciation} color="bg-blue-500" /><SkillBar label="Grammar & Fluency" score={averages.grammar} color="bg-yellow-500" /><div className="mt-6 p-4 bg-purple-100 rounded-lg"><h4 className="font-semibold text-purple-800">Smart Recommendation</h4><p className="text-purple-700">Your cultural communication is strong, but your grammar score is slightly lower. Try the 'SBAR Handover' scenario to practice more concise, technical language.</p></div></div>
                <div className="p-6 bg-gray-50 rounded-lg"><h3 className="text-xl font-semibold mb-4">Completed Sessions</h3><div className="space-y-3 max-h-80 overflow-y-auto">{sessionHistory.map(session => (<div key={session.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow"><div><p className="font-bold">{session.scenario}</p><p className="text-sm text-gray-500">{session.date}</p></div><p className="text-lg font-bold text-blue-600">{session.score}%</p></div>))}</div></div>
            </div>
             <div className="text-center mt-8"><button onClick={onBack} className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 text-lg">Back to Scenarios</button></div>
        </div>
    );
};

export default DashboardView;
