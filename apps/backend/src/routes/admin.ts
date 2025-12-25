import { Hono } from 'hono';
import { desc, count, sql } from 'drizzle-orm';
import { db, users, tasks } from '../db/index.js';

const adminRouter = new Hono();

/**
 * Get dashboard stats
 */
adminRouter.get('/stats', async (c) => {
  const [userCount] = await db.select({ count: count() }).from(users);
  const [taskCount] = await db.select({ count: count() }).from(tasks);

  // Recent activity
  const recentUsers = await db.query.users.findMany({
    orderBy: desc(users.createdAt),
    limit: 5,
  });

  const recentTasks = await db.query.tasks.findMany({
    orderBy: desc(tasks.createdAt),
    limit: 5,
    with: { user: true },
  });

  return c.json({
    success: true,
    stats: {
      totalUsers: userCount.count,
      totalTasks: taskCount.count,
    },
    recentUsers,
    recentTasks,
  });
});

/**
 * Get all users (paginated)
 */
adminRouter.get('/users', async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 20;
  const offset = (page - 1) * limit;

  const allUsers = await db.query.users.findMany({
    orderBy: desc(users.createdAt),
    limit,
    offset,
  });

  const [total] = await db.select({ count: count() }).from(users);

  return c.json({
    success: true,
    users: allUsers,
    pagination: {
      page,
      limit,
      total: total.count,
      pages: Math.ceil(total.count / limit),
    },
  });
});

/**
 * Get all tasks (paginated)
 */
adminRouter.get('/tasks', async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 20;
  const offset = (page - 1) * limit;

  const allTasks = await db.query.tasks.findMany({
    orderBy: desc(tasks.createdAt),
    limit,
    offset,
    with: { user: true },
  });

  const [total] = await db.select({ count: count() }).from(tasks);

  return c.json({
    success: true,
    tasks: allTasks,
    pagination: {
      page,
      limit,
      total: total.count,
      pages: Math.ceil(total.count / limit),
    },
  });
});

export default adminRouter;
