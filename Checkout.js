import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Global.css';

const Checkout = ({ token }) => {
    const navigate = useNavigate();
    const [transactionDetails, setTransactionDetails] = useState({
        totalAmount: 0,
        userName: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const completeCheckout = async () => {
            try {
                const response = await axios.post(
                    'http://localhost:4000/api/checkout',
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setTransactionDetails({
                    totalAmount: response.data.totalAmount,
                    userName: response.data.userName,
                });
            } catch (error) {
                console.error('Error during checkout:', error);
                setError('Checkout failed. Please try again.');
            }
        };

        completeCheckout(); // Call the checkout function on component mount
    }, [navigate, token]);

    return (
        <div>
            <h1>Checkout Page</h1>
            {error && <p className="error-message">{error}</p>}
            <p>Thank you for your order!</p>
            <div className="bill">
                <h2>Your Bill</h2>
                <p><strong>Name:</strong> {transactionDetails.userName}</p>
                <p><strong>Total Amount:</strong> ${transactionDetails.totalAmount.toFixed(2)}</p>
            </div>
            <p>You will be redirected to the Login page shortly.</p>
        </div>
    );
};

export default Checkout;
