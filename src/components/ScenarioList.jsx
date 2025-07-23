// src/components/ScenarioList.jsx
import React from 'react';

const ScenarioList = ({ scenarios, onSelect }) => (
  <div>
    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">Select a Scenario</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scenarios.map((scenario) => (
        <div key={scenario.id} className="bg-white rounded-lg shadow-lg p-6 text-center cursor-pointer transform hover:scale-105 transition-transform duration-300 ease-in-out" onClick={() => onSelect(scenario)} tabIndex="0">
          <p className="text-xl font-bold text-blue-700 mb-2">{scenario.patient}</p>
          <p className="text-md text-gray-600">{scenario.title}</p>
        </div>
      ))}
    </div>
  </div>
);

export default ScenarioList;
