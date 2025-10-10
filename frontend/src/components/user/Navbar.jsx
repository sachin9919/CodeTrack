import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleNewRepoClick = () => {
    navigate("/createRepo");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-left">
        <div className="logo-container">
          <img
            src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
            alt="GitHub Logo"
          />
          <h3>GitHub</h3>
        </div>
      </Link>

      <div className="navbar-right">
        <button
          className="plus-icon"
          title="Click to create new repo"
          onClick={handleNewRepoClick}
        >
          +
        </button>

        <Link to="/profile">
          <p>Profile</p>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
