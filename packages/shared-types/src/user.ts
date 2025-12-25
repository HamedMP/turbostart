/**
 * User Types - Shared between bot, backend, and frontend
 */

export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  credits: number;
  created_at: Date;
  updated_at: Date;
  last_activity_at: Date | null;
}

export interface CreateUserRequest {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface UpdateUserRequest {
  username?: string;
  first_name?: string;
  last_name?: string;
  credits?: number;
}
