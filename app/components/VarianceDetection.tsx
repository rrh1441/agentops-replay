'use client';

import React, { useEffect, useState } from 'react';
import { formatCost } from '@/app/services/llm-service';

interface SessionVariance {
  fileName: string;
  sessions: Array<{
    id: string;
    model: string;
    temperature: number;
    ebitda?: number;
    cost?: number;
    latency?: number;
    valid?: boolean;
    createdAt: string;
  }>;
  variance: {
    ebitdaRange: number;
    modelCount: number;
    costRange: number;
    deterministicCount: number;
    nonDeterministicCount: number;
  };
}

export function VarianceDetection() {
  const [variances, setVariances] = useState<SessionVariance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVariances();
  }, []);

  async function loadVariances() {
    try {
      // Get all sessions
      const response = await fetch('/api/sessions');
      const sessions = await response.json();
      
      // Group by file name
      const groupedByFile = sessions.reduce((acc: any, session: any) => {
        if (!session.fileName) return acc;
        
        if (!acc[session.fileName]) {
          acc[session.fileName] = {
            fileName: session.fileName,
            sessions: []
          };
        }
        
        acc[session.fileName].sessions.push({
          id: session.id,
          model: session.model,
          temperature: session.temperature,
          ebitda: session.kpis?.ebitda,
          cost: session.cost,
          latency: session.latency,
          valid: session.valid,
          createdAt: session.createdAt
        });
        
        return acc;
      }, {});
      
      // Calculate variance for each file
      const varianceData = Object.values(groupedByFile)
        .filter((group: any) => group.sessions.length > 1)
        .map((group: any) => {
          const ebitdaValues = group.sessions
            .map((s: any) => s.ebitda)
            .filter((v: any) => v !== undefined);
          const costValues = group.sessions
            .map((s: any) => s.cost)
            .filter((v: any) => v !== undefined);
          
          const ebitdaRange = ebitdaValues.length > 0 
            ? Math.max(...ebitdaValues) - Math.min(...ebitdaValues)
            : 0;
          
          const costRange = costValues.length > 0
            ? Math.max(...costValues) - Math.min(...costValues)
            : 0;
          
          const uniqueModels = new Set(group.sessions.map((s: any) => s.model));
          const deterministicCount = group.sessions.filter((s: any) => s.temperature === 0).length;
          const nonDeterministicCount = group.sessions.filter((s: any) => s.temperature > 0).length;
          
          return {
            ...group,
            variance: {
              ebitdaRange,
              modelCount: uniqueModels.size,
              costRange,
              deterministicCount,
              nonDeterministicCount
            }
          };
        })
        .sort((a: any, b: any) => b.sessions.length - a.sessions.length);
      
      setVariances(varianceData);
    } catch (error) {
      console.error('Failed to load variances:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading variance data...</div>
      </div>
    );
  }

  if (variances.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Variance Detected Yet</h3>
        <p className="text-gray-500">Upload the same file multiple times to see variance analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Variance Detected in {variances.length} File{variances.length > 1 ? 's' : ''}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Same input files are producing different results across sessions.</p>
            </div>
          </div>
        </div>
      </div>

      {variances.map((variance) => (
        <div key={variance.fileName} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{variance.fileName}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {variance.sessions.length} sessions analyzed
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {variance.variance.ebitdaRange > 0 ? `$${(variance.variance.ebitdaRange / 1000000).toFixed(1)}M` : 'None'}
                </div>
                <div className="text-xs text-gray-500 mt-1">EBITDA Variance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {variance.variance.modelCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">Different Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {variance.variance.costRange > 0 ? `${(variance.variance.costRange * 1000).toFixed(1)}x` : 'Same'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Cost Difference</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((variance.variance.deterministicCount / variance.sessions.length) * 100)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Deterministic</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Session Comparison</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temp</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">EBITDA</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Valid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {variance.sessions
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {new Date(session.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              session.model.includes('gpt-4') ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {session.model}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {session.temperature}
                          </td>
                          <td className="px-3 py-2 text-sm text-right text-gray-900">
                            {session.ebitda ? `$${(session.ebitda / 1000000).toFixed(1)}M` : 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-sm text-right text-gray-900">
                            {session.cost ? formatCost(session.cost) : 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-sm text-center">
                            {session.valid ? '✅' : '❌'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {variance.sessions.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing 5 of {variance.sessions.length} sessions
                </p>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Impact:</strong> Without observability, these variations would go unnoticed in production,
                potentially leading to inconsistent business decisions and compliance issues.
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}