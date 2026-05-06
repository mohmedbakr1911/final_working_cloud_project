# CloudExpress 🍔☁️  
**A Cloud-Native Microservices Food Delivery Marketplace**

## 📌 Project Vision
CloudExpress is a scalable, cloud-native food delivery platform designed as a **multi-restaurant marketplace**. It enables multiple restaurants to independently manage their menus while allowing users to browse, order, and track food in real time.

The system is built using a **microservices architecture**, ensuring high scalability, resilience, and modularity—key characteristics of modern distributed systems.

---

## 🏗️ System Architecture

CloudExpress follows a **Microservices + Event-Driven Architecture**:

- **User Service**
  - Handles authentication (JWT-based)
  - Manages user roles (Admin / Customer)

- **Restaurant Service**
  - Supports multi-tenant restaurant management
  - Each restaurant has its own menu and data isolation

- **Order Service**
  - Handles order creation
  - Publishes order events asynchronously

- **RabbitMQ (Message Broker)**
  - Decouples services
  - Enables asynchronous processing via queues

### 🔄 Flow Overview

1. User authenticates via User Service
2. User browses restaurants via Restaurant Service
3. User places order → Order Service
4. Order is:
   - Stored in PostgreSQL
   - Published to RabbitMQ (`order_queue`)
5. Consumers process orders asynchronously

---

## 🗄️ Database Design

Relational schema using **PostgreSQL**:

### Tables:

- **Users**
  - `id`, `email`, `password`, `role`

- **Restaurants**
  - `id`, `name`, `owner_id`

- **MenuItems**
  - `id`, `name`, `price`, `restaurant_id`

- **Orders**
  - `id`, `user_id`, `restaurant_id`, `status`

### 🏢 Multi-Tenancy Strategy

- Achieved using `restaurant_id` as a foreign key
- Each restaurant operates independently
- Data isolation is enforced at query level

---

## 📨 Asynchronous Messaging (RabbitMQ)

CloudExpress uses the **Producer-Consumer Pattern**:

- **Producer**: Order Service
  - Sends messages to `order_queue` when an order is placed

- **Consumer**:
  - Listens to queue
  - Processes order (e.g., update status, notify systems)

### ✅ Benefits:

- Non-blocking operations
- Improved system responsiveness
- Fault tolerance (queue persists messages)

---

## 🚀 Deployment Guide

### 1. Clone Repository

```bash
git clone https://github.com/mohmedbakr1911/final_working_cloud_project.git