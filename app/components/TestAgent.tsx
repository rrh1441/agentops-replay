'use client';

import { useState } from 'react';

interface AgentTestResult {
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
  validationFlags?: string[];
}

interface ComparisonResult {
  success: boolean;
  message: string;
  sessions: AgentTestResult[];
  comparison: {
    models: string[];
    totalSessions: number;
    successfulSessions: number;
    avgCost: string;
    avgLatency: number;
  };
  crossModelValidation?: {
    agreementScore: number;
    flags: string[];
  };
}

const DATA_SOURCES = [
  {
    name: 'Tesla 10K 2024',
    filename: 'tesla_10k_2024.csv',
    description: 'Automotive & Energy',
    revenue: '$96.8B',
    quarters: 'Q1-Q4'
  },
  {
    name: 'Microsoft 10K 2024', 
    filename: 'microsoft_10k_2024.csv',
    description: 'Cloud & Software',
    revenue: '$254.2B',
    quarters: 'Q1-Q4'
  },
  {
    name: 'Apple 10K 2024',
    filename: 'apple_10k_2024.csv', 
    description: 'Consumer Electronics',
    revenue: '$424.5B',
    quarters: 'Q1-Q4'
  }
];

export function TestAgent() {
  const [testResults, setTestResults] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAgentTest = async (filename: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/${filename}`);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      
      const result = await analysisResponse.json();
      
      // Add cross-model validation
      const validationResult = performCrossModelValidation(result.sessions);
      result.crossModelValidation = validationResult;
      
      setTestResults(result);
    } catch (error) {
      console.error('Agent test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performCrossModelValidation = (sessions: AgentTestResult[]) => {
    const successful = sessions.filter(s => s.success);
    if (successful.length < 2) {
      return { agreementScore: 100, flags: [] };
    }

    const flags: string[] = [];
    const revenues = successful.map(s => s.kpis.revenue);
    const ebitdas = successful.map(s => s.kpis.ebitda);
    
    // Calculate variance
    const revenueVariance = (Math.max(...revenues) - Math.min(...revenues)) / Math.max(...revenues) * 100;
    const ebitdaVariance = (Math.max(...ebitdas) - Math.min(...ebitdas)) / Math.max(...ebitdas) * 100;
    
    if (revenueVariance > 10) {
      flags.push(`Revenue variance: ${revenueVariance.toFixed(1)}% (>${Math.max(...revenues).toLocaleString()} vs ${Math.min(...revenues).toLocaleString()})`);
    }
    
    if (ebitdaVariance > 10) {
      flags.push(`EBITDA variance: ${ebitdaVariance.toFixed(1)}% (models disagree significantly)`);
    }
    
    // Check temperature warnings
    const nonDeterministic = successful.filter(s => s.temperature > 0);
    if (nonDeterministic.length > 0) {
      flags.push(`${nonDeterministic.length} model(s) using temperature > 0 (hallucination risk)`);
    }
    
    const agreementScore = Math.max(0, 100 - Math.max(revenueVariance, ebitdaVariance));
    
    return { agreementScore: Math.round(agreementScore), flags };
  };

  const getModelDisplayName = (model: string) => {
    if (model.includes('gpt-5-mini')) return 'GPT-5 Mini';
    if (model.includes('gpt-4o-mini')) return 'GPT-4o Mini'; 
    if (model.includes('gpt-3.5-turbo')) {
      if (model.includes('nondeterministic')) return 'GPT-3.5 (T=0.7)';
      return 'GPT-3.5 (T=0)';
    }
    return model;
  };

  const getModelColor = (model: string) => {
    if (model.includes('gpt-5')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (model.includes('gpt-4')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (model.includes('nondeterministic')) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Agent Definition */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Test Your Agent</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-medium text-blue-900">Agent Category</h3>
            <p className="text-blue-800">Finance & Accounting</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Agent Objective</h3>
            <p className="text-blue-800">Extract KPIs from 10K reports to identify financial trends and performance metrics</p>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-blue-900">Agent Data Sources</h3>
          <p className="text-blue-800 text-sm">Select a company 10K report to test across all models</p>
        </div>
      </div>

      {/* Data Source Selection */}
      {!testResults && (
        <div>
          <h3 className="text-lg font-medium mb-4">Select Data Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DATA_SOURCES.map((source) => (
              <button
                key={source.filename}
                onClick={() => runAgentTest(source.filename)}
                disabled={isLoading}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <h4 className="font-semibold text-gray-900">{source.name}</h4>
                <p className="text-sm text-gray-600 mb-1">{source.description}</p>
                <p className="text-xs text-gray-500">Revenue: {source.revenue}</p>
                <p className="text-xs text-gray-500">Data: {source.quarters}</p>
              </button>
            ))}
          </div>
          
          {/* Upload Custom */}
          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📎</div>
              <h4 className="font-medium text-gray-900">Upload Custom Data</h4>
              <p className="text-sm text-gray-600">Or upload your own CSV file</p>
              <label className="inline-block mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 transition-colors">
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      setIsLoading(true);
                      fetch('/api/analyze', { method: 'POST', body: formData })
                        .then(r => r.json())
                        .then(result => {
                          const validationResult = performCrossModelValidation(result.sessions);
                          result.crossModelValidation = validationResult;
                          setTestResults(result);
                        })
                        .finally(() => setIsLoading(false));
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Testing Agent Across All Models</h3>
          <p className="text-gray-600">Running GPT-5, GPT-4o, and GPT-3.5 models...</p>
        </div>
      )}

      {/* Results */}
      {testResults && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Agent Test Results</h3>
            <button
              onClick={() => {
                setTestResults(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Test New Data Source
            </button>
          </div>

          {/* Cross-Model Validation Summary */}
          {testResults.crossModelValidation && (
            <div className="mb-6 p-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Cross-Model Validation</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  testResults.crossModelValidation.agreementScore >= 90 ? 'bg-green-100 text-green-800' :
                  testResults.crossModelValidation.agreementScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {testResults.crossModelValidation.agreementScore}% Agreement
                </div>
              </div>
              
              {testResults.crossModelValidation.flags.length > 0 ? (
                <div className="space-y-2">
                  {testResults.crossModelValidation.flags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-amber-600">⚠️</span>
                      <span className="text-gray-700">{flag}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✅</span>
                  <span className="text-gray-700">All models agree within acceptable variance</span>
                </div>
              )}
            </div>
          )}

          {/* Model Results */}
          <div className="space-y-4">
            {testResults.sessions.map((session) => (
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
                    <span className="text-sm text-gray-600">T={session.temperature}</span>
                    {session.temperature > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        ⚠️ Non-deterministic
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {'⭐'.repeat(Math.floor(session.rating))}
                    </span>
                    <span className="text-sm text-gray-600">{session.rating}/5</span>
                  </div>
                </div>

                {session.success ? (
                  <div>
                    {/* Core Observability Metrics */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs text-gray-600 uppercase tracking-wide">Latency</span>
                          <div className="font-mono text-lg font-semibold">{session.latency}ms</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 uppercase tracking-wide">Cost</span>
                          <div className="font-mono text-lg font-semibold">{session.costFormatted}</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 uppercase tracking-wide">Input Tokens</span>
                          <div className="font-mono text-lg">{session.inputTokens?.toLocaleString() || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 uppercase tracking-wide">Output Tokens</span>
                          <div className="font-mono text-lg">{session.outputTokens?.toLocaleString() || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Prompt Preview */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Prompt Sent</div>
                      <div className="bg-blue-50 p-2 rounded text-xs font-mono overflow-x-auto max-h-20 overflow-y-auto">
                        {session.prompt ? session.prompt.slice(0, 200) + (session.prompt.length > 200 ? '...' : '') : 'N/A'}
                      </div>
                    </div>

                    {/* Response Preview */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Response Received</div>
                      <div className="bg-green-50 p-2 rounded text-xs font-mono overflow-x-auto max-h-20 overflow-y-auto">
                        {JSON.stringify(session.kpis, null, 2).slice(0, 200)}...
                      </div>
                    </div>

                    {/* Session Link */}
                    <div className="flex justify-between items-center">
                      <a 
                        href={`/sessions/${session.sessionId}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>🔍</span>
                        <span>View Full Session Details</span>
                      </a>
                      <button
                        onClick={() => {
                          const data = {
                            sessionId: session.sessionId,
                            model: session.model,
                            temperature: session.temperature,
                            latency: session.latency,
                            cost: session.cost,
                            inputTokens: session.inputTokens,
                            outputTokens: session.outputTokens,
                            prompt: session.prompt,
                            response: session.kpis,
                            timestamp: new Date().toISOString()
                          };
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `session-${session.sessionId}.json`;
                          a.click();
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        💾 Export JSON
                      </button>
                    </div>

                    {/* Recommendations */}
                    {session.recommendation && (
                      <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        💡 {session.recommendation}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">
                    ❌ Test failed: {(session as any).error}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Test Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Models Tested:</span>
                <div className="font-mono">{testResults.comparison.totalSessions}</div>
              </div>
              <div>
                <span className="text-gray-600">Successful:</span>
                <div className="font-mono">{testResults.comparison.successfulSessions}</div>
              </div>
              <div>
                <span className="text-gray-600">Avg Cost:</span>
                <div className="font-mono">${testResults.comparison.avgCost}</div>
              </div>
              <div>
                <span className="text-gray-600">Avg Latency:</span>
                <div className="font-mono">{testResults.comparison.avgLatency}ms</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}