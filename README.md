# 🏢 Enterprise ERP System

ยินดีต้อนรับสู่โปรเจกต์ **Enterprise ERP System**! นี่คือระบบบริหารจัดการทรัพยากรองค์กรแบบ Full-Stack ที่พัฒนาด้วยเทคโนโลยีที่ทันสมัย พร้อมระบบจัดการสิทธิ์ (RBAC) และเมนูแบบไดนามิก

---

## ✨ ฟีเจอร์หลัก (Key Features)

- **🔐 Authentication & Security**: ระบบล็อกอิน/ลงทะเบียนที่ปลอดภัยด้วย **JWT (JSON Web Token)**
- **🛡️ Dynamic RBAC**: ระบบจัดการสิทธิ์ตามบทบาท (Role-Based Access Control) ที่ยืดหยุ่นและปรับเปลี่ยนได้
- **📑 Dynamic Menu Management**: เมนูข้าง (Sidebar) ที่ปรับเปลี่ยนตามสิทธิ์ของผู้ใช้งานแต่ละคน
- **👥 User Management**: ระบบบริหารจัดการผู้ใช้งาน (CRUD)
- **✅ Form Validation**: ระบบตรวจสอบความถูกต้องของข้อมูลแบบ Real-time ด้วย Zod + React Hook Form
- **📄 API Documentation**: เอกสาร API ครบถ้วนด้วย **Swagger UI / OpenAPI**
- **🐳 Dockerized**: พร้อมใช้งานทันทีด้วย Docker Compose (Frontend, Backend, Database, PgAdmin)
- **🌱 Automatic Seeding**: ระบบสร้างข้อมูลเริ่มต้นอัตโนมัติ (Roles, Users, Menus) เมื่อเริ่มระบบครั้งแรก

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Backend

- ☕ **Java 17**
- 🍃 **Spring Boot 3.2.3**
- 🔒 **Spring Security** (JWT)
- 🗄️ **Spring Data JPA** (Hibernate)
- 🐘 **PostgreSQL**
- 📝 **SpringDoc OpenAPI** (Swagger)

### Frontend

- ⚛️ **React** (Vite)
- 🎨 **Tailwind CSS** + **shadcn/ui** (Component Library)
- 🛣️ **React Router**
- 📡 **Axios**
- 🔍 **Zod** (Schema Validation)
- 📝 **React Hook Form** (Form State Management)
- 🔔 **Sonner** (Toast Notifications)

### DevOps & Tools

- 🐳 **Docker & Docker Compose**
- 🐬 **PgAdmin 4** (Database Management)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```
enterprise-erp/
├── 📂 backend/                 # Spring Boot Application
│   ├── 📂 src/main/java/       # Source Code (Controllers, Models, Services)
│   ├── 📂 src/main/resources/  # Configuration (application.yml)
│   └── 📄 Dockerfile           # Backend Docker Configuration
├── 📂 frontend/                # React Application
│   ├── 📂 src/                 # React Components & Pages
│   ├── 📄 vite.config.js       # Vite Configuration
│   ├── 📄 nginx.conf           # Nginx Configuration
│   └── 📄 Dockerfile           # Frontend Docker Configuration
├── 📄 docker-compose.yml       # Docker Orchestration
└── 📄 README.md                # Project Documentation
```

---

## 🚀 วิธีการใช้งาน (Getting Started)

### 1. Prerequisites

ต้องติดตั้งโปรแกรมเหล่านี้ในเครื่องก่อน:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Run Application

เปิด Terminal ในโฟลเดอร์โปรเจกต์และรันคำสั่ง:

```bash
docker-compose up -d --build
```

รอสักครู่เพื่อให้ Container ทั้งหมดเริ่มทำงาน (Backend อาจใช้เวลาประมาณ 1-2 นาทีในการเริ่มและสร้างฐานข้อมูล)

---

## 🌐 ช่องทางการเข้าถึง (Access Points)

| Service            | URL                                                                            | Description                      |
| :----------------- | :----------------------------------------------------------------------------- | :------------------------------- |
| **💻 Frontend**    | [http://localhost:8098](http://localhost:8098)                                 | หน้าเว็บหลักของระบบ              |
| **⚙️ Backend API** | [http://localhost:8099](http://localhost:8099)                                 | API Server (Root path แสดงสถานะ) |
| **📖 API Docs**    | [http://localhost:8099/swagger-ui.html](http://localhost:8099/swagger-ui.html) | คู่มือ API (Swagger UI)          |
| **🐬 PgAdmin**     | [http://localhost:5050](http://localhost:5050)                                 | เครื่องมือจัดการฐานข้อมูล        |

---

## 🔑 ข้อมูลเข้าระบบเริ่มต้น (Default Credentials)

เมื่อรันระบบครั้งแรก ระบบจะสร้างข้อมูลผู้ใช้งานและสิทธิ์ต่างๆ ให้โดยอัตโนมัติ:

### 👤 Users

| Role      | Username | Password   |
| :-------- | :------- | :--------- |
| **Admin** | `admin`  | `password` |
| **HR**    | `hr`     | `password` |
| **User**  | `user`   | `password` |

### 🐬 PgAdmin

- **Email**: `admin@admin.com`
- **Password**: `root`

---

## 📚 API Documentation

เราใช้ **Swagger UI** ในการทำเอกสาร API ซึ่งคุณสามารถ:

1.  เข้าไปที่ [http://localhost:8099/swagger-ui.html](http://localhost:8099/swagger-ui.html)
2.  กดปุ่ม **Authorize** (มุมขวาบน)
3.  ใส่ **JWT Token** (ได้จากการ Login ผ่าน API `/api/auth/signin`)
4.  ทดสอบยิง API ต่างๆ ได้ทันที!

---

---

## ✅ Form Validation

ระบบใช้ **Zod + React Hook Form** สำหรับการตรวจสอบความถูกต้องของข้อมูลในทุกหน้า Management:

### เทคโนโลยี

- **Zod**: Schema-based validation library
- **React Hook Form**: Performant form state management
- **@hookform/resolvers**: Integration bridge

### ฟีเจอร์

- ✅ **Real-time Validation**: ตรวจสอบข้อมูลทันทีขณะพิมพ์
- ✅ **Inline Error Messages**: แสดง error ใต้ field ที่มีปัญหา
- ✅ **Centralized Schemas**: กำหนด validation rules ในที่เดียว (`frontend/src/schemas/index.js`)
- ✅ **Pattern Enforcement**: บังคับรูปแบบข้อมูล (เช่น Role ต้องเป็นตัวพิมพ์ใหญ่, Permission ต้องขึ้นต้นด้วย CAN\_)
- ✅ **Consistent UX**: พฤติกรรมเหมือนกันทุกหน้า

### Validation Rules

| Page       | Field    | Rule                                                   |
| ---------- | -------- | ------------------------------------------------------ |
| User       | Username | 3-50 chars, alphanumeric + underscore                  |
| User       | Email    | Valid email format                                     |
| User       | Password | Min 8 characters                                       |
| Role       | Name     | Uppercase with underscores (e.g., ROLE_ADMIN)          |
| Permission | Name     | Must start with CAN\_, uppercase (e.g., CAN_VIEW_USER) |
| Menu       | Path     | Must start with /, lowercase only                      |

---

## 📝 หมายเหตุ (Notes)

- **Port 8099**: Backend API ถูกตั้งค่าให้รันที่พอร์ต `8099` (แก้ไขจาก default 8080)
- **Port 8098**: Frontend ถูกตั้งค่าให้รันที่พอร์ต `8098` (แก้ไขจาก default 3000/80)
- หากต้องการแก้ไข Port สามารถทำได้ที่ไฟล์ `docker-compose.yml`, `backend/src/main/resources/application.yml`, และ `frontend/vite.config.js`

---

พัฒนาด้วย ❤️ โดย **Antigravity** & **You**
