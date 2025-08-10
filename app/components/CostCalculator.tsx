'use client';

import { useState } from 'react';
import { MODELS, formatCost } from '@/app/services/llm-service';

export function CostCalculator() {
  const [sessions, setSessions] = useState(100);
  const [tokensPerSession, setTokensPerSession] = useState(1000);
  const [modelKey, setModelKey] = useState('gpt-4o-mini');

  const model = MODELS[modelKey];
  const inputTokens = tokensPerSession * 0.7; // Assume 70% input
  const outputTokens = tokensPerSession * 0.3; // 30% output
  
  const costPerSession = 
    (inputTokens / 1000) * model.costPer1kInput +
    (outputTokens / 1000) * model.costPer1kOutput;
  
  const totalCost = costPerSession * sessions;
  
  // Calculate savings vs most expensive model
  const expensiveModel = MODELS['gpt-4o-mini'];
  const expensiveCostPerSession = 
    (inputTokens / 1000) * expensiveModel.costPer1kInput +
    (outputTokens / 1000) * expensiveModel.costPer1kOutput;
  const expensiveTotalCost = expensiveCostPerSession * sessions;
  const savings = expensiveTotalCost - totalCost;
  const savingsPercent = (savings / expensiveTotalCost) * 100;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>💰</span>
        Cost Calculator
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model Selection
          </label>
          <select
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="gpt-4o-mini">GPT-4o Mini (Cheapest)</option>
            <option value="gpt-4o-mini-creative">GPT-4o Mini (Creative T=0.7)</option>
            <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
            <option value="o3-mini">O3 Mini</option>
            <option value="gpt-4.1">GPT-4.1</option>
            <option value="gpt-4o">GPT-4o</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sessions per Month: {sessions.toLocaleString()}
          </label>
          <input
            type="range"
            min="10"
            max="10000"
            step="10"
            value={sessions}
            onChange={(e) => setSessions(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Avg Tokens per Session: {tokensPerSession.toLocaleString()}
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={tokensPerSession}
            onChange={(e) => setTokensPerSession(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cost per Session:</span>
            <span className="font-semibold">{formatCost(costPerSession)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Monthly Total:</span>
            <span className="text-xl font-bold text-blue-600">{formatCost(totalCost)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Savings vs GPT-4o:</span>
              <span className="font-semibold">
                {formatCost(savings)} ({savingsPercent.toFixed(0)}%)
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>💡 Pro Tip:</strong> Using temperature=0 with GPT-4o Mini provides 
            the best balance of cost ({formatCost(MODELS['gpt-4o-mini'].costPer1kInput)}/1k tokens) 
            and determinism for production workloads.
          </p>
        </div>
      </div>
    </div>
  );
}