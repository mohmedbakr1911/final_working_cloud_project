# CloudExpress 🍔☁️  
**A Cloud-Native Microservices Food Delivery Marketplace**

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Microservices-blue" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue" />
  <img src="https://img.shields.io/badge/Broker-RabbitMQ-orange" />
  <img src="https://img.shields.io/badge/Containerized-Docker-blue" />
</p>

---

# 📑 Table of Contents

- [Project Vision](#-project-vision)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Microservices Overview](#-microservices-overview)
- [Technology Stack](#-technology-stack)
- [Database Design](#-database-design)
- [Multi-Tenancy Design](#-multi-tenancy-design)
- [RabbitMQ & Asynchronous Messaging](#-rabbitmq--asynchronous-messaging)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [Real-Time Features](#-real-time-features)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Cloud-Native Advantages](#-cloud-native-advantages)
- [Workflow for Final Demo](#-workflow-for-final-demo)
- [Future Improvements](#-future-improvements)
- [Conclusion](#-conclusion)

---

# 📌 Project Vision

CloudExpress is a scalable, cloud-native food delivery platform designed as a **multi-restaurant marketplace**. It enables multiple restaurants to independently manage their menus while allowing users to browse, order, and track food in real time.

The system is built using a **Microservices Architecture**, ensuring:

- High Scalability
- Fault Tolerance
- Service Isolation
- Independent Deployment
- Real-Time Communication
- Asynchronous Processing

The project demonstrates modern distributed system principles commonly used in production-grade cloud applications.

---

# ✨ Features

## 👤 User Features

- User Registration & Login
- JWT Authentication
- Browse Restaurants
- Browse Restaurant Menus
- Place Orders
- Real-Time Order Tracking

## 🛠️ Admin Features

- Create Restaurants
- Manage Menus
- Add/Update/Delete Menu Items
- Manage Restaurant Data

## ⚙️ System Features

- Distributed Microservices
- RabbitMQ Event-Driven Messaging
- Dockerized Deployment
- PostgreSQL Relational Storage
- Asynchronous Order Processing
- Centralized Queue Monitoring

---

# 🏗️ System Architecture

CloudExpress follows a **Microservices + Event-Driven Architecture**.

The system is divided into independent services communicating through HTTP APIs and RabbitMQ queues.

---

## 🔄 Architecture Flow

```text
+-------------------+
|     Frontend      |
+-------------------+
          |
          v
+-------------------+
|   User Service    |
| Authentication    |
+-------------------+
          |
          v
+-------------------+
| Restaurant Service|
| Menus & Tenancy   |
+-------------------+
          |
          v
+-------------------+
|   Order Service   |
| Order Management  |
+-------------------+
          |
          v
+-------------------+
|     RabbitMQ      |
|   order_queue     |
+-------------------+
          |
          v
+-------------------+
| Order Consumers   |
| Async Processing  |
+-------------------+
```

---

# 🔧 Microservices Overview

## 1️⃣ User Service

Responsible for:

- User Registration
- Login Authentication
- JWT Token Generation
- Role-Based Authorization

### Roles

| Role | Permissions |
|------|-------------|
| Admin | Manage restaurants and menus |
| Customer | Browse and place orders |

---

## 2️⃣ Restaurant Service

Responsible for:

- Restaurant Management
- Menu Management
- Multi-Tenant Data Isolation

### Key Responsibilities

- Each restaurant has independent menus
- Restaurant-specific data segregation
- CRUD operations for restaurants and menus

---

## 3️⃣ Order Service

Responsible for:

- Order Creation
- Order Persistence
- Queue Publishing
- Order Status Management

### Order Flow

1. Validate order
2. Save order into PostgreSQL
3. Publish event to RabbitMQ
4. Return immediate response
5. Process asynchronously

---

# 💻 Technology Stack

| Layer | Technology |
|-------|------------|
| Backend Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Message Broker | RabbitMQ |
| Authentication | JWT |
| Containerization | Docker |
| Orchestration | Docker Compose |
| API Communication | REST |
| Architecture Style | Microservices |

---

# 🗄️ Database Design

CloudExpress uses **PostgreSQL** as the primary relational database.

---

## 📋 Database Tables

### Users Table

| Column | Type |
|-------|------|
| id | UUID |
| email | VARCHAR |
| password | VARCHAR |
| role | VARCHAR |

---

### Restaurants Table

| Column | Type |
|-------|------|
| id | UUID |
| name | VARCHAR |
| owner_id | UUID |

---

### MenuItems Table

| Column | Type |
|-------|------|
| id | UUID |
| name | VARCHAR |
| price | DECIMAL |
| restaurant_id | UUID |

---

### Orders Table

| Column | Type |
|-------|------|
| id | UUID |
| user_id | UUID |
| restaurant_id | UUID |
| total_price | DECIMAL |
| status | VARCHAR |

---

# 🏢 Multi-Tenancy Design

CloudExpress supports a **Multi-Tenant Marketplace Model**.

Each restaurant operates independently while sharing the same infrastructure.

---

## 🔐 Tenant Isolation Strategy

Tenant isolation is achieved using:

```sql
restaurant_id
```

as a foreign key in all restaurant-related entities.

### Example

- Menu items belong to a specific restaurant
- Orders belong to a specific restaurant
- Queries filter by `restaurant_id`

---

## ✅ Benefits

- Efficient resource usage
- Simplified scaling
- Centralized infrastructure
- Secure logical separation

---

# 📨 RabbitMQ & Asynchronous Messaging

CloudExpress uses **RabbitMQ** to implement asynchronous communication between services.

---

# 🔄 Producer-Consumer Pattern

## Producer

The **Order Service** acts as a producer.

When a customer places an order:

1. Order is saved into PostgreSQL
2. Message is emitted to RabbitMQ
3. Queue name: `order_queue`

---

## Consumer

Consumers subscribe to the queue and process messages asynchronously.

Example operations:

- Order confirmation
- Notification sending
- Inventory updates
- Status tracking

---

## 📦 Queue Configuration

| Property | Value |
|----------|------|
| Queue Name | order_queue |
| Exchange Type | Direct |
| Delivery Mode | Persistent |

---

## ✅ Advantages of Asynchronous Messaging

### ⚡ Better Performance
The client receives a fast response without waiting for full processing.

### 🛡️ Fault Tolerance
Messages remain in the queue even if a consumer fails.

### 📈 Scalability
Consumers can scale independently.

### 🔄 Loose Coupling
Services are independent and easier to maintain.

---

# 🔌 API Endpoints

---

## 👤 Authentication APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /register | Register new user |
| POST | /login | Authenticate user |

---

## 🍔 Restaurant APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | /restaurants | Get all restaurants |
| POST | /restaurants | Create restaurant |
| GET | /restaurants/:id | Get restaurant details |

---

## 🍕 Menu APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | /menu/:restaurantId | Get restaurant menu |
| POST | /menu | Add menu item |
| PUT | /menu/:id | Update menu item |
| DELETE | /menu/:id | Delete menu item |

---

## 📦 Order APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /orders | Place new order |
| GET | /orders/:id | Get order details |
| GET | /orders/user/:id | Get user orders |

---

# 🔐 Authentication & Authorization

CloudExpress uses **JWT Authentication**.

---

## Authentication Flow

1. User logs in
2. JWT token generated
3. Token sent in headers

```http
Authorization: Bearer <token>
```

---

## Authorization

Role-based authorization controls access:

| Role | Access |
|------|--------|
| Admin | Restaurant management |
| Customer | Ordering functionality |

---

# 📡 Real-Time Features

CloudExpress supports:

- Real-Time Order Tracking
- Queue Monitoring
- Live RabbitMQ Dashboard Monitoring

---

## RabbitMQ Dashboard

Access RabbitMQ Management UI:

```text
http://localhost:15672
```

### Default Credentials

```text
Username: guest
Password: guest
```

---

# 🐳 Docker Deployment

CloudExpress is fully containerized using Docker.

---

# 🚀 Deployment Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/mohmedbakr1911/final_working_cloud_project.git
cd final_working_cloud_project
```

---

## 2️⃣ Setup Environment Variables

Create `.env` files inside each service.

Example:

```env
PORT=3000

DATABASE_URL=postgres://postgres:password@db:5432/cloudexpress

JWT_SECRET=super_secret_key

RABBITMQ_URL=amqp://rabbitmq
```

---

## 3️⃣ Build and Run Containers

```bash
docker-compose down -v

docker-compose up --build -d
```

---

## 4️⃣ Verify Running Containers

```bash
docker ps
```

---

## 5️⃣ Open Application

```text
http://localhost:8080
```

---

# 📂 Project Structure

```text
cloudexpress/
│
├── user-service/
├── restaurant-service/
├── order-service/
├── docker-compose.yml
├── rabbitmq/
├── postgres/
└── README.md
```

---

# ☁️ Cloud-Native Advantages

---

## 📈 Scalability

Each microservice scales independently.

Example:
- High order traffic → Scale Order Service only

---

## 🛡️ Fault Tolerance

If one service fails:
- Other services remain operational
- RabbitMQ preserves pending messages

---

## 🔒 Isolation

Services are isolated:
- Easier maintenance
- Independent deployment
- Reduced system coupling

---

## ⚡ Performance

Asynchronous processing improves response times and system throughput.

---

## 🔄 Continuous Deployment Ready

The architecture supports:
- CI/CD Pipelines
- Kubernetes Migration
- Cloud Hosting

---

# 🎬 Workflow for Final Demo

---

# ✅ Fresh Start

```bash
docker-compose down -v

docker-compose up --build -d
```

---

# ✅ Verification

## Check Containers

```bash
docker ps
```

---

## Open Application

```text
http://localhost:8080
```

---

## Open RabbitMQ Dashboard

```text
http://localhost:15672
```

### Login

```text
Username: guest
Password: guest
```

---

# 🎤 Live Demonstration

---

## 1️⃣ Public Access

- Browse restaurants
- View menus
- Explore marketplace

---

## 2️⃣ Admin Demonstration

- Login as Admin
- Create new restaurant
- Add Pizza item to menu

---

## 3️⃣ User Demonstration

- Register new account
- Login
- Add Pizza to cart

---

## 4️⃣ The Grand Finale 🚀

Click:

```text
Place Order
```

Immediately switch to RabbitMQ Dashboard and show:

```text
order_queue
```

Explain:

> "The order has been persisted in PostgreSQL and emitted to RabbitMQ for asynchronous processing. This demonstrates scalability, resilience, and event-driven communication in distributed systems."

---

# 🔮 Future Improvements

- API Gateway Integration
- Kubernetes Deployment
- Distributed Tracing
- Payment Gateway Integration
- Notification Service
- Rate Limiting
- Monitoring & Logging Stack
- CI/CD Pipeline

---

# 📚 Academic Concepts Demonstrated

This project demonstrates:

- Distributed Systems
- Microservices Architecture
- Event-Driven Systems
- Asynchronous Messaging
- Containerization
- Cloud-Native Design
- Multi-Tenancy
- RESTful APIs
- Authentication & Authorization

---

# 👨‍💻 Authors

Graduation Project developed by:

- Mohamed Bakr Abas Hamza
- 

---

# 📜 License

This project is developed for academic and educational purposes.

---

# ✅ Conclusion

CloudExpress represents a modern cloud-native food delivery marketplace built using microservices and asynchronous communication patterns.

The project highlights real-world backend engineering concepts including:

- Scalability
- Fault Tolerance
- Distributed Architecture
- Event-Driven Processing
- Containerized Deployment

It serves as a strong demonstration of modern software engineering and cloud computing principles suitable for enterprise-grade applications.