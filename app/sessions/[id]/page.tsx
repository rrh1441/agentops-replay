'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TraceEvent } from '@/agent/types';
import { ReplayProgress } from '@/app/components/ReplayProgress';
import { formatCost } from '@/app/services/llm-service';

export default function SessionDetail() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TraceEvent | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      // Fetch from Supabase via API
      fetch(`/api/sessions/${params.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.session) {
            setSession(data.session);
            setEvents(data.events || []);
          } else if (data.error) {
            console.error('Session not found:', data.error);
          }
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
    setReplayProgress(0);
    
    // Simulate replay progress for demo
    const progressInterval = setInterval(() => {
      setReplayProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      const response = await fetch(`/api/sessions/${params.id}/replay`, {
        method: 'POST'
      });
      const data = await response.json();
      
      // Wait for progress to complete
      setTimeout(() => {
        if (data.success) {
          // Copy current session data to new replay session
          const currentEvents = sessionStorage.getItem(`session-${params.id}`);
          if (currentEvents) {
            // Add replay markers to events
            const replayEvents = JSON.parse(currentEvents).map((e: TraceEvent) => ({
              ...e,
              sessionId: data.replaySessionId,
              metadata: {
                ...e.metadata,
                isReplay: true,
                originalSessionId: params.id
              }
            }));
            sessionStorage.setItem(`session-${data.replaySessionId}`, JSON.stringify(replayEvents));
          }
          router.push(`/sessions/${data.replaySessionId}`);
        }
      }, 2000);
    } catch (error) {
      console.error('Replay failed:', error);
      clearInterval(progressInterval);
      setReplaying(false);
      setReplayProgress(0);
    }
  };

  const calculateComplianceScore = (compliance?: Record<string, boolean>) => {
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
    <>
      <ReplayProgress progress={replayProgress} isActive={replaying} />
      <div className="flex h-screen bg-gray-50">
        <div className="w-1/2 overflow-y-auto p-6 bg-white border-r">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Session Timeline</h1>
            <p className="text-sm text-gray-600 mt-1">ID: {params.id}</p>
            {session && (
              <div className="flex gap-4 mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {session.model}
                </span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                  Temp: {session.temperature}
                </span>
                {session.cost && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    Cost: {formatCost(session.cost, session.totalTokens)}
                  </span>
                )}
                {session.rating && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    {'⭐'.repeat(session.rating.stars)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/sessions')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleReplay}
              disabled={replaying}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {replaying ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  <span>Replaying...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Replay</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
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
      
        <div className="w-1/2 bg-gray-50 p-6 overflow-y-auto">
          <EventInspector event={selectedEvent} />
        </div>
      </div>
    </>
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
  calculateScore: (compliance?: Record<string, boolean>) => number;
}) {
  const icons: Record<string, string> = {
    start: '🚀',
    parse: '📄', 
    llm_call: '🤖',
    validation: '✅',
    output: '📊',
    error: '❌'
  };
  
  const colors: Record<string, string> = {
    start: 'bg-blue-50 border-blue-200',
    parse: 'bg-purple-50 border-purple-200',
    llm_call: 'bg-indigo-50 border-indigo-200',
    validation: event.output?.valid === false 
      ? 'bg-yellow-50 border-yellow-200' 
      : 'bg-green-50 border-green-200',
    output: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200'
  };
  
  return (
    <div 
      className={`
        border-2 rounded-lg p-4 cursor-pointer transition-all
        ${colors[event.type] || 'bg-gray-50 border-gray-200'}
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01]'}
        animate-slide-in
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl group-hover:scale-110 transition-transform">{icons[event.type] || '📌'}</div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{event.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {new Date(event.timestamp).toLocaleTimeString()}
          </div>
          {event.metadata?.duration_ms && (
            <div className="text-xs text-gray-500 mt-1">
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
  
  const getExplanation = () => {
    if (score === 100) return 'Fully deterministic, no PII, within token limits';
    if (score >= 67) return 'Mostly compliant (2/3 checks passed)';
    if (score >= 33) return 'Partially compliant (1/3 checks passed)';
    return 'Non-compliant (0/3 checks passed)';
  };
  
  return (
    <div className={`px-2 py-1 rounded text-xs font-semibold ${color}`} title={getExplanation()}>
      {score}% Compliant
    </div>
  );
}

function EventInspector({ event }: { event: TraceEvent | null }) {
  const [showRawJson, setShowRawJson] = useState(false);
  
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-6xl mb-4">🔍</div>
        <div className="text-lg">Select an event to inspect</div>
      </div>
    );
  }

  // Extract the LLM-specific details
  const isLLMCall = event.type === 'llm_call';
  const hasError = event.type === 'error' || event.output?.error;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Event Inspector</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {showRawJson ? 'Hide JSON' : 'Show JSON'}
          </button>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(event, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `event-${event.eventId}.json`;
              a.click();
            }}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>
      
      {showRawJson ? (
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(event, null, 2)}
        </pre>
      ) : (
        <div className="space-y-6">
          {/* Core Metrics */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">⚡ Performance Metrics</h3>
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-600">Latency</span>
                <div className="text-2xl font-bold text-gray-900">
                  {event.metadata?.duration_ms || 0}ms
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Cost</span>
                <div className="text-2xl font-bold text-gray-900">
                  {event.metadata?.cost ? formatCost(event.metadata.cost, event.metadata?.tokens?.total) : 'N/A'}
                </div>
              </div>
              {event.metadata?.tokens && (
                <>
                  <div>
                    <span className="text-xs text-gray-600">Input Tokens</span>
                    <div className="text-lg font-semibold text-gray-700">
                      {event.metadata.tokens.input?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Output Tokens</span>
                    <div className="text-lg font-semibold text-gray-700">
                      {event.metadata.tokens.output?.toLocaleString() || 0}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Error Display */}
          {hasError && (
            <div>
              <h3 className="font-semibold text-red-700 mb-3 text-sm uppercase tracking-wide">❌ Error Details</h3>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <pre className="text-sm text-red-800 whitespace-pre-wrap">
                  {JSON.stringify(event.output?.error || (event as any).error || 'Unknown error', null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {/* Prompt/Input */}
          {event.input && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">📥 Input / Prompt</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {typeof event.input === 'string' ? event.input : JSON.stringify(event.input, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {/* Response/Output */}
          {event.output && !hasError && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">📤 Output / Response</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {typeof event.output === 'string' ? event.output : JSON.stringify(event.output, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {/* Model Configuration */}
          {isLLMCall && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">⚙️ Model Configuration</h3>
              <div className="bg-purple-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Model:</span>
                  <span className="font-mono ml-2">{event.metadata?.model || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-mono ml-2">{event.metadata?.temperature ?? 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Max Tokens:</span>
                  <span className="font-mono ml-2">{event.metadata?.max_tokens || 'Default'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="font-mono ml-2">{new Date(event.timestamp).toISOString()}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Compliance Details */}
          {event.metadata?.compliance && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">✅ Compliance Details</h3>
              <div className="bg-yellow-50 p-4 rounded-lg text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deterministic (T=0):</span>
                  <span className={event.metadata.compliance.deterministic ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {event.metadata.compliance.deterministic ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No PII Detected:</span>
                  <span className={event.metadata.compliance.no_pii ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {event.metadata.compliance.no_pii ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Within Token Limit:</span>
                  <span className={event.metadata.compliance.within_token_limit ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {event.metadata.compliance.within_token_limit ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Metadata */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">🏷️ Event Metadata</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Event ID:</span>
                <span className="font-mono text-xs">{event.eventId}</span>
              </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-semibold">{event.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold">{event.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp:</span>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            {event.parentId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Parent ID:</span>
                <span className="font-mono text-xs">{event.parentId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}