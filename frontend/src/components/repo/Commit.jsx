import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./repo.css";

const Commit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommit = async () => {
        setError(null);
        setIsSubmitting(true);

        if (!message.trim()) {
            setError("Commit message cannot be empty");
            setIsSubmitting(false);
            return;
        }

        try {
            // FIX: Added the correct '/api/' prefix to the URL.
            const response = await fetch(`http://localhost:3000/api/repo/${id}/commit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // repoId is not needed in body, it's in the URL
                    message: message,
                    userId: localStorage.getItem("userId")
                }),
            });

            const result = await response.json();

            if (response.ok) {
                // alert("Commit successful!"); // This is fine, or just navigate
                navigate(`/repo/${id}`);
            } else {
                setError(result.error || result.message || "Commit failed");
            }
        } catch (err) {
            console.error("Commit error:", err);
            setError("Error communicating with the server during commit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="repo-action-page">
                <h2>Commit Changes</h2>
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}
                <textarea
                    placeholder="Enter commit message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleCommit} disabled={isSubmitting}>
                    {isSubmitting ? "Committing..." : "Commit"}
                </button>
            </div>
        </>
    );
};

export default Commit;