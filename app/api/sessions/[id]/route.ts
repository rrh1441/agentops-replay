import { NextResponse } from 'next/server';
import { getSession, getEvents } from '@/app/services/supabase-service';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get the ID from params
    const params = await context.params;
    const sessionId = params.id;
    
    // Get session from database
    const session = await getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found', sessionId },
        { status: 404 }
      );
    }
    
    // Get events from database
    const events = await getEvents(sessionId);
    
    // Return the data
    return NextResponse.json({
      session: {
        id: session.id,
        createdAt: session.created_at,
        fileName: session.file_name,
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
      events: events.map(e => ({
        sessionId: e.session_id,
        eventId: e.event_id,
        parentId: e.parent_id,
        timestamp: e.timestamp,
        type: e.type,
        name: e.name,
        input: e.input,
        output: e.output,
        metadata: e.metadata
      }))
    });
    
  } catch (error) {
    console.error('Error in /api/sessions/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}