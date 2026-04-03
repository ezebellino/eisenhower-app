import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./auth/AuthContext";
// import ProtectedRoute from "./auth/ProtectedRoute";

import Navbar from "./components/Navbar";
import "../styles/theme.css";
import PageTransition from "./components/PageTransition";
import Footer from "./components/Footer";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const CompletedTasks = lazy(() => import("./pages/CompletedTasks"));
const Agenda = lazy(() => import("./pages/Agenda"));
const CreateTask = lazy(() => import("./pages/CreateTask"));
const EditTask = lazy(() => import("./pages/EditTask"));

function RouteFallback() {
  return (
    <main className="page container">
      <div className="panel" style={{ padding: "1.25rem" }}>
        <p className="subtle" style={{ margin: 0 }}>
          Cargando vista...
        </p>
      </div>
    </main>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <Navbar />

      <Suspense fallback={<RouteFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Landing />
                </PageTransition>
              }
            />

            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />

            <Route
              path="/register"
              element={
                <PageTransition>
                  <Register />
                </PageTransition>
              }
            />

            <Route
              path="/tasks"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />

            <Route
              path="/tasks/completed"
              element={
                <PageTransition>
                  <CompletedTasks />
                </PageTransition>
              }
            />

            <Route
              path="/tasks/agenda"
              element={
                <PageTransition>
                  <Agenda />
                </PageTransition>
              }
            />

            <Route
              path="/tasks/create"
              element={
                <PageTransition>
                  <CreateTask />
                </PageTransition>
              }
            />

            <Route
              path="/tasks/:id/edit"
              element={
                <PageTransition>
                  <EditTask />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <Footer />
    </AuthProvider>
  );
}
