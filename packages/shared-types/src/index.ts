/**
 * Shared Types Package
 *
 * Contains TypeScript types shared between all applications in the monorepo.
 * This ensures type safety across the bot, backend, and frontend.
 */

// User types
export type { User, CreateUserRequest, UpdateUserRequest } from './user';

// Task types
export type { Task, CreateTaskRequest, TaskStatus } from './task';

// API response types
export type { ApiResponse, PaginatedResponse, ApiError } from './api';
