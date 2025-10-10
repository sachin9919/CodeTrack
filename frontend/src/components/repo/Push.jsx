import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./repo.css";

const Push = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isPushing, setIsPushing] = useState(false);
    const [output, setOutput] = useState("");

    const handlePush = async () => {
        setIsPushing(true);
        try {
            const response = await fetch("http://localhost:3000/push", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ repoId: id }),
            });

            const result = await response.json();
            if (response.ok) {
                setOutput(result.message || "Push successful!");
            } else {
                setOutput(result.message || "Push failed.");
            }
        } catch (error) {
            console.error("Push error:", error);
            setOutput("Error occurred while pushing.");
        } finally {
            setIsPushing(false);
        }
    };

    return (
        <>
            
            <div className="repo-action-page">
                <h2>Push Changes</h2>
                <button onClick={handlePush} disabled={isPushing}>
                    {isPushing ? "Pushing..." : "Push to Remote"}
                </button>
                {output && <p style={{ marginTop: "15px" }}>{output}</p>}
            </div>
        </>
    );
};

export default Push;
