import React from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const Cart = ({ cartItems, setCartItems, isCartVisible, setIsCartVisible }) => {
    const { auth } = useContext(AuthContext);

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.Price_Per_Unit * item.Quantity), 0).toFixed(2);
    };

    const handleQuantityChange = async (itemCode, newQuantity) => {
        if (newQuantity <= 0) {
            await handleRemoveFromCart(itemCode);
        } else {
            try {
                await axios.put('http://localhost:4000/api/cart', { itemCode, quantity: newQuantity }, {
                    headers: {
                        Authorization: `Bearer ${auth}`,
                    },
                });
                const response = await axios.get('http://localhost:4000/api/cart', {
                    headers: {
                        Authorization: `Bearer ${auth}`,
                    },
                });
                setCartItems(response.data);
            } catch (error) {
                console.error("Error updating cart item quantity:", error.response ? error.response.data : error.message);
            }
        }
    };

    const handleRemoveFromCart = async (itemCode) => {
        try {
            await axios.delete(`http://localhost:4000/api/cart/${itemCode}`, {
                headers: {
                    Authorization: `Bearer ${auth}`,
                },
            });
            setCartItems(cartItems.filter(item => item.Item_Code !== itemCode));
        } catch (error) {
            console.error("Error removing item from cart:", error.response ? error.response.data : error.message);
        }
    };

    const handleCheckout = () => {
        // Implement checkout logic or navigation
    };

    const handleClearCart = async () => {
        try {
            await axios.delete('http://localhost:4000/api/cart', {
                headers: {
                    Authorization: `Bearer ${auth}`,
                },
            });
            setCartItems([]);
        } catch (error) {
            console.error("Error clearing cart:", error.response ? error.response.data : error.message);
        }
    };

    if (!isCartVisible) return null;

    return (
        <aside className="cart-sidebar">
            <h2>Your Bill</h2>
            {cartItems.length > 0 ? (
                <ul>
                    {cartItems.map(item => (
                        <li key={item.Item_Code}>
                            {item.Item_Name}  
                            <input 
                                type="number" 
                                min="1" 
                                value={item.Quantity} 
                                onChange={(e) => handleQuantityChange(item.Item_Code, parseInt(e.target.value) || 0)} 
                            /> - 
                            Price: ${item.Price_Per_Unit}
                            <button onClick={() => handleRemoveFromCart(item.Item_Code)}>Remove</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your Bill is empty.</p>
            )}
            {cartItems.length > 0 && (
                <div className="cart-summary">
                    <p>Total Price: ${calculateTotalPrice()}</p>
                    <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
                    <button className="clear-cart-button" onClick={handleClearCart}>Clear Cart</button>
                </div>
            )}
        </aside>
    );
};

export default Cart;
