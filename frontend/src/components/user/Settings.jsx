import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './settings.css'; // We will create this file next

const Settings = () => {
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem('userId');

    // Fetch the user's current data to pre-fill the form
    useEffect(() => {
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/api/user/userProfile/${userId}`);
                    setCurrentUser(response.data);
                    setFormData(prev => ({ ...prev, email: response.data.email }));
                } catch (err) {
                    setError('Failed to fetch user data.');
                    console.error("Fetch user data error:", err);
                }
            };
            fetchUserData();
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                email: formData.email,
            };
            // Only include the password in the payload if the user entered one
            if (formData.newPassword) {
                payload.password = formData.newPassword;
            }

            const response = await axios.put(`http://localhost:3000/api/user/updateProfile/${userId}`, payload);

            if (response.data) {
                setMessage('Profile updated successfully!');
                // Clear password fields after successful update
                setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while updating the profile.');
            console.error("Update profile error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-form-wrapper">
                <form onSubmit={handleSubmit}>
                    <h2>Account Settings</h2>
                    {currentUser && <p className="username-display">Username: {currentUser.username}</p>}

                    {message && <p className="success-message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password (optional)</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={!formData.newPassword}
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;