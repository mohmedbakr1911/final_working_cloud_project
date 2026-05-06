const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const amqp = require('amqplib');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Helper: Send message to RabbitMQ
async function sendToQueue(orderData) {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
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

// Unified Order Route
app.post('/orders', async (req, res) => {
    const { userId, itemId, restaurantId } = req.body;
    try {
        // 1. Save to DB (Synchronous)
        const result = await pool.query(
            'INSERT INTO orders (user_id, item_id, restaurant_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, itemId, restaurantId, 'Pending']
        );
        const newOrder = result.rows[0];

        // 2. Push to RabbitMQ (Asynchronous)
        await sendToQueue(newOrder);

        // 3. Respond immediately
        res.status(202).json({
            message: "Order received and is being processed",
            order: newOrder
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(3000, () => console.log('Order Service running on port 3000'));