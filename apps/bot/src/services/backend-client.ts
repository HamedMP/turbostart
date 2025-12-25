/**
 * Backend API Client
 *
 * Handles communication between the bot and the backend API.
 */

interface CreateUserRequest {
  telegram_id: number;
  username?: string | undefined;
  first_name?: string | undefined;
  last_name?: string | undefined;
}

interface UserResponse {
  success: boolean;
  user?: {
    id: number;
    telegramId: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    credits: number;
    createdAt: string;
  };
  created?: boolean;
  error?: string;
}

interface TaskResponse {
  success: boolean;
  task?: {
    id: number;
    title: string;
    content: string;
    status: string;
    shareId: string;
    createdAt: string;
  };
  error?: string;
}

interface TasksResponse {
  success: boolean;
  tasks?: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
  }>;
  error?: string;
}

export class BackendClient {
  private baseUrl: string;
  private apiKey?: string | undefined;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Create or get user by Telegram ID
   */
  async createOrGetUser(request: CreateUserRequest): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/api/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        telegramId: request.telegram_id,
        username: request.username,
        firstName: request.first_name,
        lastName: request.last_name,
      }),
    });

    return response.json() as Promise<UserResponse>;
  }

  /**
   * Get user by Telegram ID
   */
  async getUser(telegramId: number): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/${telegramId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return response.json() as Promise<UserResponse>;
  }

  /**
   * Create a new task
   */
  async createTask(telegramId: number, title: string, content?: string): Promise<TaskResponse> {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        telegramId,
        title,
        content,
      }),
    });

    return response.json() as Promise<TaskResponse>;
  }

  /**
   * Get tasks for a user
   */
  async getUserTasks(telegramId: number): Promise<TasksResponse> {
    const response = await fetch(`${this.baseUrl}/api/tasks/user/${telegramId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return response.json() as Promise<TasksResponse>;
  }
}
