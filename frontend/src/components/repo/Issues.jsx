import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./repo.css";

const Issues = () => {
    const { id } = useParams(); // This is the repoId
    const [issues, setIssues] = useState([]);
    const [newIssue, setNewIssue] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchIssues();
    }, [id]);

    const fetchIssues = async () => {
        setLoading(true);
        setError(null);
        try {
            // FIX 1: Call the correct new backend route
            const response = await fetch(`http://localhost:3000/api/repo/${id}/issues`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch issues.");
            }
            setIssues(data);
        } catch (err) {
            console.error("Error fetching issues:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newIssue.trim()) return;

        setError(null);
        try {
            // FIX 2: Call the correct new backend route for creation
            const response = await fetch(`http://localhost:3000/api/repo/${id}/issues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newIssue,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create issue.");
            }

            // Add the new issue to the top of the list
            setIssues((prevIssues) => [data, ...prevIssues]);
            setNewIssue(""); // Clear the input box
        } catch (err) {
            console.error("Issue creation error:", err);
            setError(err.message || "Network error during issue submission.");
        }
    };

    return (
        <div className="repo-action-page">
            <h2>Issues for This Repository (Repo ID: {id})</h2>

            {error && <p style={{ color: "red", marginBottom: "15px" }}>Error: {error}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <textarea
                    placeholder="Describe the issue..."
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: "10px", borderRadius: "4px" }}
                />
                <button type="submit">Create Issue</button>
            </form>

            {loading ? (
                <p>Loading issues...</p>
            ) : (
                <ul>
                    {issues.length === 0 && <p>No issues found.</p>}
                    {issues.map((issue) => (
                        <li key={issue._id} style={{ marginBottom: "10px", borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                            <p>{issue.content}</p>
                            <small style={{ color: '#888' }}>
                                Opened on {new Date(issue.createdAt).toLocaleString()}
                            </small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Issues;