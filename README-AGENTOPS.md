# AgentOps Replay - MIT Hackathon Project

A deterministic logging and replay system for analytical agents built for MIT's "VC Big Bets (Agents)" hackathon.

## Quick Start

### 1. Setup
```bash
# Install dependencies (already done)
npm install

# Configure OpenAI API key
# Edit .env.local and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-key-here
```

### 2. Run Analysis
```bash
# Using mock data (no API key needed)
npx tsx agent/runner-mock.ts data/sample.csv

# Using real OpenAI API (requires API key)
npm run analyze data/sample.csv
```

### 3. View Sessions in UI
```bash
# Start the development server
npm run dev

# Open browser to http://localhost:3000
```

## Features

✅ **Complete Event Logging**: Every step of the agent's workflow is logged with inputs, outputs, and metadata
✅ **Deterministic Replay**: Sessions can be replayed exactly using recorded outputs
✅ **Interactive Timeline UI**: Visual timeline showing all events with detailed inspection
✅ **Compliance Scoring**: Automatic compliance badge showing determinism, PII, and token limits
✅ **JSONL Storage**: Simple filesystem storage without database dependencies

## Architecture

- **Backend**: Node.js + TypeScript
- **Agent**: Simple script with no LLM framework dependencies
- **Storage**: Filesystem JSONL (no database)
- **UI**: Next.js 14 App Router + Tailwind
- **LLM**: OpenAI gpt-4o-mini with temperature=0 for determinism

## Demo Flow (60 seconds)

1. Run analysis: `npx tsx agent/runner-mock.ts data/sample.csv`
2. Open UI at http://localhost:3000
3. Click on a session to see the timeline
4. Inspect any event to see inputs/outputs
5. Click "Replay" to create deterministic reproduction
6. Note the 100% compliance badge for deterministic settings

## Project Structure

```
/agentops-replay
  /agent            # Agent logic and logging
  /app              # Next.js UI
  /data             # CSV samples and session logs
```

## Judge Criteria Met

- ✅ **Log Coverage**: Every agent step is logged
- ✅ **Replay Fidelity**: Perfect deterministic replay
- ✅ **UX Clarity**: Clean timeline with event inspector
- ✅ **Compliance Features**: Automated scoring badges