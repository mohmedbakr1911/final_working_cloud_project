# Food Delivery System - Cloud Computing 2026

## 1. Project Overview
This project is a scalable, microservice-based Food Delivery System designed to connect customers, restaurants, and delivery personnel. The system architecture focuses on high availability, loose coupling, and containerized deployment using modern DevOps tools[cite: 1].

## 2. Microservices Architecture
The system is divided into at least three independent services that communicate via HTTP APIs[cite: 1]:

*   **User Management Service**: Handles registration and profiles for customers and delivery personnel[cite: 1].
*   **Restaurant Service**: Manages restaurant data, menus, and real-time item availability[cite: 1].
*   **Order Service**: Responsible for order creation, status tracking, and communicating with the Restaurant Service to verify availability[cite: 1].
*   **Database**: A PostgreSQL instance utilized for persistent storage across services[cite: 1].

## 3. General Requirements Met
*   **Linux Hosting**: The project is developed and hosted on a Linux distribution[cite: 1].
*   **Containerization**: 
    *   Each service (User, Restaurant, Order) is containerized using custom, optimized Docker images[cite: 1].
    *   The application uses at least three different custom images[cite: 1].
*   **Multi-Environment Support**: 
    *   **Development**: Managed via `docker-compose.yml` for local integration testing[cite: 1].
    *   **Production/Orchestration**: Managed via Kubernetes manifests for scaling and reliability[cite: 1].
*   **Orchestration**: Services are deployed and managed using Kubernetes (Minikube), ensuring efficient orchestration[cite: 1].

## 4. Setup and Installation

### Local Development (Docker-Compose)
To spin up the entire application stack locally:
```bash
docker-compose up --build

User Service: http://localhost:3001

Restaurant Service: http://localhost:3002

Order Service: http://localhost:3003



## Production Deployment (Kubernetes)