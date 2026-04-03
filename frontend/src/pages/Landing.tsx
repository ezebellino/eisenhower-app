import { Link } from "react-router-dom";
import "../../styles/Landing.css";

const principles = [
  {
    title: "Decidir primero",
    text: "Separa lo importante de lo que solo hace ruido y mantene foco en lo que mueve resultados.",
  },
  {
    title: "Ejecutar con contexto",
    text: "Cada tarea cae en un cuadrante claro para que el siguiente paso sea evidente.",
  },
  {
    title: "Escalar despues",
    text: "La cuenta abre continuidad, sincronizacion y base para asignacion de tareas dentro del equipo.",
  },
];

const accountBenefits = [
  {
    title: "Guardar y sincronizar",
    text: "Tus tareas dejan de vivir solo en este navegador y pasan a estar disponibles cada vez que vuelvas a entrar.",
  },
  {
    title: "Construir historial real",
    text: "El progreso queda ligado a tu cuenta, con historial y seguimiento mas confiables en el tiempo.",
  },
  {
    title: "Preparar trabajo en equipo",
    text: "La base ya contempla roles y es el camino natural para que un supervisor pueda asignar trabajo al staff.",
  },
];

export default function Landing() {
  return (
    <main className="page landing">
      <section className="landing__hero">
        <div className="landing__hero-copy">
          <p className="landing__eyebrow">EisenhowerApp</p>
          <h1 className="landing__title">Organiza prioridades con la calma de un buen sistema.</h1>
          <p className="landing__lead">
            Una experiencia simple para decidir que hacer ahora, que planificar, que delegar y que
            dejar fuera del radar.
          </p>

          <div className="landing__actions">
            <Link to="/tasks" className="btn-primary">
              Probar en modo invitado
            </Link>
            <Link to="/register" className="btn-secondary">
              Crear cuenta
            </Link>
          </div>

          <div className="landing__trust">
            <div>
              <strong>Modo invitado</strong>
              <span>Rapido para empezar, ideal para probar el metodo.</span>
            </div>
            <div>
              <strong>Con cuenta</strong>
              <span>Sincronizacion, continuidad y base para trabajo colaborativo.</span>
            </div>
            <div>
              <strong>Con enfoque</strong>
              <span>Todo gira alrededor de una sola matriz clara y accionable.</span>
            </div>
          </div>
        </div>

        <div className="landing__hero-visual panel">
          <div className="landing__visual-orbit landing__visual-orbit--top" />
          <div className="landing__visual-orbit landing__visual-orbit--bottom" />

          <div className="landing__matrix-preview">
            <article className="landing__preview-card is-q1">
              <span>Hacer ahora</span>
              <strong>Urgente e importante</strong>
              <p>Resolver lo critico sin perder claridad.</p>
            </article>
            <article className="landing__preview-card is-q2">
              <span>Planificar</span>
              <strong>Importante, no urgente</strong>
              <p>Reservar tiempo para lo que genera progreso real.</p>
            </article>
            <article className="landing__preview-card is-q3">
              <span>Delegar</span>
              <strong>Urgente, no importante</strong>
              <p>Evitar que lo reactivo consuma toda tu atencion.</p>
            </article>
            <article className="landing__preview-card is-q4">
              <span>Descartar</span>
              <strong>Ni urgente ni importante</strong>
              <p>Reducir carga mental y ruido operativo.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--split">
        <div>
          <p className="landing__section-label">Metodo</p>
          <h2>Una matriz clasica, convertida en una rutina digital mas usable.</h2>
        </div>
        <p>
          Dwight D. Eisenhower popularizo la idea de que no todo lo urgente merece prioridad. La
          app toma esa logica y la convierte en una interfaz clara, rapida y lista para usar todos
          los dias.
        </p>
      </section>

      <section className="landing__principles">
        {principles.map((item, index) => (
          <article key={item.title} className="landing__principle">
            <span className="landing__principle-index">0{index + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="landing__value panel">
        <div className="landing__value-copy">
          <p className="landing__section-label">Cuenta</p>
          <h2>La diferencia grande no es usarla. La diferencia grande es sostenerla.</h2>
          <p>
            Sin cuenta podes probar la matriz y trabajar localmente. Con cuenta, la experiencia se
            vuelve un sistema real: persiste, se sincroniza y queda lista para crecer hacia flujos
            de equipo y asignacion por roles.
          </p>
        </div>

        <div className="landing__value-grid">
          {accountBenefits.map((item) => (
            <article key={item.title} className="landing__value-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing__cta panel">
        <div>
          <p className="landing__section-label">Empezar</p>
          <h2>Entra, carga una tarea y deja que la matriz haga el trabajo pesado.</h2>
        </div>

        <div className="landing__cta-actions">
          <Link to="/tasks" className="btn-primary">
            Ir al dashboard
          </Link>
          <Link to="/login" className="btn-ghost">
            Iniciar sesion
          </Link>
        </div>
      </section>
    </main>
  );
}
