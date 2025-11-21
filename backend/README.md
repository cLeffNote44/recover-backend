# Recovery Backend System

Complete backend infrastructure for the multi-tenant rehab facility management platform.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                            │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │   Node.js API    │◄────────┤  Python Services │             │
│  │   (Express)      │         │  (FastAPI)       │             │
│  │   Port: 3000     │         │  Port: 8000      │             │
│  │                  │         │                  │             │
│  │ • Auth & CRUD    │         │ • Analytics      │             │
│  │ • Real-time      │         │ • AI Insights    │             │
│  │ • Messaging      │         │ • Report Gen     │             │
│  │ • File Upload    │         │ • Data Science   │             │
│  └────────┬─────────┘         └──────────────────┘             │
│           │                                                      │
│  ┌────────┴─────────────────────────────────────┐              │
│  │      PostgreSQL Database (Port: 5432)        │              │
│  │  • 40+ tables                                │              │
│  │  • Multi-tenant architecture                 │              │
│  │  • Row-level security                        │              │
│  │  • Audit logging                             │              │
│  └──────────────────────────────────────────────┘              │
│                                                                  │
│  ┌──────────────────────────────────────────────┐              │
│  │      AWS S3 / Storage (Documents)             │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
        ┌───────────────────────┐   ┌──────────────────────┐
        │  DESKTOP APP          │   │   MOBILE APP         │
        │  (Electron)           │   │   (React/Capacitor)  │
        │  For Staff            │   │   For Patients       │
        └───────────────────────┘   └──────────────────────┘
```

## 📁 Project Structure

```
backend/
├── database/               # PostgreSQL database
│   ├── schema.sql         # Complete schema (40+ tables)
│   ├── seed.sql           # Sample data & views
│   └── README.md          # Database documentation
│
├── api/                   # Node.js REST API
│   ├── src/
│   │   ├── config/        # Environment & settings
│   │   ├── database/      # Connection pool
│   │   ├── middleware/    # Auth, validation, errors
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API endpoints
│   │   ├── utils/         # Helpers (JWT, logger)
│   │   ├── types/         # TypeScript definitions
│   │   └── server.ts      # Express app
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── python-services/       # Python analytics (TODO)
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
│
└── shared/                # Shared utilities (future)
    └── types/
```

## 🚀 Quick Start - Full Stack

### 1. Setup Database

```bash
cd database

# Create database
createdb recover_backend

# Run schema
psql -d recover_backend -f schema.sql

# Seed initial data (super admin + sample facility)
psql -d recover_backend -f seed.sql
```

**Default Super Admin:**
- Email: `admin@recoversystem.com`
- Password: `SuperAdmin123!`

### 2. Start Node.js API

```bash
cd api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database connection
nano .env

# Run development server
npm run dev
```

API will run on `http://localhost:3000`

### 3. Start Python Services (Optional - Analytics)

```bash
cd python-services

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run service
python main.py
```

Python service will run on `http://localhost:8000`

## 🔑 Key Features Implemented

### ✅ Database (PostgreSQL)
- **40+ tables** for comprehensive data model
- **Multi-tenant architecture** with facility scoping
- **Registration key system** for patient onboarding
- **Row-level security** (RLS) for data isolation
- **Audit logging** for HIPAA compliance
- **Materialized views** for performance
- **Auto-calculated fields** (days sober, occupancy)

### ✅ Node.js API
- **Authentication**
  - Staff login (email/password)
  - Patient registration with key
  - Patient login
  - JWT access + refresh tokens
  - Session management

- **Patient Management**
  - Create patients (generates registration key)
  - List patients (facility-scoped, filtered, paginated)
  - View patient details
  - Update patient info
  - Delete (soft delete)
  - Regenerate registration keys
  - Patient dashboard (for counselor view)

- **Security**
  - Bcrypt password hashing
  - JWT authentication
  - Role-based authorization
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - Audit logging ready

- **WebSocket Support**
  - Socket.io configured
  - Real-time messaging ready
  - Event infrastructure in place

### 🔨 TODO - In Progress

- [ ] **Messaging System**
  - Staff-to-patient messaging
  - Announcements
  - Crisis alerts
  - Real-time delivery

- [ ] **Document Management**
  - S3 upload/download
  - Treatment plans
  - Assessments
  - Patient-visible documents

- [ ] **Goals & Treatment Plans**
  - Goal assignment
  - Progress tracking
  - Treatment plan templates

- [ ] **Recovery Data Sync**
  - Check-ins from mobile app
  - Cravings logging
  - Meeting attendance
  - Medication adherence

- [ ] **Python Analytics Service**
  - AI-powered insights
  - Pattern detection
  - Relapse risk prediction
  - PDF report generation
  - Facility-wide analytics

- [ ] **Desktop Application**
  - Electron app with Blueprint.js
  - Patient management UI
  - Dashboard & analytics
  - Messaging interface
  - Document upload

- [ ] **Mobile App Integration**
  - Registration flow
  - Data sync service
  - Offline support
  - Messages & documents

## 🔐 Registration Key System

The core innovation of this system is the **secure registration key** workflow:

### How It Works:

1. **Staff Creates Patient (Desktop App)**
   ```
   POST /api/v1/patients
   {
     "first_name": "John",
     "last_name": "Doe",
     "date_of_birth": "1985-03-15",
     ...
   }
   ```

2. **System Generates Key**
   ```json
   {
     "patient": { ... },
     "registration_key": "REC7-K9M2-P4N8",  ← Shown to staff
     "key_expires_at": "2024-11-23T10:30:00Z"
   }
   ```

3. **Staff Gives Key to Patient**
   - Print
   - SMS
   - Email
   - QR Code

4. **Patient Downloads App from App Store**
   - iOS App Store
   - Google Play Store

5. **Patient Registers**
   ```
   POST /api/v1/auth/patient/register
   {
     "registration_key": "REC7-K9M2-P4N8",
     "password": "SecurePassword123!"
   }
   ```

6. **Key is Consumed**
   - Marked as used
   - Cannot be reused
   - Patient account activated

### Security Features:
- ✅ Cryptographically random (crypto.randomBytes)
- ✅ One-time use only
- ✅ 48-hour expiration
- ✅ Bcrypt hashed in database
- ✅ Cannot regenerate after use
- ✅ Revocable by staff before use

## 📊 Database Schema Highlights

### Core Tables:
- `facilities` - Rehab centers
- `staff` - Counselors, therapists, admins
- `patients` - Enrolled patients
- `patient_check_ins` - Daily mood/HALT tracking
- `patient_cravings` - Craving logs
- `patient_goals` - Recovery goals
- `patient_medications` - Medication tracking
- `treatment_plans` - Clinical treatment plans
- `messages` - Staff-patient communication
- `documents` - File management
- `audit_logs` - HIPAA compliance
- `sessions` - Token management

### Views:
- `patient_dashboard_summary` - Quick metrics
- `staff_workload` - Caseload overview
- `facility_weekly_metrics` - Analytics

## 🛡️ Security & Compliance

### HIPAA Requirements:
- ✅ **Encryption at rest** - PostgreSQL encryption
- ✅ **Encryption in transit** - TLS/HTTPS
- ✅ **Access controls** - Role-based permissions
- ✅ **Audit logging** - All data access tracked
- ✅ **Authentication** - Strong password policy
- ✅ **Session management** - Token expiration
- ✅ **Data minimization** - Only necessary PHI
- ⏳ **Business Associate Agreements** - Hosting provider
- ⏳ **Backup encryption** - Automated backups

### Multi-Tenancy:
- Facility-scoped data access
- Row-level security policies
- Super admin for cross-facility management
- Isolated patient data per facility

## 🧪 Testing

```bash
# Test database connection
psql -d recover_backend -c "SELECT NOW()"

# Test API health
curl http://localhost:3000/api/v1/health

# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recoversystem.com","password":"SuperAdmin123!"}'

# Test patient creation (requires auth token)
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"facility_id":"...","first_name":"Test","last_name":"Patient",...}'
```

## 📈 Next Steps

### Phase 1: Complete Backend API ✅ (Current)
- [x] Database schema
- [x] Authentication system
- [x] Patient management
- [ ] Messaging endpoints
- [ ] Document endpoints
- [ ] Goals endpoints

### Phase 2: Python Analytics Service
- [ ] FastAPI setup
- [ ] Database integration
- [ ] Analytics algorithms
- [ ] Report generation
- [ ] AI/ML models

### Phase 3: Desktop Application
- [ ] Electron setup with Blueprint.js
- [ ] Authentication UI
- [ ] Patient management UI
- [ ] Dashboard & charts
- [ ] Messaging UI
- [ ] Document upload

### Phase 4: Mobile App Integration
- [ ] Add auth screens
- [ ] Implement data sync
- [ ] Messages inbox
- [ ] Documents viewer
- [ ] Offline support

### Phase 5: Production Deployment
- [ ] Docker containers
- [ ] CI/CD pipeline
- [ ] Cloud hosting setup
- [ ] Monitoring & logging
- [ ] Backup & disaster recovery

## 📖 Documentation

- **Database**: See `database/README.md`
- **Node.js API**: See `api/README.md`
- **Python Services**: See `python-services/README.md` (TODO)

## 🔧 Development Tools

### Recommended IDE Setup
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - PostgreSQL
  - Thunder Client (API testing)

### Database Tools
- **pgAdmin 4** - GUI for PostgreSQL
- **DBeaver** - Universal database tool
- **psql** - Command-line client

### API Testing
- **Postman** - API testing
- **Thunder Client** - VS Code extension
- **curl** - Command-line

## 🤝 Contributing

When adding features:

1. **Update database schema** if needed (`database/schema.sql`)
2. **Update TypeScript types** (`api/src/types/index.ts`)
3. **Create controller** (`api/src/controllers/`)
4. **Create routes** (`api/src/routes/`)
5. **Add validation** (`express-validator`)
6. **Write tests** (`*.test.ts`)
7. **Update documentation**

## 📄 License

PROPRIETARY - Recovery System

---

## 🎯 Current Status Summary

**What's Working:**
- ✅ Complete PostgreSQL database (40+ tables)
- ✅ Authentication system (staff + patient)
- ✅ Registration key generation & validation
- ✅ Patient CRUD operations
- ✅ Role-based authorization
- ✅ Multi-tenant data scoping
- ✅ WebSocket infrastructure
- ✅ Logging & error handling
- ✅ API documentation

**What's Next:**
- 🔨 Messaging system
- 🔨 Document upload/download
- 🔨 Python analytics service
- 🔨 Desktop Electron app
- 🔨 Mobile app backend integration

**Ready for:** Initial testing and desktop app development!
