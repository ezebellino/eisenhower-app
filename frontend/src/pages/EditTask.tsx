import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { showErrorAlert, showSuccessToast } from "../services/alertService";
import { getTaskById, updateTask } from "../services/taskServices";
import { listUsers, type UserSummary } from "../services/userService";
import type { Task } from "../types/tasks";
import "../../styles/formAnimation.css";
import "../../styles/formStyle.css";

function isEndTimeAfterStart(startTime: string | null | undefined, endTime: string | null | undefined) {
  if (!startTime || !endTime) return true;
  return endTime > startTime;
}

export default function EditTask() {
  const { id } = useParams();
  const taskId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";

  const [task, setTask] = useState<Task | null>(null);
  const [staff, setStaff] = useState<UserSummary[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [scheduledTimeEnd, setScheduledTimeEnd] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<Task["recurrence"]>(null);
  const [excludeHolidays, setExcludeHolidays] = useState(false);
  const [assignedToId, setAssignedToId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupervisor) return;

    (async () => {
      try {
        setLoadingStaff(true);
        const users = await listUsers();
        setStaff(users.filter((member) => member.is_active));
      } catch (err) {
        console.error("No pudimos cargar el staff.", err);
      } finally {
        setLoadingStaff(false);
      }
    })();
  }, [isSupervisor]);

  useEffect(() => {
    (async () => {
      try {
        if (!Number.isFinite(taskId) || taskId <= 0) {
          setError("No pudimos identificar la tarea.");
          return;
        }

        const found = await getTaskById(taskId);
        setTask(found);
        setTitle(found.title);
        setDescription(found.description ?? "");
        setIsUrgent(found.is_urgent);
        setIsImportant(found.is_important);
        setScheduledFor(found.scheduled_for ?? null);
        setScheduledTime(found.scheduled_time ?? null);
        setScheduledTimeEnd(found.scheduled_time_end ?? null);
        setRecurrence(found.recurrence ?? null);
        setExcludeHolidays(found.exclude_holidays ?? false);
        setAssignedToId(found.assigned_to_id ?? null);
      } catch (err: any) {
        setError(err?.message ?? "Error cargando la tarea.");
      }
    })();
  }, [taskId]);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (recurrence && !scheduledFor) {
      setError("Selecciona una fecha base antes de repetir esta tarea.");
      return;
    }

    if (excludeHolidays && recurrence !== "weekdays") {
      setError("La exclusion de feriados hoy funciona con la recurrencia de lunes a viernes.");
      return;
    }

    if (scheduledTime && !scheduledFor) {
      setError("Selecciona una fecha antes de asignar un horario.");
      return;
    }

    if (scheduledTimeEnd && !scheduledTime) {
      setError("Primero define la hora de inicio.");
      return;
    }

    if (!isEndTimeAfterStart(scheduledTime, scheduledTimeEnd)) {
      setError("La hora de cierre debe quedar despues del inicio.");
      return;
    }

    setSaving(true);

    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        is_urgent: isUrgent,
        is_important: isImportant,
        scheduled_for: scheduledFor ?? null,
        scheduled_time: scheduledTime ?? null,
        scheduled_time_end: scheduledTimeEnd ?? null,
        recurrence: recurrence ?? null,
        exclude_holidays: excludeHolidays,
        assigned_to_id: isSupervisor ? assignedToId : undefined,
      });

      await showSuccessToast("Tarea actualizada");
      navigate("/tasks");
    } catch (err: any) {
      const message = err?.message ?? "Error guardando cambios.";
      setError(message);
      await showErrorAlert("No pudimos guardar los cambios", message);
    } finally {
      setSaving(false);
    }
  };

  if (error && !task) {
    return (
      <div className="page container">
        <div className="form-page">
          <div className="form-card">
            <h2>Editar tarea</h2>
            <p className="error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="page container">
        <div className="form-page">
          <div className="form-card">
            <h2>Cargando tarea...</h2>
            <p className="subtle">Estamos preparando la informacion para que puedas editarla.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="form-page">
        <div className="form-card">
          <h2>Editar tarea</h2>
          <p className="subtle form-subtitle">
            {isSupervisor
              ? "Actualiza el contexto, revisa la prioridad o mueve la tarea a otra persona del equipo."
              : "Ajusta el contenido o la prioridad para mantener la tarea en el cuadrante correcto."}
          </p>

          <form onSubmit={onSave} id="task-form">
            <div className="form-field">
              <label>Titulo</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resume la accion principal"
              />
            </div>

            <div className="form-field">
              <label>Descripcion</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Aclara contexto, entregable o siguiente paso"
              />
            </div>

            <div className="form-grid form-grid--schedule">
              <div className="form-field">
                <label>Programar para</label>
                <input
                  type="date"
                  className="form-input"
                  value={scheduledFor ?? ""}
                  onChange={(e) => setScheduledFor(e.target.value || null)}
                />
                <p className="subtle form-hint">
                  Si tiene fecha, la tarea tambien se ve dentro de la agenda personal.
                </p>
              </div>

              <div className="form-field">
                <label>Inicio</label>
                <input
                  type="time"
                  className="form-input"
                  value={scheduledTime ?? ""}
                  onChange={(e) => {
                    const value = e.target.value || null;
                    setScheduledTime(value);
                    if (scheduledTimeEnd && value && scheduledTimeEnd <= value) {
                      setScheduledTimeEnd(null);
                    }
                  }}
                />
                <p className="subtle form-hint">
                  Marca desde que hora empieza este bloque dentro del dia.
                </p>
              </div>

              <div className="form-field">
                <label>Fin</label>
                <input
                  type="time"
                  className="form-input"
                  value={scheduledTimeEnd ?? ""}
                  onChange={(e) => setScheduledTimeEnd(e.target.value || null)}
                />
                <p className="subtle form-hint">
                  Si lo completas, la agenda puede mostrar el tramo ocupado y los huecos libres.
                </p>
              </div>

              <div className="form-field">
                <label>Repetir</label>
                <select
                  className="form-input"
                  value={recurrence ?? ""}
                  onChange={(e) =>
                    {
                      const nextRecurrence = (e.target.value as Task["recurrence"] | "") || null;
                      setRecurrence(nextRecurrence);
                      if (nextRecurrence !== "weekdays") {
                        setExcludeHolidays(false);
                      }
                    }
                  }
                >
                  <option value="">No repetir</option>
                  <option value="daily">Todos los dias</option>
                  <option value="weekly">Cada semana</option>
                  <option value="monthly">Cada mes</option>
                  <option value="weekdays">Lunes a viernes</option>
                </select>
              </div>
            </div>

            {recurrence === "weekdays" && (
              <div className="form-field">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={excludeHolidays}
                    onChange={(e) => setExcludeHolidays(e.target.checked)}
                  />
                  <span>Excluir feriados de Argentina</span>
                </label>
                <p className="subtle form-hint">
                  La agenda va a omitir automaticamente los feriados nacionales al proyectar esta rutina.
                </p>
              </div>
            )}

            {isSupervisor && (
              <div className="form-field">
                <label>Asignar a</label>
                <p className="subtle form-hint">
                  Cambia el responsable cuando haga falta redistribuir carga o destrabar avance.
                </p>
                <select
                  className="form-input"
                  value={assignedToId ?? ""}
                  onChange={(e) => setAssignedToId(e.target.value ? Number(e.target.value) : null)}
                  disabled={loadingStaff}
                >
                  <option value="">{loadingStaff ? "Cargando staff..." : "Seleccionar persona"}</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.username} {member.role === "supervisor" ? "(Supervisor)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-checks">
              <label className="check">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                />
                <span>Urgente</span>
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                />
                <span>Importante</span>
              </label>
            </div>

            <p className="subtle form-hint fade-in">
              {isUrgent && isImportant
                ? "Esta tarea esta en Q1: urgente e importante."
                : isImportant
                  ? "Esta tarea esta en Q2: importante, pero todavia sin urgencia."
                  : isUrgent
                    ? "Esta tarea esta en Q3: urgente, pero con menor impacto estrategico."
                    : "Esta tarea esta en Q4: baja prioridad por ahora."}
            </p>

            {error && <p className="error">{error}</p>}

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => navigate("/tasks")}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
