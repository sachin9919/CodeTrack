import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import "./navbar.css";
import { BellIcon, PlusIcon, MarkGithubIcon } from '@primer/octicons-react';

const Navbar = ({ toggleSidebar, toggleRightSidebar }) => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- Simplified Search State ---
  const [searchQuery, setSearchQuery] = useState("");

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

  // Close profile dropdown if clicking outside
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
  }, []);

  // *** BASIC TEST FUNCTION for onChange ***
  const handleSearchChange = (e) => {
    console.log("--- onChange event ---:", e.target.value);
    setSearchQuery(e.target.value);
  };

  // *** BASIC TEST FUNCTION for onInput ***
  const handleSearchInput = (e) => {
    console.log("--- onInput event ---:", e.target.value);
  };

  // *** RENDER LOG ***
  console.log("Navbar component rendered. Search query state:", searchQuery);


  return (
    <nav className="navbar">
      {/* --- Left Section --- */}
      <div className="nav-left">
        <button
          className="hamburger-icon nav-icon"
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '24px' }}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <Link to="/" className="logo-link" style={{ display: 'flex', alignItems: 'center' }}>
          <MarkGithubIcon size={32} />
        </Link>
      </div>

      {/* --- Middle Section (Search) --- */}
      <div className="nav-search search-container">
        <input
          type="text"
          placeholder="Search or jump to..."
          value={searchQuery}
          // FIX 1: Add id and name attributes
          id="navbar-search"
          name="navbar-search"
          onChange={handleSearchChange}
          onInput={handleSearchInput}
        />
        {/* Removed Search Results Dropdown entirely */}
      </div>

      {/* --- Right Section --- */}
      <div className="nav-right">
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
        <div className="nav-avatar-dropdown profile-menu-container" ref={dropdownRef}>
          <button
            className="profile-icon-button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            style={{ background: 'none', border: 'none', padding: 0, display: 'flex' }}
          >
            <div className="nav-avatar profile-icon-placeholder"></div>
          </button>
          {isDropdownOpen && (
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
        <button
          className="nav-right-icon nav-icon"
          onClick={toggleRightSidebar}
          aria-label="Toggle menu sidebar"
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          <MarkGithubIcon size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;