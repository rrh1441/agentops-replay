import { NextResponse } from 'next/server';
import { getSessions, getEvents } from '@/app/services/supabase-service';

export async function GET() {
  try {
    // Get first session
    const sessions = await getSessions();
    
    if (sessions.length > 0) {
      const testId = sessions[0].id;
      console.log('Testing getEvents with ID:', testId);
      
      // This is where it might fail
      const events = await getEvents(testId);
      console.log('Got events:', events.length);
      
      return NextResponse.json({ 
        success: true,
        sessionId: testId,
        eventCount: events.length,
        firstEvent: events.length > 0 ? {
          id: events[0].id,
          type: events[0].type,
          name: events[0].name
        } : null
      });
    }
    
    return NextResponse.json({ 
      success: false,
      message: 'No sessions to test'
    });
    
  } catch (error) {
    console.error('Events test error:', error);
    return NextResponse.json({ 
      error: 'Events test failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}