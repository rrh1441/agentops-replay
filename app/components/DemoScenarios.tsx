'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  model: string;
  temperature: number;
  expectedOutcome: string;
  csvFile: string;
}

const scenarios: Scenario[] = [
  {
    id: 'deterministic',
    name: 'Deterministic Analysis',
    description: 'Run with GPT-3.5-turbo at temperature=0 for reproducible results',
    icon: '🎯',
    model: 'gpt-4o-mini',
    temperature: 0,
    expectedOutcome: 'Identical results on every run',
    csvFile: 'tesla_10k_2024.csv'
  },
  {
    id: 'advanced',
    name: 'Advanced Reasoning',
    description: 'Use GPT-4o-mini for complex analysis (no temperature control)',
    icon: '🧠',
    model: 'gpt-4o-mini',
    temperature: 1,
    expectedOutcome: 'More sophisticated analysis but higher cost',
    csvFile: 'microsoft_10k_2024.csv'
  },
  {
    id: 'comparison',
    name: 'Cost Comparison',
    description: 'Run the same data through multiple models to compare cost/quality',
    icon: '💰',
    model: 'mixed',
    temperature: -1, // Will run multiple times with different settings
    expectedOutcome: 'See cost vs quality tradeoffs',
    csvFile: 'apple_10k_2024.csv'
  }
];

export function DemoScenarios() {
  const router = useRouter();
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  async function runScenario(scenario: Scenario) {
    setRunning(scenario.id);
    
    try {
      // Load the CSV file
      const response = await fetch(`/${scenario.csvFile}`);
      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const file = new File([blob], scenario.csvFile, { type: 'text/csv' });
      
      if (scenario.id === 'comparison') {
        // Run multiple analyses with different models
        const models = [
          { key: 'gpt-4o-mini', name: 'GPT-4o Mini' },
          { key: 'gpt-4o-mini-creative', name: 'GPT-4o Mini (T=0.7)' },
          { key: 'gpt-4.1', name: 'GPT-4.1' }
        ];
        
        const sessionIds: string[] = [];
        for (const model of models) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('modelOverride', model.key);
          
          const res = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
          });
          
          const data = await res.json();
          if (data.sessionId) {
            sessionIds.push(data.sessionId);
          }
        }
        
        setResults({
          ...results,
          [scenario.id]: {
            success: true,
            message: `Created ${sessionIds.length} sessions for comparison`,
            sessionIds
          }
        });
        
      } else {
        // Run single analysis
        const formData = new FormData();
        formData.append('file', file);
        if (scenario.model !== 'mixed') {
          formData.append('modelOverride', 
            scenario.temperature === 0 ? 'gpt-4o-mini' :
            scenario.temperature === 0.7 ? 'gpt-4o-mini-creative' :
            'gpt-4.1'
          );
        }
        
        const res = await fetch('/api/analyze', {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        
        if (data.sessionId) {
          setResults({
            ...results,
            [scenario.id]: {
              success: true,
              sessionId: data.sessionId,
              model: data.model,
              cost: data.cost,
              rating: data.rating
            }
          });
          
          // Navigate to session detail after a short delay
          setTimeout(() => {
            router.push(`/sessions/${data.sessionId}`);
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Scenario failed:', error);
      setResults({
        ...results,
        [scenario.id]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{scenario.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {scenario.model}
                    </span>
                    {scenario.temperature >= 0 && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                        temp={scenario.temperature}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{scenario.expectedOutcome}</p>
                </div>
                
                <button
                  onClick={() => runScenario(scenario)}
                  disabled={running !== null}
                  className={`mt-3 w-full px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    running === scenario.id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {running === scenario.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚙️</span>
                      Running...
                    </span>
                  ) : (
                    'Run Scenario'
                  )}
                </button>
                
                {results[scenario.id] && (
                  <div className={`mt-2 p-2 rounded text-xs ${
                    results[scenario.id].success 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {results[scenario.id].success ? (
                      <>
                        ✅ Success
                        {results[scenario.id].cost && (
                          <span className="ml-2">Cost: {results[scenario.id].cost}</span>
                        )}
                      </>
                    ) : (
                      <>❌ {results[scenario.id].error}</>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Pro Tip</h4>
        <p className="text-sm text-blue-700">
          Run the same scenario multiple times to see how temperature settings affect consistency.
          The &quot;Deterministic Analysis&quot; should produce identical results every time, while others may vary.
        </p>
      </div>
    </div>
  );
}