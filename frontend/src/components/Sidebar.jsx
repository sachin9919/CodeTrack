import React from "react";
import "./sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <button className="close-btn" onClick={toggleSidebar}>×</button>
            <div className="sidebar-user">
                <p>Test User</p>
            </div>
            <div className="sidebar-search">
                <input type="text" placeholder="Recent search..." />
            </div>
            <div className="sidebar-links">
                <a href="#">Overview</a>
                <a href="#">Repositories</a>
                <a href="#">Projects</a>
            </div>
        </div>
    );
};

export default Sidebar;
