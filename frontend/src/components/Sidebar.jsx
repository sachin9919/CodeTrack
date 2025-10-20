import React, { useState, useEffect, useRef } from "react"; // Import useState
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const sidebarRef = useRef();
    // FIX 1: Add state for the search query
    const [searchQuery, setSearchQuery] = useState("");

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

    // FIX 2: Define the sidebar links as an array
    const sidebarLinks = [
        { path: "/", name: "Overview", end: true },
        { path: "/repos", name: "Repositories", end: false },
        { path: "/projects", name: "Projects", end: false },
        // Add more links here if needed
    ];

    // FIX 3: Filter the links based on the search query
    const filteredLinks = sidebarLinks.filter(link =>
        link.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}
            <div className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
                <button className="close-btn" onClick={toggleSidebar} aria-label="Close Sidebar">
                    ×
                </button>

                <div className="sidebar-user">
                    {/* You might want to fetch and display the actual username here later */}
                    <p>Test User</p>
                </div>

                <div className="sidebar-search">
                    {/* FIX 4: Connect input to state */}
                    <input
                        type="text"
                        placeholder="Filter items..." // Changed placeholder
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="sidebar-links">
                    {/* FIX 5: Map over the filtered links */}
                    {filteredLinks.length > 0 ? (
                        filteredLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end} // Use end prop for exact match on "/"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={toggleSidebar} // Close sidebar on link click
                            >
                                {link.name}
                            </NavLink>
                        ))
                    ) : (
                        <p className="no-results">No items match.</p> // Message if no links match search
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;