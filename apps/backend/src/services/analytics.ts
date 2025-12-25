import { PostHog } from 'posthog-node';
import { env } from '../env.js';
import { logger } from '../middleware/logger.js';

let posthog: PostHog | null = null;

// Initialize PostHog if configured
if (env.POSTHOG_API_KEY) {
  posthog = new PostHog(env.POSTHOG_API_KEY, {
    host: env.POSTHOG_HOST,
  });
  logger.info('PostHog analytics initialized');
}

/**
 * Track an event in PostHog
 */
export function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  if (!posthog) return;

  posthog.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      source: 'backend',
    },
  });
}

/**
 * Identify a user in PostHog
 */
export function identifyUser(
  distinctId: string,
  properties?: Record<string, unknown>
) {
  if (!posthog) return;

  posthog.identify({
    distinctId,
    properties,
  });
}

/**
 * Gracefully shutdown PostHog
 */
export async function shutdownAnalytics() {
  if (posthog) {
    await posthog.shutdown();
    logger.info('PostHog shutdown complete');
  }
}

export { posthog };
