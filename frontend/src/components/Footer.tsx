import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/Footer.css";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20Zm6.92 9h-3.02a15.2 15.2 0 0 0-1.57-5.06A8.02 8.02 0 0 1 18.92 11ZM12 4.05c.92 1.12 1.96 3.34 2.33 6.95H9.67C10.04 7.39 11.08 5.17 12 4.05ZM4.08 13h3.02a15.2 15.2 0 0 0 1.57 5.06A8.02 8.02 0 0 1 4.08 13Zm3.02-2H4.08a8.02 8.02 0 0 1 4.59-5.06A15.2 15.2 0 0 0 7.1 11Zm4.9 8.95c-.92-1.12-1.96-3.34-2.33-6.95h4.66c-.37 3.61-1.41 5.83-2.33 6.95ZM13 19.06A15.2 15.2 0 0 0 14.57 13h3.02A8.02 8.02 0 0 1 13 19.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.94 8.5H3.56V20h3.38V8.5Zm.22-3.56A1.97 1.97 0 1 0 3.22 5a1.97 1.97 0 0 0 3.94-.06ZM20 12.7c0-3.47-1.85-5.08-4.33-5.08a3.75 3.75 0 0 0-3.38 1.86V8.5H8.9V20h3.38v-6.06c0-1.6.3-3.15 2.28-3.15c1.95 0 1.98 1.82 1.98 3.25V20H20v-7.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.88c-2.78.61-3.36-1.18-3.36-1.18c-.46-1.15-1.11-1.46-1.11-1.46c-.9-.62.07-.61.07-.61c1 .07 1.52 1.01 1.52 1.01c.88 1.49 2.32 1.06 2.89.81c.09-.63.35-1.06.64-1.31c-2.22-.25-4.56-1.09-4.56-4.87c0-1.08.39-1.97 1.03-2.66c-.1-.25-.45-1.27.1-2.65c0 0 .84-.27 2.75 1.02a9.7 9.7 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02c.56 1.38.21 2.4.1 2.65c.64.69 1.03 1.58 1.03 2.66c0 3.79-2.35 4.61-4.58 4.85c.36.31.68.91.68 1.84v2.72c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Footer() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const [installPrompt, setInstallPrompt] = useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  } | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(
        event as Event & {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
        }
      );
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (isAuthPage) return null;

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

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
          {installPrompt && (
            <button type="button" className="btn-ghost footer__install" onClick={handleInstallClick}>
              Instalar app
            </button>
          )}
        </div>

        <nav className="footer__nav" aria-label="Enlaces del footer">
          <div className="footer__group">
            <span>App</span>
            <Link to="/">Inicio</Link>
            <Link to="/tasks">Dashboard</Link>
            <Link to="/tasks/agenda">Agenda</Link>
            <Link to="/tasks/completed">Historial</Link>
          </div>

          <div className="footer__group">
            <span>Autor</span>
            <a href="https://zeqebellino.com" target="_blank" rel="noopener noreferrer" className="footer__social">
              <span className="footer__social-icon">
                <GlobeIcon />
              </span>
              <span>zeqebellino.com</span>
            </a>
            <a
              href="https://www.linkedin.com/in/ezebellino/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social"
            >
              <span className="footer__social-icon">
                <LinkedInIcon />
              </span>
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/ezebellino"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social"
            >
              <span className="footer__social-icon">
                <GitHubIcon />
              </span>
              <span>GitHub</span>
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
