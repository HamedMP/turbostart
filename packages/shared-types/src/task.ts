/**
 * Task Types - Example domain entity
 */

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  result_data: Record<string, unknown> | null;
  created_at: Date;
  completed_at: Date | null;
}

export interface CreateTaskRequest {
  user_id: number;
  title: string;
  description?: string;
}
