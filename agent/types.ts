export interface TraceEvent {
  sessionId: string;
  eventId: string;
  parentId?: string;
  timestamp: string;
  type: 'start' | 'parse' | 'llm_call' | 'validation' | 'output' | 'error';
  name: string;
  input?: any;
  output?: any;
  metadata?: {
    duration_ms?: number;
    model?: string;
    temperature?: number;
    tokens?: { 
      input: number; 
      output: number;
      total?: number;
    };
    compliance?: {
      deterministic: boolean;
      no_pii: boolean;
      within_token_limit: boolean;
    };
    replayed?: boolean;
    isReplay?: boolean;
    originalSessionId?: string;
    originalEventId?: string;
    [key: string]: any; // Allow additional properties
  };
}

export interface SessionMetadata {
  sessionId: string;
  createdAt: string;
  isReplay: boolean;
  originalSessionId?: string;
  status: 'running' | 'completed' | 'failed';
  eventCount: number;
}

export interface KPIResult {
  revenue: number;
  cogs: number;
  opex: number;
  ebitda: number;
  year_over_year_growth?: number;
}

export interface AnalysisResult {
  sessionId: string;
  kpis: KPIResult;
  valid: boolean;
}