import type { ApiTask, Task, TaskID } from "../types/tasks";
import { fromApiTask } from "../types/tasks";


const API_URL = "http://localhost:8000/tasks";

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  return (await res.json()) as T;
}

export const getAllTasks = async (): Promise<Task[]> => {
  const apiTasks = await fetchJson<ApiTask[]>(`${API_URL}/`);
  return apiTasks.map(fromApiTask);
};

export const getCompletedTasks = async (): Promise<Task[]> => {
  const apiTasks = await fetchJson<ApiTask[]>(`${API_URL}/completed/`);
  return apiTasks.map(fromApiTask);
};


export const completeTask = async (id: TaskID): Promise<void> => {
  await fetch(`${API_URL}/${id}/complete`, { method: "PATCH" });
};

export const uncompleteTask = async (id: TaskID): Promise<void> => {
  await fetch(`${API_URL}/${id}/uncomplete`, { method: "PATCH" });
};

export const deleteTask = async (id: TaskID): Promise<void> => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};

// Tipá el payload de creación según tu backend.
// Si backend espera otros campos, los agregamos.
export interface CreateTaskPayload {
  title: string;
  description?: string;
  is_urgent: boolean;
  is_important: boolean;
}

export const createTask = async (taskData: CreateTaskPayload): Promise<void> => {
  const res = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
};

export type CompletedActions =
  | {
      showOnlyCompletedActions: true;
      onDelete: (id: TaskID) => Promise<void>;
      onUncomplete: (id: TaskID) => Promise<void>;
    }
  | {
      showOnlyCompletedActions: false;
      onDelete: (id: TaskID) => Promise<void>;
      onComplete: (id: TaskID) => Promise<void>;
      onUncomplete: (id: TaskID) => Promise<void>;
    };

export const showOnlyCompletedActions = (task: Task): CompletedActions => {
  return task.status === "completed"
    ? {
        onDelete: deleteTask,
        onUncomplete: uncompleteTask,
        showOnlyCompletedActions: true,
      }
    : {
        onComplete: completeTask,
        onDelete: deleteTask,
        onUncomplete: uncompleteTask,
        showOnlyCompletedActions: false,
      };
};
