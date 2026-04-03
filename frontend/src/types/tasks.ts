export type Quadrant = 1 | 2 | 3 | 4;
export type TaskStatus = "active" | "completed";
export type TaskID = number;
export type TaskRecurrence = "daily" | "weekly" | "monthly" | "weekdays";

/**
 * API model (backend)
 */
export interface ApiTask {
  id: TaskID;
  title: string;
  description?: string | null;

  is_urgent: boolean;
  is_important: boolean;

  completed: boolean;
  scheduled_for?: string | null;
  scheduled_time?: string | null;
  scheduled_time_end?: string | null;
  recurrence?: TaskRecurrence | null;
  exclude_holidays?: boolean | null;
  assigned_to_id?: number | null;

  created_at: string;
  updated_at: string;
}

/**
 * UI model (frontend)
 * Incluye is_urgent / is_important para no depender del API en pantallas.
 */
export interface Task {
  id: TaskID;
  title: string;
  description?: string;

  is_urgent: boolean;
  is_important: boolean;

  quadrant: Quadrant;
  status: TaskStatus;
  scheduled_for?: string | null;
  scheduled_time?: string | null;
  scheduled_time_end?: string | null;
  recurrence?: TaskRecurrence | null;
  exclude_holidays?: boolean | null;

  createdAt: string;
  updatedAt: string;

  assigned_to_id?: number | null;
}

export const toQuadrant = (t: Pick<Task, "is_urgent" | "is_important">): Quadrant => {
  if (t.is_urgent && t.is_important) return 1;
  if (!t.is_urgent && t.is_important) return 2;
  if (t.is_urgent && !t.is_important) return 3;
  return 4;
};

export const fromApiTask = (t: ApiTask): Task => ({
  id: t.id,
  title: t.title,
  description: t.description ?? undefined,

  is_urgent: t.is_urgent,
  is_important: t.is_important,

  quadrant: toQuadrant({ is_urgent: t.is_urgent, is_important: t.is_important }),
  status: t.completed ? "completed" : "active",
  scheduled_for: t.scheduled_for ?? null,
  scheduled_time: t.scheduled_time ?? null,
  scheduled_time_end: t.scheduled_time_end ?? null,
  recurrence: t.recurrence ?? null,
  exclude_holidays: t.exclude_holidays ?? false,

  createdAt: t.created_at,
  updatedAt: t.updated_at,

  assigned_to_id: t.assigned_to_id ?? null,
});

/**
 * Para el modo local (sin backend): derivamos cuadrante/estado desde flags.
 */
export const normalizeLocalTask = (t: Omit<Task, "quadrant" | "status"> & Partial<Pick<Task, "quadrant" | "status">>): Task => {
  const quadrant = t.quadrant ?? toQuadrant({ is_urgent: t.is_urgent, is_important: t.is_important });
  const status = t.status ?? "active";
  return { ...(t as any), quadrant, status };
};
