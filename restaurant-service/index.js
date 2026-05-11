const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const client = require('prom-client');
const app = express();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Health Check (MANDATORY for Kubernetes Probes)
app.get('/health', (req, res) => res.status(200).send('Restaurant Service is Healthy'));

app.get('/restaurants', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM restaurants');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

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

// Set port to 3000 to match ContainerPort
const PORT = 3000;
app.listen(PORT, () => console.log(`Restaurant Service running on port ${PORT}`));