import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Debug endpoint - context:', context);
    
    // Test awaiting params
    const params = await context.params;
    console.log('Debug endpoint - params:', params);
    
    const id = params.id;
    console.log('Debug endpoint - id:', id);
    
    return NextResponse.json({ 
      success: true,
      receivedId: id,
      message: `Successfully received ID: ${id}`
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Failed in debug endpoint',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}