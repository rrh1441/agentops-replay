'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TraceEvent } from '@/agent/types';

interface Session {
  id: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  eventCount: number;
  duration?: number;
}

export function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  
  useEffect(() => {
    // Get sessions from sessionStorage for demo
    const storedSessions: Session[] = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('session-')) {
        const sessionId = key.replace('session-', '');
        const events = JSON.parse(sessionStorage.getItem(key) || '[]');
        
        if (events.length > 0) {
          const hasValidationIssue = events.some((e: TraceEvent) => 
            e.type === 'validation' && e.output?.valid === false
          );
          
          storedSessions.push({
            id: sessionId,
            timestamp: events[0].timestamp,
            status: hasValidationIssue ? 'warning' : 'success',
            eventCount: events.length,
            duration: events[events.length - 1]?.metadata?.duration_ms
          });
        }
      }
    }
    
    // Add some mock historical sessions for demo
    const mockSessions: Session[] = [
      {
        id: 'demo-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success',
        eventCount: 5,
        duration: 2340
      },
      {
        id: 'demo-2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'warning',
        eventCount: 6,
        duration: 3120
      },
      {
        id: 'demo-3',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        status: 'success',
        eventCount: 5,
        duration: 1890
      }
    ];
    
    setSessions([...storedSessions, ...mockSessions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, []);
  
  const statusIcons = {
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  const statusColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200'
  };
  
  return (
    <div className="space-y-3">
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No sessions yet. Upload a CSV or try a demo sample above.
        </div>
      ) : (
        sessions.map(session => (
          <Link
            key={session.id}
            href={`/sessions/${session.id}`}
            className={`block border rounded-lg p-4 hover:shadow-md transition-all ${statusColors[session.status]}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{statusIcons[session.status]}</span>
                <div>
                  <div className="font-semibold text-gray-900">
                    Session {session.id.slice(0, 8)}...
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(session.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  {session.eventCount} events
                </div>
                {session.duration && (
                  <div className="text-xs text-gray-500">
                    {session.duration}ms
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}