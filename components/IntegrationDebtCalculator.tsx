'use client';

import { useState } from 'react';

interface IntegrationDebtCalculatorProps {
  onClose?: () => void;
}

export default function IntegrationDebtCalculator({ onClose }: IntegrationDebtCalculatorProps) {
  const [numEngineers, setNumEngineers] = useState(10);
  const [avgSalary, setAvgSalary] = useState(150000);
  const [currentIntegrations, setCurrentIntegrations] = useState(5);
  const [plannedIntegrations, setPlannedIntegrations] = useState(15);
  const [avgDealSize, setAvgDealSize] = useState(50000);
  const [dealsLostMonthly, setDealsLostMonthly] = useState(2);
  const [showResults, setShowResults] = useState(false);

  // Calculations
  const hoursPerIntegration = 120; // 3 weeks
  const totalIntegrations = currentIntegrations + plannedIntegrations;

  // Engineering hours wasted
  const buildingHours = plannedIntegrations * hoursPerIntegration;
  const maintenanceHoursPerIntegration = 40; // per year
  const maintenanceHours = totalIntegrations * maintenanceHoursPerIntegration;
  const totalEngineeringHours = buildingHours + maintenanceHours;

  // Costs
  const fullyLoadedCost = avgSalary * 1.5; // 50% overhead
  const hourlyRate = fullyLoadedCost / 2080; // work hours per year

  const buildingCost = buildingHours * hourlyRate;
  const maintenanceCost = maintenanceHours * hourlyRate;
  const opportunityCost = (buildingHours + maintenanceHours) * hourlyRate * 0.5; // 50% opportunity cost

  // Lost revenue
  const lostRevenue = dealsLostMonthly * 12 * avgDealSize;

  // Incidents
  const incidentsPerYear = totalIntegrations * 2; // 2 incidents per integration per year
  const incidentCost = incidentsPerYear * (hourlyRate * 8); // 8 hours per incident

  // Total debt
  const totalDebt = buildingCost + maintenanceCost + opportunityCost + lostRevenue + incidentCost;

  // Engineers at risk
  const engineersAtRisk = Math.floor((buildingHours + maintenanceHours) / 2080 * 0.3); // 30% burnout rate

  // With Membrane calculations
  const membraneAnnualCost = 99 * 12 * Math.ceil(totalIntegrations / 10); // $99/mo per 10 integrations
  const membraneSetupTime = totalIntegrations * 5; // 5 minutes per integration
  const membraneMaintenanceHours = maintenanceHours * 0.1; // 90% reduction
  const membraneIncidents = incidentsPerYear * 0.1; // 90% reduction

  const savings = totalDebt - membraneAnnualCost;

  const handleCalculate = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {!showResults ? (
        <div className="p-8 max-w-2xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Integration Debt Calculator</h2>
          <p className="text-gray-600 mb-8 text-center">Calculate the true cost of manual integrations</p>

          {/* Tell us about your company */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tell us about your company</h3>

            {/* Number of Engineers */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Engineers
                <span className="text-gray-500 text-xs ml-2">Working on product & integrations</span>
              </label>
              <input
                type="number"
                value={numEngineers}
                onChange={(e) => setNumEngineers(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Avg Engineer Salary */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avg Engineer Salary ($)
                <span className="text-gray-500 text-xs ml-2">Annual fully-loaded cost</span>
              </label>
              <input
                type="number"
                value={avgSalary}
                onChange={(e) => setAvgSalary(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Current Integrations */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Integrations
                <span className="text-gray-500 text-xs ml-2">Active integrations today</span>
              </label>
              <input
                type="number"
                value={currentIntegrations}
                onChange={(e) => setCurrentIntegrations(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Planned Integrations */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned Integrations
                <span className="text-gray-500 text-xs ml-2">On your roadmap</span>
              </label>
              <input
                type="number"
                value={plannedIntegrations}
                onChange={(e) => setPlannedIntegrations(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Avg Deal Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avg Deal Size ($)
                <span className="text-gray-500 text-xs ml-2">Annual contract value</span>
              </label>
              <input
                type="number"
                value={avgDealSize}
                onChange={(e) => setAvgDealSize(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Deals Lost Monthly */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deals Lost (Monthly)
                <span className="text-gray-500 text-xs ml-2">Due to missing integrations</span>
              </label>
              <input
                type="number"
                value={dealsLostMonthly}
                onChange={(e) => setDealsLostMonthly(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg text-lg"
          >
            Calculate My Integration Debt
          </button>
        </div>
      ) : (
        <div className="p-8 max-w-4xl mx-auto w-full">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-red-600 mb-2">
              ${totalDebt.toLocaleString()}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Annual Integration Debt</h3>
            <p className="text-gray-600">
              This is costing you more than hiring {Math.floor(totalDebt / fullyLoadedCost)} senior engineers
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{totalEngineeringHours.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Engineering Hours Wasted/Year</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-700">${lostRevenue.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Lost Revenue/Year</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">{incidentsPerYear}</div>
              <div className="text-xs text-gray-600">Integration Incidents/Year</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{engineersAtRisk}</div>
              <div className="text-xs text-gray-600">Engineers at Quit Risk</div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h4 className="font-bold text-lg text-gray-800 mb-4">Cost Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Building New Integrations</span>
                <span className="font-semibold text-gray-900">${buildingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Annual Maintenance</span>
                <span className="font-semibold text-gray-900">${maintenanceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Lost Productivity (Opportunity Cost)</span>
                <span className="font-semibold text-gray-900">${opportunityCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Lost Revenue</span>
                <span className="font-semibold text-gray-900">${lostRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Incident Management</span>
                <span className="font-semibold text-gray-900">${incidentCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* The Membrane Difference */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">The Membrane Difference</h3>
            <p className="text-gray-600 mb-6 text-center">See how much you could save</p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Without Membrane */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-red-900 mb-4">Without Membrane</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Annual Cost</span>
                    <span className="font-semibold">${totalDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Time to Build</span>
                    <span className="font-semibold">3 weeks/integration</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Maintenance Hours</span>
                    <span className="font-semibold">{maintenanceHours}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Incidents</span>
                    <span className="font-semibold">{incidentsPerYear}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Engineers at Risk</span>
                    <span className="font-semibold">{engineersAtRisk}</span>
                  </div>
                </div>
              </div>

              {/* With Membrane */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-green-900 mb-4">With Membrane</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Annual Cost</span>
                    <span className="font-semibold">${membraneAnnualCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Time to Build</span>
                    <span className="font-semibold">5 minutes/integration</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Maintenance Hours</span>
                    <span className="font-semibold">{Math.round(membraneMaintenanceHours)}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Incidents</span>
                    <span className="font-semibold">{Math.round(membraneIncidents)}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Engineers at Risk</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Annual Savings */}
            <div className="mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 text-center">
              <div className="text-sm font-semibold mb-1">Annual Savings</div>
              <div className="text-4xl font-bold">${savings.toLocaleString()}</div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
            <h4 className="text-xl font-bold text-gray-800 mb-2">Ready to Eliminate Your Integration Debt?</h4>
            <p className="text-gray-600 mb-4">
              Membrane can reduce your integration costs by 90% and free up your engineers to focus on what matters.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg">
                Try Membrane Free
              </button>
              <button className="bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-50 transition">
                📤 Share Results
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 transition text-sm"
            >
              ← Back to Calculator
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
