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
 * Nota: preservamos is_urgent/is_important para edición y creación.
 */
export interface Task {
  id: TaskID;
  title: string;
  description?: string;

  is_urgent: boolean;
  is_important: boolean;

  quadrant: Quadrant;
  status: TaskStatus;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/**
 * Derivar cuadrante en base a urgente/importante
 */
export const toQuadrant = (t: Pick<ApiTask, "is_urgent" | "is_important">): Quadrant => {
  if (t.is_urgent && t.is_important) return 1;
  if (!t.is_urgent && t.is_important) return 2;
  if (t.is_urgent && !t.is_important) return 3;
  return 4;
};

/**
 * (Opcional) Derivar urgente/importante desde quadrant
 * Útil si alguna vez necesitás recalcularlo desde UI.
 */
export const toUrgentImportant = (q: Quadrant): { is_urgent: boolean; is_important: boolean } => {
  switch (q) {
    case 1:
      return { is_urgent: true, is_important: true };
    case 2:
      return { is_urgent: false, is_important: true };
    case 3:
      return { is_urgent: true, is_important: false };
    case 4:
    default:
      return { is_urgent: false, is_important: false };
  }
};

export const fromApiTask = (t: ApiTask): Task => ({
  id: t.id,
  title: t.title,
  description: t.description ?? undefined,

  is_urgent: t.is_urgent,
  is_important: t.is_important,

  quadrant: toQuadrant(t),
  status: t.completed ? "completed" : "active",

  createdAt: t.created_at,
  updatedAt: t.updated_at,
});
