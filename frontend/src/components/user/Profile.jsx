import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import axios from "axios";
import "./profile.css";
// Removed Navbar import as it's part of MainLayout
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  // FIX 1: Initialize userDetails state with expected structure
  const [userDetails, setUserDetails] = useState({
    username: '',
    followingCount: 0,
    // followerCount: 0, // Add if you implement follower count in backend
    repositories: []
  });
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true); // Start loading
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/user/userProfile/${userId}`
          );
          console.log("Fetched user details:", response.data);
          setUserDetails(response.data); // Set the full data object
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
          // Handle error state if needed
        } finally {
          setIsLoading(false); // Stop loading
        }
      } else {
        setIsLoading(false); // Stop loading if no userId
      }
    };
    fetchUserDetails();
  }, []); // Empty dependency array means this runs once on mount

  // Logout function (moved outside return for clarity)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    // Use navigate instead of window.location for better SPA behavior
    navigate("/auth");
  };

  // Render loading state
  if (isLoading) {
    return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading profile...</div>;
  }

  // Handle case where userDetails might still be null after fetch attempt
  if (!userDetails || !userDetails.username) {
    return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Could not load user profile.</div>;
  }


  return (
    <>
      {/* Profile Navigation */}
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item aria-current="page" icon={BookIcon} sx={{ backgroundColor: "transparent", color: "white", "&:hover": { textDecoration: "underline", color: "white" } }}>
          Overview
        </UnderlineNav.Item>
        {/* TODO: Make this link functional later */}
        <UnderlineNav.Item icon={RepoIcon} sx={{ backgroundColor: "transparent", color: "whitesmoke", "&:hover": { textDecoration: "underline", color: "white" } }}>
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      {/* Main Profile Content */}
      <div className="profile-page-wrapper">
        {/* Left Section: User Info */}
        <div className="user-profile-section">
          <div className="profile-image">
            {/* You can add an <img> tag here later */}
          </div>
          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          {/* TODO: Implement Follow functionality later */}
          <button className="follow-btn">Follow</button>

          <div className="follower">
            {/* FIX 2: Display dynamic following count */}
            {/* <p>{userDetails.followerCount ?? 0} Followers</p> */} {/* Uncomment if you add followerCount */}
            <p>{userDetails.followingCount ?? 0} Following</p>
          </div>
        </div>

        {/* Right Section: Contributions & Repos */}
        <div className="profile-main-content"> {/* Added a wrapper div */}
          <div className="heat-map-section">
            <HeatMapProfile />
          </div>

          {/* FIX 3: Add section for user's repositories */}
          <div className="profile-repos-section">
            <h4>Your Repositories</h4>
            {userDetails.repositories && userDetails.repositories.length > 0 ? (
              <ul className="profile-repo-list">
                {userDetails.repositories.map(repo => (
                  <li key={repo._id} className="profile-repo-item">
                    <Link to={`/repo/${repo._id}`}>{repo.name}</Link>
                    <p>{repo.description || 'No description'}</p>
                    <span>{repo.visibility ? 'Public' : 'Private'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No repositories found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Logout Button (moved for clarity, kept styling) */}
      <button onClick={handleLogout} style={{ position: "fixed", bottom: "50px", right: "50px" }} id="logout">
        Logout
      </button>
    </>
  );
};

export default Profile;