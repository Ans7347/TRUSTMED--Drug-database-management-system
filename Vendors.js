import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Global.css';

const Vendors = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [vendors, setVendors] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        Supplier_ID: '',
        Name: '',
        Mobile_No: '',
        Company_Name: '',
        Status: '',
        Vendor_Balance: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/vendors', {
                    headers: {
                        Authorization: `Bearer ${auth}`,
                    },
                });
                setVendors(response.data);
            } catch (error) {
                console.error("Error fetching vendors:", error);
                setError("Failed to fetch vendors.");
            }
        };

        if (auth) {
            fetchVendors();
        } else {
            navigate('/');
        }
    }, [auth, navigate]);

    const handleLogout = () => {
        setAuth(null);
        navigate('/');
    };

    const handleEdit = (vendor) => {
        setFormData(vendor);
        setIsEditing(true);
    };

    const handleAddOrUpdate = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing 
            ? `http://localhost:4000/api/vendors/${formData.Supplier_ID}` 
            : 'http://localhost:4000/api/vendors';

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
                Supplier_ID: '',
                Name: '',
                Mobile_No: '',
                Company_Name: '',
                Status: '',
                Vendor_Balance: '',
            });
            setIsEditing(false);
            // Refresh vendors after add/update
            const response = await axios.get('http://localhost:4000/api/vendors', {
                headers: {
                    Authorization: `Bearer ${auth}`,
                },
            });
            setVendors(response.data);
        } catch (error) {
            console.error("Error adding/updating vendor:", error);
            setError("Failed to add/update vendor.");
        }
    };

    const handleDelete = async (supplierId) => {
        try {
            await axios.delete(`http://localhost:4000/api/vendors/${supplierId}`, {
                headers: {
                    Authorization: `Bearer ${auth}`,
                },
            });
            setVendors(vendors.filter(vendor => vendor.Supplier_ID !== supplierId));
        } catch (error) {
            console.error("Error deleting vendor:", error);
            setError("Failed to delete vendor.");
        }
    };

    const handleInventory = () => {
        navigate('/inventory');
    };

    const handleCart = () => {
        navigate('/cart');
    };

    const handleProducts = () => {
        navigate('/dashboard');
    };
    const handleTransactions = () => {
        navigate('/transactions');
    };
    const handleCustomers = () => {
        navigate('/customers');
    };
    return (
        <div className="inventory">
            <div className="dashboard">
                <header className="dashboard-header">
                    <nav className="navbar">
                        <ul>
                            <li onClick={handleProducts}>Products</li>
                            <li onClick={handleCart}>Bill</li>
                            <li onClick={handleInventory}>Inventory</li>
                            <li className="active">Vendors</li>
                            <li onClick={handleTransactions}>Transactions</li>
                            <li onClick={handleCustomers}>Customers</li>
                        </ul>
                    </nav>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
            </div>

            {error && <p className="error-message">{error}</p>}

            <h1>Vendors</h1>
            <form onSubmit={handleAddOrUpdate}>
                <input
                    type="text"
                    placeholder="Supplier ID"
                    value={formData.Supplier_ID}
                    onChange={(e) => setFormData({ ...formData, Supplier_ID: e.target.value })}
                    required
                    disabled={isEditing}
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Mobile No"
                    value={formData.Mobile_No}
                    onChange={(e) => setFormData({ ...formData, Mobile_No: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Company Name"
                    value={formData.Company_Name}
                    onChange={(e) => setFormData({ ...formData, Company_Name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Status"
                    value={formData.Status}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Vendor Balance"
                    value={formData.Vendor_Balance}
                    onChange={(e) => setFormData({ ...formData, Vendor_Balance: e.target.value })}
                />
                <button type="submit">{isEditing ? 'Update Vendor' : 'Add Vendor'}</button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Supplier ID</th>
                        <th>Name</th>
                        <th>Mobile No</th>
                        <th>Company Name</th>
                        <th>Status</th>
                        <th>Vendor Balance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map(vendor => (
                        <tr key={vendor.Supplier_ID}>
                            <td>{vendor.Supplier_ID}</td>
                            <td>{vendor.Name}</td>
                            <td>{vendor.Mobile_No}</td>
                            <td>{vendor.Company_Name}</td>
                            <td>{vendor.Status}</td>
                            <td>{vendor.Vendor_Balance}</td>
                            <td>
                                <button onClick={() => handleEdit(vendor)}>Edit</button>
                                <button onClick={() => handleDelete(vendor.Supplier_ID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Vendors;
