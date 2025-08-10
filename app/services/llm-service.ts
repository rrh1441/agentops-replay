import OpenAI from 'openai';
import PQueue from 'p-queue';

// Only initialize OpenAI on the server
let openai: OpenAI | null = null;
let queue: PQueue | null = null;

if (typeof window === 'undefined') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Rate limiting: 10 requests per minute
  queue = new PQueue({
    concurrency: 1,
    interval: 60000, // 1 minute
    intervalCap: 10, // 10 requests per minute
  });
}

export interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export const MODELS: Record<string, ModelConfig> = {
  'gpt-4.1': {
    model: 'gpt-4.1',
    temperature: 0,
    maxTokens: 4096,
    costPer1kInput: 0.002,    // $2.00 per 1M tokens
    costPer1kOutput: 0.008,   // $8.00 per 1M tokens
  },
  'gpt-4.1-mini': {
    model: 'gpt-4.1-mini',
    temperature: 0,
    maxTokens: 4096,
    costPer1kInput: 0.0004,   // $0.40 per 1M tokens
    costPer1kOutput: 0.0016,  // $1.60 per 1M tokens
  },
  'gpt-4o': {
    model: 'gpt-4o',
    temperature: 0,
    maxTokens: 4096,
    costPer1kInput: 0.0025,   // $2.50 per 1M tokens
    costPer1kOutput: 0.010,   // $10.00 per 1M tokens
  },
  'gpt-4o-mini': {
    model: 'gpt-4o-mini',
    temperature: 0,
    maxTokens: 4096,
    costPer1kInput: 0.00015,  // $0.15 per 1M tokens
    costPer1kOutput: 0.0006,  // $0.60 per 1M tokens
  },
  'gpt-4o-mini-creative': {
    model: 'gpt-4o-mini',
    temperature: 0.7,         // Non-deterministic for comparison
    maxTokens: 4096,
    costPer1kInput: 0.00015,  // $0.15 per 1M tokens
    costPer1kOutput: 0.0006,  // $0.60 per 1M tokens
  },
};

export interface LLMResponse {
  content: string;
  model: string;
  temperature: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latency: number;
  reasoning?: string;
}

export interface SessionRating {
  stars: number;
  breakdown: {
    speed: number;
    cost: number;
    reproducibility: number;
    accuracy: number;
  };
  costMultiplier: number;
  recommendation: string;
}

export async function callLLM(
  prompt: string,
  modelKey: string = 'gpt-4o-mini'
): Promise<LLMResponse> {
  if (!openai || !queue) {
    throw new Error('OpenAI client not initialized - this function must be called server-side');
  }
  
  const startTime = Date.now();
  const config = MODELS[modelKey];

  if (!config) {
    throw new Error(`Unknown model: ${modelKey}`);
  }

  try {
    const response = await queue.add(async () => {
      try {
        const completion = await openai.chat.completions.create({
          model: config.model,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          messages: [
            {
              role: 'system',
              content: 'You are a financial analyst extracting KPIs from CSV data. Always return valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
        });

        return completion;
      } catch (apiError: any) {
        // Handle specific OpenAI API errors
        if (apiError?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (apiError?.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI configuration.');
        }
        if (apiError?.status === 503) {
          throw new Error('OpenAI service temporarily unavailable. Please try again.');
        }
        if (apiError?.message?.includes('timeout')) {
          throw new Error('Request timed out. The data might be too large.');
        }
        if (apiError?.message?.includes('context_length_exceeded')) {
          throw new Error('Input too large. Please use a smaller CSV file.');
        }
        throw apiError;
      }
    });

    const latency = Date.now() - startTime;
    const inputTokens = response?.usage?.prompt_tokens || 0;
    const outputTokens = response?.usage?.completion_tokens || 0;
    const totalTokens = response?.usage?.total_tokens || 0;
    
    // Check token limits
    if (totalTokens > 50000) {
      console.warn(`High token usage: ${totalTokens} tokens used`);
    }
    
    // Calculate cost
    const inputCost = (inputTokens / 1000) * config.costPer1kInput;
    const outputCost = (outputTokens / 1000) * config.costPer1kOutput;
    const cost = inputCost + outputCost;

    return {
      content: response?.choices[0]?.message?.content || '{}',
      model: config.model,
      temperature: config.temperature,
      inputTokens,
      outputTokens,
      totalTokens,
      cost,
      latency,
    };
  } catch (error) {
    console.error('LLM call failed:', error);
    
    // Return a fallback response for demo purposes
    if (process.env.NODE_ENV === 'development') {
      console.log('Using fallback response for development');
      return {
        content: JSON.stringify({
          revenue: 125000000,
          cogs: 45000000,
          opex: 30000000,
          ebitda: 50000000,
          margin: '40.0%',
          year_over_year_growth: 'N/A'
        }),
        model: config.model,
        temperature: config.temperature,
        inputTokens: 500,
        outputTokens: 100,
        totalTokens: 600,
        cost: 0.001,
        latency: Date.now() - startTime,
      };
    }
    
    throw error;
  }
}

export function getAllModelKeys(): string[] {
  return Object.keys(MODELS);
}

export function selectRandomModel(): string {
  const models = getAllModelKeys();
  return models[Math.floor(Math.random() * models.length)];
}

export function calculateSessionRating(
  latency: number,
  cost: number,
  temperature: number,
  validationPassed: boolean
): SessionRating {
  // Speed rating (based on latency)
  const speedRating = latency < 500 ? 5 : latency < 1000 ? 4 : latency < 2000 ? 3 : latency < 3000 ? 2 : 1;
  
  // Cost rating (based on relative cost)
  const baselineCost = 0.001; // $0.001 baseline
  const costRating = cost < baselineCost ? 5 : cost < baselineCost * 2 ? 4 : cost < baselineCost * 3 ? 3 : cost < baselineCost * 4 ? 2 : 1;
  
  // Reproducibility rating
  const reproducibilityRating = temperature === 0 ? 5 : 1;
  
  // Accuracy rating
  const accuracyRating = validationPassed ? 5 : 1;
  
  // Overall stars (average)
  const stars = Math.round((speedRating + costRating + reproducibilityRating + accuracyRating) / 4);
  
  // Cost multiplier
  const costMultiplier = Math.round(cost / baselineCost * 10) / 10;
  
  // Generate recommendation
  let recommendation = '';
  if (temperature > 0) {
    recommendation = 'Use temperature=0 for deterministic results';
  } else if (cost > baselineCost * 2) {
    recommendation = 'Consider using GPT-3.5-turbo for lower costs';
  } else if (latency > 2000) {
    recommendation = 'Optimize prompt size for faster responses';
  } else {
    recommendation = 'Optimal configuration';
  }
  
  return {
    stars,
    breakdown: {
      speed: speedRating,
      cost: costRating,
      reproducibility: reproducibilityRating,
      accuracy: accuracyRating,
    },
    costMultiplier,
    recommendation,
  };
}

export function formatCost(cost: number): string {
  // ALWAYS show cost per million tokens for consistency
  return `$${(cost * 1000000).toFixed(2)} per million tokens`;
}

export function recommendModel(sessions: any[]): {
  model: string;
  reason: string;
  score: number;
} {
  // Calculate average metrics for each model
  const modelStats: Record<string, any> = {};
  
  sessions.forEach(session => {
    if (!session.success) return;
    
    const model = session.model;
    if (!modelStats[model]) {
      modelStats[model] = {
        count: 0,
        totalCost: 0,
        totalLatency: 0,
        totalRating: 0,
        hasErrors: false
      };
    }
    
    modelStats[model].count++;
    modelStats[model].totalCost += session.cost || 0;
    modelStats[model].totalLatency += session.latency || 0;
    modelStats[model].totalRating += session.rating || 0;
    if (session.error) modelStats[model].hasErrors = true;
  });
  
  // Score each model (accuracy: 50%, price: 25%, speed: 25%)
  let bestModel = 'gpt-4o-mini';
  let bestScore = 0;
  let bestReason = '';
  
  Object.entries(modelStats).forEach(([model, stats]) => {
    const avgCost = stats.totalCost / stats.count;
    const avgLatency = stats.totalLatency / stats.count;
    const avgRating = stats.totalRating / stats.count;
    
    // Normalize scores (0-100)
    const accuracyScore = (avgRating / 5) * 100;
    const costScore = Math.max(0, 100 - (avgCost * 10000)); // Lower cost = higher score
    const speedScore = Math.max(0, 100 - (avgLatency / 50)); // Lower latency = higher score
    
    // Weighted total: accuracy 50%, cost 25%, speed 25%
    const totalScore = (accuracyScore * 0.5) + (costScore * 0.25) + (speedScore * 0.25);
    
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestModel = model;
      
      // Generate reason
      if (avgCost < 0.0002 && avgRating >= 4) {
        bestReason = 'Best balance of accuracy and cost-efficiency';
      } else if (avgRating >= 4.5) {
        bestReason = 'Highest accuracy for critical applications';
      } else if (avgCost < 0.0001) {
        bestReason = 'Most cost-effective for high-volume usage';
      } else if (avgLatency < 1000) {
        bestReason = 'Fastest response times for real-time applications';
      } else {
        bestReason = 'Optimal balance across all metrics';
      }
    }
  });
  
  return {
    model: bestModel,
    reason: bestReason,
    score: Math.round(bestScore)
  };
}