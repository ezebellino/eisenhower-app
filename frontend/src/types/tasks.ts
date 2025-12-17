export type Quadrant = 1 | 2 | 3 | 4;
export type TaskStatus = "active" | "completed";
export type TaskID = number | string;

/**
 * API model: exactamente lo que devuelve FastAPI
 */
export interface ApiTask {
  id: TaskID;
  title: string;
  description?: string | null;

  is_urgent: boolean;
  is_important: boolean;

  completed: boolean;

  created_at: string; // ISO
  updated_at: string; // ISO
}

/**
 * UI model: lo que usa tu frontend internamente
 */
export interface Task {
  id: TaskID;
  title: string;
  description?: string;

  quadrant: Quadrant;
  status: TaskStatus;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/**
 * Derivar cuadrante en base a urgente/importante
 * Q1: urgente + importante
 * Q2: no urgente + importante
 * Q3: urgente + no importante
 * Q4: no urgente + no importante
 */
export const toQuadrant = (t: Pick<ApiTask, "is_urgent" | "is_important">): Quadrant => {
  if (t.is_urgent && t.is_important) return 1;
  if (!t.is_urgent && t.is_important) return 2;
  if (t.is_urgent && !t.is_important) return 3;
  return 4;
};

export const fromApiTask = (t: ApiTask): Task => ({
  id: t.id,
  title: t.title,
  description: t.description ?? undefined,

  quadrant: toQuadrant(t),
  status: t.completed ? "completed" : "active",

  createdAt: t.created_at,
  updatedAt: t.updated_at,
});
