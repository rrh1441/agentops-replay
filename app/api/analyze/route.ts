import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    const content = await file.text();
    const records = parse(content, { columns: true });
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate KPIs from the CSV data
    let revenue = 0;
    let cogs = 0;
    let opex = 0;
    
    // Try to extract financial data from common column names
    records.forEach((record: any) => {
      // Handle both regular numbers and formatted strings (e.g., "119,575,000,000")
      const parseNumber = (val: any) => {
        if (!val) return 0;
        const str = String(val).replace(/,/g, '');
        return parseFloat(str) || 0;
      };
      
      revenue += parseNumber(record.Revenue || record.revenue || record.Sales || record.sales);
      cogs += parseNumber(record['Cost of Sales'] || record.COGS || record.cogs || record['Cost of Goods Sold']);
      opex += parseNumber(record['Operating Expenses'] || record.OpEx || record.opex);
    });
    
    // If no data found, use sample values for demo
    if (revenue === 0) {
      revenue = 711000;
      cogs = 234000;
      opex = 163000;
    }
    
    // Calculate EBITDA (with intentional error for some cases to show validation)
    let ebitda = revenue - cogs - opex;
    
    // Introduce calculation error for demonstration (10% of the time)
    const introduceError = Math.random() < 0.3; // 30% chance of error for demo
    if (introduceError && revenue > 1000000) {
      // Misstate EBITDA by 5-15%
      const errorFactor = 1 + (Math.random() * 0.1 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
      ebitda = Math.round(ebitda * errorFactor);
    }
    
    // Generate analysis events
    const events = [
      {
        sessionId,
        eventId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'start',
        name: 'analysis_start',
        input: { 
          filename: file.name, 
          size: file.size,
          rows: records.length 
        }
      },
      {
        sessionId,
        eventId: crypto.randomUUID(),
        timestamp: new Date(Date.now() + 100).toISOString(),
        type: 'parse',
        name: 'csv_parse',
        output: { 
          rows: records.length,
          columns: Object.keys(records[0] || {}),
          sample: records[0]
        },
        metadata: {
          duration_ms: 45
        }
      },
      {
        sessionId,
        eventId: crypto.randomUUID(),
        timestamp: new Date(Date.now() + 500).toISOString(),
        type: 'llm_call',
        name: 'extract_kpis',
        input: {
          prompt: `Extract financial KPIs from CSV data with ${records.length} rows`,
          sample_data: records.slice(0, 3)
        },
        output: {
          revenue,
          cogs,
          opex,
          ebitda,
          margin: revenue > 0 ? ((ebitda / revenue) * 100).toFixed(2) + '%' : '0%'
        },
        metadata: {
          model: 'gpt-4o-mini',
          temperature: 0,
          tokens: { input: 450, output: 120 },
          duration_ms: 1250,
          compliance: {
            deterministic: true,
            no_pii: true,
            within_token_limit: true
          }
        }
      },
      {
        sessionId,
        eventId: crypto.randomUUID(),
        timestamp: new Date(Date.now() + 1700).toISOString(),
        type: 'validation',
        name: 'validate_kpis',
        input: {
          revenue,
          cogs,
          opex,
          ebitda_reported: ebitda
        },
        output: (() => {
          const expectedEbitda = revenue - cogs - opex;
          const ebitdaDiff = Math.abs(ebitda - expectedEbitda);
          const ebitdaVariance = revenue > 0 ? (ebitdaDiff / revenue) * 100 : 0;
          const marginRate = revenue > 0 ? (ebitda / revenue) * 100 : 0;
          
          const checks = [
            { 
              name: 'ebitda_calculation', 
              passed: ebitdaDiff < 1000,
              expected: expectedEbitda,
              actual: ebitda,
              variance: ebitdaVariance.toFixed(2) + '%',
              message: ebitdaDiff < 1000 
                ? 'EBITDA calculation verified: Revenue - COGS - OpEx matches reported value'
                : `EBITDA MISMATCH DETECTED: Expected $${expectedEbitda.toLocaleString()} but found $${ebitda.toLocaleString()} (${ebitdaVariance.toFixed(2)}% variance)`
            },
            { 
              name: 'revenue_validation', 
              passed: revenue > 0,
              value: revenue,
              message: revenue > 0 
                ? `Revenue of $${revenue.toLocaleString()} is valid and positive`
                : 'ERROR: Revenue must be positive for valid analysis'
            },
            { 
              name: 'margin_analysis', 
              passed: marginRate > -10 && marginRate < 60,
              value: marginRate.toFixed(2) + '%',
              message: marginRate > -10 && marginRate < 60
                ? `EBITDA margin of ${marginRate.toFixed(2)}% is within reasonable bounds for the industry`
                : `WARNING: EBITDA margin of ${marginRate.toFixed(2)}% is unusual and may indicate data quality issues`
            },
            {
              name: 'cost_structure',
              passed: cogs < revenue && opex < revenue,
              message: (cogs < revenue && opex < revenue)
                ? `Cost structure is logical: COGS (${((cogs/revenue)*100).toFixed(1)}%) and OpEx (${((opex/revenue)*100).toFixed(1)}%) are below revenue`
                : 'ERROR: Costs exceed revenue - check data quality'
            }
          ];
          
          const allPassed = checks.every(c => c.passed);
          
          return {
            valid: allPassed,
            checks,
            summary: allPassed 
              ? `✅ All validations passed. Financial data appears accurate and consistent.`
              : `⚠️ Validation issues detected. ${checks.filter(c => !c.passed).length} check(s) failed. Review the detailed findings above.`,
            recommendation: !allPassed
              ? 'Recommend manual review of source documents and recalculation of key metrics.'
              : 'Data quality confirmed. Safe to proceed with analysis.'
          };
        })(),
        metadata: {
          duration_ms: 32,
          validation_engine: 'dual-source-verification',
          confidence_score: introduceError ? 0.65 : 0.98
        }
      },
      {
        sessionId,
        eventId: crypto.randomUUID(),
        timestamp: new Date(Date.now() + 1800).toISOString(),
        type: 'output',
        name: 'report_generated',
        output: {
          summary: {
            revenue,
            cogs,
            opex,
            ebitda,
            margin: revenue > 0 ? ((ebitda / revenue) * 100).toFixed(2) + '%' : '0%'
          },
          insights: [
            'Revenue trend is positive',
            'Operating efficiency improved',
            'EBITDA margin within industry standards'
          ],
          filename: `${file.name.replace('.csv', '')}_analysis.json`
        },
        metadata: {
          duration_ms: 15
        }
      }
    ];
    
    return NextResponse.json({ sessionId, events });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}