import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, users } from '../db/index.js';
import { logger } from '../middleware/logger.js';

const usersRouter = new Hono();

/**
 * Get user by Telegram ID
 */
usersRouter.get('/:telegramId', async (c) => {
  const telegramId = Number(c.req.param('telegramId'));

  if (isNaN(telegramId)) {
    return c.json({ success: false, error: 'Invalid telegram ID' }, 400);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  return c.json({ success: true, user });
});

/**
 * Create or update user
 */
usersRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { telegramId, username, firstName, lastName } = body;

  if (!telegramId) {
    return c.json({ success: false, error: 'telegramId is required' }, 400);
  }

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });

  if (existingUser) {
    // Update existing user
    const [updated] = await db
      .update(users)
      .set({
        username,
        firstName,
        lastName,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(users.telegramId, telegramId))
      .returning();

    return c.json({ success: true, user: updated, created: false });
  }

  // Create new user
  const referralCode = `REF${telegramId}${Date.now().toString(36).toUpperCase()}`;

  const [newUser] = await db
    .insert(users)
    .values({
      telegramId,
      username,
      firstName,
      lastName,
      referralCode,
      lastActivityAt: new Date(),
    })
    .returning();

  logger.info('New user created', { telegramId, username });

  return c.json({ success: true, user: newUser, created: true });
});

export default usersRouter;
