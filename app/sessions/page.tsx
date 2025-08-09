'use client';

import { FileUpload } from '@/app/components/FileUpload';
import { DemoSamples } from '@/app/components/DemoSamples';
import { SessionsList } from '@/app/components/SessionsList';
import { StatCard } from '@/app/components/StatCard';

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🔍</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AgentOps Replay
              </h1>
              <p className="text-gray-600 mt-1">
                Universal AI Agent Observability Platform
              </p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <StatCard label="Total Sessions" value="24" color="blue" />
            <StatCard label="Success Rate" value="92%" color="green" />
            <StatCard label="Avg Duration" value="2.3s" color="yellow" />
            <StatCard label="Compliance" value="100%" color="green" />
          </div>
        </div>
      </div>
      
      {/* Upload Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Analyze New Data</h2>
          <FileUpload />
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Or Try a Demo</h3>
            <DemoSamples />
          </div>
        </div>
        
        {/* Recent Sessions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
          <SessionsList />
        </div>
      </div>
    </div>
  );
}