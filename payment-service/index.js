const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const amqp = require('amqplib');
require('dotenv').config();
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── RabbitMQ Producer ────────────────────────────────────────────────────────
// Publishes a payment event to the payment_queue after a payment is created.
// Mirrors the exact sendToQueue pattern used in order-service/index.js.
async function sendToQueue(paymentData) {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
        const channel = await connection.createChannel();
        const queue = 'payment_queue';

        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(paymentData)), { persistent: true });

        console.log(' [x] Sent payment to queue:', paymentData.id);
        setTimeout(() => connection.close(), 500);
    } catch (err) {
        console.error('RabbitMQ Producer Error:', err);
    }
}

// ─── RabbitMQ Consumer ────────────────────────────────────────────────────────
// Consumes from payment_queue, simulates payment approval/rejection,
// then updates the payment status in PostgreSQL.
// This mirrors the async worker pattern expected in the architecture.
async function startConsumer() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
        const channel = await connection.createChannel();
        const queue = 'payment_queue';

        await channel.assertQueue(queue, { durable: true });
        channel.prefetch(1);

        console.log(' [*] Payment consumer waiting for messages...');

        channel.consume(queue, async (msg) => {
            if (msg === null) return;

            const paymentData = JSON.parse(msg.content.toString());
            console.log(' [x] Processing payment:', paymentData.id);

            // Simulate payment processing: 80% chance of success
            const approved = Math.random() < 0.8;
            const newStatus = approved ? 'Paid' : 'Failed';

            try {
                await pool.query(
                    'UPDATE payments SET status = $1 WHERE id = $2',
                    [newStatus, paymentData.id]
                );
                console.log(` [✓] Payment ${paymentData.id} status updated to: ${newStatus}`);
            } catch (err) {
                console.error('DB update error during payment processing:', err.message);
            }

            channel.ack(msg);
        });
    } catch (err) {
        console.error('RabbitMQ Consumer Error:', err.message);
        // Retry after 5 seconds if RabbitMQ is not yet ready
        setTimeout(startConsumer, 5000);
    }
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).send('Payment Service is Healthy'));

// ─── Prometheus Metrics ───────────────────────────────────────────────────────
// Identical pattern to user-service and order-service.
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// ─── POST /payments ───────────────────────────────────────────────────────────
// Accepts a payment request, saves it as Pending in PostgreSQL,
// then pushes it to RabbitMQ for async processing.
// Responds immediately with 202 Accepted — same pattern as POST /orders.
app.post('/payments', async (req, res) => {
    const { orderId, userId, amount } = req.body;

    // Validation: all three fields are required
    if (!orderId || !userId || !amount) {
        return res.status(400).json({ error: 'orderId, userId, and amount are required' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'amount must be a positive number' });
    }

    try {
        // 1. Save payment record with status Pending (Synchronous)
        const result = await pool.query(
            'INSERT INTO payments (order_id, user_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [orderId, userId, amount, 'Pending']
        );
        const newPayment = result.rows[0];

        // 2. Push to RabbitMQ for async processing (Asynchronous)
        await sendToQueue(newPayment);

        // 3. Respond immediately
        res.status(202).json({
            message: 'Payment received and is being processed',
            payment: newPayment
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ─── GET /payments ────────────────────────────────────────────────────────────
// Returns all payment records from PostgreSQL.
app.get('/payments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ─── GET /payments/:id ────────────────────────────────────────────────────────
// Returns a single payment record by its ID.
app.get('/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
    // Start the RabbitMQ consumer after the Express server is up
    startConsumer();
});