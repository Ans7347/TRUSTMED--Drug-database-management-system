import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Global.css';

const Login = () => {
    const { setAuth } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:4000/login', { username, phoneNumber });
            setAuth(response.data.token);
            navigate('/dashboard');
        } catch (error) {
            console.error("Login error:", error);
            setError("Login failed. Please check your credentials.");
        }
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h1>Login</h1>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                <div className="auth-footer">
                    <button type="button" onClick={handleRegister}>Register</button>
                </div>
            </form>
        </div>
    );
};

export default Login;
