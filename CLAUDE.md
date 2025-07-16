# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EcoDeli is a green delivery platform for eco-friendly package delivery and services. The project uses a Vue.js frontend with a Node.js/Express backend connected to a MySQL database.

## Development Commands

### Initial Setup
```bash
# Install all dependencies
npm run install-all

# Set up database
# 1. Create MySQL database named 'ecodeli'
# 2. Configure api/.env with your database credentials
# 3. Run bdd.sql to create schema
```

### Running the Application
```bash
# Run all applications (API + Frontend + Admin Interface)
npm run dev

# Run only frontend + API (recommended for development)
npm run dev-frontend

# Run backend only (Express on port 3000)
cd api && npm run dev

# Run frontend only (Vite on port 5173)
cd frontend && npm run dev

# Run admin interface only (Vite on port 5174)
cd backend && npm run dev
```

### Application URLs
- **Frontend (Users)**: http://localhost:5173
- **Admin Interface**: http://localhost:5174  
- **API Backend**: http://localhost:3000

### Important Notes
- The project now includes 3 separate applications: API, Frontend, and Admin Interface
- All applications run on different ports to avoid conflicts
- No linting or testing commands are currently configured

## Architecture Overview

### Directory Structure
- `api/` - Express.js backend API
  - `app.js` - Server entry point
  - `config/db.js` - MySQL database connection
  - `controllers/` - Business logic (auth, users, deliveries, etc.)
  - `middleware/` - Authentication and validation
  - `routes/` - API endpoint definitions
  - `models/` - Currently empty, intended for data models

- `frontend/` - Vue.js 3 application (User Interface)
  - Standard Vite + Vue structure for end users
  - Includes 5 user spaces: Client, Livreur, Commerçant, Prestataire, Admin dashboard
  - Development server runs on port 5173

- `backend/` - Vue.js 3 Admin Interface
  - Dedicated administration panel for platform management
  - User management, moderation, reports, settings
  - Secure admin-only access with specialized authentication
  - Development server runs on port 5174

### Database Schema
The `bdd.sql` file contains a comprehensive schema with 30+ tables covering:
- User management (utilisateurs, roles, permissions)
- Delivery system (livraisons, colis, trajets)
- Service providers (prestataires, services)
- Payments and transactions
- Reviews and ratings

### API Structure
The backend follows MVC pattern with these main route groups:
- `/api/auth` - Authentication (login, register, logout)
- `/api/utilisateurs` - User CRUD operations
- `/api/roles` - Role management
- `/api/livreurs` - Delivery driver endpoints
- `/api/prestataires` - Service provider endpoints
- `/api/annonces` - Announcements/listings

### Authentication
- Session-based authentication using express-session
- Auth middleware in `api/middleware/auth.js`
- Role-based access control implemented

### Environment Configuration
Create `api/.env` file with:
```
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ecodeli
```

## Key Development Considerations

1. **Model Implementation**: The models directory is empty. When implementing models, follow the existing controller patterns for consistency.

2. **Frontend-Backend Communication**: 
   - API runs on http://localhost:3000
   - Frontend expects API at this address
   - CORS is configured in the backend

3. **Database Relationships**: The schema has extensive foreign key relationships. Pay attention to cascade rules when implementing delete operations.

4. **Missing Infrastructure**:
   - No test framework configured
   - No database migration system
   - No API documentation generation
   - No logging system implemented

5. **Code Style**: The existing code uses:
   - CommonJS modules in backend (`require`/`module.exports`)
   - ES modules in frontend (`import`/`export`)
   - Async/await for asynchronous operations
   - Express middleware pattern for request handling