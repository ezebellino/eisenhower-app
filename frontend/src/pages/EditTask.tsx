import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { showErrorAlert, showSuccessToast } from "../services/alertService";
import { getTaskById, updateTask } from "../services/taskServices";
import { listUsers, type UserSummary } from "../services/userService";
import type { Task } from "../types/tasks";
import "../../styles/formAnimation.css";
import "../../styles/formStyle.css";

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
        setAssignedToId(found.assigned_to_id ?? null);
      } catch (err: any) {
        setError(err?.message ?? "Error cargando la tarea.");
      }
    })();
  }, [taskId]);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        is_urgent: isUrgent,
        is_important: isImportant,
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
              ? "Ajusta la prioridad o reasigna esta tarea dentro del equipo."
              : "Ajusta el contenido o cambia su prioridad para reubicarla en la matriz."}
          </p>

          <form onSubmit={onSave} id="task-form">
            <div className="form-field">
              <label>Titulo</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Descripcion</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {isSupervisor && (
              <div className="form-field">
                <label>Asignar a</label>
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
