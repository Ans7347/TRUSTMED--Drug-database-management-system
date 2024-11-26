import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Global.css';

const Customers = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/customers', {
                    headers: {
                        Authorization: `Bearer ${auth}`,
                    },
                });
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Failed to fetch users.");
            }
        };

        if (auth) {
            fetchUsers();
        } else {
            navigate('/');
        }
    }, [auth, navigate]);

    const handleLogout = () => {
        setAuth(null);
        navigate('/');
    };

    return (
        <div className="inventory">
            <div className="dashboard">
                <header className="dashboard-header">
                    <nav className="navbar">
                        <ul>
                            <li onClick={() => navigate('/dashboard')}>Products</li>
                            <li onClick={() => navigate('/cart')}>Bill</li>
                            <li onClick={() => navigate('/inventory')}>Inventory</li>
                            <li onClick={() => navigate('/vendors')}>Vendors</li>
                            <li onClick={() => navigate('/transactions')}>Transactions</li>
                            <li className="active">Customers</li>
                        </ul>
                    </nav>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
            </div>

            {error && <p className="error-message">{error}</p>}

            <h1 className="customers-title">Customers</h1>
            <div className="table-container">
                <table className="customers-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>User Name</th>
                            <th>Phone Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.phone_number}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Customers;
