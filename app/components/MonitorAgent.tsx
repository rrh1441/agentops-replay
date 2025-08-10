'use client';

import { useState } from 'react';

interface ProductionMetrics {
  selectedModel: string;
  accuracy: number;
  uptime: number;
  avgLatency: number;
  totalCost: number;
  requestsToday: number;
  errorsToday: number;
  lastAlert?: string;
}

export function MonitorAgent() {
  const [metrics] = useState<ProductionMetrics>({
    selectedModel: 'gpt-4o-mini',
    accuracy: 99.2,
    uptime: 99.8,
    avgLatency: 1245,
    totalCost: 0.24,
    requestsToday: 847,
    errorsToday: 2,
  });

  const [alerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'Latency increased by 15% in last hour',
      timestamp: '2 hours ago',
      resolved: false
    },
    {
      id: 2, 
      type: 'info',
      message: 'Model upgraded to gpt-4o-mini successfully',
      timestamp: '1 day ago',
      resolved: true
    }
  ]);

  const getStatusColor = (value: number, threshold: number = 95) => {
    if (value >= threshold) return 'text-green-600 bg-green-50 border-green-200';
    if (value >= threshold - 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Monitor Agent</h2>
          <p className="text-gray-600 text-sm">Production deployment monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Live</span>
        </div>
      </div>

      {/* Agent Status */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Production Agent</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Model:</span>
            <span className="ml-2 font-medium text-blue-900">{metrics.selectedModel}</span>
          </div>
          <div>
            <span className="text-blue-700">Category:</span>
            <span className="ml-2 font-medium text-blue-900">Finance & Accounting</span>
          </div>
          <div>
            <span className="text-blue-700">Deployed:</span>
            <span className="ml-2 font-medium text-blue-900">3 days ago</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(metrics.accuracy)}`}>
          <div className="text-2xl font-bold">{metrics.accuracy}%</div>
          <div className="text-sm">Accuracy</div>
        </div>
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(metrics.uptime)}`}>
          <div className="text-2xl font-bold">{metrics.uptime}%</div>
          <div className="text-sm">Uptime</div>
        </div>
        <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-600">
          <div className="text-2xl font-bold">{metrics.avgLatency}ms</div>
          <div className="text-sm">Avg Latency</div>
        </div>
        <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50 text-purple-600">
          <div className="text-2xl font-bold">${metrics.totalCost.toFixed(3)}</div>
          <div className="text-sm">Cost Today</div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Today&apos;s Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Requests:</span>
            <div className="font-mono text-lg">{metrics.requestsToday.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-gray-600">Errors:</span>
            <div className={`font-mono text-lg ${metrics.errorsToday > 5 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.errorsToday}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Success Rate:</span>
            <div className="font-mono text-lg text-green-600">
              {((metrics.requestsToday - metrics.errorsToday) / metrics.requestsToday * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Avg Cost/Request:</span>
            <div className="font-mono text-lg">
              ${(metrics.totalCost / metrics.requestsToday * 1000000).toFixed(2)}/million
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}