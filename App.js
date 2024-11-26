import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; // Import the AuthProvider
import Login from './Login';
import Register from './Register'; // Create this component
import ForgotPassword from './ForgotPassword'; // Create this component
import Dashboard from './Dashboard'; // Your dashboard component
import Cart from './Cart'; // Import the Cart component
import Checkout from './Checkout';
import Vendors from './Vendors';
import Inventory from './Inventory';
import Transactions from './Transactions';
import Customers from './Customers';
const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/vendors" element={<Vendors />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/customers" element={<Customers />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;