import { NextResponse } from 'next/server';
import { 
  getSession, 
  getEvents,
  createSession,
  createEvent,
  updateSession
} from '@/app/services/supabase-service';
import { callLLM, calculateSessionRating } from '@/app/services/llm-service';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 requires awaiting params
    const params = await context.params;
    const id = params.id;
    
    console.log('Replaying session:', id);
    
    // Get original session
    const originalSession = await getSession(id);
    if (!originalSession) {
      return NextResponse.json(
        { error: 'Original session not found' },
        { status: 404 }
      );
    }
    
    // Get original events
    const originalEvents = await getEvents(id);
    
    // Create new replay session
    const replaySession = await createSession({
      file_name: `REPLAY: ${originalSession.file_name}`,
      model: originalSession.model || 'gpt-4o-mini',
      temperature: originalSession.temperature || 0,
      status: 'running',
      parent_session_id: id
    });
    
    // If temperature is 0 (deterministic), we can reuse outputs
    // If temperature > 0, we should actually re-run for different results
    const isDeterministic = originalSession.temperature === 0 || originalSession.temperature === null;
    
    let finalKpis = originalSession.kpis;
    let finalCost = originalSession.cost;
    let finalLatency = originalSession.latency;
    let finalInputTokens = originalSession.input_tokens;
    let finalOutputTokens = originalSession.output_tokens;
    let finalValid = originalSession.valid;
    
    // Replay events
    for (const event of originalEvents) {
      if (event.type === 'llm_call' && !isDeterministic) {
        // For non-deterministic, actually re-run the LLM call
        const prompt = event.input?.prompt || 'Extract financial KPIs from this data';
        
        try {
          const modelKey = originalSession.model?.includes('gpt-4') ? 'gpt-4o-mini' :
                          originalSession.temperature === 0.7 ? 'gpt-4o-mini-creative' :
                          'gpt-4o-mini';
          
          const llmResponse = await callLLM(prompt, modelKey);
          const newKpis = JSON.parse(llmResponse.content);
          
          // Create event with new output
          await createEvent({
            session_id: replaySession.id,
            event_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: event.type,
            name: event.name + '_replayed',
            input: event.input,
            output: newKpis, // New output!
            metadata: {
              ...event.metadata,
              replayed: true,
              originalEventId: event.event_id,
              cost: llmResponse.cost,
              latency: llmResponse.latency,
              variance: calculateVariance(originalSession.kpis, newKpis)
            }
          });
          
          finalKpis = newKpis;
          finalCost = llmResponse.cost;
          finalLatency = llmResponse.latency;
          finalInputTokens = llmResponse.inputTokens;
          finalOutputTokens = llmResponse.outputTokens;
          
        } catch (error) {
          console.error('Failed to re-run LLM call:', error);
          // Fall back to using original output
          await createEvent({
            session_id: replaySession.id,
            event_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: event.type,
            name: event.name + '_replayed',
            input: event.input,
            output: event.output,
            metadata: {
              ...event.metadata,
              replayed: true,
              originalEventId: event.event_id,
              replayError: true
            }
          });
        }
      } else {
        // For deterministic or non-LLM events, use original output
        await createEvent({
          session_id: replaySession.id,
          event_id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: event.type,
          name: event.name + '_replayed',
          input: event.input,
          output: event.output,
          metadata: {
            ...event.metadata,
            replayed: true,
            originalEventId: event.event_id
          }
        });
      }
      
      // Add small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Validate the replayed KPIs
    if (finalKpis) {
      const expectedEbitda = finalKpis.revenue - finalKpis.cogs - finalKpis.opex;
      const ebitdaDiff = Math.abs(finalKpis.ebitda - expectedEbitda);
      finalValid = ebitdaDiff < 1000;
    }
    
    // Calculate rating for replay session
    const rating = calculateSessionRating(
      finalLatency || 1000,
      finalCost || 0.001,
      originalSession.temperature || 0,
      finalValid || false
    );
    
    // Update replay session with final results
    await updateSession(replaySession.id, {
      status: 'completed',
      kpis: finalKpis,
      valid: finalValid,
      cost: finalCost,
      latency: finalLatency,
      input_tokens: finalInputTokens,
      output_tokens: finalOutputTokens,
      rating
    });
    
    return NextResponse.json({ 
      success: true, 
      replaySessionId: replaySession.id,
      isDeterministic,
      varianceDetected: !isDeterministic && calculateVariance(originalSession.kpis, finalKpis) > 0
    });
    
  } catch (error) {
    console.error('Error in POST /api/sessions/[id]/replay:', error);
    return NextResponse.json({ 
      error: 'Failed to replay session',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function calculateVariance(original: any, replayed: any): number {
  if (!original || !replayed) return 0;
  
  const originalEbitda = original.ebitda || 0;
  const replayedEbitda = replayed.ebitda || 0;
  
  if (originalEbitda === 0) return 0;
  
  return Math.abs((replayedEbitda - originalEbitda) / originalEbitda) * 100;
}