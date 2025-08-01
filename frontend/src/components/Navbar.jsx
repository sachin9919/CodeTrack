import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import { FaBell, FaPlus, FaGithub, FaBars } from "react-icons/fa";

const Navbar = ({ toggleSidebar, toggleRightSidebar }) => {
  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="nav-left">
        <FaBars className="hamburger-icon" onClick={toggleSidebar} />
        <Link to="/" className="logo-link">
          <FaGithub className="github-logo" />
        </Link>
      </div>

      {/* Center - Search */}
      <div className="nav-search">
        <input type="text" placeholder="Search or jump to..." />
      </div>

      {/* Right Section */}
      <div className="nav-right">
        <FaBell className="nav-icon" title="Notifications" />

        <div className="nav-icon-dropdown">
          <FaPlus title="Create new..." />
          <div className="dropdown">
            <Link to="/createRepo">New Repository</Link>
          </div>
        </div>

        <div className="nav-avatar-dropdown">
          <img
            src="https://avatars.githubusercontent.com/u/9919?s=40&v=4"
            alt="avatar"
            className="nav-avatar"
          />
          <div className="dropdown">
            <Link to="/profile">Your Profile</Link>
            <a href="#">Settings</a>
            <a href="#">Logout</a>
          </div>
        </div>

        <FaGithub
          className="nav-right-icon"
          title="Open GitHub Menu"
          onClick={toggleRightSidebar}
        />
      </div>
    </nav>
  );
};

export default Navbar;
