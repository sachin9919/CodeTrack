import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./repo.css";

const Commit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null); // FIX: New state for error messages
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading

    const handleCommit = async () => {
        setError(null); // Clear previous errors
        setIsSubmitting(true);

        if (!message.trim()) {
            setError("Commit message cannot be empty");
            setIsSubmitting(false);
            return;
        }

        try {
            // FIX 1: Correct the API endpoint to include the repository ID
            const response = await fetch(`http://localhost:3000/repo/${id}/commit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    repoId: id,
                    message: message,
                    userId: localStorage.getItem("userId") // Pass user ID to backend for tracking/verification
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Commit successful!"); // NOTE: Keeping alert for success but recommend replacing this
                navigate(`/repo/${id}`);
            } else {
                // FIX 2: Set error state instead of alert()
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
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
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