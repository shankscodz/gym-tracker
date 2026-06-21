const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ExerciseLog {
  id?: number;
  sub_exercise_id: number;
  sub_exercise_name?: string;
  muscle_group_name?: string;
  muscle_group_code?: string;
  weight: number | string;
  reps: number;
  sets: number;
  order?: number;
}

export interface WorkoutLog {
  id?: number;
  user?: string;
  date?: string;
  name: string;
  is_draft: boolean;
  exercises: ExerciseLog[];
}

export interface SubExercise {
  id: number;
  name: string;
  muscle_group: number;
  muscle_group_name: string;
  muscle_group_code: string;
}

export interface MuscleGroup {
  id: number;
  name: string;
  code: string;
  exercises: SubExercise[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearTokens();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'API request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  async login(email: string, password: string) {
    const data = await request('/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.access, data.refresh);
    return data;
  },

  async register(username: string, email: string, password: string) {
    return request('/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async getProfile(): Promise<User> {
    return request('/profile/');
  },

  async getMuscleGroups(): Promise<MuscleGroup[]> {
    return request('/muscle-groups/');
  },

  async getWorkouts(): Promise<WorkoutLog[]> {
    return request('/workouts/');
  },

  async getWorkout(id: number | string): Promise<WorkoutLog> {
    return request(`/workouts/${id}/`);
  },

  async createWorkout(workout: WorkoutLog): Promise<WorkoutLog> {
    return request('/workouts/', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
  },

  async updateWorkout(id: number | string, workout: WorkoutLog): Promise<WorkoutLog> {
    return request(`/workouts/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(workout),
    });
  },

  async deleteWorkout(id: number | string): Promise<null> {
    return request(`/workouts/${id}/`, {
      method: 'DELETE',
    });
  }
};
