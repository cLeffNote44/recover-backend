# Recovery Backend - Database

PostgreSQL database schema for the multi-tenant rehab facility management system.

## Quick Start

### Prerequisites
- PostgreSQL 14+ installed
- Database user with create privileges

### Setup

```bash
# 1. Create database
createdb recover_backend

# 2. Run schema (creates all tables, indexes, triggers)
psql -d recover_backend -f schema.sql

# 3. Seed initial data (super admin + sample data)
psql -d recover_backend -f seed.sql
```

### Connection String Format

```
postgresql://username:password@localhost:5432/recover_backend
```

## Default Credentials

**⚠️ CHANGE THESE IMMEDIATELY IN PRODUCTION**

### Super Admin
- Email: `admin@recoversystem.com`
- Password: `SuperAdmin123!`
- Access: Can create facilities and facility admins

### Sample Facility: Hope Recovery Center
- Facility Admin: `admin@hoperecovery.com` / `Admin123!`
- Counselor 1: `dr.martinez@hoperecovery.com` / `Counselor123!`
- Counselor 2: `dr.thompson@hoperecovery.com` / `Counselor123!`
- Case Manager: `lisa.chen@hoperecovery.com` / `CaseManager123!`

### Sample Patients
- John Doe: `john.doe@email.com` / `Patient123!` (Active, has data)
- Jane Smith: Registration pending (key: `HOP3-N7B4-Q2K9`)
- Michael Johnson: `michael.j@email.com` / `Patient123!` (Active)

## Schema Overview

### Core Entities

```
facilities          - Rehab facilities/organizations
  ├── staff         - Facility staff (counselors, admins, etc.)
  └── patients      - Patients enrolled in programs
      ├── patient_check_ins
      ├── patient_cravings
      ├── patient_meetings
      ├── patient_meditations
      ├── patient_gratitude
      ├── patient_growth_logs
      ├── patient_goals
      ├── patient_medications
      ├── patient_medication_logs
      ├── patient_sleep_entries
      ├── patient_exercise_entries
      ├── patient_nutrition_entries
      ├── patient_relapses
      ├── patient_clean_periods
      ├── treatment_plans
      ├── messages
      └── documents
```

### Multi-Tenancy

All patient data is scoped to `facility_id`:
- Staff can only access patients in their facility
- Row Level Security (RLS) policies enforce isolation
- Super admin can access all facilities

### Registration Key System

```sql
-- Example: Create patient and generate registration key
INSERT INTO patients (
  facility_id,
  first_name,
  last_name,
  date_of_birth,
  registration_key,
  key_expires_at
) VALUES (
  '...',
  'John',
  'Doe',
  '1990-01-01',
  'REC7-K9M2-P4N8',  -- Generated key
  NOW() + INTERVAL '48 hours'
);
```

Patient uses this key in mobile app to complete registration.

## Key Features

### Automatic Triggers

1. **Updated At Timestamps**: Auto-updated on row changes
2. **Facility Occupancy**: Auto-calculated when patient status changes
3. **Days Sober**: Auto-calculated from sobriety_date

### Audit Logging

All data access and modifications are logged:
```sql
SELECT * FROM audit_logs
WHERE patient_id = '...'
ORDER BY timestamp DESC;
```

### Materialized Views

For performance, pre-computed metrics:
- `patient_daily_metrics` - Daily rollups per patient
- `patient_dashboard_summary` - Real-time patient summary
- `staff_workload` - Staff caseload overview

## Indexes

Optimized for common queries:
- Patient lookups by facility, counselor, status
- Messages by recipient (with unread filter)
- Time-series data (check-ins, cravings) by date DESC
- Registration key lookups

## Enums

Type-safe enumerations:
- `user_role`: super_admin, facility_admin, counselor, case_manager, therapist, nurse
- `patient_status`: pending, admitted, active, discharged, alumni, transferred
- `message_type`: direct_message, announcement, crisis_alert, system
- `document_type`: treatment_plan, assessment, discharge_summary, etc.

## Security

### Row Level Security (RLS)

Enabled on sensitive tables with policies:
```sql
-- Staff can only see patients in their facility
CREATE POLICY staff_facility_patients ON patients
  USING (facility_id IN (
    SELECT facility_id FROM staff WHERE id = current_setting('app.current_staff_id')::uuid
  ));
```

Application must set session variables:
```sql
SET app.current_staff_id = '<staff_uuid>';
```

### Password Hashing

All password fields use bcrypt (cost factor 10):
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);
```

### Registration Keys

Keys are double-protected:
- Plain text shown to user: `REC7-K9M2-P4N8`
- Bcrypt hash stored in DB: `registration_key_hash`
- Expiration timestamp: `key_expires_at`

## Maintenance

### Vacuum & Analyze

```sql
-- Run weekly
VACUUM ANALYZE;

-- For specific high-traffic tables
VACUUM ANALYZE patient_check_ins;
VACUUM ANALYZE messages;
```

### Backup

```bash
# Dump entire database
pg_dump recover_backend > backup_$(date +%Y%m%d).sql

# Restore
psql recover_backend < backup_20241121.sql
```

### Clean Up Old Audit Logs

```sql
-- Delete audit logs older than 1 year (adjust as needed)
DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '1 year';
```

## Useful Queries

### Patient Overview
```sql
SELECT * FROM patient_dashboard_summary WHERE id = '<patient_uuid>';
```

### Staff Caseload
```sql
SELECT * FROM staff_workload WHERE facility_id = '<facility_uuid>';
```

### Recent Check-ins
```sql
SELECT
  p.first_name,
  p.last_name,
  c.check_in_date,
  c.mood_rating,
  c.notes
FROM patient_check_ins c
JOIN patients p ON c.patient_id = p.id
WHERE p.facility_id = '<facility_uuid>'
ORDER BY c.check_in_date DESC
LIMIT 20;
```

### Unread Messages
```sql
SELECT
  m.*,
  s.first_name || ' ' || s.last_name AS sender_name
FROM messages m
JOIN staff s ON m.sender_id = s.id
WHERE m.recipient_type = 'patient'
  AND m.recipient_id = '<patient_uuid>'
  AND m.read = false
ORDER BY m.sent_at DESC;
```

### Patient Progress Over Time
```sql
SELECT
  check_in_date,
  mood_rating,
  stress_level,
  (halt_check->>'hungry')::int as hungry,
  (halt_check->>'angry')::int as angry,
  (halt_check->>'lonely')::int as lonely,
  (halt_check->>'tired')::int as tired
FROM patient_check_ins
WHERE patient_id = '<patient_uuid>'
ORDER BY check_in_date DESC
LIMIT 30;
```

## Migration Strategy

When modifying schema in production:

1. **Always use migrations** (see `migrations/` folder)
2. **Never drop columns** - mark as deprecated first
3. **Add columns as nullable** - backfill later
4. **Create indexes concurrently** to avoid locks

Example:
```sql
-- Add new column (safe)
ALTER TABLE patients ADD COLUMN new_field TEXT;

-- Create index without locking
CREATE INDEX CONCURRENTLY idx_new_field ON patients(new_field);
```

## Performance Tips

1. **Use pagination** for large result sets
2. **Avoid SELECT *** - specify needed columns
3. **Use prepared statements** to prevent SQL injection
4. **Monitor slow queries**:
   ```sql
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY total_time DESC
   LIMIT 10;
   ```

## HIPAA Compliance

✅ Encryption at rest (enable in PostgreSQL config)
✅ Audit logging (all patient data access logged)
✅ Access controls (RLS policies)
✅ Secure connections (require SSL in production)
✅ Data minimization (only store necessary PHI)
✅ Backup encryption (encrypt backup files)

## Support

For schema questions or issues, see:
- `schema.sql` - Full table definitions
- `seed.sql` - Sample data and views
- API documentation for usage examples
