import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { showErrorAlert, showInfoAlert, showSuccessToast } from "../services/alertService";
import { login } from "../services/authService";
import { setSessionNotice } from "../services/sessionNoticeService";
import { migrateLocalTasksToAccount } from "../services/taskMigrationService";
import "../../styles/Login.css";

const accountBenefits = [
  "Tus tareas quedan guardadas y sincronizadas entre sesiones.",
  "El historial y el progreso se vuelven persistentes.",
  "Es la base para futuros flujos de supervisor y asignacion al staff.",
];

export default function Login() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await login({ username, password });
      const migratedCount = await migrateLocalTasksToAccount();
      await refreshMe();

      if (migratedCount > 0) {
        await showInfoAlert(
          "Migracion completada",
          `Se copiaron ${migratedCount} tarea${migratedCount === 1 ? "" : "s"} local${migratedCount === 1 ? "" : "es"} a tu cuenta.`
        );
        setSessionNotice(
          `Sesion iniciada. Se migraron ${migratedCount} tarea${migratedCount === 1 ? "" : "s"} local${migratedCount === 1 ? "" : "es"} a tu cuenta.`
        );
      } else {
        await showSuccessToast("Sesion iniciada");
        setSessionNotice("Sesion iniciada. Ahora tus tareas quedan guardadas y sincronizadas en tu cuenta.");
      }

      navigate("/tasks");
    } catch (e: any) {
      const message = e?.message ?? "Error de login";
      setErr(message);
      await showErrorAlert("No pudimos iniciar sesion", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-layout">
      <section className="auth-aside panel">
        <p className="auth-aside__eyebrow">Cuenta EisenhowerApp</p>
        <h1 className="auth-title">Entrar tambien es darle continuidad al sistema.</h1>
        <p className="auth-subtitle">
          La cuenta convierte la matriz en una herramienta real de seguimiento: persistencia,
          historial, sincronizacion y base para trabajo por roles.
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
          <h2 className="auth-form-title">Iniciar sesion</h2>
          <p className="auth-form-subtitle">
            Entra con tu usuario para recuperar tu espacio de trabajo.
          </p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <label className="auth-label">Usuario</label>
          <input
            className="form-input auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="tu_usuario"
          />

          <label className="auth-label auth-label--spaced">Contrasena</label>
          <input
            className="form-input auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />

          {err && <p className="auth-error">{err}</p>}

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <div className="auth-form-footer">
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/")}>
              Volver al inicio
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/register")}>
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
