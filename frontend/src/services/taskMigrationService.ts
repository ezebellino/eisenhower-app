import type { Task } from "../types/tasks";
import * as api from "./apiTaskService";
import * as local from "./localTaskService";

function sortForMigration(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const aTime = Date.parse(a.createdAt);
    const bTime = Date.parse(b.createdAt);

    if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
      return Number(a.id) - Number(b.id);
    }

    return aTime - bTime;
  });
}

export async function migrateLocalTasksToAccount(): Promise<number> {
  const localTasks = await local.getAllTasks();
  if (localTasks.length === 0) return 0;

  const orderedTasks = sortForMigration(localTasks);

  try {
    for (const task of orderedTasks) {
      const created = await api.createTask({
        title: task.title,
        description: task.description ?? "",
        is_urgent: task.is_urgent,
        is_important: task.is_important,
      });

      if (task.status === "completed") {
        await api.completeTask(created.id);
      }
    }

    local.clearLocalTasks();
    return orderedTasks.length;
  } catch (error) {
    console.error("No se pudieron migrar las tareas locales a la cuenta.", error);
    return 0;
  }
}
