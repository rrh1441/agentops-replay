import { NextResponse } from 'next/server';
import { getSession, getSessions } from '@/app/services/supabase-service';

export async function GET() {
  try {
    // Test getting all sessions
    const sessions = await getSessions();
    console.log('Got sessions:', sessions.length);
    
    if (sessions.length > 0) {
      // Test getting a specific session
      const testId = sessions[0].id;
      console.log('Testing getSession with ID:', testId);
      
      const session = await getSession(testId);
      console.log('Got session:', session ? 'Found' : 'Not found');
      
      return NextResponse.json({ 
        success: true,
        totalSessions: sessions.length,
        firstSessionId: testId,
        firstSessionFound: !!session,
        firstSessionData: session ? {
          id: session.id,
          fileName: session.file_name,
          model: session.model,
          temperature: session.temperature
        } : null
      });
    }
    
    return NextResponse.json({ 
      success: true,
      totalSessions: 0,
      message: 'No sessions in database'
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: 'Database test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}