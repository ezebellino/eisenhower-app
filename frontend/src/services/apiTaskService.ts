import type { ApiTask, Task, TaskID } from "../types/tasks";
import { fromApiTask } from "../types/tasks";
import { fetchJson } from "./api";

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  is_urgent: boolean;
  is_important: boolean;
  scheduled_for?: string | null;
  scheduled_time?: string | null;
  scheduled_time_end?: string | null;
  recurrence?: "daily" | "weekly" | "monthly" | "weekdays" | null;
  exclude_holidays?: boolean | null;
  assigned_to_id?: number | null;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  completed?: boolean;
};

export async function getAllTasks(): Promise<Task[]> {
  const apiTasks = await fetchJson<ApiTask[]>("/tasks/");
  return apiTasks.map(fromApiTask);
}

export async function getCompletedTasks(): Promise<Task[]> {
  const apiTasks = await fetchJson<ApiTask[]>("/tasks/filter/?completed=true");
  return apiTasks.map(fromApiTask);
}

export async function getPendingTasks(): Promise<Task[]> {
  const apiTasks = await fetchJson<ApiTask[]>("/tasks/filter/?completed=false");
  return apiTasks.map(fromApiTask);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const apiTask = await fetchJson<ApiTask>("/tasks/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return fromApiTask(apiTask);
}

export async function updateTask(id: TaskID, patch: UpdateTaskPayload): Promise<void> {
  await fetchJson(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export async function deleteTask(id: TaskID): Promise<void> {
  await fetchJson(`/tasks/${id}`, { method: "DELETE" });
}

export async function completeTask(id: TaskID): Promise<void> {
  await fetchJson(`/tasks/${id}/complete`, { method: "PATCH" });
}

export async function uncompleteTask(id: TaskID): Promise<void> {
  await fetchJson(`/tasks/${id}/uncomplete`, { method: "PATCH" });
}
