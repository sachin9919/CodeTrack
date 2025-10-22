import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom"; // Import useParams
import axios from "axios";
import "./profile.css";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  // FIX 1: Get the profile user ID from the URL params IF it exists
  // This allows viewing other profiles, fallback to logged-in user's profile
  const params = useParams();
  const profileUserId = params.id || localStorage.getItem("userId"); // Use URL id if present, else logged-in user
  const loggedInUserId = localStorage.getItem("userId"); // Get logged-in user's ID

  const [userDetails, setUserDetails] = useState({
    _id: '', // Store the profile user's ID
    username: '',
    followingCount: 0,
    repositories: []
  });
  const [isFollowing, setIsFollowing] = useState(false); // State for follow status
  const [isLoading, setIsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false); // Loading state for follow button
  const [error, setError] = useState(''); // State for errors
  const { setCurrentUser } = useAuth(); // Assuming this is for context, not directly used here

  useEffect(() => {
    // Fetch details whenever the profileUserId changes (or on initial load)
    const fetchUserDetails = async () => {
      setIsLoading(true);
      setError(''); // Clear previous errors

      if (!profileUserId) {
        setError('User ID not found.');
        setIsLoading(false);
        return;
      }

      try {
        // FIX 2: Need to send Authorization token for backend to get req.user.id
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const response = await axios.get(
          `http://localhost:3000/api/user/userProfile/${profileUserId}`,
          config // Send config with token
        );
        console.log("Fetched user details:", response.data);
        setUserDetails(response.data);
        // FIX 3: Set initial follow state from backend data
        setIsFollowing(response.data.isFollowing || false);
      } catch (err) {
        console.error("Cannot fetch user details: ", err);
        setError(err.response?.data?.message || 'Failed to load profile.');
        // Set default state or handle error display
        setUserDetails({ username: 'Error', followingCount: 0, repositories: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [profileUserId]); // Re-run effect if the profile ID changes

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
  };

  // FIX 4: Function to handle follow/unfollow toggle
  const handleFollowToggle = async () => {
    if (!loggedInUserId || loggedInUserId === profileUserId) return; // Cannot follow self
    setFollowLoading(true);
    setError(''); // Clear previous errors

    const action = isFollowing ? 'unfollow' : 'follow';
    const url = `http://localhost:3000/api/user/${action}/${profileUserId}`;
    const token = localStorage.getItem('token');

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post(url, {}, config); // Send POST request

      if (response.data) {
        // Update state locally for immediate feedback
        setIsFollowing(!isFollowing);
        // Optionally update follower count if backend sends it, otherwise refetch might be needed
        // For now, let's assume the count isn't critical for immediate update
        console.log(response.data.message); // Log success
      }
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      setError(err.response?.data?.error || `Failed to ${action}.`);
    } finally {
      setFollowLoading(false);
    }
  };


  if (isLoading) {
    return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading profile...</div>;
  }
  if (error && !userDetails?.username) { // Show error prominently if loading failed
    return <div style={{ color: 'red', padding: '50px', textAlign: 'center' }}>Error: {error}</div>;
  }
  if (!userDetails || !userDetails.username) {
    return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Could not load user profile.</div>;
  }

  // Determine if the currently logged-in user is viewing their own profile
  const isOwnProfile = loggedInUserId === profileUserId;

  return (
    <>
      {/* Profile Navigation */}
      <UnderlineNav aria-label="Repository">
        {/* ... Nav items ... */}
      </UnderlineNav>

      {/* Main Profile Content */}
      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image"></div>
          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          {/* FIX 5: Update Follow Button Logic */}
          {!isOwnProfile && ( // Only show button if not viewing own profile
            <button
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
            </button>
          )}

          <div className="follower">
            <p>{userDetails.followingCount ?? 0} Following</p>
          </div>
        </div>

        <div className="profile-main-content">
          <div className="heat-map-section">
            <HeatMapProfile />
          </div>
          <div className="profile-repos-section">
            <h4>{isOwnProfile ? 'Your Repositories' : `${userDetails.username}'s Repositories`}</h4>
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

      {isOwnProfile && ( // Only show logout on own profile
        <button onClick={handleLogout} style={{ position: "fixed", bottom: "50px", right: "50px" }} id="logout">
          Logout
        </button>
      )}
      {/* Display follow/unfollow errors */}
      {error && <div style={{ color: 'red', position: 'fixed', bottom: '100px', right: '50px', background: '#333', padding: '10px', borderRadius: '5px' }}>Error: {error}</div>}
    </>
  );
};

export default Profile;