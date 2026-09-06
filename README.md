# 🧁 Sweet Bakery — Containerized Bakery Management System

A full-stack bakery management system built with **React.js, FastAPI, PostgreSQL, RabbitMQ, and Docker**.

The application allows bakery staff to manage products, customers, inventory, and orders through a simple web dashboard.

---

## 🌐 Live Demo

### Frontend

https://effervescent-kleicha-e9bd9b.netlify.app/

### Backend API

https://bakery-management-system-p36q.onrender.com

### GitHub Repository

https://github.com/adityakumarjha12/bakery-management-system

---

# 📌 Project Overview

The Sweet Bakery Management System is a containerized full-stack application designed to manage common bakery operations.

The system provides:

* Product management
* Customer management
* Inventory management
* Order management
* Order status tracking
* RabbitMQ-based asynchronous order processing
* Container health monitoring
* PostgreSQL database persistence
* Docker Compose orchestration

The project is deployed using **Netlify for the frontend** and **Render for the backend and PostgreSQL database**.

---

# ✨ Features

## 🧁 Product Management

* Add new bakery products
* View all products
* Search products
* Update product information
* Delete products
* Track product stock
* Display low-stock products

## 👥 Customer Management

* Add customers
* View customer information
* Store customer name, email, and phone number

## 🛒 Order Management

* Create new orders
* Automatically calculate order totals
* Prevent orders when stock is insufficient
* Automatically reduce product stock
* Track order status
* Update order status

Supported order statuses:

* Pending
* Preparing
* Ready
* Completed

## 📦 Inventory Management

The system automatically updates product stock when an order is placed.

Products with low stock can be identified from the inventory section.

---

# 🐇 RabbitMQ Order Processing

RabbitMQ is used to implement asynchronous order processing.

When an order is created:

1. The order is stored in PostgreSQL.
2. The backend publishes the order information to RabbitMQ.
3. The RabbitMQ worker receives the order.
4. The worker processes the order.
5. The worker acknowledges the message after successful processing.

Example worker output:

```text
Connected to RabbitMQ
Order worker is waiting for messages...
Processing order #4 for customer Test Customer
Product ID: 1, Quantity: 1, Total: ₹500.0
Order #4 processed successfully
```

This demonstrates the use of a **message queue and worker service** for asynchronous processing.

---

# ❤️ Container Health Monitoring

Health checks are configured for all major containers.

| Service    | Health Check                   |
| ---------- | ------------------------------ |
| PostgreSQL | `pg_isready`                   |
| Backend    | `/health` endpoint             |
| RabbitMQ   | `rabbitmq-diagnostics -q ping` |
| Worker     | RabbitMQ connection test       |
| Frontend   | Nginx HTTP check               |

Docker Compose automatically monitors the health of these services.

---

# 🚀 Advanced Features

This project implements two advanced Docker features:

### 1. RabbitMQ Worker Service

A dedicated worker container processes orders asynchronously through RabbitMQ.

### 2. Container Health Checks

All application containers include Docker health checks to verify that services are running correctly.

---

# 🖼️ Screenshots

## Dashboard

![Dashboard](screenshots/dashboard.png)

## Products

![Products](screenshots/products.png)

## Orders

![Orders](screenshots/orders.png)

## Docker Health Checks

![Docker Health Checks](screenshots/docker-health.png)

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* HTML
* CSS
* JavaScript

## Backend

* Python
* FastAPI
* SQLAlchemy
* Uvicorn

## Database

* PostgreSQL

## Message Queue

* RabbitMQ
* Pika

## Containerization

* Docker
* Docker Compose
* Nginx

## Deployment

* Netlify
* Render

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      Frontend       │
                         │    React + Vite     │
                         │      Nginx           │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Backend       │
                         │   FastAPI + Python  │
                         └───────┬───────┬─────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐              ┌──────────────────┐
          │    PostgreSQL    │              │    RabbitMQ      │
          │     Database     │              │   Message Queue  │
          └──────────────────┘              └────────┬─────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │  Worker Service  │
                                            │   Order Worker   │
                                            └──────────────────┘
```

---

# 🐳 Docker Architecture

The application consists of five Docker services:

```text
db
│
├── PostgreSQL database
│
backend
│
├── FastAPI application
│
rabbitmq
│
├── RabbitMQ message broker
│
worker
│
├── Processes orders from RabbitMQ
│
frontend
│
└── React application served using Nginx
```

All services communicate through a Docker bridge network named:

```text
bakery-network
```

PostgreSQL uses a persistent Docker volume:

```text
postgres_data
```

This ensures that database data is retained when the containers are restarted.

---

# 📁 Project Structure

```text
bakery-system/
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── worker.py
│   └── requirements.txt
│
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── dashboard.png
│   ├── products.png
│   ├── orders.png
│   └── docker-health.png
│
├── docker-compose.yml
├── netlify.toml
├── .gitignore
└── README.md
```

---

# 🐳 Docker Setup

## Prerequisites

Make sure Docker and Docker Compose are installed.

Check Docker:

```bash
docker --version
```

Check Docker Compose:

```bash
docker compose version
```

---

## Clone the Repository

```bash
git clone https://github.com/adityakumarjha12/bakery-management-system.git
```

Navigate into the project:

```bash
cd bakery-management-system
```

---

## Start the Application

Run:

```bash
docker compose up -d
```

Docker Compose starts:

* PostgreSQL
* FastAPI backend
* RabbitMQ
* RabbitMQ worker
* React frontend

---

## Check Containers

Run:

```bash
docker compose ps
```

All containers should show a healthy or running status.

---

## Access the Application

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

RabbitMQ Management Dashboard:

```text
http://localhost:15672
```

---

## Stop the Application

```bash
docker compose down
```

To remove containers and the associated database volume:

```bash
docker compose down -v
```

---

# 🔌 API Documentation

## Products

### List all products

```http
GET /products
```

### Create a product

```http
POST /products
```

Example:

```json
{
  "name": "Chocolate Cake",
  "price": 500,
  "stock": 10,
  "description": "Fresh chocolate cake",
  "category": "Cake"
}
```

### Update a product

```http
PUT /products/{product_id}
```

Example:

```json
{
  "name": "Chocolate Cake",
  "price": 550,
  "stock": 8,
  "description": "Fresh chocolate cake",
  "category": "Cake"
}
```

### Delete a product

```http
DELETE /products/{product_id}
```

---

# 👥 Customers

### List all customers

```http
GET /customers
```

### Create a customer

```http
POST /customers
```

Example:

```json
{
  "name": "Test Customer",
  "email": "test@example.com",
  "phone": "9876543210"
}
```

---

# 🛒 Orders

### Place an order

```http
POST /orders
```

Example:

```json
{
  "customer_id": 1,
  "product_id": 1,
  "quantity": 1
}
```

The backend automatically:

1. Checks product availability.
2. Calculates the total price.
3. Reduces product stock.
4. Creates the order.
5. Publishes the order to RabbitMQ.

---

### Get Order Status

```http
GET /orders/{order_id}/status
```

Example response:

```json
{
  "order_id": 3,
  "status": "Pending"
}
```

---

### Update Order Status

```http
PUT /orders/{order_id}/status
```

Example:

```json
{
  "status": "Preparing"
}
```

Allowed statuses:

```text
Pending
Preparing
Ready
Completed
```

---

# 🐇 RabbitMQ Worker Processing

The worker service runs:

```bash
python -u worker.py
```

The worker connects to the RabbitMQ service using the Docker service name:

```text
rabbitmq
```

Orders are placed into the:

```text
orders
```

queue.

The worker consumes messages from this queue and acknowledges successfully processed orders.

---

# ❤️ Health Checks

Docker Compose includes health checks for all services.

### PostgreSQL

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U bakery_user -d bakery"]
```

### Backend

The backend health check calls:

```text
/health
```

### RabbitMQ

```yaml
healthcheck:
  test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
```

### Worker

The worker checks whether it can establish a connection with RabbitMQ.

### Frontend

The frontend health check verifies that Nginx is responding on port 80.

---

# 🔐 Environment Variables

The production database connection uses the `DATABASE_URL` environment variable.

For Docker Compose, the backend connects to PostgreSQL using the internal Docker service name:

```text
postgresql://bakery_user:bakery_password@db:5432/bakery
```

Production credentials are not stored in the GitHub repository.

---

# 🧪 Testing

The application was tested using both the web interface and API endpoints.

### Product Testing

* Product creation
* Product listing
* Product update
* Product deletion
* Stock management

### Customer Testing

* Customer creation
* Customer retrieval

### Order Testing

* Order creation
* Total price calculation
* Stock reduction
* Order status retrieval
* Order status updates

### RabbitMQ Testing

Orders were successfully published to RabbitMQ and processed by the worker service.

### Docker Testing

All five containers were tested using:

```bash
docker compose ps
```

and confirmed to be running with health checks.

---

# 💡 Design Decisions

### PostgreSQL

PostgreSQL was selected as the relational database because bakery products, customers, and orders have structured relationships.

### FastAPI

FastAPI provides a lightweight and high-performance backend with automatic API documentation through Swagger UI.

### React

React was selected for building an interactive frontend dashboard with reusable components.

### Docker

Docker provides isolated and reproducible environments for every application component.

### Docker Compose

Docker Compose simplifies the management of multiple services and allows them to communicate through a shared Docker network.

### RabbitMQ

RabbitMQ was selected to demonstrate asynchronous order processing using a message queue and worker architecture.

### Persistent Volume

A PostgreSQL Docker volume is used so database data is not lost when containers are restarted.

---

# 🔮 Future Improvements

Possible future improvements include:

* Redis caching for product listings
* Authentication and role-based access
* Sales reports and analytics
* Invoice generation
* Payment integration
* Email/SMS order notifications
* Kubernetes deployment
* CI/CD pipeline
* Improved inventory forecasting

---

# 👨‍💻 Author

**Aditya Kumar Jha**

B.Tech — Computer Science & Engineering
Specialization: Cloud Computing and Virtualization
UPES — Batch 2022–2026

---
