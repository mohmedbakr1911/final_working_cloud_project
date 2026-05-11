DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer'
);

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INT REFERENCES users(id)
);

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id),
    user_id INT REFERENCES users(id),
    item_id INT REFERENCES menu_items(id),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    amount      NUMERIC(10, 2) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Seed Data: Create two different restaurants
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin') ON CONFLICT DO NOTHING;

INSERT INTO restaurants (name, description) VALUES 
('Burger King', 'Flame-grilled burgers and fries'),
('Pizza Hut', 'Hand-tossed pizzas and wings');