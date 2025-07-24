import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ProjectRoutes from "./Routes";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import "./App.css"; // include updated styles

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);

  return (
    <Router>
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isRightSidebarOpen={isRightSidebarOpen}
        toggleRightSidebar={() => setRightSidebarOpen((prev) => !prev)}
      />

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
      <RightSidebar isOpen={isRightSidebarOpen} toggleRightSidebar={() => setRightSidebarOpen(false)} />

      <div className="main-content">
        <ProjectRoutes />
      </div>
    </Router>
  );
}

export default App;
