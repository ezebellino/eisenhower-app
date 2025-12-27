import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskById, updateTask } from "../services/taskServices";
import type { Task } from "../types/tasks";


export default function EditTask() {
  const { id } = useParams();
  const taskId = Number(id);
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!Number.isFinite(taskId) || taskId <= 0) {
          setErr("ID inválido");
          return;
        }

        const found = await getTaskById(taskId);
        setTask(found);
        setTitle(found.title);
        setDescription(found.description ?? "");
        setIsUrgent(found.is_urgent);
        setIsImportant(found.is_important);
      } catch (e: any) {
        setErr(e?.message ?? "Error cargando tarea");
      }
    })();
  }, [taskId]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        is_urgent: isUrgent,
        is_important: isImportant,
      });

      navigate("/");
    } catch (e: any) {
      setErr(e?.message ?? "Error guardando cambios");
    }
  };

  if (err) {
    return (
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 className="page-title">Editar tarea</h1>
        <p className="error">{err}</p>
      </div>
    );
  }

  if (!task) {
    return <div className="container" style={{ padding: 24 }}>Cargando...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h1 className="page-title">Editar tarea</h1>

      <form onSubmit={onSave} className="panel" style={{ padding: 16 }}>
        <label>Título</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label style={{ marginTop: 10 }}>Descripción</label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label>
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
            />
            Urgente
          </label>

          <label>
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
            />
            Importante
          </label>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate("/")}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
