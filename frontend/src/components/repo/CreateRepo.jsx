import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./repo.css";

const CreateRepo = () => {
    const [repoData, setRepoData] = useState({ name: "", description: "", isPublic: true });
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

        try {
            const response = await fetch("http://localhost:3002/repo/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...repoData, userId }),
            });

            const result = await response.json();
            if (response.ok) {
                navigate(`/repo/${result._id}`); // Redirect to repo detail page
            } else {
                alert(result.message || "Failed to create repository");
            }
        } catch (err) {
            console.error("Repo creation error:", err);
            alert("Error while creating repository");
        }
    };

    return (
        <>
            <Navbar />
            <div className="repo-form-wrapper">
                <h2>Create New Repository</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Repository Name</label>
                    <input type="text" name="name" value={repoData.name} onChange={handleChange} required />

                    <label htmlFor="description">Description</label>
                    <textarea name="description" value={repoData.description} onChange={handleChange} />

                    <label>
                        <input type="checkbox" name="isPublic" checked={repoData.isPublic} onChange={handleChange} />
                        Make Public
                    </label>

                    <button type="submit">Create</button>
                </form>
            </div>
        </>
    );
};

export default CreateRepo;
