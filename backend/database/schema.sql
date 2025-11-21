-- ============================================================================
-- RECOVER BACKEND - PostgreSQL Database Schema
-- Multi-tenant Rehab Facility Management System
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'facility_admin', 'counselor', 'case_manager', 'therapist', 'nurse');
CREATE TYPE patient_status AS ENUM ('pending', 'admitted', 'active', 'discharged', 'alumni', 'transferred');
CREATE TYPE message_type AS ENUM ('direct_message', 'announcement', 'crisis_alert', 'system');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE document_type AS ENUM ('treatment_plan', 'assessment', 'discharge_summary', 'intake_form', 'progress_note', 'consent_form', 'insurance', 'other');
CREATE TYPE treatment_plan_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'abandoned', 'paused');
CREATE TYPE audit_action AS ENUM ('view', 'create', 'update', 'delete', 'export', 'login', 'logout', 'failed_login');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Facilities/Organizations
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,

    -- Contact Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),

    -- Licensing
    license_number VARCHAR(100),
    license_expiry DATE,
    accreditation JSONB, -- {type: 'CARF', number: 'xxx', expires: 'date'}

    -- Capacity
    bed_capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,

    -- Settings
    settings JSONB DEFAULT '{
        "registration_key_expiry_hours": 48,
        "allow_patient_messaging": true,
        "require_daily_checkins": true,
        "enable_family_portal": false,
        "timezone": "America/New_York"
    }'::jsonb,

    -- Subscription/Billing (for SaaS model)
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_expires_at TIMESTAMP,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Members
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,

    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),

    -- Role & Permissions
    role user_role NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb, -- Additional granular permissions

    -- Professional Info
    credentials JSONB, -- {licenses: [{type: 'LCSW', number: 'xxx', state: 'NY'}], certifications: []}
    specializations TEXT[], -- ['substance_abuse', 'trauma', 'dual_diagnosis']

    -- Account Status
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,

    -- MFA
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),

    -- Preferences
    preferences JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    assigned_counselor_id UUID REFERENCES staff(id) ON DELETE SET NULL,

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),

    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),

    -- Registration System
    registration_key VARCHAR(20) UNIQUE,
    registration_key_hash VARCHAR(255), -- bcrypt hash for security
    key_generated_at TIMESTAMP,
    key_used_at TIMESTAMP,
    key_expires_at TIMESTAMP,

    -- Patient Authentication (after registration)
    password_hash VARCHAR(255), -- Set after using registration key
    device_tokens TEXT[], -- For push notifications
    last_sync TIMESTAMP, -- Last time mobile app synced data

    -- Account Status
    status patient_status DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,

    -- Admission Information
    admission_date DATE,
    expected_discharge_date DATE,
    discharge_date DATE,
    discharge_reason TEXT,

    -- Recovery Information
    sobriety_date DATE,
    substances_of_choice TEXT[], -- ['alcohol', 'opioids', 'cocaine']
    previous_treatment_history TEXT,

    -- Medical
    medical_conditions TEXT[],
    allergies TEXT[],
    current_medications JSONB,

    -- Insurance
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),

    -- Privacy Settings
    data_sharing_consent BOOLEAN DEFAULT true,
    family_portal_enabled BOOLEAN DEFAULT false,

    -- Metrics (denormalized for quick access)
    days_sober INTEGER,
    last_check_in DATE,
    check_in_streak INTEGER DEFAULT 0,
    total_check_ins INTEGER DEFAULT 0,
    total_cravings INTEGER DEFAULT 0,
    cravings_overcome INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PATIENT RECOVERY DATA (Synced from Mobile App)
-- ============================================================================

-- Daily Check-ins
CREATE TABLE patient_check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    check_in_date DATE NOT NULL,

    -- Ratings (1-10 scale)
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),

    -- HALT Assessment
    halt_check JSONB, -- {hungry: 3, angry: 2, lonely: 4, tired: 5}

    -- Notes
    notes TEXT,
    feelings TEXT[],

    -- Sync metadata
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cravings Log
CREATE TABLE patient_cravings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10) NOT NULL,
    trigger VARCHAR(255),
    trigger_category VARCHAR(100), -- 'stress', 'social', 'emotional', 'environmental'

    coping_strategy TEXT,
    coping_techniques TEXT[], -- ['deep_breathing', 'called_sponsor', 'meditation']

    overcame BOOLEAN,
    duration_minutes INTEGER, -- How long the craving lasted

    -- HALT factors
    halt_factors JSONB,

    notes TEXT,

    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting Attendance (AA/NA/Group Therapy)
CREATE TABLE patient_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    meeting_type VARCHAR(50) NOT NULL, -- 'AA', 'NA', 'group_therapy', 'individual_therapy'
    meeting_name VARCHAR(255),
    location VARCHAR(255),

    notes TEXT,
    key_takeaways TEXT,

    attended_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meditation/Mindfulness Sessions
CREATE TABLE patient_meditations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    meditation_type VARCHAR(100), -- 'guided', 'breathwork', 'body_scan', etc.
    duration_minutes INTEGER NOT NULL,

    notes TEXT,
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),

    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gratitude Entries
CREATE TABLE patient_gratitude (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    entry_text TEXT NOT NULL,
    entry_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Growth Logs / Challenges Overcome
CREATE TABLE patient_growth_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(100),
    lessons_learned TEXT,

    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GOALS & TREATMENT PLANNING
-- ============================================================================

-- Patient Goals (can be self-set or assigned by staff)
CREATE TABLE patient_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    assigned_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

    -- Goal Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'recovery', 'wellness', 'personal', 'professional'
    goal_type VARCHAR(50), -- 'numerical', 'yes_no', 'streak', 'habit'

    -- Target
    target_value NUMERIC,
    target_unit VARCHAR(50), -- 'days', 'times', 'hours', etc.
    current_progress NUMERIC DEFAULT 0,

    -- Scheduling
    frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'one_time'
    start_date DATE,
    due_date DATE,

    status goal_status DEFAULT 'active',

    -- Completion
    completed_at TIMESTAMP,
    completion_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goal Progress Logs
CREATE TABLE patient_goal_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID REFERENCES patient_goals(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    progress_value NUMERIC NOT NULL,
    notes TEXT,

    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment Plans
CREATE TABLE treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    created_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(100), -- 'initial', 'updated', 'discharge'

    -- Structured Plan Data
    goals JSONB, -- [{goal: 'Maintain sobriety', interventions: [], timeline: '90 days'}]
    interventions JSONB, -- [{type: 'individual_therapy', frequency: 'twice_weekly'}]
    medications JSONB,
    timeline JSONB,

    status treatment_plan_status DEFAULT 'draft',

    start_date DATE,
    end_date DATE,
    review_date DATE,

    -- Approval
    approved_by_staff_id UUID REFERENCES staff(id),
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MEDICATIONS
-- ============================================================================

-- Active Medications
CREATE TABLE patient_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    prescribed_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL, -- 'twice daily', 'as needed', etc.
    route VARCHAR(50), -- 'oral', 'injection', etc.

    purpose TEXT,
    side_effects TEXT,

    prescribed_date DATE,
    start_date DATE NOT NULL,
    end_date DATE,

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication Adherence Logs
CREATE TABLE patient_medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES patient_medications(id) ON DELETE CASCADE,

    scheduled_time TIMESTAMP NOT NULL,
    taken_at TIMESTAMP,
    skipped BOOLEAN DEFAULT false,
    skip_reason VARCHAR(255),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- WELLNESS TRACKING
-- ============================================================================

-- Sleep Logs
CREATE TABLE patient_sleep_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    sleep_date DATE NOT NULL,
    hours_slept NUMERIC(4,2),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 10),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise Logs
CREATE TABLE patient_exercise_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    exercise_date DATE NOT NULL,
    exercise_type VARCHAR(100), -- 'cardio', 'strength', 'yoga', etc.
    duration_minutes INTEGER,
    intensity VARCHAR(50), -- 'low', 'moderate', 'high'

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition Logs
CREATE TABLE patient_nutrition_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    entry_date DATE NOT NULL,
    meal_type VARCHAR(50), -- 'breakfast', 'lunch', 'dinner', 'snack'
    description TEXT,

    water_intake_oz INTEGER,
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- RELAPSES & CLEAN PERIODS
-- ============================================================================

-- Relapse Events
CREATE TABLE patient_relapses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    relapse_date DATE NOT NULL,
    substance VARCHAR(255),

    -- Context
    triggers TEXT[],
    emotions TEXT[],
    circumstances TEXT,

    -- Severity
    severity VARCHAR(50), -- 'minor', 'moderate', 'severe'
    duration_description VARCHAR(255),

    -- Reflection
    lessons_learned TEXT,
    action_plan TEXT,

    -- Staff involvement
    reported_to_staff_id UUID REFERENCES staff(id),
    staff_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clean Periods (for tracking multiple sobriety streaks)
CREATE TABLE patient_clean_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    start_date DATE NOT NULL,
    end_date DATE, -- NULL if current period
    days_clean INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMMUNICATION
-- ============================================================================

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Sender (either staff or patient)
    sender_type VARCHAR(20) NOT NULL, -- 'staff', 'patient', 'system'
    sender_id UUID NOT NULL, -- References staff.id or patients.id

    -- Recipient
    recipient_type VARCHAR(20) NOT NULL, -- 'staff', 'patient'
    recipient_id UUID NOT NULL,

    -- Message Content
    subject VARCHAR(255),
    body TEXT NOT NULL,

    message_type message_type DEFAULT 'direct_message',
    priority priority_level DEFAULT 'normal',

    -- Attachments (stored in S3)
    attachments JSONB, -- [{filename: 'report.pdf', url: 's3://...', size: 12345}]

    -- Status
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    -- Threading (optional)
    reply_to_message_id UUID REFERENCES messages(id),
    thread_id UUID,

    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Soft delete
    deleted_by_sender BOOLEAN DEFAULT false,
    deleted_by_recipient BOOLEAN DEFAULT false
);

-- ============================================================================
-- DOCUMENTS & FILES
-- ============================================================================

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    uploaded_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    document_type document_type NOT NULL,

    -- File Storage (S3)
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER, -- bytes
    mime_type VARCHAR(100),

    -- Access Control
    is_visible_to_patient BOOLEAN DEFAULT true,
    requires_signature BOOLEAN DEFAULT false,
    signed_at TIMESTAMP,
    signature_data JSONB,

    -- Metadata
    tags TEXT[],

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CALENDAR & EVENTS
-- ============================================================================

-- Calendar Events (for patients and facility)
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,

    -- Can be associated with specific patient or facility-wide
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    created_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    event_type VARCHAR(100), -- 'appointment', 'group_session', 'activity', 'personal'
    location VARCHAR(255),

    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    all_day BOOLEAN DEFAULT false,

    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule JSONB, -- {frequency: 'weekly', interval: 1, daysOfWeek: ['monday', 'wednesday']}

    -- Notifications
    reminder_minutes INTEGER DEFAULT 30,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- In-app Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    recipient_type VARCHAR(20) NOT NULL, -- 'staff', 'patient'
    recipient_id UUID NOT NULL,

    notification_type VARCHAR(100) NOT NULL, -- 'new_message', 'goal_reminder', 'appointment', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,

    -- Action/Link
    action_url TEXT,
    action_data JSONB,

    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT & COMPLIANCE
-- ============================================================================

-- Audit Logs (HIPAA Requirement)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,

    -- What
    action audit_action NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- 'patient', 'document', 'message', 'treatment_plan'
    resource_id UUID,

    -- Context
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- If action involves patient data
    description TEXT,
    changes JSONB, -- {before: {...}, after: {...}}

    -- Metadata
    ip_address INET,
    user_agent TEXT,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session Tracking
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_type VARCHAR(20) NOT NULL, -- 'staff', 'patient'
    user_id UUID NOT NULL,

    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),

    ip_address INET,
    user_agent TEXT,
    device_info JSONB,

    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ANALYTICS & REPORTING (Pre-computed for Performance)
-- ============================================================================

-- Daily Patient Metrics (materialized for dashboard performance)
CREATE TABLE patient_daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,

    -- Aggregated metrics
    checked_in BOOLEAN DEFAULT false,
    mood_avg NUMERIC(4,2),
    halt_avg NUMERIC(4,2),
    cravings_count INTEGER DEFAULT 0,
    cravings_overcome_count INTEGER DEFAULT 0,
    meetings_attended INTEGER DEFAULT 0,
    meditation_minutes INTEGER DEFAULT 0,

    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(patient_id, metric_date)
);

-- Facility Analytics (weekly rollups)
CREATE TABLE facility_weekly_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,

    -- Patient counts
    total_patients INTEGER,
    active_patients INTEGER,
    new_admissions INTEGER,
    discharges INTEGER,

    -- Engagement
    total_check_ins INTEGER,
    avg_check_in_rate NUMERIC(5,2),

    -- Outcomes
    total_cravings INTEGER,
    cravings_overcome_rate NUMERIC(5,2),
    avg_mood NUMERIC(4,2),

    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(facility_id, week_start_date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Facilities
CREATE INDEX idx_facilities_active ON facilities(is_active);

-- Staff
CREATE INDEX idx_staff_facility ON staff(facility_id);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_active ON staff(is_active);

-- Patients
CREATE INDEX idx_patients_facility ON patients(facility_id);
CREATE INDEX idx_patients_counselor ON patients(assigned_counselor_id);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_reg_key ON patients(registration_key);
CREATE INDEX idx_patients_email ON patients(email);

-- Recovery Data
CREATE INDEX idx_checkins_patient_date ON patient_check_ins(patient_id, check_in_date DESC);
CREATE INDEX idx_cravings_patient_occurred ON patient_cravings(patient_id, occurred_at DESC);
CREATE INDEX idx_meetings_patient_attended ON patient_meetings(patient_id, attended_at DESC);
CREATE INDEX idx_medications_patient_active ON patient_medications(patient_id, is_active);
CREATE INDEX idx_medication_logs_patient ON patient_medication_logs(patient_id, scheduled_time DESC);

-- Goals
CREATE INDEX idx_goals_patient_status ON patient_goals(patient_id, status);
CREATE INDEX idx_goals_assigned_by ON patient_goals(assigned_by_staff_id);

-- Messages
CREATE INDEX idx_messages_recipient ON messages(recipient_type, recipient_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_type, sender_id, sent_at DESC);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id, read) WHERE read = false;

-- Documents
CREATE INDEX idx_documents_patient ON documents(patient_id, uploaded_at DESC);
CREATE INDEX idx_documents_type ON documents(document_type);

-- Audit Logs
CREATE INDEX idx_audit_staff ON audit_logs(staff_id, timestamp DESC);
CREATE INDEX idx_audit_patient ON audit_logs(patient_id, timestamp DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id, timestamp DESC);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_type, user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, read) WHERE read = false;

-- Metrics
CREATE INDEX idx_daily_metrics_patient_date ON patient_daily_metrics(patient_id, metric_date DESC);
CREATE INDEX idx_weekly_metrics_facility_date ON facility_weekly_metrics(facility_id, week_start_date DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_goals_updated_at BEFORE UPDATE ON patient_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_medications_updated_at BEFORE UPDATE ON patient_medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update facility occupancy when patient status changes
CREATE OR REPLACE FUNCTION update_facility_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'active') OR
       (TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active') THEN
        UPDATE facilities
        SET current_occupancy = current_occupancy + 1
        WHERE id = NEW.facility_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active') OR
          (TG_OP = 'DELETE' AND OLD.status = 'active') THEN
        UPDATE facilities
        SET current_occupancy = GREATEST(current_occupancy - 1, 0)
        WHERE id = COALESCE(NEW.facility_id, OLD.facility_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_facility_occupancy_trigger
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION update_facility_occupancy();

-- Calculate days sober automatically
CREATE OR REPLACE FUNCTION calculate_days_sober()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sobriety_date IS NOT NULL THEN
        NEW.days_sober = EXTRACT(DAY FROM (CURRENT_DATE - NEW.sobriety_date));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_days_sober_trigger
BEFORE INSERT OR UPDATE OF sobriety_date ON patients
FOR EACH ROW EXECUTE FUNCTION calculate_days_sober();

-- ============================================================================
-- ROW LEVEL SECURITY (Optional - for future multi-tenancy enforcement)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_cravings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Staff can only see patients in their facility
CREATE POLICY staff_facility_patients ON patients
    FOR ALL
    TO authenticated
    USING (facility_id IN (
        SELECT facility_id FROM staff WHERE id = current_setting('app.current_staff_id')::uuid
    ));

-- Patients can only see their own data
CREATE POLICY patients_own_data ON patient_check_ins
    FOR ALL
    TO authenticated
    USING (patient_id = current_setting('app.current_patient_id')::uuid);

-- Note: RLS policies can be expanded based on specific requirements

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE facilities IS 'Rehab facilities/organizations in the multi-tenant system';
COMMENT ON TABLE staff IS 'Facility staff members (counselors, therapists, case managers, admins)';
COMMENT ON TABLE patients IS 'Patients enrolled in recovery programs';
COMMENT ON TABLE patient_check_ins IS 'Daily check-ins synced from mobile app';
COMMENT ON TABLE patient_cravings IS 'Craving events logged by patients';
COMMENT ON TABLE messages IS 'Communication between staff and patients';
COMMENT ON TABLE documents IS 'Treatment plans, assessments, and other patient documents';
COMMENT ON TABLE audit_logs IS 'HIPAA-compliant audit trail of all data access and modifications';
COMMENT ON TABLE patient_goals IS 'Recovery goals (self-set or assigned by staff)';
COMMENT ON TABLE treatment_plans IS 'Formal treatment plans created by clinical staff';

COMMENT ON COLUMN patients.registration_key IS 'Plain text key shown to patient (e.g., REC7-K9M2-P4N8)';
COMMENT ON COLUMN patients.registration_key_hash IS 'Bcrypt hash of registration key for secure storage';
COMMENT ON COLUMN patients.device_tokens IS 'FCM/APNS tokens for push notifications';
COMMENT ON COLUMN patients.last_sync IS 'Last successful data sync from mobile app';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
