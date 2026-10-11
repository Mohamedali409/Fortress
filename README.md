# 🛡️ Digital Fortress (ImpersonaGuard)

A robust, production-ready RESTful authentication and user management API built with **Node.js (ES Modules)**, **Express 5**, and **MongoDB**. Designed with high-standard security practices, strict input validation, rate limiting, and comprehensive testing.

---

## 🚀 Features

- **🔐 Secure Authentication**:
  - User Registration with salted password hashing (`bcryptjs`, 12 salt rounds).
  - Login with JWT token generation and storage in secure `HttpOnly` cookies.
  - Idempotent Logout with cookie clearance.
- **🛡️ Security & Hardening**:
  - **Login Rate Limiting**: Mitigates brute-force attacks by restricting repeated failed attempts per IP address.
  - **HttpOnly Cookies**: Protects against cross-site scripting (XSS) by preventing client-side JavaScript access to tokens.
  - **Strict CORS & Helmet**: Sets security headers and restricts cross-origin resource access.
  - **Request Body Limits**: Enforces a 10kb JSON body payload limit to prevent denial-of-service (DoS) attempts.
  - **Zod Validation**: Robust schema validation for all incoming requests.
- **👤 User Management**:
  - Protected endpoints (`/api/users/me`) requiring valid session cookies.
  - Excludes sensitive fields (passwords) from all API responses.
- **🩺 Health Check**:
  - Dedicated `/api/health` monitoring endpoint.
- **⚡ Graceful Shutdown**:
  - Listens for `SIGINT` / `SIGTERM` signals to cleanly close in-flight connections and disconnect from MongoDB.
- **🧪 Automated Tests**:
  - Comprehensive unit and integration test suite with mocked MongoDB layers using **Vitest** and **Supertest**.
- **📚 API Documentation**:
  - Full collections and schemas provided for **Postman**, **Swagger (OpenAPI 3.0)**, and **Bruno**.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Security**: [Helmet](https://helmetjs.github.io/), [CORS](https://www.npmjs.com/package/cors), [bcryptjs](https://www.npmjs.com/package/bcryptjs), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [express-rate-limit](https://express-rate-limit.mintlify.app/)
- **Testing**: [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest)

---

## 📁 Project Structure

```text
Digital Fortress/
├── docs/                               # API documentation & client collections
│   ├── postman_collection.json         # Postman collection (v2.1.0)
│   ├── swagger.json                    # OpenAPI 3.0.3 specification
│   └── bruno/                          # Bruno Git-native collection
│       ├── bruno.json
│       ├── collection.bru
│       ├── environments/
│       │   └── Local.bru
│       ├── Auth/
│       ├── Health/
│       └── Users/
├── src/
│   ├── app.js                          # Express app configuration & middlewares
│   ├── server.js                       # Server entry point & graceful shutdown
│   ├── config/
│   │   ├── auth-cookie.js              # Cookie configuration settings
│   │   └── db.js                       # MongoDB connection management
│   ├── middlewares/
│   │   ├── auth.middleware.js          # Route protection & JWT verification
│   │   ├── error.middleware.js         # Global error handling middleware
│   │   ├── login-rate-limit.middleware.js # Brute-force protection for login
│   │   └── validate.middleware.js     # Zod schema validation middleware
│   ├── modules/
│   │   ├── auth/                       # Auth routes, controllers, services, validations
│   │   └── users/                      # User routes, controllers, services, models, repos
│   └── utils/
│       ├── AppError.js                 # Custom operational error class
│       └── asyncHandler.js             # Async wrapper for route handlers
├── tests/                              # Test suites (server lifecycle & auth/user flows)
├── .env.example                        # Template for environment variables
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `PORT` | Port number the server listens on | `3000` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/digital_fortress` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | `your_super_secret_jwt_key` |
| `JWT_EXPIRES_IN`| Token lifespan | `15m` |
| `COOKIE_NAME` | Name of the authentication cookie | `access_token` |
| `COOKIE_SECURE` | Set `true` in production (requires HTTPS) | `false` |
| `COOKIE_SAME_SITE` | SameSite attribute for cookie (`strict`, `lax`, `none`) | `strict` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Madoo2414/ImpersonaGuard-.git
cd ImpersonaGuard-
npm install
```

### 2. Configure Environment
Set up your `.env` file:
```bash
cp .env.example .env
```
*(Update `JWT_SECRET` and `MONGODB_URI` according to your local environment).*

### 3. Run Development Server
Start the server in watch mode:
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 4. Run in Production
```bash
npm start
```

---

## 🧪 Testing

The project uses [Vitest](https://vitest.dev/) for unit and integration testing:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📖 API Endpoints & Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint | No |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate and issue session cookie | No (Rate-Limited) |
| `POST` | `/api/auth/logout` | Clear authentication cookie | No |
| `GET` | `/api/users/me` | Fetch authenticated user profile | Yes (`access_token` cookie) |

### Documentation Files (`docs/`)

- **Postman**:
  - Import `docs/postman_collection.json` into Postman to get pre-configured requests and responses.
- **Swagger / OpenAPI**:
  - Open `docs/swagger.json` in [Swagger Editor](https://editor.swagger.io/) or your preferred OpenAPI viewer.
- **Bruno**:
  - In Bruno, click **Open Collection** and select the `docs/bruno` folder to load the workspace directly.

---

## 📜 License

This project is licensed under the **ISC License**.
