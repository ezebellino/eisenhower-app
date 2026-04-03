import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./auth/AuthContext";
// import ProtectedRoute from "./auth/ProtectedRoute";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Agenda from "./pages/Agenda";
import Register from "./pages/Register";
import CompletedTasks from "./pages/CompletedTasks";
import CreateTask from "./pages/CreateTask";
import EditTask from "./pages/EditTask";


import "../styles/theme.css";
import PageTransition from "./components/PageTransition";
import Footer from "./components/Footer";

export default function App() {
  const location = useLocation();

    return (
    <AuthProvider>
      <Navbar />

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
      <Footer />
    </AuthProvider>
  );
}
