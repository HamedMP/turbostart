import Anthropic from '@anthropic-ai/sdk';
import { env } from '../env.js';
import { logger } from '../middleware/logger.js';

let anthropic: Anthropic | null = null;

// Initialize Anthropic client if configured
if (env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });
  logger.info('Anthropic client initialized');
}

/**
 * Generate text using Claude
 */
export async function generateText(
  prompt: string,
  options: {
    maxTokens?: number;
    model?: string;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  const {
    maxTokens = 1024,
    model = 'claude-sonnet-4-20250514',
    systemPrompt = 'You are a helpful assistant.',
  } = options;

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textContent.text;
}

/**
 * Check if Anthropic is available
 */
export function isAnthropicAvailable(): boolean {
  return anthropic !== null;
}

export { anthropic };
