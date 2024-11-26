import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; // Import the CSS file

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/forgot-password', { email });
            setMessage("Check your email for password reset instructions.");
        } catch (error) {
            console.error("Error sending reset email:", error);
            setMessage("Failed to send reset email. Please try again.");
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h1>Forgot Password</h1>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send Reset Link</button>
                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
};

export default ForgotPassword;
