# AgentOps Replay System - Complete Explainer

## The 30-Second Pitch

AgentOps is the universal logging and audit system for ANY AI agent workflow. We provide complete observability, deterministic replay, and validation for all AI operations. Think of us as the "black box recorder" for AI agents.

**Think of it this way:**
```
BEFORE AgentOps:
User → AI Agent → Results (❌ No visibility, no audit trail)

WITH AgentOps:
User → AI Agent → Results
          ↓          ↓
     [Logged]   [Validated]
          ↓          ↓
  ✅ Complete Audit Trail & Replay
```

## The Core Value: Universal AI Agent Observability

**AgentOps Replay is a logging and audit infrastructure for ANY agentic workflow.** Whether your AI agents are analyzing financial documents, processing customer support tickets, generating code, or making medical diagnoses - we provide the critical audit trail.

### The Universal Problem We Solve

When anyone uses AI agents for critical workflows, they face the same challenges:
- **How do they know the AI performed correctly?**
- **How can they prove it for compliance/audit?**
- **How can they debug when things go wrong?**
- **How can they reproduce the exact same results?**

**Examples across industries:**
- Financial analysts analyzing 10-Ks (our demo example)
- Doctors using AI for diagnosis recommendations
- Lawyers using AI for contract review
- Engineers using AI for code generation
- Support teams using AI for ticket resolution

### What AgentOps Replay Does

We provide complete observability for ANY AI agent workflow:

```
User's Request → AI Agent Processes → Agent Produces Output
        ↓              ↓                      ↓
  [LOG INPUT]    [LOG STEPS]            [LOG OUTPUT]
        ↓              ↓                      ↓
            AGENTOPS CAPTURES EVERYTHING
                       ↓
              Replay, Validate, Audit
```

**Real Example from Our Demo (10-K Analysis):**
```
Analyst: "Extract KPIs from this CSV"
    ↓
AI Agent: Parses → Extracts → Validates → "Revenue: $158K, EBITDA: $97K"
    ↓
AgentOps: Logs every step, catches calculation error, provides audit trail
```

**Key Point**: We work with ANY AI agent - not just financial analysis. We're the universal logging layer.

## Who Needs This?

**Anyone building or using AI agents for critical workflows:**

- **Financial Services**: Audit trails for AI-powered analysis (10-K review, risk assessment, trading decisions)
- **Healthcare**: Track AI diagnostic recommendations and treatment suggestions
- **Legal**: Document AI contract review and discovery processes
- **Software Development**: Log AI code generation and review workflows
- **Customer Support**: Track AI ticket resolution and response generation
- **Research**: Reproduce AI-assisted data analysis and findings
- **Any Regulated Industry**: Prove AI decisions are sound, reproducible, and compliant

### Why Our Demo Uses Financial Analysis

We chose **10-K financial analysis** as our demo because:
- It's a common, high-stakes use case everyone understands
- It clearly shows the need for accuracy and audit trails
- The validation (EBITDA calculation) demonstrates error catching
- Financial services have strict compliance requirements

**But remember**: AgentOps works for ANY agentic workflow. The financial demo is just one example of thousands of possible applications.

## What Is This? (Layman's Terms)

Imagine you're watching a chef prepare a complex dish. The AgentOps Replay system is like having a video camera that records every single step the chef takes - every ingredient added, every stir, every temperature change. But even better, it can perfectly recreate the exact same dish later by following the recorded steps.

In our case, the "chef" is ANY AI agent doing ANY task. The system:
1. **Records everything** the AI does when analyzing your data
2. **Shows you exactly** what happened at each step
3. **Can replay** the entire analysis perfectly, like rewinding a movie
4. **Validates** that the AI's calculations were correct

### Why Is This Important?

When AI makes business decisions (like calculating financial metrics), you need to:
- **Trust** that it's working correctly
- **Understand** how it reached its conclusions
- **Verify** its calculations are accurate
- **Reproduce** the results for auditing
- **Prove compliance** with regulatory requirements

This system provides all of that transparency.

## How AgentOps Works in Production (The Middleware Magic)

### The Integration Challenge
How do we capture AI agent activity without modifying the AI tools themselves? We become the middleware.

### Integration Methods (From Simple to Enterprise)

#### 1. **SDK Integration** (2 lines of code)
```python
from agentops import Logger
logger = Logger()

# Their existing code
def analyze_10k(document):
    logger.log_input(document)  # One line added
    response = call_chatgpt(document)
    logger.log_output(response)  # One line added
    return response
```

#### 2. **Proxy Pattern** (Zero code changes)
```python
# Instead of: api.openai.com
# Use: agentops-proxy.company.com/openai

# The proxy logs everything before forwarding to real API
```

#### 3. **Browser Extension** (For ChatGPT Web)
- Captures conversations directly from browser
- No code changes, just install extension
- Works with ChatGPT, Claude.ai, Gemini

#### 4. **API Gateway** (Enterprise Scale)
```yaml
# Existing enterprise infrastructure
API Gateway → AgentOps Logger → OpenAI/Claude/etc
         ↓
   Compliance Dashboard
```

### The Key Insight
**We don't modify AI tools - we intercept the data flow:**
- **Before**: Log what's sent to AI
- **After**: Log what AI returns  
- **Between**: Add validation, compliance, auditing

### Real-World Examples

**Financial Analysis (Our Demo):**
```
Analyst → AI Agent → [AgentOps Logs] → Financial Report
              ↓
        SEC Audit Trail
```

**Medical Diagnosis:**
```
Doctor → AI Diagnostic Tool → [AgentOps Logs] → Treatment Plan
                ↓
          FDA Compliance
```

**Code Generation:**
```
Developer → GitHub Copilot → [AgentOps Logs] → Generated Code
                 ↓
           Code Review Audit
```

## What Is This? (Technical Terms)

AgentOps Replay is a universal, deterministic logging and replay system for ANY LLM-powered agent workflow. It implements:

### Core Architecture
- **Event Sourcing**: Every agent action is logged as an immutable event in JSONL format
- **Deterministic Replay**: Sessions can be replayed using recorded outputs (not re-executing LLM calls)
- **Full Observability**: Complete trace of inputs, outputs, and metadata for every operation
- **Compliance Tracking**: Automatic validation of determinism, PII handling, and token limits
- **Middleware Integration**: Multiple integration patterns from SDK to proxy to API gateway

### Technical Components
1. **Logger** (`agent/logger.ts`): Event capture system writing to JSONL files
2. **Runner** (`agent/runner.ts`): Demo agent orchestrating CSV parsing → LLM extraction → validation
3. **Replay Engine** (`agent/replay.ts`): Deterministic replay using recorded events
4. **REST API**: Next.js API routes for session management
5. **UI**: React-based timeline visualization with event inspector
6. **Integration Layer**: SDK, proxy, or gateway patterns for production deployment

### Data Flow (Demo)
```
CSV Input → Parse → LLM Extract (GPT-4o-mini) → Validate → Output
     ↓         ↓            ↓                      ↓         ↓
  [LOG]     [LOG]        [LOG]                  [LOG]     [LOG]
     ↓         ↓            ↓                      ↓         ↓
  JSONL     JSONL        JSONL                  JSONL     JSONL
```

### Data Flow (Production)
```
Any AI Tool → [AgentOps Middleware] → AI Provider (OpenAI/Claude/etc)
                      ↓                              ↓
                 Log Request                    Log Response
                      ↓                              ↓
              Immutable Audit Trail          Validation & Replay
```

## How to Use It

### For Business Users

1. **Run an Analysis**
   - Place your financial CSV file in the `data/` folder
   - The system will extract key metrics like Revenue, COGS, OpEx, and EBITDA

2. **View the Results**
   - Open the web interface (http://localhost:3000)
   - Click on your session to see exactly what happened
   - Each step shows what data went in and what came out

3. **Replay for Verification**
   - Click the "Replay" button on any session
   - The system recreates the exact same analysis
   - Useful for auditing or demonstrating to stakeholders

### For Technical Users

1. **Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Add OpenAI API key to .env.local
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Run Analysis**
   ```bash
   # With real OpenAI API
   npm run analyze data/sample.csv
   
   # With mock data (no API needed)
   npx tsx agent/runner-mock.ts data/sample.csv
   ```

3. **Start UI**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

4. **Inspect Events**
   - Click any event in the timeline to see full details
   - View raw JSONL logs in `data/sessions/`
   - Access via API: `GET /api/sessions/{id}`

## Key Features Explained

### 1. Event Logging
Every action creates an event with:
- **Unique ID**: For tracking and correlation
- **Timestamp**: Precise timing information
- **Type**: Category (start, parse, llm_call, validation, output, error)
- **Input/Output**: Complete data at each step
- **Metadata**: Duration, model settings, compliance flags

### 2. Validation System
The system automatically validates:
- **EBITDA Formula**: Revenue - COGS - OpEx = EBITDA
- **Data Integrity**: Ensures calculations are mathematically correct
- **Compliance**: Tracks deterministic settings (temperature=0)

When validation fails, it means the AI made a calculation error, which is properly logged and flagged.

### 3. Replay Mechanism
Replay works by:
1. Loading the original session's events
2. Creating a new session with "-replay-" suffix
3. Re-emitting events with recorded outputs (not re-running AI)
4. Maintaining perfect determinism

### 4. Compliance Scoring
Each LLM call is scored on:
- **Deterministic**: Temperature = 0 for consistent results
- **No PII**: Confirms no personal data in prompts
- **Token Limits**: Stays within model constraints

## Understanding the Session States

- **Running**: Analysis in progress
- **Completed**: Successfully finished (even if validation failed)
- **Failed**: Error occurred (e.g., missing API key, file not found)

## Understanding Validation

When you see "Valid: false", it means:
- The AI's EBITDA calculation doesn't match the formula
- **This is GOOD** - it proves our system catches AI mistakes
- This is **exactly what compliance teams need** - error detection and documentation
- All data is still recorded for review and audit

## File Structure

```
/agentops-replay
  /agent                 # Core agent logic
    logger.ts           # Event logging system
    runner.ts           # Main analysis orchestrator
    replay.ts           # Replay engine
    types.ts            # TypeScript interfaces
  /app                  # Next.js UI
    /api/sessions       # REST endpoints
    /sessions           # UI pages
  /data                 # Data storage
    /sessions           # JSONL event logs
    sample.csv          # Example data
    index.json          # Session metadata
```

## Common Use Cases

**Universal Applications:**
1. **Debugging**: Understand why any AI agent made certain decisions
2. **Compliance**: Prove any AI workflow meets regulatory requirements
3. **Quality Assurance**: Verify AI outputs across any domain
4. **Training**: Show others exactly how AI agents work
5. **Optimization**: Analyze agent performance and improve workflows

**Industry-Specific Examples:**
- **Finance**: Track KPI calculations, risk assessments, trading decisions
- **Healthcare**: Document diagnostic paths, treatment recommendations
- **Legal**: Audit contract analysis, discovery processes
- **Engineering**: Review code generation, architecture decisions
- **Research**: Reproduce data analysis, validate findings

## Post-Logging Features (What Happens After)

### Accessing and Managing Logs
- **Web Dashboard**: View all sessions at http://localhost:3000
- **Search & Filter**: Find sessions by date, status, or validation results
- **Export Options**: 
  - Download session as JSON for regulatory filing
  - Export timeline as PDF report for auditors
  - API access for integration with compliance systems

### Data Retention & Compliance
- **Immutable Storage**: JSONL files cannot be modified after creation
- **Configurable Retention**: Set policies based on regulatory requirements
- **Audit Trail Export**: One-click export for regulatory submissions
- **Searchable Archive**: Query historical sessions for patterns or issues

### Integration with Compliance Workflows
```
AgentOps Logs → Compliance Dashboard → Regulatory Reports
                        ↓
                 Risk Assessment
                        ↓
                 Audit Reviews
```

## Troubleshooting

**"Analysis failed" error**
- Check your OpenAI API key in `.env.local`
- Ensure the CSV file exists and is properly formatted

**"Valid: false" in results**
- This is normal! It means the validation system is working
- Check the Event Inspector to see the calculation difference

**Can't see sessions in UI**
- Ensure the dev server is running (`npm run dev`)
- Check that `data/index.json` exists
- Try refreshing the browser

## Security & Privacy

- API keys are stored locally in `.env.local` (never committed)
- All data stays on your machine (no external storage)
- Sessions are stored as local JSONL files
- No PII should be included in CSV data for demos