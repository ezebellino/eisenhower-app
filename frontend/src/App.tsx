import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CompletedTasks from "./pages/CompletedTasks";
import CreateTask from "./pages/CreateTask";
import "../styles/App.css";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/completed" element={<CompletedTasks />} />
          <Route path="/create" element={<CreateTask />} />
        </Routes>
      </div>
    </>
  );
}
