import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import Navbar from "../Navbar";
import "./repo.css";

const RepoDetails = () => {
    const { id } = useParams(); // fixed param
    const navigate = useNavigate();
    const [repo, setRepo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingDescription, setEditingDescription] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [pageError, setPageError] = useState(null);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetchRepoDetails();
    }, [id]);

    const fetchRepoDetails = async () => {
        setPageError(null);
        try {
            const response = await fetch(`http://localhost:3000/repo/${id}`);
            const data = await response.json();

            if (response.ok) {
                setRepo(data);
                setNewDescription(data.description || "");
            } else {
                setPageError(data.error || "Repository not found");
            }
        } catch (err) {
            console.error("Error fetching repository:", err);
            setPageError("Network error or server unreachable.");
        } finally {
            setLoading(false);
        }
    };

    // FIX: Updated Delete Handler
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this repository? This action cannot be undone.")) {
            return;
        }
        setPageError(null);

        try {
            const response = await fetch(`http://localhost:3000/repo/delete/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
                // CRITICAL FIX: Use replace: true to prevent redirecting back to the deleted repo page.
                navigate("/repos", { replace: true });
            } else {
                setPageError(data.error || "Failed to delete repository");
            }
        } catch (err) {
            console.error("Deletion error:", err);
            setPageError("Error communicating with the server during deletion.");
        }
    };

    const toggleVisibility = async () => {
        setPageError(null);
        try {
            const response = await fetch(`http://localhost:3000/repo/toggle/${id}`, {
                method: "PATCH",
            });

            const data = await response.json();
            if (response.ok) {
                setRepo(data.repository);
            } else {
                setPageError(data.error || "Failed to toggle visibility");
            }
        } catch (err) {
            console.error("Error toggling visibility:", err);
            setPageError("Error communicating with the server.");
        }
    };

    const handleDescriptionUpdate = async () => {
        setPageError(null);
        try {
            const response = await fetch(`http://localhost:3000/repo/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: "", // empty commit content just for description update
                    description: newDescription,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setRepo(data.repository);
                setEditingDescription(false);
            } else {
                setPageError(data.error || "Update failed");
            }
        } catch (err) {
            console.error("Update error:", err);
            setPageError("Error communicating with the server.");
        }
    };

    // Check if current user owns the repository
    const isOwner = repo?.owner?._id === userId;

    if (loading) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;
    if (!repo) return <div style={{ color: "white", padding: "20px" }}>Repository not found.</div>;

    return (
        <>
            <div className="repo-details-page">
                {/* Display page-level error */}
                {pageError && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>Error: {pageError}</div>}

                <div className="repo-header">
                    <h2>{repo.name}</h2>
                    {editingDescription ? (
                        <>
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                rows={3}
                            />
                            <button onClick={handleDescriptionUpdate}>Save</button>
                            <button onClick={() => setEditingDescription(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <p>{repo.description}</p>
                            <button onClick={() => setEditingDescription(true)}>Edit Description</button>
                        </>
                    )}
                </div>

                <div className="repo-meta">
                    <p><strong>Visibility:</strong> {repo.visibility ? "Public" : "Private"}</p>
                    <p><strong>Owner:</strong> {repo.owner?.username || "You"}</p>
                    <p><strong>Created At:</strong> {new Date(repo.createdAt).toLocaleString()}</p>
                    <button onClick={toggleVisibility}>Toggle Visibility</button>
                </div>

                <div className="repo-content">
                    <h3>Commits / Content:</h3>
                    {repo.content.length === 0 ? (
                        <p>No commits yet.</p>
                    ) : (
                        <ul>
                            {repo.content.map((entry, idx) => (
                                <li key={idx}>{typeof entry === 'object' ? entry.message : entry}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="repo-actions">
                    <button onClick={() => navigate(`/repo/${id}/commit`)}>Commit</button>
                    <button onClick={() => navigate(`/repo/${id}/push`)}>Push</button>
                    <button onClick={() => navigate(`/repo/${id}/pull`)}>Pull</button>
                    <button onClick={() => navigate(`/repo/${id}/issues`)}>View Issues</button>
                    {isOwner && <button onClick={handleDelete} className="delete-btn">Delete Repository</button>}
                </div>
            </div>
        </>
    );
};

export default RepoDetails;