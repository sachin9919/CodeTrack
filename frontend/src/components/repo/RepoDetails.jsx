import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./repo.css";

const RepoDetails = () => {
    const { repoId } = useParams();
    const navigate = useNavigate();
    const [repo, setRepo] = useState(null);

    useEffect(() => {
        const fetchRepo = async () => {
            try {
                const response = await fetch(`http://localhost:3002/repo/${repoId}`);
                const data = await response.json();

                if (response.ok) {
                    setRepo(data);
                } else {
                    alert("Repository not found");
                }
            } catch (err) {
                console.error("Error fetching repository:", err);
            }
        };

        fetchRepo();
    }, [repoId]);

    if (!repo) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

    return (
        <>
            <Navbar />
            <div className="repo-details-page">
                <div className="repo-header">
                    <h2>{repo.name}</h2>
                    <p>{repo.description}</p>
                </div>

                <div className="repo-meta">
                    <p><strong>Visibility:</strong> {repo.isPublic ? "Public" : "Private"}</p>
                    <p><strong>Owner:</strong> {repo.ownerUsername || "You"}</p>
                    <p><strong>Created At:</strong> {new Date(repo.createdAt).toLocaleString()}</p>
                </div>

                <div className="repo-actions">
                    <button onClick={() => navigate(`/repo/${repoId}/commit`)}>Commit</button>
                    <button onClick={() => navigate(`/repo/${repoId}/push`)}>Push</button>
                    <button onClick={() => navigate(`/repo/${repoId}/pull`)}>Pull</button>
                    <button onClick={() => navigate(`/repo/${repoId}/issues`)}>View Issues</button>
                </div>
            </div>
        </>
    );
};

export default RepoDetails;
