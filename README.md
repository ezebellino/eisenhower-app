# EisenhowerApp

EisenhowerApp es una aplicacion web de productividad basada en la Matriz de Eisenhower. Permite organizar tareas segun urgencia e importancia, visualizar prioridades con claridad y, en modo supervisor, coordinar trabajo con otras personas del staff.

## Overview

La app combina una experiencia personal de gestion de tareas con una capa de supervision para equipos.

- Usuarios individuales pueden crear, editar, completar y revisar tareas dentro de la matriz.
- Supervisores pueden asignar tareas, crear copias para varias personas, monitorear carga del equipo y detectar trabajo sin responsable.
- La experiencia distingue entre modo invitado, cuenta personal y cuenta supervisor.

## Current Features

- Creacion de tareas con titulo, descripcion y prioridad.
- Programacion de tareas por fecha y horario.
- Recurrencia diaria, semanal y mensual.
- Vista Agenda con enfoque mensual y operativo por dia.
- Recordatorios locales del navegador para tareas del dia.
- Clasificacion automatica en los 4 cuadrantes de Eisenhower.
- Dashboard visual con una tarjeta activa por cuadrante y navegacion interna.
- Historial de tareas completadas con opcion de reabrir.
- Feedback visual con SweetAlert para confirmaciones, errores y acciones exitosas.
- Estados vacios, loading states y retry states para mejorar UX.
- Filtros por busqueda, cuadrante y orden en dashboard e historial.
- Autenticacion con cuentas y persistencia de tareas en backend.
- Migracion automatica de tareas locales al iniciar sesion o registrarse.
- Diferenciacion clara entre modo invitado y cuenta activa.
- Base PWA instalable para uso movil.
- Herramientas de supervisor:
  - asignar tareas a una persona
  - crear tareas para varias personas
  - crear tareas para todo el staff
  - crear tareas sin responsable para delegarlas mas tarde
  - duplicar tareas rapidamente para otras personas o todo el staff
  - filtrar por alcance: todas, propias, equipo, sin asignar
  - ver carga del equipo por persona
  - detectar tareas sin asignar desde una bandeja dedicada

## Roles

### Usuario

- Gestiona sus propias tareas.
- Ve su dashboard personal, su agenda y su historial.
- Trabaja con foco individual.

### Supervisor

- Ve y gestiona tareas del equipo.
- Asigna trabajo a otras personas.
- Supervisa carga, urgencias y tareas sin asignar.
- Duplica tareas para multiples responsables cuando hace falta.

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- React Router
- Framer Motion
- SweetAlert2
- CSS con sistema visual propio
- Base PWA instalable

### Backend

- FastAPI
- SQLAlchemy
- SQLite

## Project Structure

```text
EisenhowerApp/
|-- frontend/
|   |-- public/
|   |-- src/
|   `-- styles/
|-- backend/
|   |-- app/
|   `-- ...
`-- README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/ezebellino/eisenhower-app.git
cd EisenhowerApp
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Run the backend

```bash
cd backend
uvicorn main:app --reload
```

## Environment Files

Hay archivos de ejemplo para preparar entornos locales o de deploy:

- `backend/.env.example`
- `frontend/.env.example`

Variables clave:

- `DATABASE_URL`
- `SECRET_KEY`
- `ALLOWED_ORIGINS`
- `VITE_API_BASE_URL`

## Install on Mobile

La app ya tiene una base PWA para poder instalarse como acceso directo cuando este publicada por `https`.

### iPhone / iPad (Safari)

1. Abre la URL publicada en Safari.
2. Toca el boton `Compartir`.
3. Elige `Agregar a pantalla de inicio`.
4. Confirma el nombre y toca `Agregar`.

### Android (Chrome)

1. Abre la URL publicada en Chrome.
2. Si aparece el aviso de instalacion, toca `Instalar app`.
3. Si no aparece, abre el menu de Chrome.
4. Elige `Instalar aplicacion` o `Agregar a pantalla de inicio`.

### Notes

- Para instalarla, la app debe estar desplegada con `https`.
- En desarrollo local, algunas funciones PWA pueden no comportarse igual.
- Los recordatorios actuales son locales del navegador; no son push notifications nativas todavia.

## Product Direction

La app ya funciona como una herramienta personal de prioridades, pero su diferencial mas fuerte esta creciendo en la capa de supervision, agenda personal y coordinacion.

Proximos pasos naturales:

- reforzar la experiencia PWA e instalacion movil
- sumar mas inteligencia en la agenda diaria
- evolucionar recordatorios locales hacia notificaciones mas robustas
- mejorar accesibilidad, rendimiento y atajos de uso
- consolidar despliegue productivo

## Deploy Direction

Stack sugerido para una primera puesta online:

- `frontend`: Vercel
- `backend`: Render
- `database`: Neon Postgres o Supabase Postgres

Notas:

- el backend ya puede correr con `SQLite` en local y `Postgres` en produccion
- CORS se resuelve con `ALLOWED_ORIGINS`
- el frontend apunta al backend publicado usando `VITE_API_BASE_URL`

## Author

**Ezequiel Bellino**

- GitHub: https://github.com/ezebellino

Proyecto desarrollado como parte de un portfolio Full Stack, con foco en producto, UX/UI y arquitectura frontend/backend desacoplada.
