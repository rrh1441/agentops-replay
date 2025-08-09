# Vercel Deployment Solutions

## The Problem
Vercel's serverless functions don't have persistent filesystem storage. Each function invocation is isolated.

## Solution Options for Demo

### Option 1: In-Memory Storage (Simplest for Demo)
**Use a global variable or memory cache for the demo session.**

```typescript
// lib/session-store.ts
// This will work for a single demo session but resets on redeploy

interface SessionStore {
  sessions: Record<string, any>;
  events: Record<string, any[]>;
}

// Global in-memory store (persists during function warm state)
const store: SessionStore = {
  sessions: {},
  events: {}
};

export function saveSession(sessionId: string, events: any[]) {
  store.sessions[sessionId] = {
    id: sessionId,
    createdAt: new Date().toISOString(),
    eventCount: events.length
  };
  store.events[sessionId] = events;
}

export function getSession(sessionId: string) {
  return store.sessions[sessionId];
}

export function getEvents(sessionId: string) {
  return store.events[sessionId] || [];
}

export function getAllSessions() {
  return Object.values(store.sessions);
}
```

### Option 2: Vercel KV (Redis) - Quick Setup
**Best for demo that needs to persist a bit longer**

```bash
# Install Vercel KV
npm install @vercel/kv
```

```typescript
// lib/kv-store.ts
import { kv } from '@vercel/kv';

export async function saveSession(sessionId: string, events: any[]) {
  // Store with 1 hour expiry for demo
  await kv.setex(`session:${sessionId}`, 3600, JSON.stringify({
    id: sessionId,
    createdAt: new Date().toISOString(),
    events
  }));
  
  // Add to session list
  await kv.sadd('sessions', sessionId);
}

export async function getSession(sessionId: string) {
  const data = await kv.get(`session:${sessionId}`);
  return data ? JSON.parse(data as string) : null;
}
```

### Option 3: Pre-computed Demo Data (Fastest)
**Perfect for hackathon demo - no storage needed!**

```typescript
// lib/demo-data.ts
// Pre-analyze sample data and store results as constants

export const DEMO_SESSIONS = {
  'demo-tesla-2024': {
    id: 'demo-tesla-2024',
    company: 'Tesla',
    createdAt: '2024-01-15T10:00:00Z',
    events: [
      // Pre-computed events from analyzing Tesla data
      { type: 'start', name: 'analysis_start', ... },
      { type: 'parse', name: 'csv_parse', ... },
      { type: 'llm_call', name: 'extract_kpis', ... },
      // ... etc
    ]
  },
  'demo-microsoft-2024': {
    // Pre-computed Microsoft analysis
  }
};

// For upload, generate on-the-fly with mock data
export async function analyzeUpload(csvContent: string) {
  // Parse CSV
  const rows = parse(csvContent);
  
  // Generate mock analysis events (fast, no API calls)
  return {
    id: `upload-${Date.now()}`,
    events: [
      { type: 'start', name: 'analysis_start', timestamp: new Date() },
      { type: 'parse', name: 'csv_parse', output: { rows: rows.length } },
      { type: 'llm_call', name: 'extract_kpis', output: { 
        // Mock KPIs based on CSV
        revenue: rows[0]?.Revenue || 150000,
        ebitda: rows[0]?.Revenue * 0.3 || 45000
      }},
      { type: 'validation', name: 'validate', output: { valid: true } }
    ]
  };
}
```

## Recommended Approach for Your Demo

### **Hybrid Solution (Best for Hackathon)**

1. **Pre-loaded demos** - Store as constants (no API needed)
2. **Live uploads** - Process in-memory and return immediately
3. **No persistence needed** - Each demo is self-contained

```typescript
// app/api/analyze/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const content = await file.text();
  
  // Parse CSV
  const records = parse(content, { columns: true });
  
  // Generate analysis events (mock or real)
  const events = [
    {
      type: 'start',
      name: 'analysis_start',
      timestamp: new Date().toISOString(),
      input: { filename: file.name }
    },
    {
      type: 'parse',
      name: 'csv_parse',
      timestamp: new Date().toISOString(),
      output: { rows: records.length, columns: Object.keys(records[0]) }
    },
    {
      type: 'llm_call',
      name: 'extract_kpis',
      timestamp: new Date().toISOString(),
      output: {
        revenue: records.reduce((sum, r) => sum + (r.Revenue || 0), 0),
        ebitda: records.reduce((sum, r) => sum + (r.Revenue || 0), 0) * 0.3
      }
    },
    {
      type: 'validation',
      name: 'validate_kpis',
      timestamp: new Date().toISOString(),
      output: { valid: true }
    }
  ];
  
  // Return events directly (no storage)
  return NextResponse.json({
    sessionId: `live-${Date.now()}`,
    events
  });
}
```

```typescript
// app/sessions/[id]/page.tsx
export default function SessionPage({ params }: { params: { id: string } }) {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    if (params.id.startsWith('demo-')) {
      // Load pre-computed demo data
      setEvents(DEMO_SESSIONS[params.id].events);
    } else if (params.id.startsWith('live-')) {
      // Events were passed via URL state or sessionStorage
      const stored = sessionStorage.getItem(`events-${params.id}`);
      if (stored) setEvents(JSON.parse(stored));
    }
  }, [params.id]);
  
  // ... rest of UI
}
```

## Deployment Steps for Vercel

1. **Environment Variables**
   ```bash
   vercel env add OPENAI_API_KEY
   ```

2. **Update API Routes**
   - Remove filesystem operations
   - Use in-memory or KV storage
   - Or return data directly

3. **Pre-compute Demo Data**
   - Run analysis locally
   - Save results as JSON
   - Import as constants

4. **Deploy**
   ```bash
   vercel --prod
   ```

## What Works Best for Demo Day

### **Recommended: Stateless Demo Mode**
- Pre-analyzed demo sessions (Tesla, Microsoft)
- Live upload creates temporary session in browser
- Use sessionStorage or URL state to pass data
- No backend storage needed
- Fast, reliable, works on Vercel

### Benefits:
- ✅ Works on Vercel's free tier
- ✅ No database setup needed
- ✅ Lightning fast (no API calls for demos)
- ✅ 100% reliable for demo
- ✅ Can still do live uploads

### Implementation:
```typescript
// For demo buttons
<button onClick={() => router.push('/sessions/demo-tesla')}>
  Demo: Tesla Analysis
</button>

// For upload
const handleUpload = async (file) => {
  const result = await analyzeFile(file); // Returns events
  sessionStorage.setItem(`session-${result.id}`, JSON.stringify(result));
  router.push(`/sessions/${result.id}`);
};
```

This approach ensures your demo works perfectly on Vercel without any infrastructure complexity!