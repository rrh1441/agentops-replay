'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/app/components/FileUpload';
import { DemoScenarios } from '@/app/components/DemoScenarios';
import { SessionsList } from '@/app/components/SessionsList';
import { StatCard } from '@/app/components/StatCard';
import { VarianceDetection } from '@/app/components/VarianceDetection';
import { CostCalculator } from '@/app/components/CostCalculator';
import { TestAgent } from '@/app/components/TestAgent';
import { MonitorAgent } from '@/app/components/MonitorAgent';
import { formatCost } from '@/app/services/llm-service';

export default function SessionsPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgCost: 0,
    avgLatency: 0,
    reproducibilityRate: 0,
    avgRating: 0,
    costSavingsPotential: 0,
    speedImprovementPotential: 0
  });  
  const [showVariance, setShowVariance] = useState(false);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);
  
  async function loadStats() {
    try {
      // Get sessions from API (which uses Supabase)
      const response = await fetch('/api/sessions');
      const sessions = await response.json();
      
      if (sessions.length === 0) {
        setStats({
          totalSessions: 0,
          avgCost: 0,
          avgLatency: 0,
          reproducibilityRate: 0,
          avgRating: 0,
          costSavingsPotential: 0,
          speedImprovementPotential: 0
        });
        return;
      }
      
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter((s: any) => s.status === 'completed');
      
      // Calculate average cost
      const totalCost = completedSessions.reduce((sum: number, s: any) => sum + (s.cost || 0), 0);
      const avgCost = totalCost / completedSessions.length || 0;
      
      // Calculate average latency
      const totalLatency = completedSessions.reduce((sum: number, s: any) => sum + (s.latency || 0), 0);
      const avgLatency = totalLatency / completedSessions.length || 0;
      
      // Calculate reproducibility rate (% with temperature=0)
      const deterministicSessions = completedSessions.filter((s: any) => s.temperature === 0).length;
      const reproducibilityRate = (deterministicSessions / completedSessions.length) * 100 || 0;
      
      // Calculate average rating
      const totalRating = completedSessions.reduce((sum: number, s: any) => 
        sum + (s.rating?.stars || 0), 0
      );
      const avgRating = totalRating / completedSessions.length || 0;
      
      // Calculate optimization potentials
      const minCost = Math.min(...completedSessions.map((s: any) => s.cost || Infinity));
      const costSavingsPotential = avgCost > minCost ? ((avgCost - minCost) / avgCost) * 100 : 0;
      
      const minLatency = Math.min(...completedSessions.map((s: any) => s.latency || Infinity));
      const speedImprovementPotential = avgLatency > minLatency ? 
        (avgLatency / minLatency - 1) * 100 : 0;
      
      setStats({
        totalSessions,
        avgCost,
        avgLatency,
        reproducibilityRate,
        avgRating,
        costSavingsPotential,
        speedImprovementPotential
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🔍</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ClearFrame
                </h1>
                <p className="text-gray-600 mt-1">
                  Universal AI Agent Observability Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/docs" 
                className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                📚 Documentation
              </a>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <StatCard 
              label="Total Sessions" 
              value={stats.totalSessions.toString()} 
              color="blue" 
            />
            <StatCard 
              label="Avg Cost" 
              value={stats.avgCost > 0 ? formatCost(stats.avgCost) : '$0'} 
              color={stats.costSavingsPotential > 30 ? "red" : "green"}
              subtitle={stats.costSavingsPotential > 0 ? 
                `${stats.costSavingsPotential.toFixed(0)}% savings possible` : undefined}
            />
            <StatCard 
              label="Reproducibility" 
              value={`${stats.reproducibilityRate.toFixed(0)}%`} 
              color={stats.reproducibilityRate > 80 ? "green" : stats.reproducibilityRate > 50 ? "yellow" : "red"}
              subtitle={stats.reproducibilityRate < 100 ? "Use temp=0 for determinism" : "Fully deterministic"}
            />
            <StatCard 
              label="Avg Rating" 
              value={`${stats.avgRating.toFixed(1)} ⭐`} 
              color={stats.avgRating >= 4 ? "green" : stats.avgRating >= 3 ? "yellow" : "red"}
              subtitle={stats.speedImprovementPotential > 0 ? 
                `${stats.speedImprovementPotential.toFixed(0)}% speed gain available` : undefined}
            />
          </div>
          
          {/* Optimization Recommendations */}
          {(stats.costSavingsPotential > 20 || stats.speedImprovementPotential > 30) && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">Optimization Opportunities</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                {stats.costSavingsPotential > 20 && (
                  <li>• You could save {stats.costSavingsPotential.toFixed(0)}% on costs by using GPT-3.5-turbo consistently</li>
                )}
                {stats.speedImprovementPotential > 30 && (
                  <li>• {(stats.speedImprovementPotential / 100 + 1).toFixed(1)}x speed improvement available with optimized models</li>
                )}
                {stats.reproducibilityRate < 80 && (
                  <li>• {(100 - stats.reproducibilityRate).toFixed(0)}% of sessions are non-deterministic - consider using temperature=0</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Test Your Agent - Primary Feature */}
        <div className="mb-8">
          <TestAgent />
        </div>
        
        {/* Monitor Agent - Secondary Feature */}
        <div className="mb-8">
          <MonitorAgent />
        </div>
        
        {/* Advanced Features */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Features</h2>
          
          {/* Legacy Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Legacy Upload */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Legacy CSV Upload</h3>
              <p className="text-gray-600 text-sm mb-4">Direct file upload for custom data sources</p>
              <FileUpload />
              
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3">Demo Scenarios</h4>
                <DemoScenarios />
              </div>
            </div>
            
            {/* Cost Calculator */}
            <div>
              <CostCalculator />
            </div>
          </div>
          
          {/* Variance Detection */}
          <div className="mb-8">
            <button
              onClick={() => setShowVariance(!showVariance)}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 mb-4"
            >
              <span>⚠️</span>
              <span>{showVariance ? 'Hide' : 'Show'} Variance Detection</span>
            </button>
            
            {showVariance && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">Variance Detection</h3>
                <VarianceDetection />
              </div>
            )}
          </div>
          
          {/* Recent Sessions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
            <SessionsList />
          </div>
        </div>
      </div>
    </div>
  );
}