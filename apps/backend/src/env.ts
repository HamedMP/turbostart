import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // Server Configuration
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(['development', 'production']).default('development'),

    // API Security
    API_KEY: z.string().min(1),

    // Database
    DATABASE_URL: z.string().min(1),

    // Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    // AI Services (optional)
    ANTHROPIC_API_KEY: z.string().optional(),
    ELEVENLABS_API_KEY: z.string().optional(),
    ELEVENLABS_VOICE_ID: z.string().optional(),
    FAL_AI_KEY: z.string().optional(),

    // Storage (optional)
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_PUBLIC_URL: z.string().optional(),

    // Analytics (optional)
    POSTHOG_API_KEY: z.string().optional(),
    POSTHOG_HOST: z.string().default('https://eu.i.posthog.com'),

    // Telegram (optional)
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_CHANNEL_ID: z.string().optional(),
  },

  clientPrefix: 'PUBLIC_',
  client: {},
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
