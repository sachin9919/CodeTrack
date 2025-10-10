import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./repo.css";

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
            const response = await fetch("http://localhost:3000/repo/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
                throw new Error(data.error || 'Failed to create repository');
            }

            console.log("Repository created:", data);
            navigate(`/repo/${data.repositoryID}`);
        } catch (error) {
            console.error("Repo creation error:", error);
            setError(error.message);
        }
    };

    return (
        <div className="repo-form-wrapper">
            <form className="repo-form" onSubmit={handleSubmit}>
                <h2>Create New Repository</h2>

                {error && <div className="error-message">{error}</div>}

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