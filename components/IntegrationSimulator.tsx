'use client';

import { useState } from 'react';

interface IntegrationSimulatorProps {
  onClose?: () => void;
}

export default function IntegrationSimulator({ onClose }: IntegrationSimulatorProps) {
  const [integrationCount, setIntegrationCount] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);

  const hoursPerIntegration = 120; // 3 weeks per integration
  const totalHours = integrationCount * hoursPerIntegration;
  const totalWeeks = Math.round(totalHours / 40);
  const engineeringCost = Math.round(totalHours * 72.115); // $150k/year engineer

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setShowResults(false);
    setCurrentWeight(0);

    // Animate weight dropping
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setCurrentWeight(count);

      if (count >= integrationCount) {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          setShowResults(true);
        }, 500);
      }
    }, 100);
  };

  const handleBack = () => {
    setShowResults(false);
    setIsSimulating(false);
    setCurrentWeight(0);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {!showResults ? (
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Integration Weight Simulator</h2>
            <p className="text-sm text-gray-600 mb-8">Watch your engineer get crushed by integration debt</p>

            {/* Animation Area */}
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl p-8 mb-6 min-h-[200px] flex flex-col items-center justify-center border border-blue-100">
              {!isSimulating && currentWeight === 0 && (
                <div className="text-6xl mb-4">🧑‍💻</div>
              )}

              {(isSimulating || currentWeight > 0) && (
                <div className="relative">
                  {/* Anchors falling */}
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {Array.from({ length: currentWeight }).map((_, i) => (
                      <span key={i} className="text-3xl animate-bounce">⚓</span>
                    ))}
                  </div>

                  {/* Engineer getting crushed */}
                  <div className={`text-6xl transition-all duration-300 ${currentWeight >= integrationCount ? 'scale-50 opacity-50' : ''}`}>
                    🧑‍💻
                  </div>

                  {isSimulating && (
                    <div className="mt-4 text-sm font-bold text-gray-700">
                      {currentWeight} / {integrationCount} integrations loaded...
                    </div>
                  )}
                </div>
              )}

              {!isSimulating && currentWeight >= integrationCount && (
                <div className="text-lg font-bold text-red-600 mt-4">
                  {totalHours.toLocaleString()} Hours of Manual Work
                </div>
              )}
            </div>

            {/* Input Controls */}
            {!isSimulating && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Number of Integrations to Build
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={integrationCount}
                    onChange={(e) => setIntegrationCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-3xl font-bold text-blue-600 mt-2">{integrationCount}</div>
                </div>

                <button
                  onClick={handleStartSimulation}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
                >
                  Start Simulation
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Relief is Here</h3>
              <p className="text-gray-600">Membrane lifts all that weight off your shoulders.</p>
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {/* Without Membrane */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-red-900 mb-4">Without Membrane</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">⏱️</span>
                    <span className="text-gray-700">
                      <strong>{totalHours.toLocaleString()} hours</strong> of manual work
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">📅</span>
                    <span className="text-gray-700">
                      <strong>{totalWeeks} weeks</strong> to completion
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">💰</span>
                    <span className="text-gray-700">
                      <strong>${engineeringCost.toLocaleString()}</strong> in engineering cost
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">😫</span>
                    <span className="text-gray-700">
                      Team morale: <strong>💀</strong>
                    </span>
                  </li>
                </ul>
              </div>

              {/* With Membrane */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-green-900 mb-4">With Membrane</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">⚡</span>
                    <span className="text-gray-700">
                      <strong>~{integrationCount * 5} minutes</strong> of setup
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">🚀</span>
                    <span className="text-gray-700">
                      <strong>Same day</strong> completion
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">💵</span>
                    <span className="text-gray-700">
                      <strong>$99/mo</strong> upfront cost
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">😄</span>
                    <span className="text-gray-700">
                      Team morale: <strong>🚀</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Benefits List */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">
                    <strong>5 minutes</strong> per integration (not 3 weeks)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">
                    <strong>Self-healing</strong> (no maintenance burden)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">
                    <strong>Production-ready</strong> (no cutting corners)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">
                    <strong>Happy engineers</strong> (priceless)
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleBack}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg text-lg"
            >
              Lift the Weight (Try Membrane)
            </button>

            {/* Back Link */}
            <div className="text-center mt-4">
              <button
                onClick={handleBack}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
