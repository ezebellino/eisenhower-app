import type { Task } from "../types/tasks";

const DAILY_REMINDER_KEY = "eisenhower_agenda_daily_reminder";

export function supportsBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | "unsupported" {
  if (!supportsBrowserNotifications()) return "unsupported";
  return Notification.permission;
}

export async function requestBrowserNotificationPermission() {
  if (!supportsBrowserNotifications()) return "unsupported" as const;
  return Notification.requestPermission();
}

export function maybeNotifyTodayTasks(tasks: Task[]) {
  if (!supportsBrowserNotifications() || Notification.permission !== "granted") return false;
  if (tasks.length === 0) return false;

  const todayKey = new Date().toISOString().slice(0, 10);
  const alreadySent = localStorage.getItem(DAILY_REMINDER_KEY);
  if (alreadySent === todayKey) return false;

  const preview = tasks
    .slice(0, 3)
    .map((task) => task.title)
    .join(", ");

  const title =
    tasks.length === 1 ? "Tienes 1 tarea para hoy" : `Tienes ${tasks.length} tareas para hoy`;
  const body =
    tasks.length <= 3
      ? preview
      : `${preview} y ${tasks.length - 3} mas en tu agenda.`;

  new Notification(title, {
    body,
    tag: "eisenhower-agenda-daily",
  });

  localStorage.setItem(DAILY_REMINDER_KEY, todayKey);
  return true;
}
