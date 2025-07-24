import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";

// Pages
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

// Repo-related pages
import CreateRepo from "./components/repo/CreateRepo";
import RepoDetails from "./components/repo/RepoDetails";
import Commit from "./components/repo/Commit";
import Push from "./components/repo/Push";
import Pull from "./components/repo/Pull";
import Issues from "./components/repo/Issues";

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();

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

    const element = useRoutes([
        { path: "/", element: <Dashboard /> },
        { path: "/auth", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/profile", element: <Profile /> },
        { path: "/createRepo", element: <CreateRepo /> },
        { path: "/repo/:id", element: <RepoDetails /> },
        { path: "/repo/:id/commit", element: <Commit /> },
        { path: "/repo/:id/push", element: <Push /> },
        { path: "/repo/:id/pull", element: <Pull /> },
        { path: "/repo/:id/issues", element: <Issues /> },
    ]);

    return element;
};

export default ProjectRoutes;
