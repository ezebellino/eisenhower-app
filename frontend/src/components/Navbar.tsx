import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "../../styles/Navbar.css";

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

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand" aria-label="Ir al inicio de EisenhowerApp">
            <span className="navbar__brand-mark">E</span>
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
          </nav>
        </div>

        <div className="navbar__right navbar__right--desktop">
          {!isLoading && (
            <div className="navbar__status">
              <span className={`navbar__status-dot ${user ? "is-online" : ""}`} />
              {user ? `Sesion de ${user.username}` : "Modo personal"}
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
              <Link to="/login" className="btn-ghost">
                Iniciar sesion
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
            <div className="navbar__status navbar__status--mobile">
              <span className={`navbar__status-dot ${user ? "is-online" : ""}`} />
              {user ? `Sesion de ${user.username}` : "Modo personal"}
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
                <Link to="/login" className="btn-ghost navbar__mobile-cta">
                  Iniciar sesion
                </Link>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
}
