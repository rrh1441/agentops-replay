# ClearFrame - AI Agent Observability Platform

🔍 **Universal observability for AI agents in production**

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Overview

ClearFrame provides comprehensive logging, visualization, and replay capabilities for AI agent interactions. Track costs, performance, and compliance across multiple LLM models with production-grade reliability.

Built for the MIT AI Hackathon - VC Big Bets (Agents) Track

**Live Demo**: [https://clearframe.vercel.app](https://clearframe.vercel.app)

## ✨ Features

- 🤖 **Multi-Model Testing** - Compare GPT-4o, GPT-4.1, and GPT-4o Mini side-by-side
- 💰 **Real-Time Cost Tracking** - Accurate pricing per million tokens for each model
- 🔄 **Deterministic Replay** - Full session replay with temperature=0 enforcement
- ✅ **Compliance Scoring** - Automatic checks for determinism, PII, and token limits
- 📊 **Cross-Model Validation** - Detect when models disagree on outputs
- 🕐 **Event Timeline** - Complete audit trail with parent-child relationships
- 📈 **Variance Detection** - Statistical analysis to catch hallucinations
- 🎯 **Production Ready** - Deployed on Vercel edge network with Supabase backend

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Edge Functions
- **AI Models**: OpenAI GPT-4o, GPT-4.1, GPT-4o Mini
- **Deployment**: Vercel, GitHub Actions

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/rrh1441/agentops-replay.git
cd agentops-replay

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` with:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
agentops-replay/
├── app/
│   ├── api/              # API routes
│   │   ├── analyze/      # Multi-model analysis endpoint
│   │   └── sessions/     # Session management
│   ├── components/       # React components
│   │   ├── TestAgent.tsx # Agent testing interface
│   │   └── SessionsList.tsx
│   ├── services/         # Core services
│   │   ├── llm-service.ts
│   │   └── supabase-service.ts
│   └── sessions/         # Session views
│       └── [id]/         # Session detail page
├── public/               # Static assets & sample data
│   ├── tesla_10k_2024.csv
│   ├── microsoft_10k_2024.csv
│   └── apple_10k_2024.csv
└── data/                 # Session logs
```

## 🧪 Testing the Platform

1. **Upload Data**: Use pre-loaded samples or upload your own CSV
2. **Select Models**: Choose which models to compare
3. **Run Analysis**: Click "Run Test" to analyze across all selected models
4. **View Results**: Compare costs, accuracy, and performance
5. **Inspect Sessions**: Click any session to see detailed timeline
6. **Check Compliance**: Review compliance scores for production readiness

### Sample Data Available

- **Tesla 10K** (2024 Q1-Q3): Quarterly financials
- **Microsoft 10K** (2024 Fiscal Year): Annual report
- **Amazon 10K** (2024): Full year financials

## 🎯 Key Features Explained

### Cross-Model Validation
Automatically detects when different models produce conflicting results, helping identify potential hallucinations or model-specific biases.

### Cost Optimization
Real-time cost calculation shows exactly how much each model costs per million tokens, helping teams choose the most cost-effective option.

### Compliance Scoring
Three-factor scoring system:
- **Determinism**: Temperature = 0 for reproducible results
- **PII Detection**: Flags potential personal information
- **Token Limits**: Ensures responses stay within limits

## 📊 Model Comparison

| Model | Cost (per M tokens) | Speed | Accuracy | Best For |
|-------|-------------------|--------|----------|----------|
| GPT-4o Mini | $150/$600 | Fast | Good | Cost-sensitive production |
| GPT-4.1 Mini | $400/$1,600 | Fast | Better | Balanced performance |
| GPT-4.1 | $2,000/$8,000 | Medium | Best | High-accuracy requirements |
| GPT-4o | $2,500/$10,000 | Slow | Best | Complex reasoning |

## 🚢 Deployment

The app is deployed on Vercel with automatic deployments from the main branch:

```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel --prod
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Submission

Built in 24 hours for the MIT AI Hackathon - VC Big Bets (Agents) Track

**Team**: ClearFrame  
**Track**: Agent Observability & Production Reliability  
**Demo**: [clearframe.vercel.app](https://clearframe.vercel.app)

## 📞 Contact

For questions or feedback, please open an issue on GitHub.

---

<p align="center">Made with ❤️ for reliable AI agents in production</p>