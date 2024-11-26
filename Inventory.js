import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Global.css';

const Inventory = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        Item_Code: '',
        Item_Name: '',
        Available_Stock: '',
        Dispensing_Unit: '',
        Category: '',
        Price_Per_Unit: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/inventory', {
                    headers: {
                        Authorization: `Bearer ${auth}`,
                    },
                });
                setItems(response.data);
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
            fetchItems();
            fetchCartItems();
        } else {
            navigate('/');
        }
    }, [auth, navigate]);

    const handleLogout = () => {
        setAuth(null);
        navigate('/');
    };
    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
    };

    const handleAddOrUpdate = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing 
            ? `http://localhost:4000/api/inventory/${formData.Item_Code}` 
            : 'http://localhost:4000/api/inventory';

        try {
            await axios({
                method,
                url,
                headers: {
                    Authorization: `Bearer ${auth}`,
                },
                data: formData,
            });

            setError('');
            setFormData({
                Item_Code: '',
                Item_Name: '',
                Available_Stock: '',
                Dispensing_Unit: '',
                Category: '',
                Price_Per_Unit: '',
            });
            setIsEditing(false);
            // Refresh items after add/update
            const response = await axios.get('http://localhost:4000/api/inventory', {
                headers: {
                    Authorization: `Bearer ${auth}`,
                },
            });
            setItems(response.data);
        } catch (error) {
            console.error("Error adding/updating item:", error);
            setError("Failed to add/update item.");
        }
    };

    const handleDelete = async (itemCode) => {
        try {
            await axios.delete(`http://localhost:4000/api/inventory/${itemCode}`, {
                headers: {
                    Authorization: `Bearer ${auth}`,
                },
            });
            setItems(items.filter(item => item.Item_Code !== itemCode));
        } catch (error) {
            console.error("Error deleting item:", error);
            setError("Failed to delete item.");
        }
    };

    const handleCartClick = () => {
        setIsCartVisible(!isCartVisible); // Toggle cart visibility
    };

    const handleInventory = () => {
        navigate('/inventory');
    };

    const handleVendors = () => {
        navigate('/vendors');
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.Price_Per_Unit * item.Quantity), 0).toFixed(2);
    };

    const handleCheckout = () => {
        navigate('/checkout'); // Navigate to the Checkout page
    };
    const handleProducts = () => {
        navigate('/dashboard'); // Navigate to the Checkout page
    };
    const handleTransactions = () => {
        navigate('/transactions');
    };
    const handleCustomers = () => {
        navigate('/customers');
    };
    return (
        //<script>
        <div className="inventory">
            <div className="dashboard">
                <header className="dashboard-header">
                    <nav className="navbar">
                        <ul>
                            <li onClick={handleProducts}>Products</li>
                            <li onClick={handleCartClick}>Bill</li>
                            <li onClick={handleInventory}>Inventory</li>
                            <li onClick={handleVendors}>Vendors</li>
                            <li onClick={handleTransactions}>Transactions</li>
                            <li onClick={handleCustomers}>Customers</li>
                        </ul>
                    </nav>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
            </div>

            {error && <p className="error-message">{error}</p>}

            <h1>Inventory</h1>
            <form onSubmit={handleAddOrUpdate}>
                <input
                    type="text"
                    placeholder="Item Code"
                    value={formData.Item_Code}
                    onChange={(e) => setFormData({ ...formData, Item_Code: e.target.value })}
                    required
                    disabled={isEditing}
                />
                <input
                    type="text"
                    placeholder="Item Name"
                    value={formData.Item_Name}
                    onChange={(e) => setFormData({ ...formData, Item_Name: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Available Stock"
                    value={formData.Available_Stock}
                    onChange={(e) => setFormData({ ...formData, Available_Stock: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Dispensing Unit"
                    value={formData.Dispensing_Unit}
                    onChange={(e) => setFormData({ ...formData, Dispensing_Unit: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={formData.Category}
                    onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Price Per Unit"
                    value={formData.Price_Per_Unit}
                    onChange={(e) => setFormData({ ...formData, Price_Per_Unit: e.target.value })}
                />
                <button type="submit">{isEditing ? 'Update Item' : 'Add Item'}</button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Price</th>
                        <th>Available Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.Item_Code}>
                            <td>{item.Item_Code}</td>
                            <td>{item.Item_Name}</td>
                            <td>${item.Price_Per_Unit}</td>
                            <td>{item.Available_Stock}</td>
                            <td>
                                <button onClick={() => handleEdit(item)}>Edit</button>
                                <button onClick={() => handleDelete(item.Item_Code)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isCartVisible && (
                <aside className="cart-sidebar">
                    <h2>Your Bill</h2>
                    {cartItems.length > 0 ? (
                        <ul>
                            {cartItems.map(item => (
                                <li key={item.Item_Code}>
                                    {item.Item_Name} - Quantity: {item.Quantity} - Price: ${item.Price_Per_Unit}
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
                        </div>
                    )}
                </aside>
            )}
        </div>
        //</script>
    );
};

export default Inventory;
