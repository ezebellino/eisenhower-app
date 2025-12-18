import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CompletedTasks from "./pages/CompletedTasks";
import CreateTask from "./pages/CreateTask";

import "../styles/theme.css";
import PageTransition from "./components/PageTransition";

export default function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />

      <div className="route-stage">
        <AnimatePresence mode="sync" initial={false}>
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/completed" element={<CompletedTasks />} />
              <Route path="/create" element={<CreateTask />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </div>
    </>
  );
}
