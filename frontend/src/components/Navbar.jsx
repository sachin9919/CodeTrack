import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import "./navbar.css";
// Using placeholder icons - you can replace '☰' and 'GH' with actual icons if needed
import { BellIcon, PlusIcon, MarkGithubIcon } from '@primer/octicons-react'; // Keep using octicons

// Navbar receives props to toggle sidebars
const Navbar = ({ toggleSidebar, toggleRightSidebar }) => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleNewRepoClick = () => {
    navigate("/createRepo");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    setIsDropdownOpen(false);
    navigate("/auth");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // FIX: Reverted structure and class names to closely match your CSS and target screenshot
  return (
    <nav className="navbar">
      {/* --- Left Section --- */}
      <div className="nav-left"> {/* Correct class */}
        <button
          className="hamburger-icon nav-icon" // Correct classes
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '24px' }} // Basic style
        >
          ☰
        </button>
        <Link to="/" className="logo-link" style={{ display: 'flex', alignItems: 'center' }}> {/* Correct class */}
          <MarkGithubIcon size={32} />
        </Link>
      </div>

      {/* --- Middle Section (Search) --- */}
      <div className="nav-search">
        <input type="text" placeholder="Search or jump to..." />
      </div>

      {/* --- Right Section --- */}
      <div className="nav-right"> {/* Correct class */}
        <button className="nav-icon" title="Notifications" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <BellIcon size={18} />
        </button>
        <button
          className="nav-icon plus-icon"
          title="Create new"
          onClick={handleNewRepoClick}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          <PlusIcon size={18} />
        </button>

        {/* Profile Dropdown */}
        {/* Using nav-avatar-dropdown class from your CSS */}
        <div className="nav-avatar-dropdown profile-menu-container" ref={dropdownRef}>
          <button
            className="profile-icon-button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            style={{ background: 'none', border: 'none', padding: 0, display: 'flex' }} // Added display flex for avatar
          >
            {/* Using nav-avatar class from your CSS */}
            <div className="nav-avatar profile-icon-placeholder"></div>
          </button>
          {isDropdownOpen && (
            // Using dropdown class from your CSS
            <div className="dropdown profile-dropdown-menu">
              <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                Your Profile
              </Link>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar Toggle Button */}
        {/* Using nav-right-icon class from your CSS */}
        <button
          className="nav-right-icon nav-icon"
          onClick={toggleRightSidebar}
          aria-label="Toggle menu sidebar"
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          {/* Placeholder icon, you can replace with a better one */}
          <MarkGithubIcon size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;