import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        // Using port 3000 as inferred from CreateRepo.jsx
        const response = await fetch(`http://localhost:3000/repo/user/${userId}`);
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories:", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch("http://localhost:3000/repo/all");
        const data = await response.json();
        setSuggestedRepositories(data || []);
      } catch (err) {
        console.error("Error while fetching suggested repositories:", err);
        setSuggestedRepositories([]);
      }
    };

    // Only run if userId exists
    if (userId) {
      fetchRepositories();
    }
    fetchSuggestedRepositories();
  }, [location.pathname]); // CRITICAL FIX: Re-run effect when the route path changes

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

  return (
    <section id="dashboard">
      {/* Suggested Public Repositories */}
      <aside className="left-panel">
        <h3>Suggested Public Repositories</h3>
        {suggestedRepositories.map((repo) => (
          <div
            key={repo._id}
            className="repo-card clickable"
            onClick={() => navigate(`/repo/${repo._id}`)}
          >
            <h4>{repo.name}</h4>
            <p>{repo.description}</p>
            <p style={{ fontSize: "12px", color: "#999" }}>
              {repo.visibility ? "Public" : "Private"} | By {repo.owner?.username || "Unknown"}
            </p>
          </div>
        ))}
      </aside>

      {/* Main User's Repositories */}
      <main className="main-content">
        <h2>Your Repositories</h2>
        <div id="search">
          <input
            type="text"
            value={searchQuery}
            placeholder="Search..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {repositories.length === 0 && <p>No repositories found.</p>}

        {searchResults.map((repo) => (
          <div
            key={repo._id}
            className="repo-card clickable"
            onClick={() => navigate(`/repo/${repo._id}`)}
          >
            <h4>{repo.name}</h4>
            <p>{repo.description}</p>
            <p style={{ fontSize: "12px", color: "#999" }}>
              {repo.visibility ? "Public" : "Private"}
            </p>
          </div>
        ))}
      </main>

      {/* Right Sidebar */}
      <aside className="right-panel">
        <h3>Upcoming Events</h3>
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