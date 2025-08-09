import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { TraceEvent } from '@/agent/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionFile = path.join(process.cwd(), 'data', 'sessions', `${id}.jsonl`);
    
    if (!fs.existsSync(sessionFile)) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const content = fs.readFileSync(sessionFile, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const events: TraceEvent[] = lines.map(line => JSON.parse(line));
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}