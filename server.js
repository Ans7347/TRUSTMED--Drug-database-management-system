const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD || 'Batani#123',
    database: 'trustmed'
});

// User registration
app.post('/register', (req, res) => {
    const { username, phoneNumber } = req.body;
    db.query('INSERT INTO users_with_phone (username, phone_number) VALUES (?, ?)', [username, phoneNumber], (err) => {
        if (err) return res.status(500).send("Enter valid user details.");
        res.status(200).send("User registered successfully.");
    });
});

// User login
app.post('/login', (req, res) => {
    const { username, phoneNumber } = req.body;
    db.query('SELECT * FROM users_with_phone WHERE username = ? AND phone_number = ?', [username, phoneNumber], (err, results) => {
        if (err || results.length === 0) return res.status(401).send("User not found.");
        const user = results[0];
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 });
        res.status(200).send({ auth: true, token });
    });
});

// Get inventory items
app.get('/api/inventory', (req, res) => {
    db.query('SELECT * FROM inventory', (err, results) => {
        if (err) return res.status(500).send("Error retrieving inventory.");
        res.status(200).json(results);
    });
});

// Add item to inventory
app.post('/api/inventory', (req, res) => {
    const { Item_Code, Item_Name, Available_Stock, Dispensing_Unit, Category, Price_Per_Unit } = req.body;
    db.query('INSERT INTO inventory (Item_Code, Item_Name, Available_Stock, Dispensing_Unit, Category, Price_Per_Unit) VALUES (?, ?, ?, ?, ?, ?)', 
             [Item_Code, Item_Name, Available_Stock, Dispensing_Unit, Category, Price_Per_Unit], (err) => {
        if (err) return res.status(500).send("Error adding item to inventory.");
        res.status(200).send("Item added to inventory successfully.");
    });
});

// Update inventory item
app.put('/api/inventory/:Item_Code', (req, res) => {
    const { Item_Code } = req.params;
    const { Item_Name, Available_Stock, Dispensing_Unit, Category, Price_Per_Unit } = req.body;
    db.query('UPDATE inventory SET Item_Name = ?, Available_Stock = ?, Dispensing_Unit = ?, Category = ?, Price_Per_Unit = ? WHERE Item_Code = ?', 
             [Item_Name, Available_Stock, Dispensing_Unit, Category, Price_Per_Unit, Item_Code], (err) => {
        if (err) return res.status(500).send("Error updating inventory item.");
        res.status(200).send("Inventory item updated successfully.");
    });
});

// Delete inventory item
app.delete('/api/inventory/:Item_Code', (req, res) => {
    const { Item_Code } = req.params;
    db.query('DELETE FROM inventory WHERE Item_Code = ?', [Item_Code], (err) => {
        if (err) return res.status(500).send("Error deleting inventory item.");
        res.status(200).send("Inventory item deleted successfully.");
    });
});

// CRUD operations for vendors

// Get all vendors
app.get('/api/vendors', (req, res) => {
    db.query('SELECT * FROM Supplier_Vendor', (err, results) => {
        if (err) return res.status(500).send("Error retrieving vendors.");
        res.status(200).json(results);
    });
});

// Add a new vendor
app.post('/api/vendors', (req, res) => {
    const { Name, Mobile_No, Company_Name, Status, Vendor_Balance } = req.body;
    db.query(
        'INSERT INTO Supplier_Vendor (Name, Mobile_No, Company_Name, Status, Vendor_Balance) VALUES (?, ?, ?, ?, ?)',
        [Name, Mobile_No, Company_Name, Status, Vendor_Balance],
        (err) => {
            if (err) return res.status(500).send("Error adding vendor.");
            res.status(200).send("Vendor added successfully.");
        }
    );
});

// Update an existing vendor by Supplier_ID
app.put('/api/vendors/:Supplier_ID', (req, res) => {
    const { Supplier_ID } = req.params;
    const { Name, Mobile_No, Company_Name, Status, Vendor_Balance } = req.body;
    db.query(
        'UPDATE Supplier_Vendor SET Name = ?, Mobile_No = ?, Company_Name = ?, Status = ?, Vendor_Balance = ? WHERE Supplier_ID = ?',
        [Name, Mobile_No, Company_Name, Status, Vendor_Balance, Supplier_ID],
        (err) => {
            if (err) return res.status(500).send("Error updating vendor.");
            res.status(200).send("Vendor updated successfully.");
        }
    );
});

// Delete a vendor by Supplier_ID
app.delete('/api/vendors/:Supplier_ID', (req, res) => {
    const { Supplier_ID } = req.params;
    db.query(
        'DELETE FROM Supplier_Vendor WHERE Supplier_ID = ?',
        [Supplier_ID],
        (err) => {
            if (err) return res.status(500).send("Error deleting vendor.");
            res.status(200).send("Vendor deleted successfully.");
        }
    );
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send("No token provided.");
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).send("Failed to authenticate token.");
        req.userId = decoded.id; // Set userId from the token
        next();
    });
};

// Add an item to the cart
app.post('/api/cart', verifyToken, (req, res) => {
    const { itemCode, quantity } = req.body;
    const userId = req.userId;

    // Check if the item exists in inventory
    db.query('SELECT * FROM inventory WHERE Item_Code = ?', [itemCode], (err, results) => {
        if (err) return res.status(500).send("Error checking inventory.");
        if (results.length === 0) return res.status(404).send("Item not found in inventory.");

        const item = results[0];

        // Check if the requested quantity is available
        if (quantity > item.Available_Stock) {
            return res.status(400).send("Requested quantity exceeds available stock.");
        }

        // Insert the item into the cart
        db.query('INSERT INTO cart (User_ID, Item_Code, Quantity) VALUES (?, ?, ?)', [userId, itemCode, quantity], (err) => {
            if (err) return res.status(500).send("Error adding to cart.");

            // Update the inventory stock
            db.query('UPDATE inventory SET Available_Stock = Available_Stock - ? WHERE Item_Code = ?', [quantity, itemCode], (err) => {
                if (err) return res.status(500).send("Error updating inventory.");
                res.status(200).send({ message: "Item added to cart successfully." });
            });
        });
    });
});

// Remove an item from the cart
app.delete('/api/cart/:Item_Code', verifyToken, (req, res) => {
    const userId = req.userId;
    const { Item_Code } = req.params;

    // Check if the item exists in the cart
    db.query('SELECT * FROM cart WHERE User_ID = ? AND Item_Code = ?', [userId, Item_Code], (err, results) => {
        if (err) {
            console.error("Error checking cart:", err);
            return res.status(500).send("Error removing item from cart.");
        }

        if (results.length === 0) {
            return res.status(404).send("Item not found in the cart.");
        }

        const item = results[0];

        // Update the inventory stock
        db.query('UPDATE inventory SET Available_Stock = Available_Stock + ? WHERE Item_Code = ?', [
            item.Quantity,
            Item_Code
        ], (err) => {
            if (err) {
                console.error("Error updating inventory:", err);
                return res.status(500).send("Error removing item from cart.");
            }

            // Remove the item from the cart
            db.query('DELETE FROM cart WHERE User_ID = ? AND Item_Code = ?', [userId, Item_Code], (err) => {
                if (err) {
                    console.error("Error removing item from cart:", err);
                    return res.status(500).send("Error removing item from cart.");
                }

                res.status(200).send({ message: "Item removed from cart successfully." });
            });
        });
    });
});

// Get the total price of items in the cart
app.get('/api/cart/total', verifyToken, (req, res) => {
    const userId = req.userId;

    db.query('SELECT SUM(c.Quantity * i.Price_Per_Unit) AS total_price FROM cart c JOIN inventory i ON c.Item_Code = i.Item_Code WHERE c.User_ID = ?', [userId], (err, results) => {
        if (err) {
            console.error("Error getting cart total:", err);
            return res.status(500).send("Error getting cart total.");
        }

        const totalPrice = results[0].total_price || 0;
        res.status(200).send({ totalPrice: totalPrice.toFixed(2) });
    });
});

// Delete all items from the cart
app.delete('/api/cart', verifyToken, (req, res) => {
    const userId = req.userId;

    // Get all items in the cart
    db.query('SELECT * FROM cart WHERE User_ID = ?', [userId], (err, results) => {
        if (err) {
            console.error("Error getting cart items:", err);
            return res.status(500).send("Error deleting cart.");
        }

        if (results.length === 0) {
            return res.status(200).send({ message: "Cart is already empty." });
        }

        // Update the inventory stock for all items in the cart
        db.query('UPDATE inventory i JOIN cart c ON i.Item_Code = c.Item_Code SET i.Available_Stock = i.Available_Stock + c.Quantity WHERE c.User_ID = ?', [userId], (err) => {
            if (err) {
                console.error("Error updating inventory:", err);
                return res.status(500).send("Error deleting cart.");
            }

            // Delete all items from the cart
            db.query('DELETE FROM cart WHERE User_ID = ?', [userId], (err) => {
                if (err) {
                    console.error("Error deleting cart:", err);
                    return res.status(500).send("Error deleting cart.");
                }

                res.status(200).send({ message: "Cart deleted successfully." });
            });
        });
    });
});

// Get cart items for the logged-in user
app.get('/api/cart', verifyToken, (req, res) => {
    const userId = req.userId;

    db.query(`
        SELECT c.Item_Code, c.Quantity, i.Item_Name, i.Price_Per_Unit
        FROM cart c
        JOIN inventory i ON c.Item_Code = i.Item_Code
        WHERE c.User_ID = ?`, [userId], (err, results) => {
            if (err) {
                console.error("Error retrieving cart items:", err);
                return res.status(500).send("Error retrieving cart items.");
            }
            res.status(200).json(results);
        });
});

app.post('/api/checkout', verifyToken, (req, res) => {
    const userId = req.userId;
    const transactionType ='UPI'; // Default to UPI if not provided

    // Call the stored procedure
    db.query('CALL GetUserTransactionDetails(?, ?)', [userId, transactionType], (err, results) => {
        if (err) {
            console.error("Error during checkout:", err);
            return res.status(500).send("Error during checkout.");
        }

        const transactionResult = results[0][0]; // Access the first result set and the first row

        if (!transactionResult) {
            return res.status(404).send("No transaction found.");
        }

        res.status(200).send({
            message: "Checkout completed successfully.",
            totalAmount: transactionResult.Amount,
            userName: transactionResult.User_Name
        });
    });
});


// Get all users
app.get('/api/customers', (req, res) => {
    db.query('SELECT * FROM users_with_phone', (err, results) => {
        if (err) return res.status(500).send("Error retrieving users.");
        res.status(200).json(results);
    });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
    db.query('SELECT * FROM transaction_history', (err, results) => {
        if (err) return res.status(500).send("Error retrieving transactions.");
        res.status(200).json(results);
    });
});

// Protected route example (if needed)
app.get('/api/protected', verifyToken, (req, res) => {
    res.status(200).send("This is a protected route.");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
