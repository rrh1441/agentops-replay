# Implementation Priority for Demo

## Core Requirements for Your Demo

### Must Have (For Demo Day)

#### 1. CSV Upload Feature (Critical)
**Implementation:**
```typescript
// app/components/FileUpload.tsx
- Simple file input or drag-drop
- Immediately triggers analysis on upload
- Shows loading state during processing
- Redirects to session view when complete

// app/api/upload/route.ts
- Receives file
- Saves temporarily to /tmp or data/uploads/
- Calls runner.ts with file path
- Returns session ID
- File auto-deletes after analysis
```

**User Flow:**
1. Click "Upload CSV" or drag file
2. See "Analyzing..." spinner
3. Auto-redirect to session timeline
4. View results immediately

#### 2. Pre-loaded Sample Buttons (For Quick Demo)
```typescript
// Add to sessions page
<div className="quick-demos">
  <button onClick={() => analyzePreloaded('tesla.csv')}>
    Analyze Tesla 10-K
  </button>
  <button onClick={() => analyzePreloaded('microsoft.csv')}>
    Analyze Microsoft 10-K
  </button>
</div>
```

### Nice to Have (If Time)

#### 3. Better Visual Polish
- Clean up the timeline cards
- Add proper loading states
- Better status badges
- Smooth animations

#### 4. One-Click Demo
- Big "Try Demo" button on landing
- Runs pre-configured analysis
- Shows impressive results immediately

### Don't Need (Skip for Demo)

#### ❌ Authentication/Users
- No login needed
- No user management
- No permissions

#### ❌ Database
- Filesystem storage is fine
- Sessions only need to last for demo
- No need for persistence

#### ❌ Complex Features
- No comparison view needed
- No export features needed
- No compliance dashboard needed

## Simplified Architecture for Demo

```
User Uploads CSV → API saves to /tmp → Runner analyzes → 
                           ↓
                   Logs to filesystem
                           ↓
                   UI shows timeline
                           ↓
                   User can replay
```

## Quick Implementation Plan

### Step 1: Upload UI (30 minutes)
```tsx
// app/sessions/page.tsx
function UploadSection() {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const { sessionId } = await res.json();
    router.push(`/sessions/${sessionId}`);
  };
  
  return (
    <div className="border-2 border-dashed p-8">
      <input type="file" accept=".csv" onChange={e => 
        e.target.files?.[0] && handleUpload(e.target.files[0])
      } />
      {uploading && <p>Analyzing...</p>}
    </div>
  );
}
```

### Step 2: Upload API (20 minutes)
```typescript
// app/api/upload/route.ts
import { writeFile } from 'fs/promises';
import { runAnalysis } from '@/agent/runner';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Save temporarily
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const path = `/tmp/${Date.now()}.csv`;
  await writeFile(path, buffer);
  
  // Run analysis
  const result = await runAnalysis(path);
  
  // Clean up
  setTimeout(() => unlink(path), 60000); // Delete after 1 min
  
  return NextResponse.json({ sessionId: result.sessionId });
}
```

### Step 3: Pre-loaded Samples (10 minutes)
```typescript
// Create data/examples/ with:
// - tesla.csv
// - microsoft.csv
// - sample.csv (already have)

// Add quick buttons
const quickAnalyze = async (filename: string) => {
  const result = await runAnalysis(`data/examples/${filename}`);
  router.push(`/sessions/${result.sessionId}`);
};
```

## Demo Script with Upload

1. **Opening**: "AgentOps provides universal AI agent observability"

2. **Upload Demo**: 
   - "Let me analyze this financial data"
   - Drag and drop CSV
   - "Watch as we log every step"
   - Show timeline appearing

3. **Timeline Demo**:
   - Click through events
   - Show input/output logging
   - Point out validation catching errors

4. **Replay Demo**:
   - "Now watch perfect replay"
   - Click replay button
   - Show identical results

5. **Close**: "Works with any AI workflow, not just finance"

## Key Points for Demo

- **Keep it simple**: Upload → Analyze → View → Replay
- **Focus on value**: Logging, observability, validation
- **No complexity**: Skip auth, database, fancy features
- **Speed matters**: Everything should feel instant
- **Visual impact**: Make the timeline look impressive

## What You Really Need

1. **Upload works** (can drag/drop or select CSV)
2. **Analysis runs** (calls your runner.ts)
3. **Timeline displays** (shows the events)
4. **Replay works** (demonstrates determinism)
5. **Looks professional** (clean, not janky)

Everything else is optional for the demo!