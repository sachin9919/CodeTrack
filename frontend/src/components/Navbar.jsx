import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import "./navbar.css"; // This will now use the main navbar.css
import { BellIcon, PlusIcon, MarkGithubIcon } from '@primer/octicons-react';

const Navbar = ({ toggleSidebar, toggleRightSidebar }) => {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth(); // We get setCurrentUser from context
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatarUrl") || '');

    // Listen for avatar updates
    useEffect(() => {
        const handleAvatarUpdate = () => {
            console.log("Navbar: Avatar update event received or component mounted!");
            setAvatarUrl(localStorage.getItem("avatarUrl") || '');
        };

        // Listen for the custom event fired from Settings.jsx or Profile.jsx
        window.addEventListener('avatarUpdated', handleAvatarUpdate);

        // Run the function once ON LOAD to get the avatar
        handleAvatarUpdate();

        // Cleanup listener
        return () => {
            window.removeEventListener('avatarUpdated', handleAvatarUpdate);
        };
    }, []); // Empty dependency array, runs once on mount


    const handleNewRepoClick = () => { navigate("/createRepo"); };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("avatarUrl"); // Clear avatarUrl on logout

        // Call setCurrentUser from context to update global state
        if (setCurrentUser) setCurrentUser(null);

        setAvatarUrl(''); // Clear local state
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
    }, []);

    // Test functions for search
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    const handleSearchInput = (e) => {
        console.log("--- onInput event ---:", e.target.value);
    };

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
                    id="navbar-search"
                    name="navbar-search"
                    onChange={handleSearchChange}
                    onInput={handleSearchInput}
                />
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
                        {/* THIS IS THE FIX: Display user's avatar or the placeholder */}
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="nav-avatar profile-icon-placeholder" />
                        ) : (
                            <div className="nav-avatar profile-icon-placeholder"></div>
                        )}
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