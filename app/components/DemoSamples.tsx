'use client';

import { useRouter } from 'next/navigation';
import { TraceEvent } from '@/agent/types';

const DEMO_SAMPLES = [
  { id: 'tesla-2024', name: 'Tesla 10-K', icon: '🚗' },
  { id: 'microsoft-2024', name: 'Microsoft Quarterly', icon: '💻' },
  { id: 'startup-saas', name: 'SaaS Metrics', icon: '🚀' }
];

// Pre-computed demo data
const PRECOMPUTED_DEMOS: Record<string, TraceEvent[]> = {
  'tesla-2024': [
    {
      sessionId: 'tesla-2024',
      eventId: 'evt-1',
      timestamp: new Date().toISOString(),
      type: 'start',
      name: 'analysis_start',
      input: { filename: 'tesla_10k_2024.csv', size: 125432, rows: 48 }
    },
    {
      sessionId: 'tesla-2024',
      eventId: 'evt-2',
      timestamp: new Date(Date.now() + 100).toISOString(),
      type: 'parse',
      name: 'csv_parse',
      output: { 
        rows: 48,
        columns: ['Quarter', 'Revenue', 'COGS', 'OpEx', 'R&D', 'SG&A'],
        sample: { Quarter: 'Q1-2024', Revenue: '23329000000', COGS: '18775000000', OpEx: '1843000000' }
      },
      metadata: { duration_ms: 67 }
    },
    {
      sessionId: 'tesla-2024',
      eventId: 'evt-3',
      timestamp: new Date(Date.now() + 800).toISOString(),
      type: 'llm_call',
      name: 'extract_kpis',
      input: { prompt: 'Extract automotive and energy KPIs from Tesla 10-K filing' },
      output: {
        revenue: 96773000000,
        cogs: 79225000000,
        opex: 8493000000,
        ebitda: 9055000000,
        margin: '9.35%',
        segments: {
          automotive: 82419000000,
          energy: 14354000000
        }
      },
      metadata: {
        model: 'gpt-5-mini-2025-08-07',
        temperature: 0,
        tokens: { input: 1250, output: 340 },
        duration_ms: 2140,
        compliance: {
          deterministic: true,
          no_pii: true,
          within_token_limit: true
        }
      }
    },
    {
      sessionId: 'tesla-2024',
      eventId: 'evt-4',
      timestamp: new Date(Date.now() + 3000).toISOString(),
      type: 'validation',
      name: 'validate_kpis',
      output: { 
        valid: true,
        checks: [
          { name: 'ebitda_formula', passed: true },
          { name: 'segment_reconciliation', passed: true },
          { name: 'yoy_growth_positive', passed: true }
        ],
        message: 'All validations passed - Tesla showing strong growth'
      },
      metadata: { duration_ms: 45 }
    },
    {
      sessionId: 'tesla-2024',
      eventId: 'evt-5',
      timestamp: new Date(Date.now() + 3200).toISOString(),
      type: 'output',
      name: 'report_generated',
      output: {
        summary: {
          company: 'Tesla Inc.',
          period: '2024 Full Year',
          revenue: 96773000000,
          ebitda: 9055000000,
          margin: '9.35%'
        },
        insights: [
          'Automotive revenue grew 19% YoY',
          'Energy business accelerating with 125% growth',
          'Operating leverage improving with scale'
        ]
      }
    }
  ],
  'microsoft-2024': [
    {
      sessionId: 'microsoft-2024',
      eventId: 'evt-1',
      timestamp: new Date().toISOString(),
      type: 'start',
      name: 'analysis_start',
      input: { filename: 'msft_q4_2024.csv', size: 87234, rows: 36 }
    },
    {
      sessionId: 'microsoft-2024',
      eventId: 'evt-2',
      timestamp: new Date(Date.now() + 100).toISOString(),
      type: 'parse',
      name: 'csv_parse',
      output: { 
        rows: 36,
        columns: ['Segment', 'Product', 'Revenue', 'Growth', 'Operating Income'],
        sample: { Segment: 'Productivity', Product: 'Office 365', Revenue: '18900000000' }
      },
      metadata: { duration_ms: 52 }
    },
    {
      sessionId: 'microsoft-2024',
      eventId: 'evt-3',
      timestamp: new Date(Date.now() + 600).toISOString(),
      type: 'llm_call',
      name: 'extract_kpis',
      input: { prompt: 'Extract cloud and AI revenue metrics from Microsoft quarterly report' },
      output: {
        revenue: 62020000000,
        cogs: 19064000000,
        opex: 14726000000,
        ebitda: 28230000000,
        margin: '45.5%',
        segments: {
          cloud: 31800000000,
          productivity: 18900000000,
          gaming: 5450000000
        }
      },
      metadata: {
        model: 'gpt-5-mini-2025-08-07',
        temperature: 0,
        tokens: { input: 980, output: 290 },
        duration_ms: 1890,
        compliance: {
          deterministic: true,
          no_pii: true,
          within_token_limit: true
        }
      }
    },
    {
      sessionId: 'microsoft-2024',
      eventId: 'evt-4',
      timestamp: new Date(Date.now() + 2600).toISOString(),
      type: 'validation',
      name: 'validate_kpis',
      output: { 
        valid: false,
        checks: [
          { name: 'ebitda_formula', passed: true },
          { name: 'segment_sum', passed: false, message: 'Segment sum does not match total revenue' },
          { name: 'margin_threshold', passed: true }
        ],
        message: 'Warning: Segment reconciliation requires adjustment'
      },
      metadata: { duration_ms: 38 }
    },
    {
      sessionId: 'microsoft-2024',
      eventId: 'evt-5',
      timestamp: new Date(Date.now() + 2800).toISOString(),
      type: 'output',
      name: 'report_generated',
      output: {
        summary: {
          company: 'Microsoft Corporation',
          period: 'Q4 2024',
          revenue: 62020000000,
          ebitda: 28230000000,
          margin: '45.5%'
        },
        insights: [
          'Azure revenue grew 30% YoY',
          'AI services contributing $3B quarterly',
          'Operating margin expansion of 320 basis points'
        ],
        warnings: ['Segment data reconciliation needed']
      }
    }
  ],
  'startup-saas': [
    {
      sessionId: 'startup-saas',
      eventId: 'evt-1',
      timestamp: new Date().toISOString(),
      type: 'start',
      name: 'analysis_start',
      input: { filename: 'saas_metrics.csv', size: 34521, rows: 24 }
    },
    {
      sessionId: 'startup-saas',
      eventId: 'evt-2',
      timestamp: new Date(Date.now() + 100).toISOString(),
      type: 'parse',
      name: 'csv_parse',
      output: { 
        rows: 24,
        columns: ['Month', 'MRR', 'Customers', 'Churn', 'CAC', 'LTV'],
        sample: { Month: 'Jan-2024', MRR: '125000', Customers: '450', Churn: '2.1%' }
      },
      metadata: { duration_ms: 41 }
    },
    {
      sessionId: 'startup-saas',
      eventId: 'evt-3',
      timestamp: new Date(Date.now() + 500).toISOString(),
      type: 'llm_call',
      name: 'extract_kpis',
      input: { prompt: 'Extract SaaS metrics and unit economics' },
      output: {
        arr: 3840000,
        mrr: 320000,
        customers: 892,
        churn_rate: '2.3%',
        nrr: '118%',
        cac: 1200,
        ltv: 14500,
        ltv_cac_ratio: 12.1,
        burn_rate: 145000,
        runway_months: 18
      },
      metadata: {
        model: 'gpt-5-mini-2025-08-07',
        temperature: 0,
        tokens: { input: 620, output: 180 },
        duration_ms: 1120,
        compliance: {
          deterministic: true,
          no_pii: true,
          within_token_limit: true
        }
      }
    },
    {
      sessionId: 'startup-saas',
      eventId: 'evt-4',
      timestamp: new Date(Date.now() + 1700).toISOString(),
      type: 'validation',
      name: 'validate_kpis',
      output: { 
        valid: true,
        checks: [
          { name: 'arr_mrr_ratio', passed: true },
          { name: 'ltv_cac_healthy', passed: true, note: 'Ratio > 3 is excellent' },
          { name: 'nrr_growth', passed: true, note: 'NRR > 100% indicates expansion' }
        ],
        message: 'Strong SaaS metrics - ready for Series A'
      },
      metadata: { duration_ms: 29 }
    },
    {
      sessionId: 'startup-saas',
      eventId: 'evt-5',
      timestamp: new Date(Date.now() + 1900).toISOString(),
      type: 'output',
      name: 'report_generated',
      output: {
        summary: {
          company: 'SaaS Startup',
          arr: 3840000,
          growth_rate: '142%',
          ltv_cac: 12.1,
          runway: '18 months'
        },
        insights: [
          'Product-market fit achieved with NRR of 118%',
          'Unit economics support aggressive growth',
          'Ready for Series A fundraising'
        ]
      }
    }
  ]
};

export function DemoSamples() {
  const router = useRouter();
  
  const runDemo = (demoId: string) => {
    // Use pre-computed data
    const events = PRECOMPUTED_DEMOS[demoId];
    if (events) {
      sessionStorage.setItem(`session-${demoId}`, JSON.stringify(events));
      router.push(`/sessions/${demoId}`);
    }
  };
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {DEMO_SAMPLES.map(demo => (
        <button
          key={demo.id}
          onClick={() => runDemo(demo.id)}
          className="p-6 bg-white border rounded-lg hover:shadow-lg transition-all hover:scale-105 group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{demo.icon}</div>
          <div className="font-semibold text-gray-900">{demo.name}</div>
          <div className="text-sm text-gray-500">Quick Demo</div>
        </button>
      ))}
    </div>
  );
}