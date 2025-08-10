'use client';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">📚</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AgentOps Replay Documentation
              </h1>
              <p className="text-gray-600 mt-1">
                How to test and monitor your AI agents
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 mb-4">
                AgentOps Replay is an observability platform for AI agents. It provides complete logging, 
                deterministic replay, and multi-model comparison to help you:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Test agents</strong> across multiple models (GPT-5, GPT-4, GPT-3.5)</li>
                <li><strong>Validate consistency</strong> and identify hallucination risks</li>
                <li><strong>Monitor production</strong> agents with cost and accuracy tracking</li>
                <li><strong>Replay sessions</strong> deterministically for debugging</li>
              </ul>
            </section>

            {/* Current Agent */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Agent: Financial KPI Extractor</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-blue-900">Agent Category</h3>
                    <p className="text-blue-800">Finance & Accounting</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Agent Objective</h3>
                    <p className="text-blue-800">Extract KPIs from 10K reports to identify financial trends and performance metrics</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Available Data Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold">Tesla 10K 2024</h4>
                  <p className="text-sm text-gray-600">Q1-Q4 financial data</p>
                  <p className="text-xs text-gray-500">$96.8B revenue, automotive focus</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold">Microsoft 10K 2024</h4>
                  <p className="text-sm text-gray-600">Q1-Q4 financial data</p>
                  <p className="text-xs text-gray-500">$254.2B revenue, cloud/software</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold">Apple 10K 2024</h4>
                  <p className="text-sm text-gray-600">Q1-Q4 financial data</p>
                  <p className="text-xs text-gray-500">$424.5B revenue, consumer electronics</p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Validation Methods</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Formula Validation:</strong> EBITDA = Revenue - COGS - OpEx</li>
                <li><strong>Cross-Model Comparison:</strong> Flag disagreements &gt;10% between models</li>
                <li><strong>Consistency Checking:</strong> Temperature=0 should produce identical results</li>
                <li><strong>Domain Logic:</strong> Revenue &gt; 0, margins within reasonable bounds</li>
              </ul>
            </section>

            {/* How to Test New Agents */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Test New Agents (Future)</h2>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-4">
                <p className="text-amber-800 font-medium">
                  ⚠️ This workflow is currently out of scope but planned for future releases.
                </p>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Step 1: Define Your Agent</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="text-sm"><code>{`{
  "category": "Legal Document Analysis",
  "objective": "Extract key clauses from contracts to identify risk factors",
  "inputFormat": "PDF",
  "expectedOutputs": ["risk_score", "key_clauses", "recommendations"],
  "validationLogic": "custom_legal_validator.js"
}`}</code></pre>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Step 2: Add Data Sources</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Upload representative test documents (contracts, reports, etc.)</li>
                <li>Provide ground truth annotations for a subset</li>
                <li>Define success metrics (accuracy, consistency, cost)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Step 3: Multi-Model Testing</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>Consistency:</strong> Run same input across models to identify disagreements</li>
                <li><strong>Temperature Testing:</strong> Compare temp=0 vs temp=0.7 for hallucination risk</li>
                <li><strong>Cost Analysis:</strong> Balance accuracy vs cost for production deployment</li>
                <li><strong>Latency Testing:</strong> Measure response times for real-time requirements</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Step 4: Validation Strategy</h3>
              <p className="text-gray-700 mb-2">Choose validation methods appropriate for your domain:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>Cross-Model Validation:</strong> Flag when models disagree significantly</li>
                <li><strong>Consistency Checking:</strong> Identical inputs should produce identical outputs (temp=0)</li>
                <li><strong>Human-in-the-Loop:</strong> Sample random outputs for expert review</li>
                <li><strong>Domain Rules:</strong> Apply business logic validation where possible</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Step 5: Production Monitoring</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Deploy selected model with continuous monitoring</li>
                <li>Track accuracy drift, cost changes, latency spikes</li>
                <li>Set up alerts for validation failures or unusual patterns</li>
                <li>Regular model comparison runs to identify improvements</li>
              </ul>
            </section>

            {/* Model Comparison */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Model Comparison Guide</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Available Models</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 mb-4">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Model</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Temperature</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Cost/1M tokens</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">GPT-5-mini</td>
                      <td className="border border-gray-300 px-4 py-2">0</td>
                      <td className="border border-gray-300 px-4 py-2">$0.25/$2.00</td>
                      <td className="border border-gray-300 px-4 py-2">Latest model, deterministic</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">GPT-4o-mini</td>
                      <td className="border border-gray-300 px-4 py-2">1</td>
                      <td className="border border-gray-300 px-4 py-2">$0.15/$0.60</td>
                      <td className="border border-gray-300 px-4 py-2">Fast, cost-effective</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">GPT-3.5-turbo</td>
                      <td className="border border-gray-300 px-4 py-2">0</td>
                      <td className="border border-gray-300 px-4 py-2">$0.50/$1.50</td>
                      <td className="border border-gray-300 px-4 py-2">Reliable, deterministic baseline</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">GPT-3.5-turbo</td>
                      <td className="border border-gray-300 px-4 py-2">0.7</td>
                      <td className="border border-gray-300 px-4 py-2">$0.50/$1.50</td>
                      <td className="border border-gray-300 px-4 py-2">Non-deterministic comparison</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Interpretation Guide</h3>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-green-400 bg-green-50">
                  <p className="font-medium text-green-900">✅ Models Agree</p>
                  <p className="text-green-800 text-sm">All models produce similar results (variance &lt;10%). High confidence in output.</p>
                </div>
                <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50">
                  <p className="font-medium text-yellow-900">⚠️ Models Disagree</p>
                  <p className="text-yellow-800 text-sm">Significant variance between models. Review input data or consider human validation.</p>
                </div>
                <div className="p-3 border-l-4 border-red-400 bg-red-50">
                  <p className="font-medium text-red-900">❌ Inconsistent Results</p>
                  <p className="text-red-800 text-sm">Same model produces different outputs (temp&gt;0). High hallucination risk.</p>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Reference</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Multi-Model Analysis</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="text-sm"><code>{`POST /api/analyze
Content-Type: multipart/form-data

file: [CSV file]

Response:
{
  "success": true,
  "message": "Analysis completed across 4 models (4 successful)",
  "sessions": [
    {
      "sessionId": "uuid",
      "model": "gpt-5-mini", 
      "temperature": 0,
      "cost": 0.001,
      "rating": 4,
      "kpis": { ... }
    }
  ],
  "comparison": {
    "models": ["gpt-5-mini", "gpt-4o-mini", ...],
    "avgCost": "0.0004",
    "avgLatency": 2743
  }
}`}</code></pre>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Session Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm"><code>{`GET /api/sessions/[sessionId]

Response:
{
  "id": "uuid",
  "model": "gpt-5-mini",
  "kpis": { ... },
  "events": [
    {
      "type": "llm_call",
      "input": { ... },
      "output": { ... },
      "metadata": { ... }
    }
  ]
}`}</code></pre>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}