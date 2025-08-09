import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Session {
  id: string;
  created_at: string;
  file_name: string;
  file_hash: string;
  model: string;
  temperature: number;
  status: 'running' | 'completed' | 'failed';
  kpis?: any;
  valid?: boolean;
  cost?: number;
  latency?: number;
  input_tokens?: number;
  output_tokens?: number;
  rating?: any;
  parent_session_id?: string; // For replay sessions
}

export interface Event {
  id: string;
  session_id: string;
  event_id: string;
  parent_id?: string;
  timestamp: string;
  type: string;
  name: string;
  input?: any;
  output?: any;
  metadata?: any;
}

export async function createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<Session> {
  const { data, error } = await supabase
    .from('logs_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<Session> {
  const { data, error } = await supabase
    .from('logs_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSession(id: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('logs_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return data;
}

export async function getSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('logs_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  return data || [];
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const { data, error } = await supabase
    .from('logs_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEvents(sessionId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('logs_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data || [];
}

export async function getSessionsByFile(fileHash: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('logs_sessions')
    .select('*')
    .eq('file_hash', fileHash)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions by file:', error);
    return [];
  }
  return data || [];
}

export async function getSessionStats() {
  const { data, error } = await supabase
    .from('logs_sessions')
    .select('*')
    .eq('status', 'completed');

  if (error) {
    console.error('Error fetching stats:', error);
    return {
      totalSessions: 0,
      avgCost: 0,
      avgLatency: 0,
      reproducibilityRate: 0,
      avgRating: 0,
    };
  }

  const sessions = data || [];
  const totalSessions = sessions.length;
  
  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      avgCost: 0,
      avgLatency: 0,
      reproducibilityRate: 0,
      avgRating: 0,
    };
  }

  const avgCost = sessions.reduce((sum, s) => sum + (s.cost || 0), 0) / totalSessions;
  const avgLatency = sessions.reduce((sum, s) => sum + (s.latency || 0), 0) / totalSessions;
  const deterministicSessions = sessions.filter(s => s.temperature === 0).length;
  const reproducibilityRate = (deterministicSessions / totalSessions) * 100;
  
  const ratingsSum = sessions.reduce((sum, s) => {
    const rating = s.rating?.stars || 0;
    return sum + rating;
  }, 0);
  const avgRating = ratingsSum / totalSessions;

  return {
    totalSessions,
    avgCost,
    avgLatency,
    reproducibilityRate,
    avgRating,
  };
}

export function hashFile(content: string): string {
  // Simple hash function for demo purposes
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}