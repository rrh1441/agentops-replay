import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { SessionMetadata } from '@/agent/types';

export async function GET() {
  try {
    const indexPath = path.join(process.cwd(), 'data', 'index.json');
    
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json([]);
    }
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    const sessions: SessionMetadata[] = content ? JSON.parse(content) : [];
    
    sessions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}