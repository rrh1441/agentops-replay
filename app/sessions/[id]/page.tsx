'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TraceEvent } from '@/agent/types';

export default function SessionDetail() {
  const params = useParams();
  const router = useRouter();
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TraceEvent | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/sessions/${params.id}`)
        .then(r => r.json())
        .then(data => {
          setEvents(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading session:', error);
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleReplay = async () => {
    setReplaying(true);
    try {
      const response = await fetch(`/api/sessions/${params.id}/replay`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/sessions/${data.replaySessionId}`);
      }
    } catch (error) {
      console.error('Replay failed:', error);
      setReplaying(false);
    }
  };

  const calculateComplianceScore = (compliance?: any) => {
    if (!compliance) return 0;
    const checks = Object.values(compliance).filter(Boolean).length;
    const total = Object.keys(compliance).length;
    return Math.round((checks / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 overflow-y-auto p-4 border-r">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Session Timeline</h1>
            <p className="text-sm text-gray-600 mt-1">{params.id}</p>
          </div>
          <button
            onClick={handleReplay}
            disabled={replaying}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {replaying ? 'Replaying...' : '🔄 Replay'}
          </button>
        </div>
        
        <div className="space-y-2">
          {events.map((event, i) => (
            <EventCard 
              key={i} 
              event={event} 
              onClick={() => setSelectedEvent(event)}
              isSelected={selectedEvent?.eventId === event.eventId}
              calculateScore={calculateComplianceScore}
            />
          ))}
        </div>
      </div>
      
      <div className="w-1/2 bg-gray-50 p-4 overflow-y-auto">
        <EventInspector event={selectedEvent} />
      </div>
    </div>
  );
}

function EventCard({ 
  event, 
  onClick, 
  isSelected,
  calculateScore 
}: { 
  event: TraceEvent; 
  onClick: () => void;
  isSelected: boolean;
  calculateScore: (compliance?: any) => number;
}) {
  const icons: Record<string, string> = {
    start: '🚀',
    parse: '📄', 
    llm_call: '🤖',
    validation: '✓',
    output: '📊',
    error: '❌'
  };
  
  return (
    <div 
      className={`border rounded p-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icons[event.type] || '📌'}</span>
        <div className="flex-1">
          <div className="font-semibold">{event.name}</div>
          <div className="text-sm text-gray-500">
            {new Date(event.timestamp).toLocaleTimeString()}
          </div>
          {event.metadata?.duration_ms && (
            <div className="text-xs text-gray-400">
              Duration: {event.metadata.duration_ms}ms
            </div>
          )}
        </div>
        {event.metadata?.compliance && (
          <ComplianceBadge score={calculateScore(event.metadata.compliance)} />
        )}
      </div>
    </div>
  );
}

function ComplianceBadge({ score }: { score: number }) {
  const color = score === 100 ? 'bg-green-100 text-green-800' : 
                score >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800';
  
  return (
    <div className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {score}% Compliant
    </div>
  );
}

function EventInspector({ event }: { event: TraceEvent | null }) {
  if (!event) {
    return (
      <div className="text-gray-500 text-center mt-8">
        Select an event to inspect
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Event Inspector</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700 mb-1">Event Details</h3>
          <div className="bg-white p-3 rounded border text-sm">
            <div><strong>ID:</strong> {event.eventId}</div>
            <div><strong>Type:</strong> {event.type}</div>
            <div><strong>Name:</strong> {event.name}</div>
            <div><strong>Timestamp:</strong> {event.timestamp}</div>
            {event.parentId && <div><strong>Parent ID:</strong> {event.parentId}</div>}
          </div>
        </div>

        {event.input && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Input</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {JSON.stringify(event.input, null, 2)}
            </pre>
          </div>
        )}

        {event.output && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Output</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {JSON.stringify(event.output, null, 2)}
            </pre>
          </div>
        )}

        {event.metadata && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Metadata</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}