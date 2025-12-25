import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { db, tasks, users, CREDIT_COSTS } from '../db/index.js';
import { logger } from '../middleware/logger.js';

const tasksRouter = new Hono();

/**
 * Create a new task
 */
tasksRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { telegramId, title, content } = body;

  if (!telegramId || !title) {
    return c.json({ success: false, error: 'telegramId and title are required' }, 400);
  }

  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  // Check credits
  if (user.credits < CREDIT_COSTS.TASK_CREATE) {
    return c.json({
      success: false,
      error: 'Insufficient credits',
      required: CREDIT_COSTS.TASK_CREATE,
      available: user.credits,
    }, 400);
  }

  const startTime = Date.now();

  // Deduct credits and create task
  await db
    .update(users)
    .set({ credits: user.credits - CREDIT_COSTS.TASK_CREATE })
    .where(eq(users.id, user.id));

  // Generate share ID
  const shareId = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;

  // Create task
  const [task] = await db
    .insert(tasks)
    .values({
      userId: user.id,
      title,
      content: content || '',
      shareId,
      status: 'completed',
      generationTimeMs: Date.now() - startTime,
      completedAt: new Date(),
    })
    .returning();

  logger.info('Task created', { taskId: task.id, userId: user.id });

  return c.json({ success: true, task });
});

/**
 * Get task by ID
 */
tasksRouter.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ success: false, error: 'Invalid task ID' }, 400);
  }

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
    with: { user: true },
  });

  if (!task) {
    return c.json({ success: false, error: 'Task not found' }, 404);
  }

  return c.json({ success: true, task });
});

/**
 * Get tasks for a user
 */
tasksRouter.get('/user/:telegramId', async (c) => {
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

  const userTasks = await db.query.tasks.findMany({
    where: eq(tasks.userId, user.id),
    orderBy: desc(tasks.createdAt),
    limit: 50,
  });

  return c.json({ success: true, tasks: userTasks });
});

export default tasksRouter;
