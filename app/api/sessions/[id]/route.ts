import { NextResponse } from 'next/server';
import { getSession, getEvents } from '@/app/services/supabase-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get session details
    const session = await getSession(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Get events for this session
    const events = await getEvents(id);
    
    // Transform events to match TraceEvent interface
    const transformedEvents = events.map(event => ({
      sessionId: event.session_id,
      eventId: event.event_id,
      parentId: event.parent_id,
      timestamp: event.timestamp,
      type: event.type,
      name: event.name,
      input: event.input,
      output: event.output,
      metadata: event.metadata
    }));
    
    return NextResponse.json({
      session: {
        id: session.id,
        createdAt: session.created_at,
        fileName: session.file_name,
        fileHash: session.file_hash,
        model: session.model,
        temperature: session.temperature,
        status: session.status,
        kpis: session.kpis,
        valid: session.valid,
        cost: session.cost,
        latency: session.latency,
        inputTokens: session.input_tokens,
        outputTokens: session.output_tokens,
        rating: session.rating,
        parentSessionId: session.parent_session_id
      },
      events: transformedEvents
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}