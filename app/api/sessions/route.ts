import { NextResponse } from 'next/server';
import { getSessions } from '@/app/services/supabase-service';

export async function GET() {
  try {
    const sessions = await getSessions();
    
    // Transform to match frontend expectations
    const transformedSessions = sessions.map(session => ({
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
    }));
    
    return NextResponse.json(transformedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}