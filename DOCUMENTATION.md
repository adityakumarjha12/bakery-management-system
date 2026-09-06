# Sweet Bakery — Bakery Management System

## Design Documentation

### 1. Project Overview

Sweet Bakery is a containerized bakery management system developed using Docker and Docker Compose.

The system provides a web-based interface for managing bakery products, customers, inventory, and orders. The application consists of multiple services including PostgreSQL, FastAPI backend, React frontend, RabbitMQ, and a background worker.

The main objective is to demonstrate containerization, multi-container networking, service orchestration, persistent storage, asynchronous order processing, and container health monitoring.

---

### 2. Project Objectives

The project was designed to:

* Containerize a multi-service bakery application.
* Deploy PostgreSQL as a database container.
* Provide REST APIs through a FastAPI backend.
* Provide a React-based frontend.
* Connect multiple services using Docker networking.
* Use Docker Compose to orchestrate all services.
* Implement asynchronous order processing using RabbitMQ and a worker.
* Implement health checks for all containers.
* Maintain persistent PostgreSQL data using Docker volumes.

---

### 3. System Architecture

The system contains five main Docker services:

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   Nginx Container   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │   Port 8000         │
                    └──────┬───────┬──────┘
                           │       │
                  ┌────────▼───┐   │
                  │ PostgreSQL │   │
                  │ Database   │   │
                  └────────────┘   │
                                   ▼
                         ┌─────────────────┐
                         │    RabbitMQ     │
                         │ Message Queue   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Order Worker   │
                         │    Python       │
                         └─────────────────┘
```

All Docker services are connected through the `bakery-network` bridge network.

---

### 4. Docker Services

| Service    | Technology       | Purpose                                  |
| ---------- | ---------------- | ---------------------------------------- |
| `db`       | PostgreSQL 16    | Stores products, customers, and orders   |
| `backend`  | FastAPI + Python | Provides REST APIs and application logic |
| `frontend` | React + Nginx    | Provides the web interface               |
| `rabbitmq` | RabbitMQ         | Handles asynchronous order messages      |
| `worker`   | Python + Pika    | Processes orders from RabbitMQ           |

---

### 5. PostgreSQL Database

PostgreSQL is deployed as a separate Docker container.

The database is configured using environment variables:

```text
POSTGRES_DB= bakery
POSTGRES_USER= bakery_user
POSTGRES_PASSWORD= bakery_password
```

A Docker named volume called `postgres_data` is used to persist database data.

This ensures that database data is not lost when the PostgreSQL container is restarted or recreated.

The backend connects to PostgreSQL through the Docker service name:

```text
db:5432
```

---

### 6. Backend Design

The backend is developed using FastAPI and Python.

It handles:

* Product management
* Customer management
* Order creation
* Order status management
* Database communication
* RabbitMQ message publishing

The backend is containerized using a Python 3.11 image and runs on port `8000`.

#### Main APIs

| Method | Endpoint                    | Purpose             |
| ------ | --------------------------- | ------------------- |
| GET    | `/products`                 | List all products   |
| POST   | `/products`                 | Add a product       |
| PUT    | `/products/{product_id}`    | Update a product    |
| DELETE | `/products/{product_id}`    | Delete a product    |
| GET    | `/customers`                | List customers      |
| POST   | `/customers`                | Add a customer      |
| POST   | `/orders`                   | Place an order      |
| GET    | `/orders/{order_id}/status` | Check order status  |
| PUT    | `/orders/{order_id}/status` | Update order status |

The required project functionality of listing products, placing orders, and checking order status is therefore supported.

---

### 7. Frontend Design

The frontend is developed using React and Vite.

It provides interfaces for:

* Dashboard
* Products
* Customers
* Orders
* Inventory
* Low-stock monitoring

The frontend is built into static files and served using an Nginx container.

The frontend communicates with the backend API to retrieve and modify application data.

---

### 8. RabbitMQ Order Processing

RabbitMQ is implemented as an advanced feature for asynchronous order processing.

When an order is successfully created:

1. The order is stored in PostgreSQL.
2. The backend publishes the order information to the RabbitMQ `orders` queue.
3. The worker receives the message.
4. The worker processes the order.
5. The worker acknowledges the message after successful processing.

Example processing flow:

```text
Customer places order
        ↓
FastAPI Backend
        ↓
PostgreSQL
        ↓
RabbitMQ "orders" Queue
        ↓
Order Worker
        ↓
Order Processed
```

This design separates order creation from background processing and demonstrates asynchronous communication between containers.

---

### 9. Container Health Checks

Health checks were implemented for all five services.

| Container  | Health Check                         |
| ---------- | ------------------------------------ |
| PostgreSQL | `pg_isready`                         |
| Backend    | Requests `/health` endpoint          |
| RabbitMQ   | `rabbitmq-diagnostics -q ping`       |
| Worker     | Tests RabbitMQ connection using Pika |
| Frontend   | Checks Nginx using `wget`            |

Docker Compose uses these health checks to determine whether services are ready.

For example, the backend waits for PostgreSQL to become healthy before starting.

---

### 10. Docker Compose Orchestration

Docker Compose is used to manage the complete application.

The Compose configuration defines:

* Five services
* Container builds
* Environment variables
* Port mappings
* Docker volumes
* Docker networks
* Service dependencies
* Health checks

The complete system can be started using:

```bash
docker compose up -d
```

The running containers can be checked using:

```bash
docker compose ps
```

The application can be stopped using:

```bash
docker compose down
```

---

### 11. Container Networking

All services are connected to the custom Docker bridge network:

```text
bakery-network
```

Docker service names are used for internal service communication.

For example, the backend connects to PostgreSQL using:

```text
db:5432
```

The worker connects to RabbitMQ using:

```text
rabbitmq
```

This avoids using hard-coded container IP addresses and allows Docker's internal DNS to resolve service names.

---

### 12. Design Decisions

#### Docker

Docker was selected to package each application component with its dependencies and provide a consistent execution environment.

#### Docker Compose

Docker Compose was selected because the project contains multiple related services that must run together.

#### PostgreSQL

PostgreSQL provides reliable relational storage for products, customers, and orders.

#### FastAPI

FastAPI was selected because it provides a lightweight and efficient framework for creating REST APIs in Python.

#### React and Nginx

React provides the interactive frontend, while Nginx efficiently serves the production frontend build.

#### RabbitMQ

RabbitMQ was selected to demonstrate asynchronous communication and background order processing.

#### Health Checks

Health checks improve reliability by allowing Docker Compose to determine whether individual services are functioning correctly.

#### Persistent Volume

A named PostgreSQL volume ensures that database information survives container restarts and recreation.

---

### 13. Testing and Verification

The application was tested using both Docker Compose and the REST API.

The following functionality was verified:

* PostgreSQL container starts successfully.
* Backend starts successfully after the database becomes healthy.
* Frontend container serves the React application.
* RabbitMQ starts and accepts connections.
* Worker connects successfully to RabbitMQ.
* Products can be created and retrieved.
* Customers can be created.
* Orders can be placed.
* Order status can be checked.
* Orders are published to RabbitMQ.
* Worker successfully processes RabbitMQ messages.
* All five containers report healthy status.

Example worker output:

```text
Connected to RabbitMQ
Order worker is waiting for messages...
Processing order #4 for customer Test Customer
Product ID: 1, Quantity: 1, Total: ₹500.0
Order #4 processed successfully
```

---

### 14. Project Structure

```text
bakery-system/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── worker.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
│
├── screenshots/
│   ├── dashboard.png
│   ├── products.png
│   ├── orders.png
│   └── docker-health.png
│
├── docker-compose.yml
├── README.md
└── DOCUMENTATION.md
```

---

### 15. Conclusion

The Sweet Bakery Management System demonstrates a complete multi-container application using Docker and Docker Compose.

The project satisfies the core containerization requirements by integrating PostgreSQL, FastAPI, React, RabbitMQ, and a background worker through Docker networking and Compose orchestration.

The two selected advanced features, RabbitMQ-based order processing and container health checks, further demonstrate practical container orchestration concepts and improve the reliability of the application.
