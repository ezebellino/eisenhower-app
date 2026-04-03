import type { Task, TaskID } from "../types/tasks";
import { normalizeLocalTask } from "../types/tasks";

const STORAGE_KEY = "eisenhower_tasks_local_v1";

type LocalTaskRecord = Omit<Task, "quadrant" | "status"> & {
  // para storage guardamos todo igual; quadrant/status los recalculamos igual
  quadrant?: Task["quadrant"];
  status?: Task["status"];
};

function nowISO() {
  return new Date().toISOString();
}

function load(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalTaskRecord[];
    return parsed.map((t) => normalizeLocalTask(t as Task));
  } catch {
    return [];
  }
}

function save(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function nextId(tasks: Task[]): number {
  const max = tasks.reduce((acc, t) => Math.max(acc, Number(t.id)), 0);
  return max + 1;
}

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  is_urgent: boolean;
  is_important: boolean;
  assigned_to_id?: number | null;
};

export type UpdateTaskPayload = Partial<{
  title: string;
  description: string | null;
  is_urgent: boolean;
  is_important: boolean;
  completed: boolean;
  assigned_to_id: number | null;
}>;

export async function getAllTasks(): Promise<Task[]> {
  return load();
}

export async function getCompletedTasks(): Promise<Task[]> {
  return load().filter((t) => t.status === "completed");
}

export async function getPendingTasks(): Promise<Task[]> {
  return load().filter((t) => t.status === "active");
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const tasks = load();
  const id = nextId(tasks);

  const t: Task = normalizeLocalTask({
    id,
    title: payload.title,
    description: payload.description ?? undefined,
    is_urgent: payload.is_urgent,
    is_important: payload.is_important,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    assigned_to_id: null,
    status: "active",
  } as any);

  const next = [t, ...tasks];
  save(next);
  return t;
}

export async function updateTask(id: TaskID, patch: UpdateTaskPayload): Promise<Task> {
  const tasks = load();
  const idx = tasks.findIndex((t) => t.id === Number(id));
  if (idx === -1) throw new Error("Task not found");

  const current = tasks[idx];

  const completed =
    typeof patch.completed === "boolean"
      ? patch.completed
      : current.status === "completed";

  const updated: Task = normalizeLocalTask({
    ...current,
    title: patch.title ?? current.title,
    description:
      patch.description === null ? undefined : patch.description ?? current.description,
    is_urgent: patch.is_urgent ?? current.is_urgent,
    is_important: patch.is_important ?? current.is_important,
    status: completed ? "completed" : "active",
    updatedAt: nowISO(),
    assigned_to_id: patch.assigned_to_id ?? current.assigned_to_id ?? null,
  } as any);

  const next = [...tasks];
  next[idx] = updated;
  save(next);
  return updated;
}

export async function deleteTask(id: TaskID): Promise<void> {
  const tasks = load().filter((t) => t.id !== Number(id));
  save(tasks);
}

export async function completeTask(id: TaskID): Promise<void> {
  await updateTask(id, { completed: true });
}

export async function uncompleteTask(id: TaskID): Promise<void> {
  await updateTask(id, { completed: false });
}

export function clearLocalTasks(): void {
  localStorage.removeItem(STORAGE_KEY);
}
