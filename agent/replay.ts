import { Logger } from './logger';
import { TraceEvent } from './types';
import * as fs from 'fs';
import * as path from 'path';

export class ReplayEngine {
  async replay(sessionId: string): Promise<string> {
    const events = this.loadEvents(sessionId);
    const replayId = `${sessionId}-replay-${Date.now()}`;
    const logger = new Logger(replayId);
    
    for (const event of events) {
      const replayEvent: Partial<TraceEvent> = {
        type: event.type,
        name: event.name + '_replayed',
        input: event.input,
        output: event.output,
        metadata: { 
          ...event.metadata, 
          replayed: true,
          originalEventId: event.eventId
        }
      };
      
      logger.event(
        event.type, 
        replayEvent.name!, 
        replayEvent
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.finalizeSession('completed');
    return replayId;
  }
  
  private loadEvents(sessionId: string): TraceEvent[] {
    const sessionFile = path.join(process.cwd(), 'data', 'sessions', `${sessionId}.jsonl`);
    
    if (!fs.existsSync(sessionFile)) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const content = fs.readFileSync(sessionFile, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    return lines.map(line => JSON.parse(line));
  }
}