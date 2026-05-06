const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. Get all restaurants for the Marketplace
app.get('/restaurants', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM restaurants');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get menu for a SPECIFIC restaurant
app.get('/restaurants/:id/menu', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM menu_items WHERE restaurant_id = $1', 
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Admin: Add item to a specific restaurant
app.post('/restaurant/menu', async (req, res) => {
    const { restaurant_id, name, price } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO menu_items (restaurant_id, name, price) VALUES ($1, $2, $3) RETURNING *',
            [restaurant_id, name, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/restaurants', async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO restaurants (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Multi-Tenant Restaurant Service on 3000'));