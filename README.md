# Enterprise ERP System

This project is a full-stack Enterprise ERP system generated with Spring Boot (Backend) and React (Frontend).

## Prerequisites

- Docker and Docker Compose installed on your machine.

## How to Run

1.  Open a terminal in the `enterprise-erp` directory.
2.  Run the following command to build and start the services:
    ```bash
    docker-compose up --build
    ```
3.  Wait for the containers to start. The backend might take a minute to initialize and connect to the database.

## Accessing the Application

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)

## Default Credentials (To be created manually via API or DB for now)

Since the database is empty on first run, you will need to register a user via the Signup API or insert data directly.

**Quick Signup:**
Use Postman or curl to register an admin user:

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "password123",
    "role": ["admin"]
  }'
```

Then login at [http://localhost:3000/login](http://localhost:3000/login) with `admin` / `password123`.

## Project Structure

- `backend/`: Spring Boot application
- `frontend/`: React Vite application
- `docker-compose.yml`: Orchestration file
