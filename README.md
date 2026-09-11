# 🏡 Resimpli — Real Estate CRM & AI-Powered Lead Management Platform

[![Angular](https://img.shields.io/badge/Angular-21.2-dd0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Flash_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![AWS S3](https://img.shields.io/badge/AWS-S3_Storage-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)

A modern, full-stack Real Estate Customer Relationship Management (CRM) and deal management ecosystem designed for real estate investors, brokers, and wholesalers. **Resimpli** streamlines the entire property lifecycle — from acquiring and analyzing leads to managing buyer lists, document drives, email campaigns, and pipeline progression — accelerated by **Google Gemini AI** for automatic historical area analysis and property insights.

---

## 🌟 Key Features

### 1. 📊 Lead Management & Deal Pipeline
- **Lead Dashboard:** Centralized dashboard tracking active leads, estimated values, statuses, and property records.
- **Stage Progression:** Visual stage management and tracking from initial outreach to closing.
- **Lead Profile 360°:** Deep-dive lead page containing complete contact information, property data, assigned buyers, notes, and activity timeline.
- **Bulk Excel Import/Export:** Import and export hundreds of property leads with instant validation and status mapping via ExcelJS.

### 2. 🧠 AI-Powered Market & Property Intelligence
- **Google Gemini Integration:** Built-in integration with Google Gemini Flash model (`@google/genai`).
- **Area Historical Insights:** Auto-analyzes property locations and generates historical neighborhood trends, development patterns, and local market evolution.
- **Smart Fallback Engine:** Automatic fallbacks guarantee continuous summaries even in offline/rate-limited states.

### 3. 👥 Buyer Management (CRM)
- **Buyer Directory:** Organize qualified buyers, investment criteria, contact details, and purchasing budgets.
- **Deal Matching:** Link prospective buyers directly to lead properties and track transaction readiness.
- **Buyer Profiles:** Dedicated management interface for buyer interaction history and target areas.

### 4. 📁 Cloud Document Drive & Media Vault
- **Multi-Cloud Storage:** Flexible storage architecture with AWS S3 presigned URLs and MongoDB GridFS.
- **File Management:** Upload contracts, inspection reports, deed documents, and photos.
- **Bulk Download:** Fast zip archiving of deal files via `archiver`.

### 5. ✉️ Communication & Email Engine
- **In-App Email Hub:** Compose, send, and log emails directly within the CRM using Nodemailer.
- **Transactional Notifications:** Automated emails for password resets, status alerts, and client follow-ups.

### 6. 🔒 Enterprise-Grade Security & Authentication
- **Secure Auth:** JWT (JSON Web Tokens) with HS256 signatures and Bcrypt password hashing.
- **Route Protection:** Angular AuthGuard protecting sensitive client data on the client side.
- **Forgot & Reset Password:** Complete tokenized password recovery workflow.
- **API Documentation:** Interactive Swagger / OpenAPI documentation UI for developer onboarding.

---

## 🛠️ Architecture & Tech Stack

```
Resimpli /
├── BE/                   # Node.js & Express 5 Backend REST API
│   ├── api/v1/web/       # Route controllers (auth, lead, buyer, drive, email, stage)
│   ├── collections/      # Mongoose schemas & data models
│   ├── services/         # Business logic & 3rd-party integrations (Gemini AI, S3, Nodemailer)
│   ├── utilities/        # Helpers, JWT verification, validators (Joi)
│   └── server.js         # Express server entry point
│
├── FE/                   # Angular 21 Single Page Application
│   ├── src/app/
│   │   ├── core/         # Guards, interceptors, core services
│   │   ├── modules/      # Feature modules (dashboard, lead-profile, buyers, drive, email, auth)
│   │   └── shared/       # Reusable UI components, pipes, directives
│   └── src/index.html    # Web application root
│
└── docs/                 # Documentation & architectural diagrams
```

### Backend (`BE`)
- **Runtime:** Node.js (v18+) with Vite-Node / Nodemon
- **Framework:** Express 5 (`express: ^5.2.1`)
- **Database:** MongoDB with Mongoose (`mongoose: ^9.7.3`)
- **AI / LLM:** Google Gemini Flash (`@google/genai`)
- **Cloud Storage:** AWS SDK S3 (`@aws-sdk/client-s3`) & MongoDB GridFS (`multer-gridfs-storage`)
- **Email:** Nodemailer
- **Validation:** Joi
- **API Specs:** Swagger UI Express & swagger-jsdoc
- **Testing:** Vitest

### Frontend (`FE`)
- **Framework:** Angular 21 (`@angular/core: ^21.2.0`)
- **Component Architecture:** Standalone Components, Angular Signals & Reactive Forms
- **Styling:** Tailwind CSS v4 & Angular Material CDK
- **Data Export:** ExcelJS & FileSaver
- **Tooling:** Angular CLI, PostCSS, TypeScript 5.9

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.x` or later (v20+ recommended)
- **npm**: `v9.x` or later
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster connection string
- **Google Gemini API Key** (optional, for AI features)

---

### 1. Clone the Repository
```bash
git clone https://github.com/DIVYESH212/Resimpli.git
cd Resimpli
```

---

### 2. Backend Setup (`BE`)

1. Navigate to the backend directory:
   ```bash
   cd BE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `BE/` root:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/resimpli?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:4200

   # Authentication
   JWT_SECRET=your_jwt_secret_key_here
   JWT_KEY=your_jwt_key_here
   JWT_ALGO=HS256

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key_here

   # Email Configuration (SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com

   # AWS S3 Storage (Optional)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your_s3_bucket_name
   ```

4. Start the backend development server:
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:5000`.  
   Interactive API docs (Swagger): `http://localhost:5000/api-docs`

---

### 3. Frontend Setup (`FE`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd FE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

---

## 📖 API Endpoints Overview

| Area | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/v1/web/auth/login` | User login & JWT issuance |
| **Auth** | `POST` | `/api/v1/web/auth/signup` | Register new user account |
| **Auth** | `POST` | `/api/v1/web/auth/forgot-password` | Send password reset token |
| **Auth** | `POST` | `/api/v1/web/auth/reset-password` | Set new password with token |
| **Leads** | `GET` | `/api/v1/web/lead` | Paginated lead listing with filters |
| **Leads** | `POST` | `/api/v1/web/lead` | Create a new lead record |
| **Leads** | `GET` | `/api/v1/web/lead/:id` | Fetch detailed lead profile |
| **Leads** | `PUT` | `/api/v1/web/lead/:id` | Update lead status, price, notes |
| **Leads** | `DELETE` | `/api/v1/web/lead/:id` | Soft/hard delete lead |
| **Leads** | `GET` | `/api/v1/web/lead/:id/ai-summary` | Generate Gemini AI market analysis |
| **Leads** | `POST` | `/api/v1/web/lead/import-excel` | Bulk import leads from `.xlsx` |
| **Buyers** | `GET` | `/api/v1/web/buyer` | Fetch all registered buyers |
| **Buyers** | `POST` | `/api/v1/web/buyer` | Add new prospective buyer |
| **Drive** | `POST` | `/api/v1/web/drive/upload` | Upload documents to S3 / GridFS |
| **Drive** | `GET` | `/api/v1/web/drive/download/:id`| Download document / presigned URL |
| **Email** | `POST` | `/api/v1/web/email/send` | Send outbound email via SMTP |

---

## 🧪 Testing

### Backend Unit & Integration Tests (Vitest)
```bash
cd BE
npm test
```

### Frontend Tests (Vitest & Angular CLI)
```bash
cd FE
npm test
```

---

## 📦 Production Deployment

### Building the Frontend
```bash
cd FE
npm run build
```
The compiled production bundle will be generated in `FE/dist/fe/browser/`.

### Serving with Node.js / Docker
The backend serves the API endpoints and can be configured with reverse proxies like Nginx or deployed directly to AWS ECS, DigitalOcean, Heroku, or Render.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/DIVYESH212">Divyesh</a> for Real Estate Professionals.</sub>
</div>
