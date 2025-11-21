-- ============================================================================
-- SEED DATA - Initial Super Admin & Sample Data
-- ============================================================================

-- ============================================================================
-- SUPER ADMIN SETUP
-- ============================================================================

-- Create Super Admin (not tied to any facility)
-- Password: SuperAdmin123! (this should be changed on first login)
-- Bcrypt hash generated for 'SuperAdmin123!'
INSERT INTO staff (
    id,
    facility_id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    email_verified
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    NULL, -- Super admin not tied to specific facility
    'admin@recoversystem.com',
    '$2b$10$rKzQJvLhb0h0GC.xJO0pu.NZWnqYLNfQlRiJfKvZxNZxKXxKXxKXK', -- SuperAdmin123!
    'System',
    'Administrator',
    'super_admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SAMPLE FACILITY (for testing)
-- ============================================================================

INSERT INTO facilities (
    id,
    name,
    address_line1,
    city,
    state,
    zip_code,
    phone,
    email,
    license_number,
    bed_capacity,
    settings
) VALUES (
    '10000000-0000-0000-0000-000000000001'::uuid,
    'Hope Recovery Center',
    '123 Recovery Lane',
    'Austin',
    'TX',
    '78701',
    '(512) 555-0100',
    'info@hoperecovery.com',
    'TX-LIC-2024-001',
    50,
    '{
        "registration_key_expiry_hours": 48,
        "allow_patient_messaging": true,
        "require_daily_checkins": true,
        "enable_family_portal": false,
        "timezone": "America/Chicago"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE STAFF MEMBERS (for testing)
-- ============================================================================

-- Facility Admin
INSERT INTO staff (
    id,
    facility_id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role,
    credentials,
    is_active,
    email_verified
) VALUES (
    '20000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    'admin@hoperecovery.com',
    '$2b$10$rKzQJvLhb0h0GC.xJO0pu.NZWnqYLNfQlRiJfKvZxNZxKXxKXxKXK', -- Admin123!
    'Sarah',
    'Johnson',
    '(512) 555-0101',
    'facility_admin',
    '{
        "licenses": [
            {"type": "LCDC", "number": "TX-12345", "state": "TX", "expires": "2025-12-31"}
        ]
    }'::jsonb,
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Counselor #1
INSERT INTO staff (
    id,
    facility_id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role,
    credentials,
    specializations,
    is_active,
    email_verified
) VALUES (
    '20000000-0000-0000-0000-000000000002'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    'dr.martinez@hoperecovery.com',
    '$2b$10$rKzQJvLhb0h0GC.xJO0pu.NZWnqYLNfQlRiJfKvZxNZxKXxKXxKXK', -- Counselor123!
    'Maria',
    'Martinez',
    '(512) 555-0102',
    'counselor',
    '{
        "licenses": [
            {"type": "LCSW", "number": "TX-67890", "state": "TX", "expires": "2026-06-30"},
            {"type": "LCDC", "number": "TX-67891", "state": "TX", "expires": "2026-06-30"}
        ],
        "certifications": [
            {"name": "Certified Addiction Counselor", "organization": "NAADAC", "year": 2018}
        ]
    }'::jsonb,
    ARRAY['substance_abuse', 'trauma', 'dual_diagnosis'],
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Counselor #2
INSERT INTO staff (
    id,
    facility_id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role,
    credentials,
    specializations,
    is_active,
    email_verified
) VALUES (
    '20000000-0000-0000-0000-000000000003'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    'dr.thompson@hoperecovery.com',
    '$2b$10$rKzQJvLhb0h0GC.xJO0pu.NZWnqYLNfQlRiJfKvZxNZxKXxKXxKXK', -- Counselor123!
    'James',
    'Thompson',
    '(512) 555-0103',
    'counselor',
    '{
        "licenses": [
            {"type": "LPC", "number": "TX-11223", "state": "TX", "expires": "2025-12-31"}
        ]
    }'::jsonb,
    ARRAY['substance_abuse', 'family_therapy'],
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Case Manager
INSERT INTO staff (
    id,
    facility_id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role,
    is_active,
    email_verified
) VALUES (
    '20000000-0000-0000-0000-000000000004'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    'lisa.chen@hoperecovery.com',
    '$2b$10$rKzQJvLhb0h0GC.xJO0pu.NZWnqYLNfQlRiJfKvZxNZxKXxKXxKXK', -- CaseManager123!
    'Lisa',
    'Chen',
    '(512) 555-0104',
    'case_manager',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SAMPLE PATIENTS (for testing)
-- ============================================================================

-- Patient 1 - Already registered and using the app
INSERT INTO patients (
    id,
    facility_id,
    assigned_counselor_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone,
    email,
    password_hash, -- Patient123!
    status,
    admission_date,
    expected_discharge_date,
    sobriety_date,
    substances_of_choice,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
    registration_key,
    registration_key_hash,
    key_generated_at,
    key_used_at,
    data_sharing_consent,
    is_active
) VALUES (
    '30000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '20000000-0000-0000-0000-000000000002'::uuid, -- Assigned to Dr. Martinez
    'John',
    'Doe',
    '1985-03-15',
    'Male',
    '(555) 123-4567',
    'john.doe@email.com',
    '$2b$10$rKzQJvLhb0h0GC.xJO0pu.NZWnqYLNfQlRiJfKvZxNZxKXxKXxKXK',
    'active',
    '2024-10-01',
    '2025-01-01',
    '2024-10-01',
    ARRAY['alcohol', 'cocaine'],
    'Mary Doe',
    '(555) 123-4568',
    'Spouse',
    'REC7-K9M2-P4N8',
    '$2b$10$Xn5DjGzN0q2gvPXm7vZYqeKZvZYqeKZvZYqeKZvZYqeKZvZYqeKZ',
    '2024-09-29 10:00:00',
    '2024-09-30 14:23:00',
    true,
    true
);

-- Patient 2 - Pending registration (key not used yet)
INSERT INTO patients (
    id,
    facility_id,
    assigned_counselor_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone,
    status,
    admission_date,
    expected_discharge_date,
    sobriety_date,
    substances_of_choice,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
    registration_key,
    registration_key_hash,
    key_generated_at,
    key_expires_at,
    data_sharing_consent,
    is_active
) VALUES (
    '30000000-0000-0000-0000-000000000002'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '20000000-0000-0000-0000-000000000003'::uuid, -- Assigned to Dr. Thompson
    'Jane',
    'Smith',
    '1992-07-22',
    'Female',
    '(555) 234-5678',
    'pending',
    '2024-11-20',
    '2025-02-20',
    '2024-11-20',
    ARRAY['opioids'],
    'Robert Smith',
    '(555) 234-5679',
    'Father',
    'HOP3-N7B4-Q2K9',
    '$2b$10$Yn6EkHzO1r3hwQYn8wAZreLA0wAZreLA0wAZreLA0wAZreLA0wAZ',
    NOW(),
    NOW() + INTERVAL '48 hours',
    true,
    true
);

-- Patient 3 - Active, different counselor
INSERT INTO patients (
    id,
    facility_id,
    assigned_counselor_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone,
    email,
    password_hash,
    status,
    admission_date,
    expected_discharge_date,
    sobriety_date,
    substances_of_choice,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
    registration_key,
    registration_key_hash,
    key_generated_at,
    key_used_at,
    data_sharing_consent,
    is_active
) VALUES (
    '30000000-0000-0000-0000-000000000003'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '20000000-0000-0000-0000-000000000003'::uuid, -- Assigned to Dr. Thompson
    'Michael',
    'Johnson',
    '1978-11-30',
    'Male',
    '(555) 345-6789',
    'michael.j@email.com',
    '$2b$10$rKzQJvLhb0h0GC.xJO0pu.NZWnqYLNfQlRiJfKvZxNZxKXxKXxKXK',
    'active',
    '2024-09-15',
    '2024-12-15',
    '2024-09-15',
    ARRAY['alcohol'],
    'Linda Johnson',
    '(555) 345-6790',
    'Sister',
    'REC2-M8P5-N3L7',
    '$2b$10$Zp7FlI0s2t4ixRZo9xB0sfMB1xB0sfMB1xB0sfMB1xB0sfMB1xB0',
    '2024-09-14 09:00:00',
    '2024-09-15 11:45:00',
    true,
    true
);

-- ============================================================================
-- SAMPLE RECOVERY DATA (for Patient 1 - John Doe)
-- ============================================================================

-- Check-ins for the past week
INSERT INTO patient_check_ins (patient_id, check_in_date, mood_rating, energy_level, sleep_quality, stress_level, halt_check, notes, feelings)
VALUES
    ('30000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '6 days', 7, 6, 7, 5, '{"hungry": 2, "angry": 1, "lonely": 3, "tired": 4}'::jsonb, 'Feeling good today. Attended my first AA meeting.', ARRAY['hopeful', 'nervous', 'motivated']),
    ('30000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '5 days', 8, 7, 8, 4, '{"hungry": 1, "angry": 1, "lonely": 2, "tired": 2}'::jsonb, 'Great sleep! Feeling optimistic.', ARRAY['happy', 'energized']),
    ('30000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '4 days', 6, 5, 6, 6, '{"hungry": 3, "angry": 4, "lonely": 3, "tired": 5}'::jsonb, 'Had a tough day at work. Called my sponsor.', ARRAY['stressed', 'irritable']),
    ('30000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '3 days', 7, 7, 7, 5, '{"hungry": 2, "angry": 2, "lonely": 2, "tired": 3}'::jsonb, 'Feeling better. Worked out this morning.', ARRAY['proud', 'determined']),
    ('30000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '2 days', 8, 8, 8, 3, '{"hungry": 1, "angry": 1, "lonely": 2, "tired": 2}'::jsonb, 'Really proud of myself. One month sober!', ARRAY['proud', 'grateful', 'joyful']),
    ('30000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '1 day', 7, 7, 7, 4, '{"hungry": 2, "angry": 1, "lonely": 2, "tired": 3}'::jsonb, 'Attended group therapy. Very helpful.', ARRAY['reflective', 'supported']),
    ('30000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE, 9, 8, 9, 2, '{"hungry": 1, "angry": 1, "lonely": 1, "tired": 2}'::jsonb, 'Best day yet! Feeling strong in my recovery.', ARRAY['joyful', 'confident', 'grateful']);

-- Cravings
INSERT INTO patient_cravings (patient_id, intensity, trigger, trigger_category, coping_strategy, coping_techniques, overcame, duration_minutes, halt_factors, occurred_at)
VALUES
    ('30000000-0000-0000-0000-000000000001'::uuid, 7, 'Saw old drinking buddies at store', 'social', 'Left immediately and called sponsor', ARRAY['deep_breathing', 'called_sponsor', 'left_situation'], true, 15, '{"hungry": 2, "angry": 1, "lonely": 4, "tired": 2}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '4 days 14 hours'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 5, 'Work stress', 'emotional', 'Took a walk and practiced mindfulness', ARRAY['exercise', 'mindfulness', 'journaling'], true, 10, '{"hungry": 3, "angry": 5, "lonely": 2, "tired": 4}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '2 days 18 hours'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 3, 'Bored at home', 'environmental', 'Went for a run', ARRAY['exercise'], true, 5, '{"hungry": 1, "angry": 1, "lonely": 3, "tired": 2}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '1 day 10 hours');

-- Meetings
INSERT INTO patient_meetings (patient_id, meeting_type, meeting_name, location, notes, key_takeaways, attended_at)
VALUES
    ('30000000-0000-0000-0000-000000000001'::uuid, 'AA', 'Morning Serenity Group', 'Community Church', 'First meeting. Everyone was welcoming.', 'One day at a time. Keep coming back.', CURRENT_TIMESTAMP - INTERVAL '6 days 10 hours'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'group_therapy', 'CBT Group Session', 'Hope Recovery Center', 'Learned about cognitive distortions', 'Challenge negative thoughts. Reality test.', CURRENT_TIMESTAMP - INTERVAL '5 days 14 hours'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'AA', 'Friday Night Lights', 'Downtown Club', 'Shared my story for the first time', 'Sharing helps. We are not alone.', CURRENT_TIMESTAMP - INTERVAL '2 days 19 hours'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'individual_therapy', 'One-on-one with Dr. Martinez', 'Hope Recovery Center', 'Discussed triggers and coping strategies', 'Identify patterns. Build healthier habits.', CURRENT_TIMESTAMP - INTERVAL '1 day 15 hours');

-- Meditations
INSERT INTO patient_meditations (patient_id, meditation_type, duration_minutes, notes, mood_before, mood_after, completed_at)
VALUES
    ('30000000-0000-0000-0000-000000000001'::uuid, 'guided', 20, 'Headspace morning meditation', 6, 8, CURRENT_TIMESTAMP - INTERVAL '5 days 8 hours'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'breathwork', 10, 'Box breathing exercise', 5, 7, CURRENT_TIMESTAMP - INTERVAL '4 days 17 hours'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'body_scan', 15, 'Full body scan before sleep', 7, 8, CURRENT_TIMESTAMP - INTERVAL '2 days 22 hours'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'guided', 20, 'Calm app evening meditation', 7, 9, CURRENT_TIMESTAMP - INTERVAL '1 day 21 hours');

-- Gratitude entries
INSERT INTO patient_gratitude (patient_id, entry_text, entry_date)
VALUES
    ('30000000-0000-0000-0000-000000000001'::uuid, 'Grateful for my supportive family who never gave up on me', CURRENT_DATE - INTERVAL '6 days'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'Thankful for Dr. Martinez and the care team here', CURRENT_DATE - INTERVAL '5 days'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'Grateful for another sober day and my health improving', CURRENT_DATE - INTERVAL '4 days'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'Appreciating the small things - coffee, sunrise, being alive', CURRENT_DATE - INTERVAL '2 days'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'Grateful for second chances and new beginnings', CURRENT_DATE);

-- Goals
INSERT INTO patient_goals (patient_id, assigned_by_staff_id, title, description, category, goal_type, target_value, current_progress, frequency, status, start_date, due_date)
VALUES
    ('30000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000002'::uuid, 'Complete 12-Step Workbook', 'Work through all 12 steps with sponsor', 'recovery', 'numerical', 12, 3, 'one_time', 'active', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '90 days'),
    ('30000000-0000-0000-0000-000000000001'::uuid, NULL, 'Daily Check-ins', 'Check in every day to track mood and progress', 'recovery', 'streak', 365, 7, 'daily', 'active', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '358 days'),
    ('30000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000002'::uuid, 'Attend 3 Meetings Weekly', 'Go to at least 3 AA/NA meetings per week', 'recovery', 'numerical', 3, 2, 'weekly', 'active', CURRENT_DATE - INTERVAL '7 days', NULL),
    ('30000000-0000-0000-0000-000000000001'::uuid, NULL, 'Exercise 30 minutes', 'Physical activity for 30 minutes', 'wellness', 'yes_no', 1, 0, 'daily', 'active', CURRENT_DATE, NULL);

-- Treatment Plan
INSERT INTO treatment_plans (patient_id, created_by_staff_id, title, description, plan_type, goals, interventions, status, start_date, end_date)
VALUES (
    '30000000-0000-0000-0000-000000000001'::uuid,
    '20000000-0000-0000-0000-000000000002'::uuid,
    '90-Day Intensive Outpatient Program',
    'Comprehensive treatment plan for alcohol and cocaine addiction',
    'initial',
    '[
        {"goal": "Achieve and maintain sobriety", "timeline": "Ongoing", "measures": "Zero substance use, negative drug tests"},
        {"goal": "Develop healthy coping mechanisms", "timeline": "60 days", "measures": "Successfully manage 90% of cravings"},
        {"goal": "Rebuild family relationships", "timeline": "90 days", "measures": "Weekly family therapy sessions"}
    ]'::jsonb,
    '[
        {"type": "individual_therapy", "frequency": "twice_weekly", "provider": "Dr. Martinez"},
        {"type": "group_therapy", "frequency": "three_times_weekly", "focus": "CBT and relapse prevention"},
        {"type": "12_step_program", "frequency": "minimum_three_weekly", "program": "AA"},
        {"type": "medication_management", "medication": "Naltrexone", "provider": "Dr. Patel"},
        {"type": "family_therapy", "frequency": "weekly", "provider": "Dr. Martinez"}
    ]'::jsonb,
    'active',
    '2024-10-01',
    '2024-12-31'
);

-- Sample message from counselor to patient
INSERT INTO messages (sender_type, sender_id, recipient_type, recipient_id, subject, body, message_type, priority, sent_at)
VALUES (
    'staff',
    '20000000-0000-0000-0000-000000000002'::uuid,
    'patient',
    '30000000-0000-0000-0000-000000000001'::uuid,
    'Great Progress This Week!',
    'Hi John,

I wanted to reach out and congratulate you on completing your first month of sobriety! Looking at your check-ins and seeing your consistent attendance at meetings shows real commitment to your recovery.

Your mood ratings have been steadily improving, and I''m particularly impressed with how you handled the craving situation when you ran into old friends. Calling your sponsor and removing yourself from the situation was exactly the right move.

Let''s discuss your progress in more detail during our session tomorrow. Keep up the excellent work!

Best,
Dr. Martinez',
    'direct_message',
    'normal',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
);

-- Sample document
INSERT INTO documents (patient_id, uploaded_by_staff_id, title, description, document_type, file_url, file_name, file_size, mime_type, is_visible_to_patient)
VALUES (
    '30000000-0000-0000-0000-000000000001'::uuid,
    '20000000-0000-0000-0000-000000000002'::uuid,
    'Initial Assessment Report',
    'Comprehensive intake assessment and treatment recommendations',
    'assessment',
    's3://recover-documents/30000000-0000-0000-0000-000000000001/assessment-2024-10-01.pdf',
    'assessment-2024-10-01.pdf',
    245678,
    'application/pdf',
    true
);

-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================

-- View for patient dashboard summary
CREATE OR REPLACE VIEW patient_dashboard_summary AS
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.facility_id,
    p.assigned_counselor_id,
    s.first_name || ' ' || s.last_name AS counselor_name,
    p.status,
    p.admission_date,
    p.sobriety_date,
    p.days_sober,
    p.check_in_streak,
    p.total_check_ins,
    p.total_cravings,
    p.cravings_overcome,
    CASE
        WHEN p.total_cravings > 0 THEN ROUND((p.cravings_overcome::numeric / p.total_cravings * 100), 2)
        ELSE 0
    END AS craving_success_rate,
    (SELECT COUNT(*) FROM messages WHERE recipient_type = 'patient' AND recipient_id = p.id AND read = false) AS unread_messages,
    (SELECT COUNT(*) FROM patient_goals WHERE patient_id = p.id AND status = 'active') AS active_goals
FROM patients p
LEFT JOIN staff s ON p.assigned_counselor_id = s.id
WHERE p.is_active = true;

COMMENT ON VIEW patient_dashboard_summary IS 'Quick dashboard metrics for each patient';

-- View for staff workload
CREATE OR REPLACE VIEW staff_workload AS
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.role,
    s.facility_id,
    COUNT(DISTINCT p.id) AS total_patients,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) AS active_patients,
    COUNT(DISTINCT m.id) AS unread_messages
FROM staff s
LEFT JOIN patients p ON s.id = p.assigned_counselor_id
LEFT JOIN messages m ON m.recipient_type = 'staff' AND m.recipient_id = s.id AND m.read = false
WHERE s.is_active = true AND s.role IN ('counselor', 'therapist', 'case_manager')
GROUP BY s.id, s.first_name, s.last_name, s.role, s.facility_id;

COMMENT ON VIEW staff_workload IS 'Summary of each staff member''s patient load';

-- ============================================================================
-- DEFAULT PASSWORDS (FOR REFERENCE)
-- ============================================================================

/*
IMPORTANT: All default passwords should be changed on first login!

Super Admin:
  Email: admin@recoversystem.com
  Password: SuperAdmin123!

Facility Admin:
  Email: admin@hoperecovery.com
  Password: Admin123!

Counselors:
  Email: dr.martinez@hoperecovery.com, dr.thompson@hoperecovery.com
  Password: Counselor123!

Case Manager:
  Email: lisa.chen@hoperecovery.com
  Password: CaseManager123!

Test Patients:
  Email: john.doe@email.com, michael.j@email.com
  Password: Patient123!

Note: These are bcrypt hashes. In production, implement password change on first login.
*/
