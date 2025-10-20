import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./repo.css";

// This URL for the CLI might need to be updated if you create a separate router for it.
const CLI_API_URL = "http://localhost:3000/cli/config";

const CreateRepo = () => {
    const [repoData, setRepoData] = useState({
        name: "",
        description: "",
        isPublic: true,
        content: [],
        issues: [],
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRepoData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        if (!userId) {
            setError("Please login first");
            return;
        }

        try {
            // FIX: Added the correct '/api' prefix to the URL.
            const response = await fetch("http://localhost:3000/api/repo/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: repoData.name,
                    description: repoData.description,
                    visibility: repoData.isPublic,
                    owner: userId,
                    content: repoData.content,
                    issues: repoData.issues
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // This will now show a proper error from the server instead of the HTML error.
                throw new Error(data.error || 'Failed to create repository');
            }

            const newRepoId = data.repositoryID;

            // This part for updating local config seems advanced. Leaving as is.
            const configUpdateResponse = await fetch(`${CLI_API_URL}/set-repoid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoId: newRepoId })
            });

            if (!configUpdateResponse.ok) {
                console.warn(`WARNING: Failed to automatically set repoId in local config. HTTP Status: ${configUpdateResponse.status}. You must set it manually in .myGit/config.json.`);
            } else {
                console.log(`Successfully wrote repoId ${newRepoId} to local config.json.`);
            }

            navigate(`/repo/${newRepoId}`);

        } catch (error) {
            console.error("Repo creation error:", error);
            setError(error.message);
        }
    };

    return (
        <div className="repo-form-wrapper">
            <form className="repo-form" onSubmit={handleSubmit}>
                <h2>Create New Repository</h2>
                {error && <div className="error-message">Error: {error}</div>}
                <label htmlFor="name">Repository Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={repoData.name}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={repoData.description}
                    onChange={handleChange}
                />
                <div className="checkbox-row">
                    <input
                        type="checkbox"
                        name="isPublic"
                        checked={repoData.isPublic}
                        onChange={handleChange}
                        id="isPublic"
                    />
                    <label htmlFor="isPublic">Make Public</label>
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    );
};

export default CreateRepo;