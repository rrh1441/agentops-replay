import { TraceEvent } from '@/agent/types';

// Real company financial data (in millions)
const COMPANY_DATA = [
  { name: 'Apple', revenue: 383285, cogs: 217518, opex: 54847 },
  { name: 'Microsoft', revenue: 211915, cogs: 65525, opex: 45184 },
  { name: 'Amazon', revenue: 574785, cogs: 304739, opex: 213638 },
  { name: 'Google', revenue: 307394, cogs: 133332, opex: 89422 },
  { name: 'Meta', revenue: 134902, cogs: 25959, opex: 53919 },
  { name: 'Tesla', revenue: 96773, cogs: 79225, opex: 8493 },
  { name: 'Netflix', revenue: 33723, cogs: 19715, opex: 7053 },
  { name: 'Nvidia', revenue: 60922, cogs: 16621, opex: 11132 },
  { name: 'Adobe', revenue: 19409, cogs: 2173, opex: 11901 },
  { name: 'Salesforce', revenue: 34857, cogs: 6829, opex: 24502 },
  { name: 'Oracle', revenue: 52961, cogs: 10018, opex: 25219 },
  { name: 'IBM', revenue: 61860, cogs: 32688, opex: 19848 },
  { name: 'Intel', revenue: 63054, cogs: 33727, opex: 20478 },
  { name: 'Cisco', revenue: 57024, cogs: 20840, opex: 19877 },
  { name: 'PayPal', revenue: 29771, cogs: 11448, opex: 14416 },
  { name: 'Zoom', revenue: 4632, cogs: 653, opex: 3237 },
  { name: 'Spotify', revenue: 13247, cogs: 9732, opex: 3211 },
  { name: 'Uber', revenue: 37281, cogs: 19349, opex: 15142 },
  { name: 'Airbnb', revenue: 9917, cogs: 2438, opex: 5915 },
  { name: 'Block', revenue: 24537, cogs: 14760, opex: 9197 },
];

export function generateSessionData(company: typeof COMPANY_DATA[0], sessionId: string): TraceEvent[] {
  const timestamp = new Date(Date.now() - Math.random() * 86400000); // Random time in last 24h
  
  // Randomly introduce errors for realism
  const hasValidationError = Math.random() < 0.15; // 15% have validation errors
  const hasSlowPerformance = Math.random() < 0.1; // 10% are slow
  
  // Calculate EBITDA with possible error
  let ebitda = company.revenue - company.cogs - company.opex;
  if (hasValidationError) {
    // Introduce calculation error
    ebitda = Math.round(ebitda * (0.85 + Math.random() * 0.3));
  }
  
  const baseDuration = hasSlowPerformance ? 3000 : 1000;
  
  return [
    {
      sessionId,
      eventId: `${sessionId}-evt-1`,
      timestamp: timestamp.toISOString(),
      type: 'start',
      name: 'analysis_start',
      input: { 
        filename: `${company.name.toLowerCase()}_10k_2024.csv`,
        size: Math.round(50000 + Math.random() * 200000),
        rows: Math.round(20 + Math.random() * 100)
      }
    },
    {
      sessionId,
      eventId: `${sessionId}-evt-2`,
      timestamp: new Date(timestamp.getTime() + 100).toISOString(),
      type: 'parse',
      name: 'csv_parse',
      output: { 
        rows: Math.round(20 + Math.random() * 100),
        columns: ['Quarter', 'Revenue', 'COGS', 'OpEx', 'R&D', 'SG&A'],
        sample: { 
          Quarter: 'Q4-2024',
          Revenue: company.revenue.toString(),
          COGS: company.cogs.toString(),
          OpEx: company.opex.toString()
        }
      },
      metadata: { 
        duration_ms: Math.round(baseDuration * 0.05 + Math.random() * 50)
      }
    },
    {
      sessionId,
      eventId: `${sessionId}-evt-3`,
      timestamp: new Date(timestamp.getTime() + 500).toISOString(),
      type: 'llm_call',
      name: 'extract_kpis',
      input: { 
        prompt: `Extract financial KPIs from ${company.name} 10-K filing`,
        model: 'gpt-5-mini-2025-08-07'
      },
      output: {
        revenue: company.revenue,
        cogs: company.cogs,
        opex: company.opex,
        ebitda: ebitda,
        margin: `${((ebitda / company.revenue) * 100).toFixed(2)}%`
      },
      metadata: {
        model: 'gpt-5-mini-2025-08-07',
        temperature: 0,
        tokens: { 
          input: Math.round(800 + Math.random() * 600),
          output: Math.round(200 + Math.random() * 200)
        },
        duration_ms: Math.round(baseDuration * 1.2 + Math.random() * 500),
        compliance: {
          deterministic: true,
          no_pii: true,
          within_token_limit: true
        }
      }
    },
    {
      sessionId,
      eventId: `${sessionId}-evt-4`,
      timestamp: new Date(timestamp.getTime() + 1500).toISOString(),
      type: 'validation',
      name: 'validate_kpis',
      input: {
        revenue: company.revenue,
        cogs: company.cogs,
        opex: company.opex,
        ebitda_reported: ebitda
      },
      output: {
        valid: !hasValidationError,
        checks: [
          { 
            name: 'ebitda_calculation',
            passed: !hasValidationError,
            expected: company.revenue - company.cogs - company.opex,
            actual: ebitda,
            message: hasValidationError 
              ? `EBITDA mismatch detected: Expected ${(company.revenue - company.cogs - company.opex).toLocaleString()} but found ${ebitda.toLocaleString()}`
              : 'EBITDA calculation verified'
          },
          { 
            name: 'revenue_validation',
            passed: true,
            value: company.revenue
          },
          {
            name: 'margin_analysis',
            passed: true,
            value: `${((ebitda / company.revenue) * 100).toFixed(2)}%`
          }
        ],
        summary: hasValidationError 
          ? '⚠️ Validation issues detected. Review required.'
          : '✅ All validations passed. Data quality confirmed.'
      },
      metadata: { 
        duration_ms: Math.round(20 + Math.random() * 30),
        confidence_score: hasValidationError ? 0.65 : 0.98
      }
    },
    {
      sessionId,
      eventId: `${sessionId}-evt-5`,
      timestamp: new Date(timestamp.getTime() + 1700).toISOString(),
      type: 'output',
      name: 'report_generated',
      output: {
        summary: {
          company: company.name,
          revenue: company.revenue,
          cogs: company.cogs,
          opex: company.opex,
          ebitda: ebitda,
          margin: `${((ebitda / company.revenue) * 100).toFixed(2)}%`
        },
        insights: [
          `${company.name} revenue: $${(company.revenue / 1000).toFixed(1)}B`,
          `Operating margin: ${(((company.revenue - company.cogs - company.opex) / company.revenue) * 100).toFixed(1)}%`,
          hasValidationError ? 'Data quality issues detected' : 'Financial metrics validated'
        ],
        filename: `${company.name.toLowerCase()}_analysis.json`
      },
      metadata: { 
        duration_ms: Math.round(10 + Math.random() * 20)
      }
    }
  ];
}

export function seedSessions() {
  // Clear existing demo sessions (but keep user-uploaded ones)
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.includes('demo-') || key?.includes('seed-')) {
      sessionStorage.removeItem(key);
    }
  }
  
  // Generate sessions for random companies
  const numSessions = 15 + Math.floor(Math.random() * 10); // 15-25 sessions
  const selectedCompanies = [...COMPANY_DATA]
    .sort(() => Math.random() - 0.5)
    .slice(0, numSessions);
  
  selectedCompanies.forEach((company, index) => {
    const sessionId = `seed-${Date.now()}-${index}`;
    const events = generateSessionData(company, sessionId);
    sessionStorage.setItem(`session-${sessionId}`, JSON.stringify(events));
  });
  
  return numSessions;
}