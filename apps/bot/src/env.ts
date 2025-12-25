import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    TELEGRAM_BOT_TOKEN: z.string().min(1),

    // Backend API
    BACKEND_API_URL: z.string().url().default('http://localhost:4000'),
    BACKEND_API_KEY: z.string().optional(),

    NODE_ENV: z.enum(['development', 'production']).default('development'),
  },

  clientPrefix: 'PUBLIC_',
  client: {},
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
