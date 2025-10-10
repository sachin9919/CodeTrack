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

    useEffect(() => {
        fetchRepoDetails();
    }, [id]);

    const fetchRepoDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3000/repo/${id}`);
            const data = await response.json();

            if (response.ok) {
                setRepo(data); // Remove [0] since backend sends single object
                setNewDescription(data.description || "");
            } else {
                alert(data.error || "Repository not found");
            }
        } catch (err) {
            console.error("Error fetching repository:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async () => {
        try {
            const response = await fetch(`http://localhost:3000/repo/toggle/${id}`, {
                method: "PATCH",
            });

            const data = await response.json();
            if (response.ok) {
                setRepo(data.repository);
            } else {
                alert(data.error || "Failed to toggle visibility");
            }
        } catch (err) {
            console.error("Error toggling visibility:", err);
        }
    };

    const handleDescriptionUpdate = async () => {
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
                alert(data.error || "Update failed");
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    if (loading) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;
    if (!repo) return <div style={{ color: "white", padding: "20px" }}>Repository not found.</div>;

    return (
        <>
            <div className="repo-details-page">
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
                                <li key={idx}>{entry}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="repo-actions">
                    <button onClick={() => navigate(`/repo/${id}/commit`)}>Commit</button>
                    <button onClick={() => navigate(`/repo/${id}/push`)}>Push</button>
                    <button onClick={() => navigate(`/repo/${id}/pull`)}>Pull</button>
                    <button onClick={() => navigate(`/repo/${id}/issues`)}>View Issues</button>
                </div>
            </div>
        </>
    );
};

export default RepoDetails;
