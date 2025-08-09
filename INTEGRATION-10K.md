# Integrating Real SEC 10-K Data with AgentOps Replay

## Overview

The provided `sec_fsds_downloader.py` script is **EXCELLENT** for pulling real SEC financial data. Here's how it perfectly fits the AgentOps Replay use case for financial analysts:

## What the SEC FSDS Contains

The SEC Financial Statement Data Sets include:
- **Quarterly filings** from 2009q1 to present
- **All public companies** filing with SEC
- **Structured CSV files** with:
  - `sub.txt` - Submission metadata (company, form type, filing date)
  - `num.txt` - Numerical financial data (revenue, assets, liabilities, etc.)
  - `tag.txt` - XBRL taxonomy tags
  - `pre.txt` - Presentation relationships

## Integration Architecture

```
SEC FSDS → Parser → CSV Transform → AgentOps Analysis → Validation → Report
     ↓         ↓          ↓              ↓                ↓           ↓
   [LOG]     [LOG]      [LOG]          [LOG]            [LOG]       [LOG]
```

## Implementation Plan

### Phase 1: Data Acquisition (Using 10k.md Script)

1. **Convert to TypeScript** or run as Python subprocess
2. **Download recent quarters** (e.g., 2023q1-2024q4)
3. **Store in** `data/sec_fsds/` directory

### Phase 2: Parser Component

Create `agent/sec-parser.ts`:

```typescript
interface Company10K {
  cik: string;
  name: string;
  ticker?: string;
  filingDate: string;
  financials: {
    revenue: number;
    cogs: number;
    opex: number;
    rd?: number;
    sga?: number;
    ebitda: number;
    netIncome: number;
    totalAssets: number;
    totalLiabilities: number;
  };
}

export class SECParser {
  async parse10K(fsdsPath: string, cik: string): Promise<Company10K> {
    // 1. Read num.txt for financial values
    // 2. Match by CIK and relevant tags
    // 3. Extract key metrics
    // 4. Return structured data
  }
  
  async convertToCSV(company: Company10K): Promise<string> {
    // Transform to CSV format expected by runner.ts
  }
}
```

### Phase 3: Enhanced Agent Workflow

```typescript
export async function analyze10K(
  companyIdentifier: string,  // CIK or ticker
  quarter: string              // e.g., "2024q1"
): Promise<AnalysisResult> {
  const logger = new Logger(randomUUID());
  
  // Step 1: Parse SEC data
  const parseEvent = logger.startSpan('parse', 'sec_10k_parse');
  const parser = new SECParser();
  const company10K = await parser.parse10K(
    `data/sec_fsds/${quarter}/extracted/num.txt`,
    companyIdentifier
  );
  logger.endSpan(parseEvent, company10K);
  
  // Step 2: LLM Analysis
  const llmEvent = logger.startSpan('llm_call', 'analyze_financials');
  const analysis = await analyzeWithLLM(company10K);
  logger.endSpan(llmEvent, analysis);
  
  // Step 3: Validate Parser vs LLM
  const validationEvent = logger.startSpan('validation', 'cross_check');
  const validation = validateParserVsLLM(company10K, analysis);
  logger.endSpan(validationEvent, validation);
  
  return { company10K, analysis, validation };
}
```

## Major Use Case: Parser Validation

This is **PERFECT** for financial analysts because:

### 1. **Dual-Source Verification**
```typescript
// Parser extracts from structured XBRL
const parserRevenue = extractFromXBRL('Revenues');

// LLM interprets from text/context
const llmRevenue = await askLLM('What is the revenue?');

// Compare and flag discrepancies
const match = Math.abs(parserRevenue - llmRevenue) < threshold;
```

### 2. **Catch Parser Errors**
- Parser might mismap XBRL tags
- LLM provides second opinion
- Discrepancies trigger alerts

### 3. **Catch LLM Hallucinations**
- LLM might misread or hallucinate
- Parser provides ground truth
- Validation ensures accuracy

## Sample Companies to Include

For demo purposes, include these well-known companies:

```typescript
const DEMO_COMPANIES = [
  { cik: '0000789019', ticker: 'MSFT', name: 'Microsoft' },
  { cik: '0001318605', ticker: 'TSLA', name: 'Tesla' },
  { cik: '0000320193', ticker: 'AAPL', name: 'Apple' },
  { cik: '0001018724', ticker: 'AMZN', name: 'Amazon' },
  { cik: '0001326801', ticker: 'META', name: 'Meta' }
];
```

## UI Enhancements for 10-K Analysis

### 1. **Company Selector**
```tsx
<select onChange={handleCompanySelect}>
  <option value="">Select a company...</option>
  <option value="MSFT">Microsoft (MSFT)</option>
  <option value="TSLA">Tesla (TSLA)</option>
  <option value="AAPL">Apple (AAPL)</option>
</select>
```

### 2. **Dual-Column Comparison View**
```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <h3>Parser Results</h3>
    <pre>{JSON.stringify(parserData, null, 2)}</pre>
  </div>
  <div>
    <h3>LLM Analysis</h3>
    <pre>{JSON.stringify(llmData, null, 2)}</pre>
  </div>
</div>
```

### 3. **Discrepancy Highlighting**
```tsx
{discrepancies.map(d => (
  <div className="bg-yellow-100 p-2 rounded">
    <strong>{d.field}:</strong>
    Parser: ${d.parserValue.toLocaleString()} | 
    LLM: ${d.llmValue.toLocaleString()} |
    Diff: {d.percentDiff}%
  </div>
))}
```

## Quick Implementation Steps

### For Next Developer:

1. **Install Python dependencies**
   ```bash
   pip install requests
   ```

2. **Download recent SEC data**
   ```bash
   python sec_fsds_downloader.py \
     --out-dir ./data/sec_fsds \
     --since 2023q1 \
     --through 2024q4 \
     --contact "demo@agentops.com"
   ```

3. **Create TypeScript parser**
   - Read CSV files from extracted FSDS
   - Map XBRL tags to financial metrics
   - Extract by CIK

4. **Enhance runner.ts**
   - Add 10K analysis mode
   - Implement dual validation
   - Log parser vs LLM comparison

5. **Update UI**
   - Add company selector
   - Show comparison view
   - Highlight discrepancies

## Benefits for Financial Analysts

1. **Accuracy Verification**: Cross-check parser and LLM results
2. **Audit Trail**: Complete logging of both extraction methods
3. **Error Detection**: Catch both parser bugs and LLM hallucinations
4. **Compliance**: Demonstrate due diligence in financial analysis
5. **Efficiency**: Process multiple 10-Ks quickly with validation

## Demo Script Addition

"Our system doesn't just analyze financial data - it validates it two ways:
1. Structured parser extracts from SEC XBRL filings
2. LLM interprets the same data independently  
3. We compare results and flag any discrepancies
4. Every step is logged for complete auditability

This dual-validation approach catches both parser errors AND AI hallucinations - critical for financial analysis where accuracy matters."

## Technical Notes

- The SEC data is **huge** (GBs per quarter)
- For demo, extract just specific companies
- XBRL tags vary by company - need mapping logic
- Consider caching parsed results

## Alternative: Direct Edgar API

If downloading full FSDS is too heavy, use SEC's EDGAR API:
```typescript
const edgar = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;
```

This gives company-specific data without bulk downloads.

## Conclusion

The `sec_fsds_downloader.py` script is **PERFECT** for this use case. It provides:
- Real SEC filing data
- Structured format for parsing
- Quarterly updates
- All public companies

Combined with the AgentOps Replay system, this creates a powerful tool for financial analysts to:
1. Analyze real 10-K data
2. Validate parser accuracy with LLM
3. Track every step with full logging
4. Replay analyses for audit purposes

This is a **MAJOR** differentiator for the hackathon - showing real-world financial analysis with dual validation!