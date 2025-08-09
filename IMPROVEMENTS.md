# AgentOps Replay - Improvement Plan

## Priority 1: CSV Upload Feature (Essential for Demo)

### Implementation Steps

1. **Add Upload Component** (`app/components/FileUpload.tsx`)
   ```typescript
   - Drag-and-drop zone or file picker
   - Accept .csv files only
   - Max file size: 10MB
   - Preview first 5 rows before analysis
   ```

2. **Create Upload API** (`app/api/upload/route.ts`)
   ```typescript
   - Save uploaded file to data/uploads/
   - Validate CSV structure
   - Return file path for analysis
   ```

3. **Update Sessions Page** (`app/sessions/page.tsx`)
   ```typescript
   - Add "Upload CSV" button in header
   - Modal with upload component
   - "Analyze" button triggers runner with uploaded file
   ```

4. **Add Sample Selector**
   ```typescript
   - Dropdown with pre-loaded examples
   - "Tesla 10-K", "Apple Quarterly", "Startup P&L"
   - Load from data/examples/ directory
   ```

## Priority 2: Real Financial Data Examples

### Recommended Data Sources

1. **SEC EDGAR Data** (Best Option)
   - Download 10-K/10-Q financial tables as CSV
   - Companies to include:
     - Tesla (TSLA) - 2023 Annual
     - Microsoft (MSFT) - Latest Quarterly  
     - Amazon (AMZN) - Latest Annual
   - Format: Revenue, COGS, OpEx, R&D, Net Income by period

2. **Prepared Examples** (`data/examples/`)
   ```
   tesla_2023_10k.csv
   microsoft_q3_2024.csv
   amazon_2023_annual.csv
   startup_saas_monthly.csv
   ```

3. **Data Structure for 10-K CSV**
   ```csv
   Period,Revenue,COGS,OpEx,R&D,SG&A,EBITDA,NetIncome
   Q1-2023,23329,18818,1843,733,1462,1416,2513
   Q2-2023,24927,19396,1917,771,1523,1978,2703
   Q3-2023,23350,18681,1826,895,1576,1606,1853
   Q4-2023,25167,20289,1862,943,1611,1605,7928
   ```

### Web Research Implementation
```typescript
// agent/data-fetcher.ts
async function fetch10KData(ticker: string, year: number) {
  // Use SEC API or financial data provider
  // Parse XBRL data to CSV format
  // Cache in data/examples/
}
```

## Priority 3: Easy UI/UX Improvements

### 1. **Add Loading States**
```typescript
// Show spinner during analysis
// Progress bar for replay
// Skeleton loaders for event cards
```

### 2. **Enhanced Event Timeline**
```typescript
- Add duration bars showing relative time
- Color code by event type
- Collapsible event groups
- Search/filter events
```

### 3. **Better Error Display**
```typescript
- Toast notifications for errors
- Detailed error modal with stack trace
- Retry button for failed analyses
```

### 4. **Session Comparison**
```typescript
- Side-by-side view of two sessions
- Highlight differences in KPIs
- Show validation discrepancies
```

### 5. **Export Features**
```typescript
- Download session as JSON
- Export timeline as PDF report
- Copy shareable session link
```

## Priority 4: Technical Improvements

### 1. **Performance Optimizations**
```typescript
- Virtual scrolling for long event lists
- Lazy load event details
- Index sessions for faster search
- Compress old JSONL files
```

### 2. **Enhanced Validation**
```typescript
// Add more financial validations
- Gross margin checks
- YoY growth calculations
- Ratio analysis (current ratio, debt/equity)
- Anomaly detection
```

### 3. **Better Prompt Engineering**
```typescript
const ENHANCED_PROMPT = `
Extract financial KPIs with the following rules:
1. Sum all revenue lines for total revenue
2. Include all cost categories in COGS
3. Separate R&D from general OpEx
4. Calculate derived metrics (margins, ratios)
Return structured JSON with units and period.
`
```

### 4. **Multi-Model Support**
```typescript
// Add support for other models
- Claude 3.5 Sonnet
- GPT-4o (full)
- Gemini Pro
- Local models (Ollama)
```

### 5. **Batch Processing**
```typescript
// Process multiple CSVs at once
async function batchAnalyze(files: string[]) {
  return Promise.all(files.map(runAnalysis))
}
```

## Priority 5: Demo-Specific Features

### 1. **Demo Mode**
```typescript
// Pre-populated with good examples
// Guided tour with tooltips
// Auto-replay after 5 seconds
// Highlight key features
```

### 2. **Presentation View**
```typescript
// Larger fonts
// Hide technical details
// Focus on business metrics
// Full-screen timeline
```

### 3. **Quick Stats Dashboard**
```typescript
// Total sessions analyzed
// Average processing time
// Validation success rate
// Token usage stats
```

## Implementation Order for Next Developer

1. **First Hour**: CSV Upload UI
2. **Second Hour**: Real 10-K data integration
3. **Third Hour**: UI improvements (loading states, better timeline)
4. **Fourth Hour**: Demo mode and presentation features
5. **If Time Permits**: Enhanced validations and multi-model support

## Quick Wins (< 15 minutes each)

1. **Add Copy Button** for session IDs
2. **Timestamp Formatting** - show relative time ("2 minutes ago")
3. **Keyboard Shortcuts** - 'R' for replay, 'ESC' to close inspector
4. **Dark Mode Toggle** - respect system preference
5. **Session Search** - filter by date or status
6. **Auto-refresh** - poll for new sessions every 5 seconds
7. **Validation Badge Colors** - green/yellow/red based on score
8. **Event Count Badge** - show number on session cards
9. **CSV Preview** - show first few rows in event inspector
10. **One-Click Demo** - button to run analysis on sample data

## Testing Improvements

### 1. **Add Test Suite**
```typescript
// agent/runner.test.ts
- Test CSV parsing
- Test validation logic
- Test replay determinism
- Mock OpenAI responses
```

### 2. **E2E Tests**
```typescript
// cypress/e2e/replay.cy.ts
- Upload CSV
- Verify timeline appears
- Click replay
- Confirm new session created
```

## Notes for Handoff

- The mock runner (`agent/runner-mock.ts`) is perfect for demos without API keys
- The validation "failure" is intentional - it demonstrates error catching
- All data is stored locally in `data/sessions/` as JSONL files
- The UI auto-redirects from `/` to `/sessions`
- Temperature=0 is critical for determinism claims
- The replay uses recorded outputs, not re-execution

## MVP for Demo Day

**Must Have:**
1. CSV upload in UI
2. 2-3 real company examples
3. One-click demo button
4. Clear "100% Deterministic" badge

**Nice to Have:**
1. Session comparison
2. Export to PDF
3. Multi-model support
4. Batch processing

**Skip for Demo:**
1. Authentication
2. Database migration
3. Production error handling
4. Comprehensive test suite