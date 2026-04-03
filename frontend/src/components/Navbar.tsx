import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "../../styles/Navbar.css";

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="navbar__brand-icon">
      <defs>
        <linearGradient id="brand-gradient" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#9dc7ff" />
          <stop offset="55%" stopColor="#ffd089" />
          <stop offset="100%" stopColor="#5be2b0" />
        </linearGradient>
      </defs>
      <rect x="7" y="7" width="50" height="50" rx="18" fill="rgba(7, 17, 31, 0.7)" />
      <path
        d="M20 18h24v6H27v8h15v6H27v8h17v6H20z"
        fill="url(#brand-gradient)"
      />
      <circle cx="48" cy="18" r="4" fill="#9dc7ff" />
      <circle cx="48" cy="32" r="4" fill="#ffd089" />
      <circle cx="48" cy="46" r="4" fill="#5be2b0" />
    </svg>
  );
}

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const onLogout = () => {
    logout();
    navigate("/");
  };

  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  if (isAuthPage) return null;

  const modeLabel = user ? "Cuenta activa" : "Modo invitado";
  const modeHelper = user
    ? user.role === "supervisor"
      ? `Supervisor: ${user.username}`
      : `Sincronizado como ${user.username}`
    : "Tus tareas viven solo en este navegador";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand" aria-label="Ir al inicio de EisenhowerApp">
            <span className="navbar__brand-mark">
              <BrandMark />
            </span>
            <span className="navbar__brand-copy">
              <strong>EisenhowerApp</strong>
              <small>Prioridad clara para cada tarea</small>
            </span>
          </Link>

          <nav className="navbar__links navbar__links--desktop" aria-label="Navegacion principal">
            <NavLink
              to="/tasks"
              className={({ isActive }) => `navbar__link ${isActive ? "is-active" : ""}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/tasks/completed"
              className={({ isActive }) => `navbar__link ${isActive ? "is-active" : ""}`}
            >
              Historial
            </NavLink>
            <NavLink
              to="/tasks/agenda"
              className={({ isActive }) => `navbar__link ${isActive ? "is-active" : ""}`}
            >
              Agenda
            </NavLink>
          </nav>
        </div>

        <div className="navbar__right navbar__right--desktop">
          {!isLoading && (
            <div className={`navbar__status ${user?.role === "supervisor" ? "is-supervisor" : ""}`}>
              <span className={`navbar__status-dot ${user ? "is-online" : ""}`} />
              <span className="navbar__status-copy">
                <strong>{modeLabel}</strong>
                <small>{modeHelper}</small>
              </span>
            </div>
          )}

          <Link to="/tasks/create" className="btn-primary navbar__cta">
            Nueva tarea
          </Link>

          {!isLoading &&
            (user ? (
              <button type="button" className="btn-ghost" onClick={onLogout}>
                Salir
              </button>
            ) : (
              <Link to="/register" className="btn-ghost">
                Crear cuenta
              </Link>
            ))}
        </div>

        <button
          type="button"
          className={`burger ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`navbar__mobile ${menuOpen ? "is-open" : ""}`}>
        <div className="navbar__mobile-content">
          {!isLoading && (
            <div
              className={`navbar__status navbar__status--mobile ${user?.role === "supervisor" ? "is-supervisor" : ""}`}
            >
              <span className={`navbar__status-dot ${user ? "is-online" : ""}`} />
              <span className="navbar__status-copy">
                <strong>{modeLabel}</strong>
                <small>{modeHelper}</small>
              </span>
            </div>
          )}

          <nav className="navbar__mobile-links" aria-label="Menu mobile">
            <NavLink
              to="/tasks"
              className={({ isActive }) => `navbar__mobile-link ${isActive ? "is-active" : ""}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/tasks/completed"
              className={({ isActive }) => `navbar__mobile-link ${isActive ? "is-active" : ""}`}
            >
              Historial
            </NavLink>
            <NavLink
              to="/tasks/agenda"
              className={({ isActive }) => `navbar__mobile-link ${isActive ? "is-active" : ""}`}
            >
              Agenda
            </NavLink>
          </nav>

          <div className="navbar__mobile-actions">
            <Link to="/tasks/create" className="btn-primary navbar__mobile-cta">
              Nueva tarea
            </Link>
            {!isLoading &&
              (user ? (
                <button
                  type="button"
                  className="btn-ghost navbar__mobile-cta"
                  onClick={onLogout}
                >
                  Salir
                </button>
              ) : (
                <Link to="/register" className="btn-ghost navbar__mobile-cta">
                  Crear cuenta
                </Link>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
}
