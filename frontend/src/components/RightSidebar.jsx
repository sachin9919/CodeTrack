import React from "react";
import "./rightSidebar.css";

const RightSidebar = ({ isOpen, toggleRightSidebar }) => {
    return (
        <div className={`right-sidebar ${isOpen ? "open" : ""}`}>
            <button className="close-btn" onClick={toggleRightSidebar}>×</button>
            <h3>GitHub Menu</h3>
            <ul>
                <li><a href="#">Dashboard</a></li>
                <li><a href="#">Your Repositories</a></li>
                <li><a href="#">Stars</a></li>
                <li><a href="#">Explore</a></li>
                <li><a href="#">Settings</a></li>
            </ul>
        </div>
    );
};

export default RightSidebar;
