import { NextResponse } from 'next/server';
import { ReplayEngine } from '@/agent/replay';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const replayEngine = new ReplayEngine();
    const replaySessionId = await replayEngine.replay(params.id);
    
    return NextResponse.json({ 
      success: true, 
      replaySessionId 
    });
  } catch (error) {
    console.error('Error replaying session:', error);
    return NextResponse.json({ 
      error: 'Failed to replay session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}