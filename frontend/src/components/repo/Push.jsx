import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./repo.css";

const Push = () => {
    const { id: repoId } = useParams();
    const [isPushing, setIsPushing] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    const handlePush = async () => {
        setIsPushing(true);
        setError(null);
        setMessage("");

        try {
            // FIX: Use the correct API path, including the '/api' prefix
            const response = await fetch(`http://localhost:3000/api/repo/${repoId}/push`, {
                method: "POST",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Push failed due to a server error.");
            }

            setMessage(result.message || "Push successful!");
        } catch (err) {
            console.error("Push error:", err);
            setError(err.message || "A network error occurred.");
        } finally {
            setIsPushing(false);
        }
    };

    return (
        <div className="repo-action-page">
            <h2>Push Changes (Repo ID: {repoId})</h2>
            <button onClick={handlePush} disabled={isPushing}>
                {isPushing ? "Pushing..." : "Push to Remote"}
            </button>
            {error && <p style={{ marginTop: "15px", color: 'red' }}>Error: {error}</p>}
            {message && <p style={{ marginTop: "15px", color: 'lightgreen' }}>{message}</p>}
        </div>
    );
};

export default Push;