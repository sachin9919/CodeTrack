import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./repo.css";

const Commit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    const handleCommit = async () => {
        if (!message.trim()) {
            alert("Commit message cannot be empty");
            return;
        }

        try {
            const response = await fetch("http://localhost:3002/commit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ repoId: id, message }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Commit successful!");
                navigate(`/repo/${id}`);
            } else {
                alert(result.message || "Commit failed");
            }
        } catch (err) {
            console.error("Commit error:", err);
            alert("Error during commit");
        }
    };

    return (
        <>
            <Navbar />
            <div className="repo-action-page">
                <h2>Commit Changes</h2>
                <textarea
                    placeholder="Enter commit message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleCommit}>Commit</button>
            </div>
        </>
    );
};

export default Commit;
