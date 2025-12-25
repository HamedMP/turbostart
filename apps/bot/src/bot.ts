/**
 * Telegram Bot Template
 *
 * A template bot with basic commands and patterns.
 * Features:
 * - /start - Welcome and onboarding
 * - /task - Create a new task
 * - /tasks - View your tasks
 * - /help - Show help
 */

import 'dotenv/config';
import {
  Bot,
  Context,
  session,
  type SessionFlavor,
  InlineKeyboard,
} from 'grammy';
import { CommandGroup } from '@grammyjs/commands';
import { limit } from '@grammyjs/ratelimiter';
import { env } from './env.js';
import { BackendClient } from './services/backend-client.js';

// Session data interface
interface SessionData {
  lastTaskId?: number;
  awaitingTaskTitle?: boolean;
}

// Custom context with session
type MyContext = Context & SessionFlavor<SessionData>;

// Initialize bot
const bot = new Bot<MyContext>(env.TELEGRAM_BOT_TOKEN);

// Initialize backend client
const backendClient = new BackendClient(
  env.BACKEND_API_URL,
  env.BACKEND_API_KEY
);

// Session middleware
bot.use(
  session({
    initial: (): SessionData => ({}),
  })
);

// Rate limiting middleware
bot.use(
  limit({
    timeFrame: 60000, // 1 minute
    limit: 20, // 20 requests per minute per user
    onLimitExceeded: async (ctx) => {
      await ctx.reply('Please slow down! Too many requests.');
    },
  })
);

// Command group for auto-complete
const commands = new CommandGroup<MyContext>();

// /start command
commands.command('start', 'Start the bot', async (ctx) => {
  const firstName = ctx.from?.first_name || 'friend';
  const telegramId = ctx.from?.id || 0;

  // Register user in backend
  try {
    await backendClient.createOrGetUser({
      telegram_id: telegramId,
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
    });

    const keyboard = new InlineKeyboard()
      .text('Create Task', 'new_task')
      .text('View Tasks', 'view_tasks');

    await ctx.reply(
      `Hello ${firstName}! Welcome to the bot.\n\n` +
        `Commands:\n` +
        `/task - Create a new task\n` +
        `/tasks - View your tasks\n` +
        `/help - Show help\n`,
      { reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Failed to register user:', error);
    await ctx.reply(
      `Hello ${firstName}! Welcome to the bot.\n\n` +
        `There was an issue connecting to the server. Please try /start again.`
    );
  }
});

// /task command - Create a new task
commands.command('task', 'Create a new task', async (ctx) => {
  const text = ctx.message?.text || '';
  const parts = text.split(' ');
  const taskTitle = parts.length > 1 ? parts.slice(1).join(' ').trim() : '';

  if (!taskTitle) {
    ctx.session.awaitingTaskTitle = true;
    await ctx.reply('What would you like to name your task?\n\nSend /cancel to cancel.');
    return;
  }

  await createTask(ctx, taskTitle);
});

// Helper to create task
async function createTask(ctx: MyContext, title: string) {
  const telegramId = ctx.from?.id || 0;

  const loadingMsg = await ctx.reply('Creating task...');

  try {
    const result = await backendClient.createTask(telegramId, title);

    // Delete loading message
    try {
      await ctx.api.deleteMessage(ctx.chat?.id || 0, loadingMsg.message_id);
    } catch {
      // Ignore delete errors
    }

    if (!result.success || !result.task) {
      await ctx.reply('Failed to create task. Please try again.');
      return;
    }

    ctx.session.lastTaskId = result.task.id;
    ctx.session.awaitingTaskTitle = false;

    const keyboard = new InlineKeyboard()
      .text('Create Another', 'new_task')
      .text('View All Tasks', 'view_tasks');

    await ctx.reply(
      `Task created!\n\n` +
        `Title: ${result.task.title}\n` +
        `ID: ${result.task.id}`,
      { reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Failed to create task:', error);
    await ctx.reply('Server is unavailable. Please try again later.');
  }
}

// /tasks command - View tasks
commands.command('tasks', 'View your tasks', async (ctx) => {
  const telegramId = ctx.from?.id || 0;

  try {
    const result = await backendClient.getUserTasks(telegramId);

    if (!result.success || !result.tasks || result.tasks.length === 0) {
      const keyboard = new InlineKeyboard().text('Create Task', 'new_task');
      await ctx.reply('You have no tasks yet!', { reply_markup: keyboard });
      return;
    }

    const taskList = result.tasks
      .slice(0, 10)
      .map((t, i) => `${i + 1}. ${t.title} (${t.status})`)
      .join('\n');

    const keyboard = new InlineKeyboard()
      .text('Create Task', 'new_task')
      .text('Refresh', 'view_tasks');

    await ctx.reply(
      `Your Tasks:\n\n${taskList}`,
      { reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Failed to get tasks:', error);
    await ctx.reply('Failed to load tasks. Please try again.');
  }
});

// /help command
commands.command('help', 'Show help', async (ctx) => {
  await ctx.reply(
    `Bot Help\n\n` +
      `Commands:\n` +
      `/start - Start the bot\n` +
      `/task [title] - Create a new task\n` +
      `/tasks - View your tasks\n` +
      `/help - Show this help\n` +
      `/cancel - Cancel current operation\n\n` +
      `You can also tap the buttons in messages!`
  );
});

// /cancel command
commands.command('cancel', 'Cancel current operation', async (ctx) => {
  ctx.session.awaitingTaskTitle = false;
  await ctx.reply('Operation cancelled.');
});

// Register commands
bot.use(commands);

// Handle callback queries for inline keyboard
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === 'new_task') {
    await ctx.answerCallbackQuery();
    ctx.session.awaitingTaskTitle = true;
    await ctx.reply('What would you like to name your task?\n\nSend /cancel to cancel.');
    return;
  }

  if (data === 'view_tasks') {
    await ctx.answerCallbackQuery({ text: 'Loading tasks...' });
    const telegramId = ctx.from?.id || 0;

    try {
      const result = await backendClient.getUserTasks(telegramId);

      if (!result.success || !result.tasks || result.tasks.length === 0) {
        const keyboard = new InlineKeyboard().text('Create Task', 'new_task');
        await ctx.reply('You have no tasks yet!', { reply_markup: keyboard });
        return;
      }

      const taskList = result.tasks
        .slice(0, 10)
        .map((t, i) => `${i + 1}. ${t.title} (${t.status})`)
        .join('\n');

      const keyboard = new InlineKeyboard()
        .text('Create Task', 'new_task')
        .text('Refresh', 'view_tasks');

      await ctx.reply(
        `Your Tasks:\n\n${taskList}`,
        { reply_markup: keyboard }
      );
    } catch (error) {
      console.error('Failed to get tasks:', error);
      await ctx.reply('Failed to load tasks.');
    }
    return;
  }

  await ctx.answerCallbackQuery();
});

// Handle text messages
bot.on('message:text', async (ctx) => {
  const text = ctx.message?.text?.trim() || '';

  // Check if awaiting task title
  if (ctx.session.awaitingTaskTitle) {
    await createTask(ctx, text);
    return;
  }

  // Default response
  await ctx.reply('Use /help to see available commands.');
});

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Start the bot
async function main() {
  console.log('Starting Bot...');
  console.log(`Backend API: ${env.BACKEND_API_URL}`);

  // Register commands with Telegram for auto-complete
  console.log('Registering commands with Telegram...');
  await commands.setCommands(bot);
  console.log('Commands registered successfully');

  await bot.start({
    onStart: () => {
      console.log('Bot is running!');
    },
  });
}

main().catch((error) => {
  console.error('Fatal bot error:', error);
  process.exit(1);
});
