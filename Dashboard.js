import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Global.css'; // Import the CSS file

const Dashboard = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [error, setError] = useState('');
    const [isCartVisible, setIsCartVisible] = useState(false); // State for cart visibility
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/inventory', {
                    headers: {
                        Authorization: `Bearer ${auth}`,
                    },
                });
                setInventory(response.data);
            } catch (error) {
                console.error("Error fetching inventory:", error);
                setError("Failed to fetch inventory.");
            }
        };

        const fetchCartItems = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/cart', {
                    headers: {
                        Authorization: `Bearer ${auth}`,
                    },
                });
                setCartItems(response.data);
            } catch (error) {
                console.error("Error fetching cart items:", error);
                setError("Failed to fetch cart items.");
            }
        };

        if (auth) {
            fetchInventory();
            fetchCartItems();
        } else {
            navigate('/');
        }
    }, [auth, navigate]);

    const handleLogout = () => {
        setAuth(null);
        navigate('/');
    };

    const categories = [...new Set(inventory.map(item => item.Category))];

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setFilteredItems(inventory.filter(item => item.Category === category));
    };

    const handleAddToCart = async (itemCode, quantity) => {
        if (quantity <= 0) {
            alert("Please select a valid quantity.");
            return;
        }

        try {
            await axios.post('http://localhost:4000/api/cart', { itemCode, quantity }, {
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
            console.error("Error adding to cart:", error.response ? error.response.data : error.message);
        }
    };

    const handleCartClick = () => {
        setIsCartVisible(!isCartVisible); // Toggle cart visibility
    };

    // Calculate total price
    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.Price_Per_Unit * item.Quantity), 0).toFixed(2);
    };

    const handleCheckout = () => {
        navigate('/checkout'); // Navigate to the Checkout page
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

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <nav className="navbar">
                    <ul>
                        <li onClick={() => setIsCartVisible(false)}>Products</li>
                        <li onClick={handleCartClick}>Bill</li>
                        <li onClick={() => navigate('/inventory')}>Inventory</li>
                        <li onClick={() => navigate('/vendors')}>Vendors</li>
                        <li onClick={() => navigate('/transactions')}>Transactions</li>
                        <li onClick={() => navigate('/customers')}>Customers</li>
                    </ul>
                </nav>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </header>

            {error && <p className="error-message">{error}</p>}

            <div className="main-content">
                <aside className="categories">
                    <h2>Categories</h2>
                    <ul>
                        {categories.map(category => (
                            <li key={category} onClick={() => handleCategoryClick(category)} className="category-item">
                                {category}
                            </li>
                        ))}
                    </ul>
                </aside>

                <section className="products-section">
                    <h2>Featured Products</h2>
                    {selectedCategory && (
                        <div className="products-grid">
                            {filteredItems.length > 0 ? (
                                filteredItems.map(item => (
                                    <div key={item.Item_Code} className="product-card">
                                        <h3>{item.Item_Name}</h3>
                                        <p>${item.Price_Per_Unit}</p>
                                        <p>Available Stock: {item.Available_Stock}</p>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max={item.Available_Stock} 
                                            defaultValue="1" 
                                            id={`quantity-${item.Item_Code}`} 
                                        />
                                        <button onClick={() => handleAddToCart(item.Item_Code, parseInt(document.getElementById(`quantity-${item.Item_Code}`).value))}>
                                            Add to Bill
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No products available in this category.</p>
                            )}
                        </div>
                    )}
                </section>

                {isCartVisible && (
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
                )}
            </div>
        </div>
    );
};

export default Dashboard;
