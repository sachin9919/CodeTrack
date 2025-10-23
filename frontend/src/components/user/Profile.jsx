import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const profileUserId = params.id || localStorage.getItem("userId");
  const loggedInUserId = localStorage.getItem("userId");

  const [userDetails, setUserDetails] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');
  const { setCurrentUser } = useAuth();

  const fetchUserDetails = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) { setIsLoading(true); setError(''); setUserDetails(null); setIsFollowing(false); }
    else { setError(''); }
    if (!profileUserId) { setError('User ID could not be determined.'); if (isInitialLoad) setIsLoading(false); return null; }
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`http://localhost:3000/api/user/userProfile/${profileUserId}`, config);
      console.log("Fetched user details:", response.data, `Received followerCount: ${response.data?.followerCount}`);
      if (response.data && response.data._id) { return response.data; }
      else { setError('Received invalid user data.'); return null; }
    } catch (err) {
      console.error("Cannot fetch user details: ", err);
      const backendError = err.response?.data?.message || err.response?.data?.error || 'Failed to load profile.';
      setError(backendError); return null;
    } finally { if (isInitialLoad) setIsLoading(false); }
  }, [profileUserId]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchUserDetails(true);
      if (data) {
        setUserDetails(data);
        setIsFollowing(data.isFollowing || false);
        if (data._id === loggedInUserId) {
          localStorage.setItem('avatarUrl', data.avatarUrl || '');
          window.dispatchEvent(new Event('avatarUpdated'));
        }
      }
    };
    loadData();
  }, [fetchUserDetails, loggedInUserId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatarUrl");
    if (setCurrentUser) setCurrentUser(null);
    navigate("/auth");
  };

  const handleFollowToggle = async () => {
    if (!loggedInUserId || loggedInUserId === profileUserId) return;
    setFollowLoading(true); setError('');
    const action = isFollowing ? 'unfollow' : 'follow';
    const url = `http://localhost:3000/api/user/${action}/${profileUserId}`;
    const token = localStorage.getItem('token');
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post(url, {}, config);
      if (response.data) {
        console.log(response.data.message);
        const updatedUserDetails = await fetchUserDetails(false);
        if (updatedUserDetails) {
          setUserDetails(updatedUserDetails);
          setIsFollowing(updatedUserDetails.isFollowing || false);
        } else { setError('Failed to refresh profile after follow action.'); }
      }
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      const followError = err.response?.data?.error || `Failed to ${action}.`;
      setError(followError);
    } finally { setFollowLoading(false); }
  };

  if (isLoading) {
    return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading profile...</div>;
  }
  if (error || !userDetails) {
    return <div style={{ color: 'red', padding: '50px', textAlign: 'center' }}>
      {`Error: ${error || 'Could not load user profile. User may not exist or access denied.'}`}
    </div>;
  }

  const isOwnProfile = loggedInUserId === profileUserId;

  return (
    <>
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item aria-current="page" icon={BookIcon} sx={{ backgroundColor: "transparent", color: "white", "&:hover": { textDecoration: "underline", color: "white" } }}>Overview</UnderlineNav.Item>
        <UnderlineNav.Item icon={RepoIcon} sx={{ backgroundColor: "transparent", color: "whitesmoke", "&:hover": { textDecoration: "underline", color: "white" } }}>Starred Repositories</UnderlineNav.Item>
      </UnderlineNav>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image">
            {userDetails.avatarUrl ? (
              <img src={userDetails.avatarUrl} alt={`${userDetails.username}'s avatar`} />
            ) : (
              <div className="profile-image-placeholder"></div>
            )}
          </div>
          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>
          {!isOwnProfile && (
            <button
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
            </button>
          )}
          <div className="follower">
            <p>{userDetails.followerCount ?? 0} Followers</p>
            {/* FIX: Removed the extra <p> tag with the dot */}
            <p>{userDetails.followingCount ?? 0} Following</p>
          </div>
        </div>

        <div className="profile-main-content">
          <div className="heat-map-section"><HeatMapProfile /></div>
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
            ) : (<p>No repositories found.</p>)}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <button onClick={handleLogout} style={{ position: "fixed", bottom: "50px", right: "50px" }} id="logout">Logout</button>
      )}
      {error && <div style={{ color: 'red', position: 'fixed', bottom: '100px', right: '50px', background: '#333', padding: '10px', borderRadius: '5px' }}>Error: {error}</div>}
    </>
  );
};

export default Profile;