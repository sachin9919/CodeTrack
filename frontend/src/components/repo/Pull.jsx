import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./repo.css";

const Pull = () => {
    const { id } = useParams();
    const [isPulling, setIsPulling] = useState(false);
    const [output, setOutput] = useState("");

    const handlePull = async () => {
        setIsPulling(true);
        try {
            const response = await fetch("http://localhost:3000/pull", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ repoId: id }),
            });

            const result = await response.json();
            if (response.ok) {
                setOutput(result.message || "Pull successful!");
            } else {
                setOutput(result.message || "Pull failed.");
            }
        } catch (error) {
            console.error("Pull error:", error);
            setOutput("Error occurred while pulling.");
        } finally {
            setIsPulling(false);
        }
    };

    return (
        <>
            <div className="repo-action-page">
                <h2>Pull Latest Changes</h2>
                <button onClick={handlePull} disabled={isPulling}>
                    {isPulling ? "Pulling..." : "Pull from Remote"}
                </button>
                {output && <p style={{ marginTop: "15px" }}>{output}</p>}
            </div>
        </>
    );
};

export default Pull;
