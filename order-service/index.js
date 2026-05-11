const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const amqp = require('amqplib');
require('dotenv').config();
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Health Check
app.get('/health', (req, res) => res.status(200).send('Order Service is Healthy'));

// Helper: Send message to RabbitMQ
async function sendToQueue(orderData) {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();
        const queue = 'order_queue';
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderData)), { persistent: true });
        console.log(" [x] Sent order to queue:", orderData.id);
        setTimeout(() => connection.close(), 500);
    } catch (err) {
        console.error("RabbitMQ Producer Error:", err);
    }
}

// Metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// GET order status by ID
app.get('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, status, created_at FROM orders WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST create order
app.post('/orders', async (req, res) => {
    const { userId, itemId, restaurantId } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO orders (user_id, item_id, restaurant_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, itemId, restaurantId, 'Pending']
        );
        const newOrder = result.rows[0];

        await sendToQueue(newOrder);

        // Status simulation — updates real DB rows over time
        setTimeout(() => pool.query("UPDATE orders SET status='Preparing' WHERE id=$1",        [newOrder.id]), 5000);
        setTimeout(() => pool.query("UPDATE orders SET status='Out for Delivery' WHERE id=$1", [newOrder.id]), 10000);
        setTimeout(() => pool.query("UPDATE orders SET status='Delivered' WHERE id=$1",        [newOrder.id]), 15000);

        res.status(202).json({
            message: "Order received and is being processed",
            order: newOrder
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
