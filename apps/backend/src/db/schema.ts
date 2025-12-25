import { pgTable, serial, bigint, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const taskStatusEnum = pgEnum('task_status', ['pending', 'processing', 'completed', 'failed']);

// ============================================================================
// CREDIT SYSTEM CONFIG
// ============================================================================

export const CREDIT_COSTS = {
  TASK_CREATE: 1,
  AUDIO_GENERATE: 4,
  INITIAL_CREDITS: 10,
  REFERRAL_BONUS: 10,
  REFERRALS_REQUIRED: 3,
} as const;

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  telegramId: bigint('telegram_id', { mode: 'number' }).notNull().unique(),
  username: text('username'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  credits: integer('credits').notNull().default(CREDIT_COSTS.INITIAL_CREDITS),
  // Referral system
  referralCode: text('referral_code').unique(),
  referredByUserId: integer('referred_by_user_id'),
  referralCreditsEarned: integer('referral_credits_earned').notNull().default(0),
  // Status flags
  isEarlyAdopter: boolean('is_early_adopter').notNull().default(false),
  isPremium: boolean('is_premium').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastActivityAt: timestamp('last_activity_at'),
});

// ============================================================================
// TASKS TABLE (example entity - rename for your use case)
// ============================================================================

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  status: taskStatusEnum('status').notNull().default('pending'),
  // Generated assets
  imageUrl: text('image_url'),
  audioUrl: text('audio_url'),
  videoUrl: text('video_url'),
  // Public sharing
  shareId: text('share_id').unique(),
  isPublic: boolean('is_public').notNull().default(false),
  viewCount: integer('view_count').notNull().default(0),
  // Metadata
  generationTimeMs: integer('generation_time_ms'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

// ============================================================================
// REFERRALS TABLE
// ============================================================================

export const referralStatusEnum = pgEnum('referral_status', ['pending', 'completed']);

export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: integer('referred_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  referralCode: text('referral_code').notNull(),
  status: referralStatusEnum('status').notNull().default('pending'),
  credited: boolean('credited').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  creditedAt: timestamp('credited_at'),
});

// ============================================================================
// ACTIVITY LOG TABLE
// ============================================================================

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  telegramId: bigint('telegram_id', { mode: 'number' }).notNull(),
  action: text('action').notNull(), // 'command', 'button_click', 'api_call'
  details: text('details'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  tasks: many(tasks),
  activityLogs: many(activityLogs),
  referralsMade: many(referrals, { relationName: 'referrer' }),
  referredBy: one(users, {
    fields: [users.referredByUserId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: 'referrer',
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: 'referredUser',
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// TYPES
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
