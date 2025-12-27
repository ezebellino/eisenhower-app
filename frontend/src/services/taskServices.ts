import type { ApiTask, Task, TaskID } from "../types/tasks";
import { fromApiTask } from "../types/tasks";
import { fetchJson } from "./api";

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  is_urgent: boolean;
  is_important: boolean;
  assigned_to_id?: number | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  is_urgent?: boolean;
  is_important?: boolean;
  completed?: boolean;
  assigned_to_id?: number | null;
}

export const getAllTasks = async (): Promise<Task[]> => {
  const apiTasks = await fetchJson<ApiTask[]>("/tasks/", { method: "GET" });
  return apiTasks.map(fromApiTask);
};

export const getCompletedTasks = async (): Promise<Task[]> => {
  const apiTasks = await fetchJson<ApiTask[]>("/tasks/completed/", { method: "GET" });
  return apiTasks.map(fromApiTask);
};

export const getTaskById = async (id: TaskID): Promise<Task> => {
  const apiTask = await fetchJson<ApiTask>(`/tasks/${id}`, { method: "GET" });
  return fromApiTask(apiTask);
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const apiTask = await fetchJson<ApiTask>("/tasks/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return fromApiTask(apiTask);
};

export const updateTask = async (id: TaskID, payload: UpdateTaskPayload): Promise<Task> => {
  const apiTask = await fetchJson<ApiTask>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return fromApiTask(apiTask);
};

export const completeTask = async (id: TaskID): Promise<Task> => {
  const apiTask = await fetchJson<ApiTask>(`/tasks/${id}/complete`, { method: "PATCH" });
  return fromApiTask(apiTask);
};

export const uncompleteTask = async (id: TaskID): Promise<Task> => {
  const apiTask = await fetchJson<ApiTask>(`/tasks/${id}/uncomplete`, { method: "PATCH" });
  return fromApiTask(apiTask);
};

export const deleteTask = async (id: TaskID): Promise<void> => {
  await fetchJson<{ detail: string }>(`/tasks/${id}`, { method: "DELETE" });
};
