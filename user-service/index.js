const express = require('express');
const pool = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Health Check
app.get('/health', (req, res) => res.status(200).send('User Service is Healthy'));

// Register a new user (Customer or Delivery)
app.post('/users', async (req, res) => {
    try {
        const { name, role } = req.body;
        const result = await pool.query(
            'INSERT INTO users (name, role) VALUES ($1, $2) RETURNING *',
            [name, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND password = $2',
        [username, password]
    );
    if (result.rows.length > 0) {
        res.json({ id: result.rows[0].id, username: result.rows[0].username, role: result.rows[0].role });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// user-service/index.js
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: "Username already exists" });
    }
});

// restaurant-service/index.js
app.post('/restaurant/menu', async (req, res) => {
    const { name, price } = req.body;
    const result = await pool.query(
        'INSERT INTO menu_items (name, price) VALUES ($1, $2) RETURNING *',
        [name, price]
    );
    res.status(201).json(result.rows[0]);
});

// Get user profile
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).send('User not found');
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));