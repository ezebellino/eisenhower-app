import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../services/authService";
import { useAuth } from "../auth/AuthContext";
import { showErrorAlert, showInfoAlert, showSuccessToast } from "../services/alertService";
import { setSessionNotice } from "../services/sessionNoticeService";
import { migrateLocalTasksToAccount } from "../services/taskMigrationService";
import "../../styles/Register.css";

const accountBenefits = [
  "Persistencia real de tareas e historial.",
  "Acceso desde cualquier sesion sin perder contexto.",
  "Camino natural para equipo, roles y asignacion de trabajo.",
];

export default function Register() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const u = username.trim();
    const em = email.trim();

    if (!u) return setErr("Ingresa un usuario.");
    if (!em) return setErr("Ingresa un email.");
    if (!password) return setErr("Ingresa una contrasena.");
    if (password !== confirm) return setErr("Las contrasenas no coinciden.");

    setLoading(true);
    try {
      await register({ username: u, email: em, password });
      await login({ username: u, password });
      const migratedCount = await migrateLocalTasksToAccount();
      await refreshMe();

      if (migratedCount > 0) {
        await showInfoAlert(
          "Cuenta lista",
          `Tu cuenta se creo y se migraron ${migratedCount} tarea${migratedCount === 1 ? "" : "s"} local${migratedCount === 1 ? "" : "es"}.`
        );
        setSessionNotice(
          `Cuenta creada. Ya puedes trabajar con sincronizacion y se migraron ${migratedCount} tarea${migratedCount === 1 ? "" : "s"} local${migratedCount === 1 ? "" : "es"}.`
        );
      } else {
        await showSuccessToast("Cuenta creada correctamente");
        setSessionNotice("Cuenta creada. A partir de ahora tu progreso queda guardado y sincronizado.");
      }

      navigate("/tasks");
    } catch (e: any) {
      const message = e?.message ?? "No se pudo crear la cuenta.";
      setErr(message);
      await showErrorAlert("No pudimos crear la cuenta", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-layout">
      <section className="auth-aside panel">
        <p className="auth-aside__eyebrow">Cuenta EisenhowerApp</p>
        <h1 className="auth-title">La cuenta es donde la matriz se vuelve sistema.</h1>
        <p className="auth-subtitle">
          Registrarte no es solo guardar tareas. Es preparar una base real para continuidad,
          seguimiento y futuros flujos de asignacion dentro del equipo.
        </p>

        <div className="auth-benefits">
          {accountBenefits.map((benefit) => (
            <article key={benefit} className="auth-benefit">
              <span />
              <p>{benefit}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="auth-card panel">
        <div className="auth-header">
          <h2 className="auth-form-title">Crear cuenta</h2>
          <p className="auth-form-subtitle">
            Abre tu espacio personal para empezar a trabajar con continuidad.
          </p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label">Usuario</label>
          <input
            className="form-input auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="tu_usuario"
          />

          <label className="auth-label auth-label--spaced">Email</label>
          <input
            className="form-input auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="tu@email.com"
            inputMode="email"
          />

          <label className="auth-label auth-label--spaced">Contrasena</label>
          <input
            className="form-input auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <label className="auth-label auth-label--spaced">Confirmar contrasena</label>
          <input
            className="form-input auth-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          {err && <p className="auth-error">{err}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="auth-form-footer">
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/login")}>
              Ya tengo cuenta
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/tasks")}>
              Seguir como invitado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
