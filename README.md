# EisenhowerApp

EisenhowerApp es una aplicacion web de productividad basada en la Matriz de Eisenhower. Permite organizar tareas segun urgencia e importancia, visualizar prioridades con claridad y, en modo supervisor, coordinar trabajo con otras personas del staff.

## Overview

La app combina una experiencia personal de gestion de tareas con una capa de supervision para equipos.

- Usuarios individuales pueden crear, editar, completar y revisar tareas dentro de la matriz.
- Supervisores pueden asignar tareas, crear copias para varias personas, monitorear carga del equipo y detectar trabajo sin responsable.
- La experiencia distingue entre modo invitado, cuenta personal y cuenta supervisor.

## Current Features

- Creacion de tareas con titulo, descripcion y prioridad.
- Clasificacion automatica en los 4 cuadrantes de Eisenhower.
- Dashboard visual con una tarjeta activa por cuadrante y navegacion interna.
- Historial de tareas completadas con opcion de reabrir.
- Feedback visual con SweetAlert para confirmaciones, errores y acciones exitosas.
- Estados vacios, loading states y retry states para mejorar UX.
- Filtros por busqueda, cuadrante y orden en dashboard e historial.
- Autenticacion con cuentas y persistencia de tareas en backend.
- Migracion automatica de tareas locales al iniciar sesion o registrarse.
- Diferenciacion clara entre modo invitado y cuenta activa.
- Herramientas de supervisor:
  - asignar tareas a una persona
  - crear tareas para varias personas
  - crear tareas para todo el staff
  - duplicar tareas rapidamente para otras personas o todo el staff
  - filtrar por alcance: todas, propias, equipo, sin asignar
  - ver carga del equipo por persona
  - detectar tareas sin asignar desde una bandeja dedicada

## Roles

### Usuario

- Gestiona sus propias tareas.
- Ve su dashboard personal y su historial.
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

### Backend

- FastAPI
- SQLAlchemy
- SQLite

## Project Structure

```text
EisenhowerApp/
├── frontend/
│   ├── src/
│   └── styles/
├── backend/
│   ├── app/
│   └── ...
└── README.md
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

## Product Direction

La app ya funciona como una herramienta personal de prioridades, pero su diferencial mas fuerte esta creciendo en la capa de supervision y coordinacion.

Proximos pasos naturales:

- acciones mas rapidas de reasignacion desde cards o paneles
- mejor visibilidad de carga operativa por equipo
- vistas mas fuertes para seguimiento de tareas sin asignar
- mejoras de accesibilidad y atajos de uso
- evolucion de persistencia y despliegue productivo

## Author

**Ezequiel Bellino**

- GitHub: https://github.com/ezebellino

Proyecto desarrollado como parte de un portfolio Full Stack, con foco en producto, UX/UI y arquitectura frontend/backend desacoplada.
