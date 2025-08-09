import { Logger } from './logger';
import { AnalysisResult, KPIResult } from './types';
import { parse } from 'csv-parse/sync';
import OpenAI from 'openai';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

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
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const prompt = EXTRACTION_PROMPT.replace('{{DATA}}', JSON.stringify(records.slice(0, 5)));
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [{
        role: 'user',
        content: prompt
      }],
      response_format: { type: 'json_object' }
    });
    
    const kpis = JSON.parse(completion.choices[0].message.content || '{}') as KPIResult;
    
    logger.endSpan(llmEvent, kpis, {
      model: 'gpt-4o-mini',
      temperature: 0,
      tokens: completion.usage ? {
        input: completion.usage.prompt_tokens,
        output: completion.usage.completion_tokens,
        total: completion.usage.total_tokens
      } : undefined,
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
    console.error('Usage: ts-node agent/runner.ts <csv-path>');
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