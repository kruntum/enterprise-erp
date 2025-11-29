# 🧙‍♂️ Ultimate Enterprise ERP Generation Prompt

นี่คือ Prompt ฉบับสมบูรณ์ที่คุณสามารถนำไปสั่ง AI (เช่น Claude 3.5 Sonnet, GPT-4) เพื่อให้สร้างโปรเจกต์ Enterprise ERP แบบที่เราทำกันมาทั้งหมดได้ในคำสั่งเดียวครับ

---

**Copy ข้อความด้านล่างนี้ไปสั่ง AI:**

---

**Role:** Act as an expert Full-Stack Developer and System Architect.

**Objective:** Create a complete, production-ready **Enterprise ERP System** boilerplate that is containerized and ready to run.

**📂 Project Structure:**

- Root directory containing `docker-compose.yml` and `README.md`.
- `backend/`: Spring Boot application.
- `frontend/`: React Vite application.

**🛠️ Technology Stack:**

- **Backend:** Java 17, Spring Boot 3.2+, Spring Security, Spring Data JPA, PostgreSQL Driver, Lombok, JJWT (for JWT), SpringDoc OpenAPI (Swagger).
- **Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, Lucide React (icons).
- **Database:** PostgreSQL 16.
- **DevOps:** Docker, Docker Compose.

**⚡ Core Features & Requirements:**

1.  **Docker & Infrastructure:**

    - Create a `docker-compose.yml` with 4 services:
      - `database`: PostgreSQL (port 5432).
      - `pgadmin`: PgAdmin 4 (port 5050).
      - `backend`: Spring Boot (port **8099**).
      - `frontend`: React/Nginx (port **8098**).
    - Configure networks and volumes for data persistence.

2.  **Backend Implementation:**

    - **Architecture:** Use Controller-Service-Repository pattern.
    - **Security:** Implement stateless JWT Authentication.
      - Public endpoints: `/api/auth/**`, `/v3/api-docs/**`, `/swagger-ui/**`, `/`.
      - Secure all other endpoints.
    - **RBAC (Role-Based Access Control):**
      - Models: `User`, `Role`, `Permission`.
      - Relationships: Users <-> Roles <-> Permissions.
    - **Dynamic Menu System:**
      - Model: `Menu` (label, path, icon, parent_id, sort_order, permission_required).
      - API: `/api/menus` to fetch the menu tree based on the authenticated user's permissions.
    - **Data Seeding (`DataSeeder.java`):**
      - On startup, check if data exists. If not, create:
        - **Roles:** `ROLE_ADMIN`, `ROLE_HR`, `ROLE_USER`.
        - **Users:** `admin` (pass: password), `hr`, `user`.
        - **Menus:** Dashboard, User Management, Settings, etc.
    - **API Documentation:**
      - Integrate **SpringDoc OpenAPI**.
      - Enable Swagger UI at `http://localhost:8099/swagger-ui.html`.
      - Configure JWT security scheme in Swagger so I can authorize via the UI.
    - **Root Endpoint:**
      - `GET /` returns `{"status": "running", "message": "..."}`.

3.  **Frontend Implementation:**

    - **Setup:** Initialize with Vite.
    - **Authentication:**
      - Login Page: Modern, professional UI with Tailwind CSS.
      - Logic: Store JWT in localStorage. Use Axios interceptor to attach `Authorization: Bearer <token>` to requests.
    - **Layout:**
      - Create a `MainLayout` with a **Dynamic Sidebar** that renders items fetched from the Backend Menu API.
      - Include a Navbar with User Profile and Logout.
    - **Pages:**
      - **Dashboard:** Welcome page.
      - **User Management:** A CRUD page to list users (mock or real).
    - **Routing:** Use `react-router-dom` with Protected Routes (redirect to login if not authenticated).

4.  **Configuration:**

    - **Backend:** `application.yml` configured for Docker environment (datasource url: `jdbc:postgresql://database:5432/...`).
    - **Frontend:** `vite.config.js` and `nginx.conf` configured to proxy `/api` requests to the backend service.

5.  **Deliverables:**
    - Provide the full file content for all critical files (`pom.xml`, `package.json`, `Dockerfile`, Java classes, React components).
    - Create a beautiful `README.md` with setup instructions, default credentials, and project structure.

**Tone & Quality:**

- Code must be clean, modular, and follow best practices.
- Ensure the UI looks premium and modern (use gradients, shadows, rounded corners).
- The system must be runnable immediately with `docker-compose up --build`.

---
