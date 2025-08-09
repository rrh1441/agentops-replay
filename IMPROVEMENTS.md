# AgentOps Replay - Final Implementation Plan

## The Real Story We're Telling

**"Your AI agents are processing the same data differently - and you might not even know it"**

We'll demonstrate this by showing:
1. **Hidden Variance**: Same CSV file produces different results across sessions
2. **Model Drift**: Your system might be using different models without you knowing
3. **Non-Determinism Issues**: Temperature settings causing inconsistent outputs
4. **Cost Surprises**: Some sessions cost 3x more due to model selection
5. **Validation Failures**: How to catch when AI produces incorrect calculations

## Implementation Tasks

### 1. ✅ Database & API Setup (COMPLETED)
- Supabase tables created (`logs_sessions`, `logs_events`)
- OpenAI API key configured
- Both connections tested and working

### 2. 🔄 Create Real LLM Integration Service
**File: `/app/services/llm-service.ts`**
- Support multiple models (gpt-3.5-turbo, gpt-5-mini-2025-08-07)
- Implement rate limiting (10 req/min, 50k tokens/session)
- Track actual costs per model
- Store all calls in Supabase
- Calculate performance rating for each session:
  ```typescript
  interface SessionRating {
    stars: number; // 1-5
    breakdown: {
      speed: number; // 1-5 based on latency
      cost: number; // 1-5 based on relative cost
      reproducibility: number; // 5 if temp=0, 1 if not
      accuracy: number; // 5 if validated, 1 if errors
    };
    costMultiplier: number; // 1x, 2x, 3x relative to baseline
    recommendation: string; // "Use GPT-3.5 temp=0 for better performance"
  }
  ```

### 3. 🔄 Update CSV Analysis API
**File: `/app/api/analyze/route.ts`**
- **Randomly select model and temperature** (simulating production variance)
- 50% chance: GPT-3.5-turbo with temperature=0 (deterministic)
- 30% chance: GPT-3.5-turbo with temperature=0.7 (non-deterministic)
- 20% chance: GPT-5-mini (advanced but always temperature=1)
- Actually call OpenAI API with selected config
- Store session in Supabase with model/temp metadata
- Return real metrics (tokens, cost, latency)

### 4. 🔄 Create Variance Detection View
**File: `/app/components/VarianceDetection.tsx`**
- Automatically detect when same file produces different results
- Highlight sessions with same input but different outputs
- Show variance in:
  - EBITDA calculations (numerical differences)
  - Model used (GPT-3.5 vs GPT-5)
  - Temperature settings (deterministic vs non-deterministic)
  - Cost per session ($0.0005 vs $0.0014)
  - Processing time (500ms vs 1200ms)

### 5. 🔄 Update Session Detail View
**File: `/app/sessions/[id]/page.tsx`**
- Pull data from Supabase instead of sessionStorage
- Show real model used
- Display actual prompt/response
- Show token breakdown (including reasoning tokens)
- Calculate and display actual cost

### 6. 🔄 Implement True Replay
**File: `/app/api/sessions/[id]/replay/route.ts`**
- For temperature=0: Actually re-run and show identical output
- For temperature>0: Show variation between runs
- Store replay sessions in Supabase
- Link original and replay sessions

### 7. 🔄 Update Dashboard Stats
**File: `/app/sessions/page.tsx`**
- Pull real metrics from Supabase
- Show average star rating across all sessions
- Display cost efficiency score (% of optimal)
- Show speed optimization potential
- Track reproducibility rate
- Generate optimization recommendations:
  - "You could save 65% by using GPT-3.5"
  - "2.5x speed improvement available"
  - "67% of sessions non-reproducible for audit"

### 8. 🔄 Add Demo Scenarios
**File: `/app/components/DemoScenarios.tsx`**
Create 3 pre-built demos:
1. **"Deterministic Analysis"** - GPT-3.5-turbo with temperature=0
2. **"Advanced Reasoning"** - GPT-5-mini (no temperature control)
3. **"Cost Comparison"** - Run same data through both models

### 9. 🔄 Error Handling & Edge Cases
- Rate limit exceeded → Show graceful error
- API timeout → Fallback to cached response
- Invalid CSV → Clear error message
- Token limit exceeded → Truncate intelligently

### 10. 🔄 Final UI Polish
- Add cost calculator widget
- Show live token counter during processing
- Add "Determinism Score" badge
- Create model recommendation based on use case

## Code Changes Needed

### A. Package Dependencies
```bash
npm install @supabase/supabase-js openai p-queue
```

### B. Environment Variables (Already Set)
```
NEXT_PUBLIC_SUPABASE_URL=✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=✅
OPENAI_API_KEY=✅
```

### C. Key Implementation Files

1. **LLM Service** - Handles all OpenAI calls with proper error handling
2. **Supabase Service** - Manages all database operations
3. **Analysis Pipeline** - Orchestrates CSV → LLM → Validation → Storage
4. **UI Components** - Real-time updates from Supabase

## The Demo Script (60 seconds)

1. **"This is AgentOps Replay - see what your AI agents are actually doing"**
2. **"Let's process this Tesla 10-K three times"** - Upload same CSV 3x
3. **"Look - same data, different results!"** Show dashboard:
   - Session 1: GPT-3.5 temp=0, EBITDA: $9.055B ✅
   - Session 2: GPT-5-mini, EBITDA: $9.244B ❌ (calculation error!)
   - Session 3: GPT-3.5 temp=0.7, EBITDA: $9.055B ✅ (but different reasoning)
4. **"Without observability, you'd never know this variance exists"**
5. Click on Session 2: **"See the exact LLM call that went wrong"**
   - Show prompt, response, reasoning tokens
   - Highlight the calculation error
6. **"Notice the cost difference"** - GPT-5 session cost 3x more but got it wrong!
7. **"Watch the replay feature"** - Click replay on Session 1
   - Shows identical results (deterministic)
8. **"Now replay Session 3"** - Different output despite same input!
9. Point to stats: **"20% of your sessions are non-deterministic"**
10. **"This is why you need observability - to catch these issues in production"**

## Success Criteria

- [ ] Can upload any CSV and process through real OpenAI API
- [ ] Shows actual model differences (3.5 vs 5-mini)
- [ ] Demonstrates temperature impact on determinism
- [ ] All data persisted to Supabase
- [ ] Replay actually reproduces sessions
- [ ] Dashboard shows real, calculated metrics
- [ ] Handles errors gracefully
- [ ] Costs tracked and displayed accurately

## Next Steps for Implementation

1. Start with LLM service - get real API calls working
2. Wire up Supabase storage for all events
3. Update UI to pull from Supabase
4. Add model comparison features
5. Polish and test error cases

**This creates a legitimate demo showing why AI observability matters - model selection, temperature settings, cost tracking, and determinism are real production concerns that developers face.**