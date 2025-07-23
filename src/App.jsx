// src/App.jsx
import React, { useState } from 'react';
import ScenarioList from './components/ScenarioList';
import ScenarioIntro from './components/ScenarioIntro';
import SimulationView from './components/SimulationView';
import FeedbackView from './components/FeedbackView';
import DashboardView from './components/DashboardView';
import { scenarios, aiPersonas, mockIdealConversations } from './data/scenarios';
import { generateDynamicFeedback } from './services/feedbackService';

const App = () => {
  const [currentView, setCurrentView] = useState('scenarioList');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [lastConversation, setLastConversation] = useState([]);
  const [lastFeedback, setLastFeedback] = useState(null);

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    setCurrentView('scenarioIntro');
  };

  const handleStartSimulation = () => {
    setCurrentView('simulation');
  };

  const handleShowScenarioList = () => {
    window.speechSynthesis.cancel();
    setSelectedScenario(null);
    setCurrentView('scenarioList');
  };

  const handleFinishScenario = async (conversation) => {
    setCurrentView('feedback'); 
    setLastConversation(conversation);
    const feedback = await generateDynamicFeedback(conversation, aiPersonas[selectedScenario.id].prompt);
    setLastFeedback(feedback);
    
    if (feedback && feedback.cultural && typeof feedback.cultural.score === 'number') {
        const score = Math.round((feedback.cultural.score + feedback.pronunciation.score + feedback.grammar.score) / 3);
        const newHistoryEntry = {
            id: sessionHistory.length + 1,
            scenario: selectedScenario.title,
            score: isNaN(score) ? 0 : score, // Safeguard against NaN
            date: new Date().toISOString().split('T')[0],
            feedback: feedback
        };
        setSessionHistory(prev => [...prev, newHistoryEntry]);
    }
  };
  
  const handleShowDashboard = () => {
      setCurrentView('dashboard');
  }

  const renderContent = () => {
    switch (currentView) {
      case 'scenarioIntro':
        return <ScenarioIntro scenario={selectedScenario} onStart={handleStartSimulation} onBack={handleShowScenarioList} />;
      case 'simulation': 
        return <SimulationView scenario={selectedScenario} onBack={handleShowScenarioList} onFinish={handleFinishScenario} />;
      
      case 'feedback': {
        const idealConversation = mockIdealConversations[selectedScenario.id] || [];
        return <FeedbackView 
            feedback={lastFeedback} 
            userConversation={lastConversation}
            idealConversation={idealConversation}
            onFinish={handleShowScenarioList} 
        />;
      }

      case 'dashboard': 
        return <DashboardView sessionHistory={sessionHistory} onBack={handleShowScenarioList} />;
      
      default: 
        return <ScenarioList scenarios={scenarios} onSelect={handleScenarioSelect} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">UK Healthcare Communication Training</h1>
        {currentView !== 'scenarioList' && (
             <button onClick={handleShowScenarioList} className="bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors">
                All Scenarios
            </button>
        )}
        {currentView !== 'dashboard' && (
            <button onClick={handleShowDashboard} className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-2 px-4 rounded-lg transition-colors">
                My Dashboard
            </button>
        )}
      </header>
      <main className="p-4 md:p-8">{renderContent()}</main>
    </div>
  );
};

export default App;
