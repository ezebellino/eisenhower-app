import type { Task, TaskID } from "../types/tasks";
import { getToken } from "./api";

import * as api from "./apiTaskService";
import * as local from "./localTaskService";

/**
 * Si hay token => API
 * Si NO hay token => Local
 */
function useApi(): boolean {
  return Boolean(getToken());
}

// Re-exportá tipos para que tus páginas sigan importando desde taskServices
export type CreateTaskPayload = local.CreateTaskPayload;
export type UpdateTaskPayload = local.UpdateTaskPayload;

export async function getAllTasks(): Promise<Task[]> {
  return useApi() ? api.getAllTasks() : local.getAllTasks();
}

export async function getCompletedTasks(): Promise<Task[]> {
  return useApi() ? api.getCompletedTasks() : local.getCompletedTasks();
}

export async function getPendingTasks(): Promise<Task[]> {
  return useApi() ? api.getPendingTasks() : local.getPendingTasks();
}

export async function createTask(payload: CreateTaskPayload): Promise<void> {
  return useApi() ? api.createTask(payload) : (async () => { await local.createTask(payload); })();
}

export async function updateTask(id: TaskID, patch: UpdateTaskPayload): Promise<void> {
  return useApi() ? api.updateTask(id, patch) : (async () => { await local.updateTask(id, patch); })();
}

export async function deleteTask(id: TaskID): Promise<void> {
  return useApi() ? api.deleteTask(id) : local.deleteTask(id);
}

export async function completeTask(id: TaskID): Promise<void> {
  return useApi() ? api.completeTask(id) : local.completeTask(id);
}

export async function uncompleteTask(id: TaskID): Promise<void> {
  return useApi() ? api.uncompleteTask(id) : local.uncompleteTask(id);
}

export async function getTaskById(id: TaskID): Promise<Task> {
  const tasks = await getAllTasks();
  const task = tasks.find((t) => t.id === Number(id));
  if (!task) throw new Error("Task not found");
  return task;
}
