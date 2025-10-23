import React, { useState, useEffect } from "react";
// FIX 1: Import Link from react-router-dom
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setIsLoading(false);
      setRepositories([]);
      return;
    }

    const fetchRepositories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/repo/user/${userId}`);
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories:", err);
        setRepositories([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/repo/all");
        const data = await response.json();
        // Ensure owner data is available for suggested repos
        // The backend /api/repo/all should populate owner username
        setSuggestedRepositories(data || []);
      } catch (err) {
        console.error("Error while fetching suggested repositories:", err);
        setSuggestedRepositories([]);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, [location.pathname]); // Consider removing location.pathname dependency if not needed

  // Client-side search logic (remains the same)
  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  const currentUserId = localStorage.getItem("userId");

  if (!currentUserId) {
    return (
      <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>You are not logged in.</h2>
        <p>Please log in to view and manage your repositories.</p>
      </div>
    );
  }

  // Combine loading states? Or show partial loading? For now, keep as is.
  if (isLoading) {
    return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading repositories...</div>;
  }

  return (
    <section id="dashboard">
      <aside className="left-panel">
        <h3>Suggested Public Repositories</h3>
        {suggestedRepositories.length === 0 && <p style={{ color: '#888', fontSize: '14px' }}>No public repositories found.</p>}
        {suggestedRepositories.map((repo) => (
          // Make the whole card clickable to the repo
          <div
            key={repo._id}
            className="repo-card clickable"
            onClick={() => navigate(`/repo/${repo._id}`)}
            title={`Go to repository: ${repo.name}`} // Add tooltip
          >
            <h4>{repo.name}</h4>
            <p>{repo.description || 'No description.'}</p>
            <p style={{ fontSize: "12px", color: "#999" }}>
              {repo.visibility ? "Public" : "Private"} | By{' '}
              {/* FIX 2: Make username a clickable link if owner ID exists */}
              {repo.owner?._id ? (
                <Link
                  to={`/profile/${repo.owner._id}`}
                  className="owner-link" // Add class for styling if needed
                  onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
                  title={`View ${repo.owner.username}'s profile`} // Add tooltip
                >
                  {repo.owner.username || "Unknown"}
                </Link>
              ) : (
                "Unknown" // Fallback if owner is somehow not populated
              )}
            </p>
          </div>
        ))}
      </aside>

      <main className="main-content">
        <h2>Your Repositories</h2>
        <div id="search">
          <input
            type="text"
            value={searchQuery}
            placeholder="Search your repositories..." // More specific placeholder
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Display message based on search results */}
        {searchResults.length === 0 && searchQuery && <p style={{ color: '#888' }}>No repositories match your search.</p>}
        {repositories.length === 0 && !searchQuery && <p style={{ color: '#888' }}>You haven't created any repositories yet.</p>}

        {/* Map over searchResults */}
        {searchResults.map((repo) => (
          <div
            key={repo._id}
            className="repo-card clickable"
            onClick={() => navigate(`/repo/${repo._id}`)}
            title={`Go to repository: ${repo.name}`} // Add tooltip
          >
            <h4>{repo.name}</h4>
            <p>{repo.description || 'No description.'}</p>
            <p style={{ fontSize: "12px", color: "#999" }}>
              {/* Assuming these are always the user's repos, owner isn't displayed */}
              {repo.visibility ? "Public" : "Private"}
            </p>
          </div>
        ))}
      </main>

      <aside className="right-panel">
        <h3>Upcoming Events</h3>
        {/* Placeholder content - consider making dynamic later */}
        <ul>
          <li>Tech Conference - Dec 15</li>
          <li>Developer Meetup - Dec 25</li>
          <li>React Summit - Jan 5</li>
        </ul>
      </aside>
    </section>
  );
};

export default Dashboard;