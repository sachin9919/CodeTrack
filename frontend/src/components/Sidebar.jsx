import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const sidebarRef = useRef();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                toggleSidebar();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, toggleSidebar]);

    // Swipe left to close
    useEffect(() => {
        let startX = 0;
        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
        };
        const handleTouchEnd = (e) => {
            const endX = e.changedTouches[0].clientX;
            if (startX - endX > 50) toggleSidebar(); // Swipe left to close
        };

        const el = sidebarRef.current;
        if (el) {
            el.addEventListener("touchstart", handleTouchStart);
            el.addEventListener("touchend", handleTouchEnd);
        }

        return () => {
            if (el) {
                el.removeEventListener("touchstart", handleTouchStart);
                el.removeEventListener("touchend", handleTouchEnd);
            }
        };
    }, [toggleSidebar]);

    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}
            <div className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
                <button className="close-btn" onClick={toggleSidebar} aria-label="Close Sidebar">
                    ×
                </button>

                <div className="sidebar-user">
                    <p>Test User</p>
                </div>

                <div className="sidebar-search">
                    <input type="text" placeholder="Recent search..." />
                </div>

                <div className="sidebar-links">
                    <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Overview</NavLink>
                    <NavLink to="/repos" className={({ isActive }) => (isActive ? "active" : "")}>Repositories</NavLink>
                    <NavLink to="/projects" className={({ isActive }) => (isActive ? "active" : "")}>Projects</NavLink>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
