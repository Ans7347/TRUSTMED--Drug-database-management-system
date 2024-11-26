import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Global.css';

const Transactions = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/transactions', {
                    headers: {
                        Authorization: `Bearer ${auth}`,
                    },
                });
                setTransactions(response.data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setError("Failed to fetch transactions.");
            }
        };

        if (auth) {
            fetchTransactions();
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
                            <li className="active">Transactions</li>
                            <li onClick={() => navigate('/customers')}>Customers</li>
                        </ul>
                    </nav>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
            </div>

            {error && <p className="error-message">{error}</p>}

            <h1>Transactions</h1>
            <table>
                <thead>
                    <tr>
                        <th>Transaction No</th>
                        <th>Transaction Type</th>
                        <th>Amount</th>
                        <th>Transaction Date</th>
                        <th>User Name</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction.Transaction_No}>
                            <td>{transaction.Transaction_No}</td>
                            <td>{transaction.Transaction_Type}</td>
                            <td>${transaction.Amount}</td>
                            <td>{new Date(transaction.Transaction_Date).toLocaleString()}</td>
                            <td>{transaction.User_Name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Transactions;
