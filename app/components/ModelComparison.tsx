'use client';

import { useState } from 'react';

interface ModelComparisonResult {
  sessionId: string;
  success: boolean;
  model: string;
  temperature: number;
  cost: number;
  costFormatted: string;
  rating: number;
  recommendation: string;
  latency: number;
  kpis: {
    revenue: number;
    cogs: number;
    opex: number;
    ebitda: number;
    margin: string;
  };
}

interface ComparisonData {
  success: boolean;
  message: string;
  sessions: ModelComparisonResult[];
  comparison: {
    models: string[];
    totalSessions: number;
    successfulSessions: number;
    avgCost: string;
    avgLatency: number;
  };
}

export function ModelComparison() {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runComparison = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setComparisonData(result);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      runComparison(file);
    }
  };

  const getModelDisplayName = (model: string) => {
    if (model === 'gpt-4.1') return 'GPT-4.1';
    if (model === 'gpt-4.1-mini') return 'GPT-4.1 Mini';
    if (model === 'gpt-4o') return 'GPT-4o';
    if (model === 'gpt-4o-mini') return 'GPT-4o Mini';
    if (model === 'o3') return 'O3';
    return model;
  };

  const getModelColor = (model: string) => {
    if (model === 'o3') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (model === 'gpt-4.1') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (model === 'gpt-4.1-mini') return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    if (model === 'gpt-4o') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (model === 'gpt-4o-mini') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Multi-Model Comparison</h2>
      
      {!comparisonData && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">⚖️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Compare All Models
          </h3>
          <p className="text-gray-600 mb-6">
            Upload a CSV file to run analysis across GPT-5, GPT-4o, and GPT-3.5 models
          </p>
          <label className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
            {isLoading ? 'Running Analysis...' : 'Select CSV File'}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">Running analysis across all models...</p>
        </div>
      )}

      {comparisonData && (
        <div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Comparison Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Models:</span>
                <div className="font-mono">{comparisonData.comparison.models.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Successful:</span>
                <div className="font-mono">{comparisonData.comparison.successfulSessions}/{comparisonData.comparison.totalSessions}</div>
              </div>
              <div>
                <span className="text-gray-600">Avg Cost:</span>
                <div className="font-mono">${comparisonData.comparison.avgCost}</div>
              </div>
              <div>
                <span className="text-gray-600">Avg Latency:</span>
                <div className="font-mono">{comparisonData.comparison.avgLatency}ms</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {comparisonData.sessions.map((session) => (
              <div 
                key={session.sessionId} 
                className={`p-4 rounded-lg border-2 ${
                  session.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getModelColor(session.model)}`}>
                      {getModelDisplayName(session.model)}
                    </span>
                    <span className="text-sm text-gray-600">
                      T={session.temperature}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {'⭐'.repeat(Math.floor(session.rating))}
                    </span>
                    <span className="text-sm text-gray-600">
                      {session.rating}/5
                    </span>
                  </div>
                </div>

                {session.success ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-gray-600 uppercase tracking-wide">Revenue</span>
                        <div className="font-mono text-sm">${session.kpis.revenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 uppercase tracking-wide">COGS</span>
                        <div className="font-mono text-sm">${session.kpis.cogs.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 uppercase tracking-wide">OpEx</span>
                        <div className="font-mono text-sm">${session.kpis.opex.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 uppercase tracking-wide">EBITDA</span>
                        <div className="font-mono text-sm font-semibold">${session.kpis.ebitda.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 uppercase tracking-wide">Margin</span>
                        <div className="font-mono text-sm">{session.kpis.margin}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                      <div>
                        <span>Cost: </span>
                        <span className="font-mono">{session.costFormatted}</span>
                      </div>
                      <div>
                        <span>Latency: </span>
                        <span className="font-mono">{session.latency}ms</span>
                      </div>
                      <div>
                        <span>Session: </span>
                        <a 
                          href={`/sessions/${session.sessionId}`}
                          className="font-mono text-blue-600 hover:underline"
                        >
                          {session.sessionId.slice(0, 8)}...
                        </a>
                      </div>
                    </div>

                    {session.recommendation && (
                      <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        💡 {session.recommendation}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">
                    ❌ Analysis failed: {(session as any).error}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setComparisonData(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Run New Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
}