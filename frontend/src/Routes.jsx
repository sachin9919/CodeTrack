import React, { useEffect, useState } from "react";
import { useRoutes, useNavigate } from "react-router-dom";

import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
// FIX 1: Import the new Settings component
import Settings from "./components/user/Settings";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo";
import RepoDetails from "./components/repo/RepoDetails";
import Commit from "./components/repo/Commit";
import Push from "./components/repo/Push";
import Pull from "./components/repo/Pull";
import Issues from "./components/repo/Issues";

import { useAuth } from "./authContext";
import MainLayout from "./components/layout/MainLayout";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem("userId");

        if (userIdFromStorage && !currentUser) {
            setCurrentUser(userIdFromStorage);
        }

        if (!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname)) {
            navigate("/auth");
        }

        if (userIdFromStorage && window.location.pathname === "/auth") {
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);

    const routes = useRoutes([
        {
            element: (
                <MainLayout
                    isSidebarOpen={sidebarOpen}
                    toggleSidebar={() => setSidebarOpen((prev) => !prev)}
                    isRightSidebarOpen={rightSidebarOpen}
                    toggleRightSidebar={() => setRightSidebarOpen((prev) => !prev)}
                />
            ),
            children: [
                { path: "/", element: <Dashboard /> },
                { path: "/profile", element: <Profile /> },
                // FIX 2: Add the new route for the Settings page
                { path: "/settings", element: <Settings /> },
                { path: "/createRepo", element: <CreateRepo /> },
                { path: "/repo/:id", element: <RepoDetails /> },
                { path: "/repo/:id/commit", element: <Commit /> },
                { path: "/repo/:id/push", element: <Push /> },
                { path: "/repo/:id/pull", element: <Pull /> },
                { path: "/repo/:id/issues", element: <Issues /> },
            ],
        },
        { path: "/auth", element: <Login /> },
        { path: "/signup", element: <Signup /> },
    ]);

    return routes;
};

export default ProjectRoutes;