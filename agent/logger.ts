import { TraceEvent, SessionMetadata } from './types';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export class Logger {
  private events: TraceEvent[] = [];
  private eventStartTimes: Map<string, number> = new Map();
  
  constructor(private sessionId: string) {
    this.ensureDataDirectory();
    this.initializeSession();
  }
  
  private ensureDataDirectory(): void {
    const sessionsDir = path.join(process.cwd(), 'data', 'sessions');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
  }
  
  private initializeSession(): void {
    const indexPath = path.join(process.cwd(), 'data', 'index.json');
    let sessions: SessionMetadata[] = [];
    
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8');
      if (content) {
        sessions = JSON.parse(content);
      }
    }
    
    const isReplay = this.sessionId.includes('-replay-');
    const originalSessionId = isReplay ? this.sessionId.split('-replay-')[0] : undefined;
    
    const metadata: SessionMetadata = {
      sessionId: this.sessionId,
      createdAt: new Date().toISOString(),
      isReplay,
      originalSessionId,
      status: 'running',
      eventCount: 0
    };
    
    sessions.push(metadata);
    fs.writeFileSync(indexPath, JSON.stringify(sessions, null, 2));
  }
  
  event(type: TraceEvent['type'], name: string, data?: any): string {
    const eventId = randomUUID();
    const event: TraceEvent = {
      sessionId: this.sessionId,
      eventId,
      timestamp: new Date().toISOString(),
      type,
      name,
      ...data
    };
    
    this.events.push(event);
    this.writeEvent(event);
    this.updateSessionMetadata();
    
    return eventId;
  }
  
  startSpan(type: TraceEvent['type'], name: string, input?: any): string {
    const eventId = this.event(type, `${name}_start`, { input });
    this.eventStartTimes.set(eventId, Date.now());
    return eventId;
  }
  
  endSpan(parentId: string, output: any, metadata?: any): void {
    const startTime = this.eventStartTimes.get(parentId);
    const duration_ms = startTime ? Date.now() - startTime : undefined;
    
    const parentEvent = this.events.find(e => e.eventId === parentId);
    if (!parentEvent) return;
    
    const endEventName = parentEvent.name.replace('_start', '_end');
    
    this.event(parentEvent.type, endEventName, {
      parentId,
      output,
      metadata: {
        ...metadata,
        duration_ms
      }
    });
    
    this.eventStartTimes.delete(parentId);
  }
  
  private writeEvent(event: TraceEvent): void {
    const file = path.join(process.cwd(), 'data', 'sessions', `${this.sessionId}.jsonl`);
    fs.appendFileSync(file, JSON.stringify(event) + '\n');
  }
  
  private updateSessionMetadata(): void {
    const indexPath = path.join(process.cwd(), 'data', 'index.json');
    if (!fs.existsSync(indexPath)) return;
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    const sessions: SessionMetadata[] = JSON.parse(content);
    
    const sessionIndex = sessions.findIndex(s => s.sessionId === this.sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].eventCount = this.events.length;
    }
    
    fs.writeFileSync(indexPath, JSON.stringify(sessions, null, 2));
  }
  
  finalizeSession(status: 'completed' | 'failed' = 'completed'): void {
    const indexPath = path.join(process.cwd(), 'data', 'index.json');
    if (!fs.existsSync(indexPath)) return;
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    const sessions: SessionMetadata[] = JSON.parse(content);
    
    const sessionIndex = sessions.findIndex(s => s.sessionId === this.sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].status = status;
      sessions[sessionIndex].eventCount = this.events.length;
    }
    
    fs.writeFileSync(indexPath, JSON.stringify(sessions, null, 2));
  }
}