# Recovery Backend API

Node.js/Express REST API for the multi-tenant rehab facility management system.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ running (see `../database/README.md`)
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run database migrations (ensure database is created first)
cd ../database
psql recover_backend < schema.sql
psql recover_backend < seed.sql
cd ../api

# Start development server
npm run dev
```

The API will start on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── config/
│   └── env.ts              # Environment configuration
├── database/
│   └── pool.ts             # PostgreSQL connection pool
├── middleware/
│   ├── auth.ts             # Authentication & authorization
│   ├── errorHandler.ts     # Global error handling
│   └── validate.ts         # Request validation
├── controllers/
│   ├── auth.controller.ts  # Login, registration, tokens
│   └── patients.controller.ts # Patient CRUD operations
├── routes/
│   ├── auth.routes.ts      # Authentication endpoints
│   └── patients.routes.ts  # Patient endpoints
├── services/
│   └── ...                 # Business logic (to be added)
├── utils/
│   ├── auth.ts             # JWT, bcrypt, key generation
│   └── logger.ts           # Winston logger
├── types/
│   └── index.ts            # TypeScript interfaces
└── server.ts               # Express app & server setup
```

## 🔐 Authentication

### Flow Overview

1. **Staff Login**
   - Staff logs in with email/password
   - Receives JWT access token (15 min) + refresh token (7 days)

2. **Patient Registration**
   - Staff creates patient profile in desktop app
   - System generates registration key (e.g., `REC7-K9M2-P4N8`)
   - Key expires in 48 hours
   - Patient downloads mobile app, enters key, sets password
   - Patient account activated

3. **Patient Login**
   - Patient logs in with email/password
   - Receives JWT tokens

### Authentication Endpoints

```bash
# Staff Login
POST /api/v1/auth/staff/login
{
  "email": "dr.martinez@hoperecovery.com",
  "password": "Counselor123!"
}

# Validate Registration Key
POST /api/v1/auth/validate-key
{
  "registration_key": "REC7-K9M2-P4N8"
}

# Patient Registration
POST /api/v1/auth/patient/register
{
  "registration_key": "REC7-K9M2-P4N8",
  "password": "SecurePassword123!"
}

# Patient Login
POST /api/v1/auth/patient/login
{
  "email": "john.doe@email.com",
  "password": "Patient123!"
}

# Refresh Access Token
POST /api/v1/auth/refresh-token
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Logout
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

## 📋 Patient Management Endpoints

All require authentication (`Authorization: Bearer <token>`)

```bash
# Create Patient (Staff only)
POST /api/v1/patients
{
  "facility_id": "uuid",
  "assigned_counselor_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1985-03-15",
  "phone": "(555) 123-4567",
  "email": "john.doe@email.com",
  "admission_date": "2024-11-21",
  "sobriety_date": "2024-11-21",
  "substances_of_choice": ["alcohol", "cocaine"],
  "emergency_contact_name": "Mary Doe",
  "emergency_contact_phone": "(555) 123-4568",
  "emergency_contact_relationship": "Spouse"
}

Response:
{
  "success": true,
  "patient": { ... },
  "registration_key": "REC7-K9M2-P4N8",
  "key_expires_at": "2024-11-23T10:30:00Z"
}

# Get All Patients (Staff only, facility-scoped)
GET /api/v1/patients?status=active&page=1&limit=50&search=john

# Get Patient by ID
GET /api/v1/patients/:id

# Get Patient Dashboard (for counselor view)
GET /api/v1/patients/:id/dashboard

Response:
{
  "success": true,
  "data": {
    "patient": { ... },
    "recent_check_ins": [ ... ],
    "recent_cravings": [ ... ],
    "active_goals": [ ... ]
  }
}

# Update Patient
PUT /api/v1/patients/:id
{
  "assigned_counselor_id": "uuid",
  "status": "active",
  "expected_discharge_date": "2025-02-01"
}

# Delete Patient (soft delete)
DELETE /api/v1/patients/:id

# Regenerate Registration Key
POST /api/v1/patients/:id/regenerate-key

Response:
{
  "success": true,
  "registration_key": "HOP3-N7B4-Q2K9",
  "key_expires_at": "2024-11-23T10:30:00Z"
}
```

## 🔒 Authorization Levels

### User Roles

- `super_admin` - Full system access, manages facilities
- `facility_admin` - Manages facility, staff, and patients
- `counselor` - Manages assigned patients
- `case_manager` - Manages assigned patients
- `therapist` - Manages assigned patients
- `nurse` - Read-only access to assigned patients

### Middleware

```typescript
// Require authentication
authenticate

// Require specific role(s)
requireRole(UserRole.SUPER_ADMIN, UserRole.FACILITY_ADMIN)

// Require staff account
requireStaff

// Require patient account
requirePatient

// Require same facility (staff can only access their facility's data)
requireSameFacility

// Require patient accessing own data OR their assigned counselor
requirePatientOrCounselor
```

## 🛡️ Security Features

### Password Security
- Bcrypt hashing (cost factor 10)
- Minimum 8 characters required
- Failed login attempt tracking
- Account lockout after 5 failed attempts (15 min)

### Registration Keys
- Cryptographically secure random generation
- One-time use only
- 48-hour expiration
- Bcrypt hashed in database
- Cannot be regenerated after use

### JWT Tokens
- Access token: 15 minutes
- Refresh token: 7 days
- Stored in sessions table for revocation
- Token rotation on refresh

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to all `/api/` routes

### CORS
- Configurable allowed origins
- Credentials support for cookies

### Headers
- Helmet.js for security headers
- CSP in production

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [  // Only for validation errors
    {
      "field": "email",
      "message": "Valid email required"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test -- --watch
```

## 📝 Development

### Adding New Endpoints

1. **Create controller** in `src/controllers/`
2. **Create route** in `src/routes/`
3. **Add validation** using `express-validator`
4. **Import route** in `src/server.ts`
5. **Update types** in `src/types/index.ts`

Example:

```typescript
// src/controllers/example.controller.ts
export const getExample = async (req: AuthenticatedRequest, res: Response) => {
  const result = await query('SELECT * FROM table WHERE id = $1', [req.params.id]);
  res.json({ success: true, data: result.rows[0] });
};

// src/routes/example.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as exampleController from '../controllers/example.controller';

const router = Router();
router.get('/:id', authenticate, asyncHandler(exampleController.getExample));
export default router;

// src/server.ts
import exampleRoutes from './routes/example.routes';
app.use(`${API_PREFIX}/examples`, exampleRoutes);
```

### Database Queries

Always use parameterized queries to prevent SQL injection:

```typescript
// ✅ GOOD
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ BAD
const result = await query(`SELECT * FROM users WHERE id = '${userId}'`);
```

Use transactions for multiple related queries:

```typescript
await transaction(async (client) => {
  await client.query('INSERT INTO table1 VALUES ($1)', [value1]);
  await client.query('UPDATE table2 SET column = $1', [value2]);
});
```

## 🔍 Logging

Logs are written to:
- Console (always)
- `logs/api.log` (production)
- `logs/api-error.log` (errors only, production)

Log levels: `error`, `warn`, `info`, `debug`

```typescript
import logger from './utils/logger';

logger.info('User logged in', { user_id, email });
logger.error('Database error', { error, query });
logger.debug('Processing request', { params: req.params });
```

## 🌐 WebSocket (Socket.io)

Connected at: `ws://localhost:3000/api/v1/socket`

Events:
- `connect` - Client connected
- `authenticate` - Client authentication
- `disconnect` - Client disconnected
- `new_message` - New message received
- `patient_check_in` - Patient checked in (for staff)
- `crisis_alert` - Emergency alert

TODO: Full implementation in progress

## 🚢 Deployment

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db?ssl=true
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
```

### Recommended Hosting

- **API**: Railway, Render, DigitalOcean App Platform, AWS ECS
- **Database**: Supabase, Railway, AWS RDS, DigitalOcean Managed PostgreSQL
- **Files (S3)**: AWS S3, DigitalOcean Spaces, Cloudflare R2

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-21T10:30:00Z",
  "uptime": 12345.67,
  "environment": "production",
  "database": "connected"
}
```

## 🐛 Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify firewall/network settings
- Check connection pool settings

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure user exists and is active
- Check failed login attempts

### CORS Errors
- Add frontend URL to `CORS_ORIGIN` in `.env`
- Ensure `CORS_CREDENTIALS=true` if using cookies

## 📚 TODO

- [ ] Implement messaging endpoints
- [ ] Implement document upload/download
- [ ] Implement goals management
- [ ] Implement facility management
- [ ] Implement staff management
- [ ] Complete WebSocket real-time features
- [ ] Add comprehensive test coverage
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement audit logging middleware
- [ ] Add email notifications
- [ ] Add push notifications (FCM)
- [ ] Implement data export/import
- [ ] Add analytics endpoints integration with Python service

## 📄 License

PROPRIETARY - Recovery System

## 🤝 Support

For issues or questions, contact the development team.
