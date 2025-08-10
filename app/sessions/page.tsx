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
        
      </div>
    </div>
  );
}