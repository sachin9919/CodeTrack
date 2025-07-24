import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import "./repo.css";

const Issues = () => {
    const { id } = useParams();
    const [issues, setIssues] = useState([]);
    const [newIssue, setNewIssue] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await fetch(`http://localhost:3002/issue/${id}`);
                const data = await response.json();
                setIssues(data);
            } catch (err) {
                console.error("Error fetching issues:", err);
            }
        };

        fetchIssues();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newIssue.trim()) return;

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3002/issue/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoId: id, content: newIssue }),
            });

            const data = await response.json();
            if (response.ok) {
                setIssues((prev) => [...prev, data]);
                setNewIssue("");
            } else {
                alert("Failed to create issue");
            }
        } catch (err) {
            console.error("Issue creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="repo-action-page">
                <h2>Issues for This Repository</h2>

                <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                    <textarea
                        placeholder="Describe the issue..."
                        value={newIssue}
                        onChange={(e) => setNewIssue(e.target.value)}
                        rows={3}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px" }}
                    ></textarea>
                    <button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Create Issue"}
                    </button>
                </form>

                <ul>
                    {issues.length === 0 && <p>No issues found.</p>}
                    {issues.map((issue) => (
                        <li key={issue._id} style={{ marginBottom: "10px" }}>
                            <strong>{new Date(issue.createdAt).toLocaleString()}:</strong> {issue.content}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default Issues;
