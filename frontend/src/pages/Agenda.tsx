import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { showInfoAlert, showSuccessToast } from "../services/alertService";
import {
  getBrowserNotificationPermission,
  maybeNotifyTodayTasks,
  requestBrowserNotificationPermission,
  supportsBrowserNotifications,
} from "../services/notificationService";
import { getAllTasks } from "../services/taskServices";
import type { Task } from "../types/tasks";
import "../../styles/Agenda.css";

type AgendaScope = "selected" | "today" | "tomorrow" | "week";

function toLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function occursOn(task: Task, date: Date) {
  if (!task.scheduled_for || task.status === "completed") return false;

  const anchor = toLocalDate(task.scheduled_for);
  if (Number.isNaN(anchor.getTime()) || date < anchor) return false;

  if (!task.recurrence) {
    return sameDate(anchor, date);
  }

  if (task.recurrence === "daily") {
    return true;
  }

  if (task.recurrence === "weekly") {
    return anchor.getDay() === date.getDay();
  }

  if (task.recurrence === "monthly") {
    return anchor.getDate() === date.getDate();
  }

  return false;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(date);
}

function recurrenceLabel(value: Task["recurrence"]) {
  switch (value) {
    case "daily":
      return "Diaria";
    case "weekly":
      return "Semanal";
    case "monthly":
      return "Mensual";
    default:
      return null;
  }
}

function getScopeTitle(scope: AgendaScope, selectedDate: Date, today: Date, tomorrow: Date) {
  switch (scope) {
    case "today":
      return `Hoy · ${dayLabel(today)}`;
    case "tomorrow":
      return `Manana · ${dayLabel(tomorrow)}`;
    case "week":
      return "Esta semana";
    case "selected":
    default:
      return dayLabel(selectedDate);
  }
}

export default function Agenda() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [scope, setScope] = useState<AgendaScope>("today");
  const [notificationPermission, setNotificationPermission] = useState(
    getBrowserNotificationPermission()
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const allTasks = await getAllTasks();
        setTasks(allTasks);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "No pudimos cargar tu agenda.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeTasks = tasks.filter((task) => task.status === "active");
  const scheduledTasks = activeTasks.filter((task) => Boolean(task.scheduled_for));
  const recurringTasks = activeTasks.filter((task) => Boolean(task.recurrence));
  const unscheduledTasks = activeTasks.filter((task) => !task.scheduled_for).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const tasksToday = activeTasks.filter((task) => occursOn(task, today));
  const tasksTomorrow = activeTasks.filter((task) => occursOn(task, tomorrow));
  const tasksThisWeek = activeTasks.filter((task) => {
    for (
      let cursor = new Date(weekStart);
      cursor <= weekEnd;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      if (occursOn(task, cursor)) return true;
    }
    return false;
  });

  useEffect(() => {
    if (notificationPermission === "granted") {
      maybeNotifyTodayTasks(tasksToday);
    }
  }, [notificationPermission, tasksToday]);

  const monthDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const start = new Date(first);
    const offset = first.getDay() === 0 ? 6 : first.getDay() - 1;
    start.setDate(first.getDate() - offset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of monthDays) {
      const key = day.toISOString().slice(0, 10);
      map.set(
        key,
        activeTasks.filter((task) => occursOn(task, day))
      );
    }
    return map;
  }, [activeTasks, monthDays]);

  const selectedKey = selectedDate.toISOString().slice(0, 10);
  const selectedTasks = tasksByDate.get(selectedKey) ?? [];
  const sidebarTasks =
    scope === "today"
      ? tasksToday
      : scope === "tomorrow"
        ? tasksTomorrow
        : scope === "week"
          ? tasksThisWeek
          : selectedTasks;

  const scopeTitle = getScopeTitle(scope, selectedDate, today, tomorrow);

  const handleEnableNotifications = async () => {
    if (!supportsBrowserNotifications()) {
      await showInfoAlert(
        "Notificaciones no disponibles",
        "Este navegador no soporta recordatorios locales desde la aplicacion."
      );
      return;
    }

    const permission = await requestBrowserNotificationPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      maybeNotifyTodayTasks(tasksToday);
      await showSuccessToast("Recordatorios activados");
      return;
    }

    await showInfoAlert(
      "Recordatorios desactivados",
      "Puedes volver a habilitarlos mas tarde desde este mismo panel."
    );
  };

  return (
    <main className="page container agenda-page">
      <section className="agenda-hero panel">
        <div>
          <p className="agenda-hero__eyebrow">Agenda</p>
          <h1 className="page-title">Calendario propio para tus tareas</h1>
          <p className="agenda-hero__description">
            Programa tareas para una fecha concreta, repitelas cuando haga falta y mira tu carga por dia sin salir de la app.
          </p>
        </div>

        <div className="agenda-hero__actions">
          <Link to="/tasks/create" className="btn-primary">
            Programar tarea
          </Link>
          <Link to="/tasks" className="btn-ghost">
            Volver al Dashboard
          </Link>
        </div>
      </section>

      <section className="agenda-kpis">
        <article className="agenda-kpi panel">
          <span>Hoy</span>
          <strong>{tasksToday.length}</strong>
          <small>Tareas activas que tocan hoy</small>
        </article>
        <article className="agenda-kpi panel">
          <span>Manana</span>
          <strong>{tasksTomorrow.length}</strong>
          <small>Lo que ya cae en el dia siguiente</small>
        </article>
        <article className="agenda-kpi panel">
          <span>Esta semana</span>
          <strong>{tasksThisWeek.length}</strong>
          <small>Carga visible en los proximos 7 dias</small>
        </article>
        <article className="agenda-kpi panel">
          <span>Recurrentes</span>
          <strong>{recurringTasks.length}</strong>
          <small>Rutinas o recordatorios que siguen vivos</small>
        </article>
      </section>

      <section className="agenda-focus panel">
        <div className="agenda-focus__tabs">
          <button
            type="button"
            className={`agenda-focus__tab ${scope === "today" ? "is-active" : ""}`}
            onClick={() => setScope("today")}
          >
            Hoy
          </button>
          <button
            type="button"
            className={`agenda-focus__tab ${scope === "tomorrow" ? "is-active" : ""}`}
            onClick={() => setScope("tomorrow")}
          >
            Manana
          </button>
          <button
            type="button"
            className={`agenda-focus__tab ${scope === "week" ? "is-active" : ""}`}
            onClick={() => setScope("week")}
          >
            Esta semana
          </button>
          <button
            type="button"
            className={`agenda-focus__tab ${scope === "selected" ? "is-active" : ""}`}
            onClick={() => setScope("selected")}
          >
            Fecha elegida
          </button>
        </div>

        <div className="agenda-focus__summary">
          <div>
            <span>Sin fecha</span>
            <strong>{unscheduledTasks}</strong>
            <small>Tareas activas todavia fuera de agenda</small>
          </div>
          <div>
            <span>Recordatorios</span>
            <strong>
              {notificationPermission === "granted"
                ? "Activos"
                : notificationPermission === "denied"
                  ? "Bloqueados"
                  : "Opcionales"}
            </strong>
            <small>
              {notificationPermission === "granted"
                ? "La app puede recordarte tus tareas del dia."
                : "Puedes activar avisos locales desde este panel."}
            </small>
          </div>
          {notificationPermission !== "granted" && (
            <button type="button" className="btn-ghost" onClick={handleEnableNotifications}>
              Activar recordatorios
            </button>
          )}
        </div>
      </section>

      {loadError && (
        <div className="matrix-banner matrix-banner--error">
          <p>No pudimos cargar la agenda.</p>
          <small>{loadError}</small>
        </div>
      )}

      <section className="agenda-layout">
        <div className="agenda-calendar panel">
          <div className="agenda-calendar__header">
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
                )
              }
            >
              Mes anterior
            </button>
            <h2>{monthLabel(visibleMonth)}</h2>
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
                )
              }
            >
              Mes siguiente
            </button>
          </div>

          <div className="agenda-calendar__weekdays">
            {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="agenda-calendar__grid">
            {monthDays.map((day) => {
              const key = day.toISOString().slice(0, 10);
              const dayTasks = tasksByDate.get(key) ?? [];
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const isToday = sameDate(day, today);
              const isSelected = sameDate(day, selectedDate);

              return (
                <button
                  key={key}
                  type="button"
                  className={`agenda-day ${isCurrentMonth ? "" : "is-muted"} ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`}
                  onClick={() => {
                    setSelectedDate(new Date(day));
                    setScope("selected");
                  }}
                >
                  <div className="agenda-day__topline">
                    <strong>{day.getDate()}</strong>
                    {dayTasks.length > 0 && <span>{dayTasks.length}</span>}
                  </div>
                  <div className="agenda-day__items">
                    {dayTasks.slice(0, 2).map((task) => (
                      <small key={`${task.id}-${key}`}>{task.title}</small>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="agenda-sidebar panel">
          <div className="agenda-sidebar__header">
            <p className="agenda-hero__eyebrow">Vista operativa</p>
            <h2>{scopeTitle}</h2>
          </div>

          {loading ? (
            <p className="subtle">Estamos preparando tu agenda...</p>
          ) : sidebarTasks.length === 0 ? (
            <div className="agenda-sidebar__empty">
              <strong>No hay tareas para esta vista.</strong>
              <p>Puedes dejar ese espacio libre o programar algo nuevo desde crear tarea.</p>
            </div>
          ) : (
            <div className="agenda-sidebar__list">
              {sidebarTasks.map((task) => (
                <article key={`${task.id}-${scopeTitle}`} className="agenda-task">
                  <div className="agenda-task__header">
                    <strong>{task.title}</strong>
                    {task.recurrence && <span>Repite {recurrenceLabel(task.recurrence)}</span>}
                  </div>
                  <p>{task.description || "Sin descripcion adicional."}</p>
                  <div className="agenda-task__meta">
                    <span>{task.scheduled_for ? `Fecha ${task.scheduled_for}` : "Sin fecha"}</span>
                    <span>{task.is_important ? "Importante" : "Menor impacto"}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="agenda-sidebar__footer">
            <strong>{scheduledTasks.length}</strong>
            <span>tareas activas con fecha en agenda</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
