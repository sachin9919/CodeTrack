// import React, { useEffect, useState } from "react";
// import { useRoutes, useNavigate } from "react-router-dom";

// import Dashboard from "./components/dashboard/Dashboard";
// import Profile from "./components/user/Profile";
// import Settings from "./components/user/Settings";
// import Login from "./components/auth/Login";
// import Signup from "./components/auth/Signup";
// import CreateRepo from "./components/repo/CreateRepo";
// import RepoDetails from "./components/repo/RepoDetails";
// import Commit from "./components/repo/Commit";
// import Push from "./components/repo/Push";
// import Pull from "./components/repo/Pull";
// import Issues from "./components/repo/Issues";

// import { useAuth } from "./authContext";
// import MainLayout from "./components/layout/MainLayout";

// const ProjectRoutes = () => {
//     const { currentUser, setCurrentUser } = useAuth();
//     const navigate = useNavigate();
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

//     useEffect(() => {
//         const userIdFromStorage = localStorage.getItem("userId");

//         if (userIdFromStorage && !currentUser) {
//             setCurrentUser(userIdFromStorage);
//         }

//         // Redirect logic remains the same
//         if (!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname)) {
//             navigate("/auth");
//         }
//         if (userIdFromStorage && (window.location.pathname === "/auth" || window.location.pathname === "/signup")) {
//             // Redirect logged-in users away from auth pages
//             navigate("/");
//         }
//     }, [currentUser, navigate, setCurrentUser]);

//     const routes = useRoutes([
//         {
//             element: (
//                 <MainLayout
//                     isSidebarOpen={sidebarOpen}
//                     toggleSidebar={() => setSidebarOpen((prev) => !prev)}
//                     isRightSidebarOpen={rightSidebarOpen}
//                     toggleRightSidebar={() => setRightSidebarOpen((prev) => !prev)}
//                 />
//             ),
//             children: [
//                 { path: "/", element: <Dashboard /> },
//                 // FIX: Add route WITH ':id' parameter for viewing other profiles
//                 { path: "/profile/:id", element: <Profile /> },
//                 // Keep the original route WITHOUT ':id' for viewing own profile
//                 // (Profile component checks params.id first, then localStorage)
//                 { path: "/profile", element: <Profile /> },
//                 { path: "/settings", element: <Settings /> },
//                 { path: "/createRepo", element: <CreateRepo /> },
//                 { path: "/repo/:id", element: <RepoDetails /> },
//                 { path: "/repo/:id/commit", element: <Commit /> },
//                 { path: "/repo/:id/push", element: <Push /> },
//                 { path: "/repo/:id/pull", element: <Pull /> },
//                 { path: "/repo/:id/issues", element: <Issues /> },
//             ],
//         },
//         { path: "/auth", element: <Login /> },
//         { path: "/signup", element: <Signup /> },
//         // Optional: Add a 404 Not Found route
//         // { path: "*", element: <NotFoundComponent /> }
//     ]);

//     return routes;
// };

// export default ProjectRoutes;

import React, { useEffect, useState } from "react";
import { useRoutes, useNavigate } from "react-router-dom";

import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Settings from "./components/user/Settings";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo";
import RepoDetails from "./components/repo/RepoDetails";
import Commit from "./components/repo/Commit";
import Push from "./components/repo/Push";
import Pull from "./components/repo/Pull";
import Issues from "./components/repo/Issues";
import Explore from "./components/explore/Explore";
// Import placeholder components
import Stars from "./components/stars/Stars"; // Ensure this file exists at src/components/stars/Stars.jsx
import Projects from "./components/projects/Projects"; // Ensure this file exists at src/components/projects/Projects.jsx


import { useAuth } from "./authContext";
import MainLayout from "./components/layout/MainLayout";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem("userId");
        if (userIdFromStorage && !currentUser) { setCurrentUser(userIdFromStorage); }
        // Redirect logic remains the same
        if (!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname)) { navigate("/auth"); }
        if (userIdFromStorage && (window.location.pathname === "/auth" || window.location.pathname === "/signup")) { navigate("/"); }
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
                { path: "/", element: <Dashboard /> }, // Dashboard/Overview/Your Repositories all point here
                { path: "/profile/:id", element: <Profile /> },
                { path: "/profile", element: <Profile /> },
                { path: "/settings", element: <Settings /> },
                { path: "/explore", element: <Explore /> },
                // Add routes for placeholder pages
                { path: "/stars", element: <Stars /> },
                { path: "/projects", element: <Projects /> },
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
        // Consider adding a 404 Not Found route
        // { path: "*", element: <NotFoundComponent /> } // Make sure NotFoundComponent exists
    ]);

    return routes;
};

export default ProjectRoutes;