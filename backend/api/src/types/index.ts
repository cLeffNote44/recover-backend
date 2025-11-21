import { Request } from 'express';

// ============================================================================
// ENUMS (matching database enums)
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  FACILITY_ADMIN = 'facility_admin',
  COUNSELOR = 'counselor',
  CASE_MANAGER = 'case_manager',
  THERAPIST = 'therapist',
  NURSE = 'nurse',
}

export enum PatientStatus {
  PENDING = 'pending',
  ADMITTED = 'admitted',
  ACTIVE = 'active',
  DISCHARGED = 'discharged',
  ALUMNI = 'alumni',
  TRANSFERRED = 'transferred',
}

export enum MessageType {
  DIRECT_MESSAGE = 'direct_message',
  ANNOUNCEMENT = 'announcement',
  CRISIS_ALERT = 'crisis_alert',
  SYSTEM = 'system',
}

export enum PriorityLevel {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DocumentType {
  TREATMENT_PLAN = 'treatment_plan',
  ASSESSMENT = 'assessment',
  DISCHARGE_SUMMARY = 'discharge_summary',
  INTAKE_FORM = 'intake_form',
  PROGRESS_NOTE = 'progress_note',
  CONSENT_FORM = 'consent_form',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  PAUSED = 'paused',
}

export enum AuditAction {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  LOGIN = 'login',
  LOGOUT = 'logout',
  FAILED_LOGIN = 'failed_login',
}

// ============================================================================
// ENTITIES
// ============================================================================

export interface Facility {
  id: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  license_number?: string;
  license_expiry?: Date;
  accreditation?: any;
  bed_capacity?: number;
  current_occupancy?: number;
  settings?: any;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Staff {
  id: string;
  facility_id?: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  permissions?: any;
  credentials?: any;
  specializations?: string[];
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  failed_login_attempts: number;
  locked_until?: Date;
  mfa_enabled: boolean;
  mfa_secret?: string;
  preferences?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  id: string;
  facility_id: string;
  assigned_counselor_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender?: string;
  phone?: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  registration_key?: string;
  registration_key_hash?: string;
  key_generated_at?: Date;
  key_used_at?: Date;
  key_expires_at?: Date;
  password_hash?: string;
  device_tokens?: string[];
  last_sync?: Date;
  status: PatientStatus;
  is_active: boolean;
  admission_date?: Date;
  expected_discharge_date?: Date;
  discharge_date?: Date;
  discharge_reason?: string;
  sobriety_date?: Date;
  substances_of_choice?: string[];
  previous_treatment_history?: string;
  medical_conditions?: string[];
  allergies?: string[];
  current_medications?: any;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
  data_sharing_consent: boolean;
  family_portal_enabled: boolean;
  days_sober?: number;
  last_check_in?: Date;
  check_in_streak?: number;
  total_check_ins?: number;
  total_cravings?: number;
  cravings_overcome?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CheckIn {
  id: string;
  patient_id: string;
  check_in_date: Date;
  mood_rating?: number;
  energy_level?: number;
  sleep_quality?: number;
  stress_level?: number;
  halt_check?: {
    hungry: number;
    angry: number;
    lonely: number;
    tired: number;
  };
  notes?: string;
  feelings?: string[];
  synced_at: Date;
  created_at: Date;
}

export interface Craving {
  id: string;
  patient_id: string;
  intensity: number;
  trigger?: string;
  trigger_category?: string;
  coping_strategy?: string;
  coping_techniques?: string[];
  overcame?: boolean;
  duration_minutes?: number;
  halt_factors?: any;
  notes?: string;
  occurred_at: Date;
  created_at: Date;
}

export interface Goal {
  id: string;
  patient_id: string;
  assigned_by_staff_id?: string;
  title: string;
  description?: string;
  category?: string;
  goal_type?: string;
  target_value?: number;
  current_progress?: number;
  target_unit?: string;
  frequency?: string;
  status: GoalStatus;
  start_date?: Date;
  due_date?: Date;
  completed_at?: Date;
  completion_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  sender_type: 'staff' | 'patient' | 'system';
  sender_id: string;
  recipient_type: 'staff' | 'patient';
  recipient_id: string;
  subject?: string;
  body: string;
  message_type: MessageType;
  priority: PriorityLevel;
  attachments?: any;
  read: boolean;
  read_at?: Date;
  reply_to_message_id?: string;
  thread_id?: string;
  sent_at: Date;
  deleted_by_sender: boolean;
  deleted_by_recipient: boolean;
}

export interface Document {
  id: string;
  patient_id: string;
  uploaded_by_staff_id?: string;
  title: string;
  description?: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  is_visible_to_patient: boolean;
  requires_signature: boolean;
  signed_at?: Date;
  signature_data?: any;
  tags?: string[];
  uploaded_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  staff_id?: string;
  facility_id: string;
  action: AuditAction;
  resource_type: string;
  resource_id?: string;
  patient_id?: string;
  description?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    type: 'staff' | 'patient';
    role?: UserRole;
    facility_id?: string;
    email?: string;
  };
}

export interface StaffAuthRequest extends AuthenticatedRequest {
  staff?: Staff;
}

export interface PatientAuthRequest extends AuthenticatedRequest {
  patient?: Patient;
}

// ============================================================================
// DTO (Data Transfer Objects) for API requests/responses
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    facility_id?: string;
  };
}

export interface RegisterPatientRequest {
  registration_key: string;
  password: string;
  pin?: string;
}

export interface CreatePatientRequest {
  facility_id: string;
  assigned_counselor_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  phone?: string;
  email?: string;
  admission_date?: string;
  expected_discharge_date?: string;
  sobriety_date?: string;
  substances_of_choice?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface CreatePatientResponse {
  success: boolean;
  patient: Partial<Patient>;
  registration_key: string;
  key_expires_at: Date;
}

export interface UpdatePatientRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  assigned_counselor_id?: string;
  status?: PatientStatus;
  expected_discharge_date?: string;
  discharge_date?: string;
  discharge_reason?: string;
  sobriety_date?: string;
}

export interface SendMessageRequest {
  recipient_id: string;
  subject?: string;
  body: string;
  message_type?: MessageType;
  priority?: PriorityLevel;
}

export interface UploadDocumentRequest {
  patient_id: string;
  title: string;
  description?: string;
  document_type: DocumentType;
  is_visible_to_patient?: boolean;
}

export interface PatientDashboard {
  patient: Partial<Patient>;
  counselor?: Partial<Staff>;
  stats: {
    days_sober: number;
    check_in_streak: number;
    total_check_ins: number;
    craving_success_rate: number;
    active_goals: number;
    unread_messages: number;
  };
  recent_check_ins: CheckIn[];
  recent_cravings: Craving[];
  active_goals: Goal[];
}

export interface FacilityDashboard {
  facility: Facility;
  stats: {
    total_patients: number;
    active_patients: number;
    pending_patients: number;
    average_days_sober: number;
    total_check_ins_today: number;
    high_priority_alerts: number;
  };
  recent_admissions: Partial<Patient>[];
  staff_list: Partial<Staff>[];
}

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ============================================================================
// WEBSOCKET EVENTS
// ============================================================================

export interface SocketUser {
  id: string;
  type: 'staff' | 'patient';
  facility_id?: string;
}

export enum SocketEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Authentication
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',

  // Messages
  NEW_MESSAGE = 'new_message',
  MESSAGE_READ = 'message_read',

  // Goals
  GOAL_ASSIGNED = 'goal_assigned',
  GOAL_UPDATED = 'goal_updated',

  // Notifications
  NOTIFICATION = 'notification',

  // Patient Activity (for staff)
  PATIENT_CHECK_IN = 'patient_check_in',
  PATIENT_CRAVING = 'patient_craving',

  // Alerts
  CRISIS_ALERT = 'crisis_alert',
}

export default {};
