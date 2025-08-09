'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SessionMetadata } from '@/agent/types';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading sessions:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">AgentOps Sessions</h1>
      
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No sessions yet. Run an analysis to create your first session.
          </div>
        ) : (
          sessions.map((session) => (
            <Link
              key={session.sessionId}
              href={`/sessions/${session.sessionId}`}
              className="block"
            >
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">
                      {session.isReplay ? '🔄 Replay' : '📊 Analysis'} Session
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ID: {session.sessionId}
                    </div>
                    {session.originalSessionId && (
                      <div className="text-sm text-gray-500 mt-1">
                        Replay of: {session.originalSessionId}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {session.eventCount} events
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(session.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}