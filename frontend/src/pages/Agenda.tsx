import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { showInfoAlert, showSuccessToast } from "../services/alertService";
import { getPublicHolidayDates } from "../services/holidayService";
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

function isHoliday(date: Date, holidayDates: Set<string>) {
  return holidayDates.has(date.toISOString().slice(0, 10));
}

function occursOn(task: Task, date: Date, holidayDates: Set<string>) {
  if (!task.scheduled_for || task.status === "completed") return false;

  const anchor = toLocalDate(task.scheduled_for);
  if (Number.isNaN(anchor.getTime()) || date < anchor) return false;

  if (!task.recurrence) {
    return sameDate(anchor, date);
  }

  if (task.exclude_holidays && isHoliday(date, holidayDates)) {
    return false;
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

  if (task.recurrence === "weekdays") {
    const weekday = date.getDay();
    return weekday >= 1 && weekday <= 5;
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
    case "weekdays":
      return "Lunes a viernes";
    default:
      return null;
  }
}

function formatTaskTime(value: string | null | undefined) {
  if (!value) return "Sin horario";
  return value.slice(0, 5);
}

function parseTimeToMinutes(value: string | null | undefined) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function formatMinutesAsTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDuration(startMinutes: number, endMinutes: number) {
  const diff = Math.max(endMinutes - startMinutes, 0);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours > 0 && minutes > 0) return `${hours} h ${minutes} min`;
  if (hours > 0) return `${hours} h`;
  return `${minutes} min`;
}

function getTaskStartMinutes(task: Task | undefined) {
  if (!task) return null;
  return parseTimeToMinutes(task.scheduled_time);
}

function getTaskEndMinutes(task: Task | undefined) {
  if (!task) return null;
  return parseTimeToMinutes(task.scheduled_time_end) ?? getTaskStartMinutes(task);
}

function getTaskTimeRangeLabel(task: Task) {
  const start = formatTaskTime(task.scheduled_time);
  const end = formatTaskTime(task.scheduled_time_end);

  if (start !== "Sin horario" && end !== "Sin horario") {
    return `${start} a ${end}`;
  }

  return start;
}

function getScopeTitle(scope: AgendaScope, selectedDate: Date, today: Date, tomorrow: Date) {
  switch (scope) {
    case "today":
      return `Hoy | ${dayLabel(today)}`;
    case "tomorrow":
      return `Manana | ${dayLabel(tomorrow)}`;
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
  const [holidaysByYear, setHolidaysByYear] = useState<Record<number, string[]>>({});
  const [holidayError, setHolidayError] = useState<string | null>(null);

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

  const holidayYears = useMemo(() => {
    const years = new Set<number>([
      today.getFullYear(),
      tomorrow.getFullYear(),
      selectedDate.getFullYear(),
      visibleMonth.getFullYear(),
      weekEnd.getFullYear(),
    ]);

    monthDays.forEach((day) => years.add(day.getFullYear()));

    return [...years];
  }, [monthDays, selectedDate, today, tomorrow, visibleMonth, weekEnd]);

  useEffect(() => {
    const missingYears = holidayYears.filter((year) => !holidaysByYear[year]);
    if (missingYears.length === 0) return;

    let cancelled = false;

    (async () => {
      try {
        const results = await Promise.all(
          missingYears.map(async (year) => ({
            year,
            dates: await getPublicHolidayDates(year, "AR"),
          }))
        );

        if (cancelled) return;

        setHolidaysByYear((prev) => {
          const next = { ...prev };
          results.forEach(({ year, dates }) => {
            next[year] = dates;
          });
          return next;
        });
        setHolidayError(null);
      } catch (error) {
        if (cancelled) return;
        setHolidayError(
          error instanceof Error
            ? error.message
            : "No pudimos cargar los feriados para agenda habil."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [holidayYears, holidaysByYear]);

  const holidayDates = useMemo(() => {
    const allDates = Object.values(holidaysByYear).flat();
    return new Set(allDates);
  }, [holidaysByYear]);

  const tasksToday = activeTasks.filter((task) => occursOn(task, today, holidayDates));
  const tasksTomorrow = activeTasks.filter((task) => occursOn(task, tomorrow, holidayDates));
  const tasksThisWeek = activeTasks.filter((task) => {
    for (
      let cursor = new Date(weekStart);
      cursor <= weekEnd;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      if (occursOn(task, cursor, holidayDates)) return true;
    }
    return false;
  });

  useEffect(() => {
    if (notificationPermission === "granted") {
      maybeNotifyTodayTasks(tasksToday);
    }
  }, [notificationPermission, tasksToday]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of monthDays) {
      const key = day.toISOString().slice(0, 10);
      map.set(
        key,
        activeTasks.filter((task) => occursOn(task, day, holidayDates))
      );
    }
    return map;
  }, [activeTasks, holidayDates, monthDays]);

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
  const timelineDate =
    scope === "selected" ? selectedDate : scope === "tomorrow" ? tomorrow : today;
  const timelineTasks = activeTasks.filter((task) => occursOn(task, timelineDate, holidayDates));
  const timedTimelineTasks = [...timelineTasks]
    .filter((task) => Boolean(task.scheduled_time))
    .sort(
      (left, right) =>
        (getTaskStartMinutes(left) ?? 0) - (getTaskStartMinutes(right) ?? 0)
    );
  const floatingTimelineTasks = timelineTasks.filter((task) => !task.scheduled_time);
  const timelineDayLabel = dayLabel(timelineDate);

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

        {holidayError && (
          <div className="agenda-holiday-note">
            <strong>Feriados no disponibles por ahora.</strong>
            <span>{holidayError}</span>
          </div>
        )}

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

      <section className="agenda-dayflow">
        <div className="agenda-dayflow__timeline panel">
          <div className="agenda-sidebar__header">
            <p className="agenda-hero__eyebrow">Dia en bloques</p>
            <h2>{timelineDayLabel}</h2>
          </div>

          {timedTimelineTasks.length === 0 ? (
            <div className="agenda-sidebar__empty">
              <strong>No hay tareas con horario para esta fecha.</strong>
              <p>Si programas inicio y fin, el dia se ordena solo y empieza a mostrarte tambien los huecos libres.</p>
            </div>
          ) : (
            <div className="agenda-timeline">
              {timedTimelineTasks.map((task, index) => {
                const currentEnd = getTaskEndMinutes(task);
                const nextStart = getTaskStartMinutes(timedTimelineTasks[index + 1]);
                const hasGap =
                  currentEnd !== null && nextStart !== null && nextStart > currentEnd;

                return (
                  <div key={`timeline-${timelineDate.toISOString()}-${task.id}`} className="agenda-timeline__group">
                    <article className="agenda-timeline__item">
                      <div className="agenda-timeline__time">{getTaskTimeRangeLabel(task)}</div>
                      <div className="agenda-timeline__content">
                        <strong>{task.title}</strong>
                        <p>{task.description || "Sin descripcion adicional."}</p>
                        <div className="agenda-task__meta">
                          <span>{task.is_important ? "Importante" : "Pendiente menor"}</span>
                          {task.recurrence && <span>Repite {recurrenceLabel(task.recurrence)}</span>}
                          {task.exclude_holidays && <span>Salta feriados AR</span>}
                          {task.scheduled_time_end && (
                            <span>Bloque de {formatDuration(
                              getTaskStartMinutes(task) ?? 0,
                              getTaskEndMinutes(task) ?? getTaskStartMinutes(task) ?? 0
                            )}</span>
                          )}
                        </div>
                      </div>
                    </article>

                    {hasGap && currentEnd !== null && nextStart !== null && (
                      <div className="agenda-gap">
                        <span className="agenda-gap__label">Libre</span>
                        <strong>
                          {formatMinutesAsTime(currentEnd)} a {formatMinutesAsTime(nextStart)}
                        </strong>
                        <small>{formatDuration(currentEnd, nextStart)} disponibles</small>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="agenda-dayflow__pending panel">
          <div className="agenda-sidebar__header">
            <p className="agenda-hero__eyebrow">Pendientes del dia</p>
            <h2>Sin horario fijo</h2>
          </div>

          {floatingTimelineTasks.length === 0 ? (
            <div className="agenda-sidebar__empty">
              <strong>Todo lo de esta fecha ya tiene horario.</strong>
              <p>Buen punto de partida para sostener una rutina mas clara.</p>
            </div>
          ) : (
            <div className="agenda-sidebar__list">
              {floatingTimelineTasks.map((task) => (
                <article key={`floating-${task.id}`} className="agenda-task">
                  <div className="agenda-task__header">
                    <strong>{task.title}</strong>
                    {task.recurrence && <span>Repite {recurrenceLabel(task.recurrence)}</span>}
                  </div>
                  <p>{task.description || "Sin descripcion adicional."}</p>
                  <div className="agenda-task__meta">
                    <span>Sin horario asignado</span>
                    {task.exclude_holidays && <span>Salta feriados AR</span>}
                    <span>{task.is_urgent ? "Urgente" : "Puede esperar un poco"}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
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
                    {getTaskTimeRangeLabel(task) !== "Sin horario" && (
                      <span>{getTaskTimeRangeLabel(task)}</span>
                    )}
                    {task.exclude_holidays && <span>Salta feriados AR</span>}
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
