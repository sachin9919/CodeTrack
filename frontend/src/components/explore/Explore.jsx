import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './explore.css'; // Make sure this CSS file exists

const Explore = () => {
    const [publicRepos, setPublicRepos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPublicRepos = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Fetch public repos from the new backend endpoint
                const response = await axios.get('http://localhost:3000/api/repo/public');
                if (response.data && Array.isArray(response.data)) { // Check if it's an array
                    setPublicRepos(response.data);
                } else {
                    console.warn("Received non-array data for public repos:", response.data);
                    setPublicRepos([]); // Set empty array if data is not an array
                }
            } catch (err) {
                console.error("Error fetching public repositories:", err);
                setError(err.response?.data?.error || 'Failed to load public repositories.');
                setPublicRepos([]); // Clear repos on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicRepos();
    }, []); // Run only once on component mount

    return (
        <div className="explore-page-container">
            <h2>Explore Public Repositories</h2>

            {isLoading && <p className="loading-message">Loading repositories...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {!isLoading && !error && publicRepos.length === 0 && (
                <p className="no-repos-message">No public repositories found.</p>
            )}

            {!isLoading && !error && publicRepos.length > 0 && (
                <div className="repo-list-container">
                    {publicRepos.map((repo) => (
                        <div
                            key={repo._id}
                            className="repo-card explore-card clickable" // Re-use repo-card style?
                            onClick={() => navigate(`/repo/${repo._id}`)}
                            title={`View repository: ${repo.name}`}
                        >
                            <h4>{repo.name}</h4>
                            <p className="repo-description">{repo.description || 'No description provided.'}</p>
                            <div className="repo-meta-explore">
                                <span className="repo-owner">
                                    By:{' '}
                                    {repo.owner?._id ? (
                                        <Link
                                            to={`/profile/${repo.owner._id}`}
                                            onClick={(e) => e.stopPropagation()} // Prevent card click
                                            className="owner-link"
                                            title={`View ${repo.owner.username}'s profile`}
                                        >
                                            {repo.owner.username || 'Unknown'}
                                        </Link>
                                    ) : (
                                        'Unknown'
                                    )}
                                </span>
                                <span className="repo-created-date">
                                    Created: {new Date(repo.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Explore;