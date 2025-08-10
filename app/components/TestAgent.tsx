'use client';

import { useState } from 'react';
import { recommendModel } from '@/app/services/llm-service';

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
  inputTokens?: number;
  outputTokens?: number;
  prompt?: string;
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

// DATA_SOURCES removed - using inline data in the 2x2 grid

export function TestAgent() {
  const [testResults, setTestResults] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o-mini', 'gpt-4o-mini-creative', 'gpt-4.1-mini', 'gpt-4.1', 'gpt-4o']);

  const runAgentTest = async () => {
    if (!selectedDataSource) return;
    
    setIsLoading(true);
    
    try {
      let file: File;
      
      if (selectedDataSource.startsWith('custom:')) {
        // Use the uploaded custom file
        file = (window as any).__customFile;
        if (!file) {
          alert('Please select a file first');
          setIsLoading(false);
          return;
        }
      } else {
        // Fetch the pre-defined file
        const response = await fetch(`/${selectedDataSource}`);
        const blob = await response.blob();
        file = new File([blob], selectedDataSource, { type: 'text/csv' });
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('models', JSON.stringify(selectedModels));
      
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
    if (model === 'gpt-4.1') return 'GPT-4.1';
    if (model === 'gpt-4.1-mini') return 'GPT-4.1 Mini';
    if (model === 'gpt-4o') return 'GPT-4o';
    if (model === 'gpt-4o-mini') return 'GPT-4o Mini';
    if (model === 'gpt-4o-mini-creative') return 'GPT-4o Mini (T=0.7)';
    return model;
  };

  const getModelColor = (model: string) => {
    if (model === 'gpt-4.1') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (model === 'gpt-4.1-mini') return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    if (model === 'gpt-4o') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (model === 'gpt-4o-mini-creative') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (model === 'gpt-4o-mini') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6">Agent Testing Ground</h2>
      
      {/* Agent Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Agent Category</h3>
          <p className="text-lg font-medium text-gray-900">Finance & Accounting</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Agent Objective</h3>
          <p className="text-lg font-medium text-gray-900">Extract Financial KPIs</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Data Sources</h3>
          <p className="text-lg font-medium text-gray-900">10K Reports (CSV)</p>
        </div>
      </div>

      {/* Data Source Selection - 2x2 Grid */}
      {!testResults && (
        <div>
          <h3 className="text-lg font-medium mb-4">Select Data Source</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Tesla */}
            <button
              onClick={() => setSelectedDataSource('tesla_10k_2024.csv')}
              disabled={isLoading}
              className={`p-6 border-2 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group ${
                selectedDataSource === 'tesla_10k_2024.csv' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🚗</span>
                  <h4 className="font-bold text-lg text-gray-900">Tesla</h4>
                </div>
                <p className="text-sm text-gray-600">$96.8B Revenue • 2024 Q1-Q3</p>
              </div>
            </button>
            
            {/* Microsoft */}
            <button
              onClick={() => setSelectedDataSource('microsoft_10k_2024.csv')}
              disabled={isLoading}
              className={`p-6 border-2 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group ${
                selectedDataSource === 'microsoft_10k_2024.csv' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">💻</span>
                  <h4 className="font-bold text-lg text-gray-900">Microsoft</h4>
                </div>
                <p className="text-sm text-gray-600">$218.3B Revenue • 2024 Fiscal Year</p>
              </div>
            </button>
            
            {/* Amazon (Apple) */}
            <button
              onClick={() => setSelectedDataSource('apple_10k_2024.csv')}
              disabled={isLoading}
              className={`p-6 border-2 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group ${
                selectedDataSource === 'apple_10k_2024.csv' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">📦</span>
                  <h4 className="font-bold text-lg text-gray-900">Amazon</h4>
                </div>
                <p className="text-sm text-gray-600">$383.3B Revenue • 2024 Fiscal Year</p>
              </div>
            </button>
            
            {/* Upload Custom */}
            <div className={`p-6 border-2 border-dashed rounded-lg transition-all ${
              selectedDataSource?.startsWith('custom:')
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📎</span>
                <h4 className="font-bold text-lg text-gray-900">Upload CSV</h4>
              </div>
              <label className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors cursor-pointer">
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Store the file for later use when Run Test is clicked
                      setSelectedDataSource('custom:' + file.name);
                      // Store file in a way we can access it later
                      (window as any).__customFile = file;
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Model Selection */}
          <h3 className="text-lg font-medium mb-4 mt-6">Select Models</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { key: 'gpt-4o-mini', label: 'GPT-4o Mini (T=0)', color: 'bg-green-100 text-green-800 border-green-300' },
              { key: 'gpt-4o-mini-creative', label: 'GPT-4o Mini (T=0.7)', color: 'bg-orange-100 text-orange-800 border-orange-300' },
              { key: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
              { key: 'gpt-4.1', label: 'GPT-4.1', color: 'bg-purple-100 text-purple-800 border-purple-300' },
              { key: 'gpt-4o', label: 'GPT-4o', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }
            ].map(model => (
              <button
                key={model.key}
                onClick={() => {
                  setSelectedModels(prev => 
                    prev.includes(model.key) 
                      ? prev.filter(m => m !== model.key)
                      : [...prev, model.key]
                  );
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedModels.includes(model.key) 
                    ? model.color + ' border-2' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedModels.includes(model.key) && <span className="mr-2">✓</span>}
                {model.label}
              </button>
            ))}
          </div>
          
          {/* Run Test Button */}
          <div className="flex justify-center">
            <button
              onClick={runAgentTest}
              disabled={isLoading || !selectedDataSource || selectedModels.length === 0}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Running Test...' : 'Run Test'}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Testing Agent Across All Models</h3>
          <p className="text-gray-600">Running GPT-4.1, GPT-4o, and GPT-4o Mini models...</p>
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