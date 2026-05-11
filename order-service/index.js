const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const amqp = require('amqplib');
require('dotenv').config();
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const app = express();

// 1. Fixed CORS to match other services
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. HEALTH CHECK (Mandatory for K8s)
app.get('/health', (req, res) => res.status(200).send('Order Service is Healthy'));

// Helper: Send message to RabbitMQ
async function sendToQueue(orderData) {
    try {
        // Updated to use environment variable for RabbitMQ host
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

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.post('/orders', async (req, res) => {
    const { userId, itemId, restaurantId } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO orders (user_id, item_id, restaurant_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, itemId, restaurantId, 'Pending']
        );
        const newOrder = result.rows[0];
        await sendToQueue(newOrder);

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