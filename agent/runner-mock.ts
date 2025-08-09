import { Logger } from './logger';
import { AnalysisResult, KPIResult } from './types';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

const EXTRACTION_PROMPT = `Extract financial KPIs from this CSV data.
Return JSON with: revenue, cogs, opex, ebitda, year_over_year_growth
Data: {{DATA}}`;

export async function runAnalysis(csvPath: string, sessionId?: string): Promise<AnalysisResult> {
  const actualSessionId = sessionId || randomUUID();
  const logger = new Logger(actualSessionId);
  
  try {
    logger.event('start', 'analysis_start', { input: { file: csvPath } });
    
    const parseEvent = logger.startSpan('parse', 'csv_parse');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, { columns: true });
    logger.endSpan(parseEvent, { 
      output: { 
        rows: records.length, 
        columns: Object.keys(records[0] || {}),
        sample: records[0] 
      } 
    });
    
    const llmEvent = logger.startSpan('llm_call', 'extract_kpis');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const kpis: KPIResult = {
      revenue: 711000,
      cogs: 234000,
      opex: 163000,
      ebitda: 314000,
      year_over_year_growth: 26.4
    };
    
    logger.endSpan(llmEvent, kpis, {
      model: 'gpt-4o-mini',
      temperature: 0,
      tokens: {
        input: 450,
        output: 120,
        total: 570
      },
      compliance: {
        deterministic: true,
        no_pii: true,
        within_token_limit: true
      }
    });
    
    const validationEvent = logger.startSpan('validation', 'validate_kpis');
    const calculatedEbitda = kpis.revenue - kpis.cogs - kpis.opex;
    const isValid = Math.abs(kpis.ebitda - calculatedEbitda) < 0.01;
    
    logger.endSpan(validationEvent, { 
      output: { 
        valid: isValid, 
        checks: ['ebitda_formula'],
        expected_ebitda: calculatedEbitda,
        actual_ebitda: kpis.ebitda,
        difference: Math.abs(kpis.ebitda - calculatedEbitda)
      } 
    });
    
    logger.event('output', 'report_generated', { 
      output: { kpis, valid: isValid } 
    });
    
    logger.finalizeSession('completed');
    
    return { 
      sessionId: actualSessionId, 
      kpis, 
      valid: isValid 
    };
    
  } catch (error) {
    logger.event('error', 'analysis_error', { 
      output: { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      } 
    });
    logger.finalizeSession('failed');
    throw error;
  }
}

if (require.main === module) {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: npx tsx agent/runner-mock.ts <csv-path>');
    process.exit(1);
  }
  
  runAnalysis(csvPath)
    .then(result => {
      console.log('\n✅ Analysis Complete!');
      console.log('Session ID:', result.sessionId);
      console.log('KPIs:', result.kpis);
      console.log('Valid:', result.valid);
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}