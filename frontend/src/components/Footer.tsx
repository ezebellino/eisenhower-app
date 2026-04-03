import { Link, useLocation } from "react-router-dom";
import "../../styles/Footer.css";

export default function Footer() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  if (isAuthPage) return null;

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <p className="footer__eyebrow">EisenhowerApp</p>
          <h2>Prioridades simples, decisiones mas claras.</h2>
          <p className="footer__description">
            Una experiencia pensada para separar lo urgente de lo importante y sostener el foco
            todos los dias.
          </p>
        </div>

        <nav className="footer__nav" aria-label="Enlaces del footer">
          <div className="footer__group">
            <span>App</span>
            <Link to="/">Inicio</Link>
            <Link to="/tasks">Dashboard</Link>
            <Link to="/tasks/completed">Historial</Link>
            <Link to="/tasks/create">Nueva tarea</Link>
          </div>

          <div className="footer__group">
            <span>Autor</span>
            <a href="https://zeqebellino.com" target="_blank" rel="noopener noreferrer">
              zeqebellino.com
            </a>
            <a href="https://www.linkedin.com/in/ezebellino/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com/ezebellino" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </nav>
      </div>

      <div className="footer__bottom">
        <p>Desarrollado por Zeqe Bellino.</p>
        <p>Construido sobre la Matriz de Eisenhower para organizar trabajo con criterio.</p>
      </div>
    </footer>
  );
}
