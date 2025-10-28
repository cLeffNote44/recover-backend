// Core data types for Recovery Journey app

export interface HALTCheck {
  hungry: number;    // 1-10
  angry: number;     // 1-10
  lonely: number;    // 1-10
  tired: number;     // 1-10
}

export interface CheckIn {
  id: number;
  date: string;
  mood?: number;
  notes?: string;
  halt?: HALTCheck;  // Optional HALT assessment
}

export interface Meeting {
  id: number;
  date: string;
  type: string;
  location: string;
  notes?: string;
}

export interface GrowthLog {
  id: number;
  date: string;
  title: string;
  description: string;
}

export interface Challenge {
  id: number;
  date: string;
  situation: string;
  response: string;
  outcome: string;
}

export interface Gratitude {
  id: number;
  date: string;
  entry: string;
}

export interface Contact {
  id: number;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  description?: string;
  type: 'meeting' | 'appointment' | 'reminder' | 'other';
}

export interface Craving {
  id: number;
  date: string;
  intensity: number;
  trigger: string;
  triggerNotes?: string;
  copingStrategy?: string;
  overcame: boolean;
  halt?: HALTCheck;  // Optional HALT assessment before craving
}

export interface Meditation {
  id: number;
  date: string;
  duration: number;
  type: string;
  notes?: string;
}

export interface RelapsePlan {
  warningSigns: string[];
  highRiskSituations: string[];
  greenActions: string[];
  yellowActions: string[];
  redActions: string[];
}

export interface ReasonForSobriety {
  id: number;
  date: string;
  text: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type?: 'checkins' | 'meditations' | 'cravings' | 'meetings' | 'gratitude' | 'streak';
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminderTime: string; // Format: "HH:mm" (24-hour)
  streakReminders: boolean;
  meetingReminders: boolean;
  milestoneNotifications: boolean;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  category: 'recovery' | 'wellness' | 'personal' | 'social';
  targetType: 'numerical' | 'yes-no' | 'streak';
  targetValue?: number;  // For numerical goals
  currentValue: number;  // Current progress
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  startDate: string;
  endDate?: string;  // Optional end date
  completedDate?: string;  // When goal was completed
  isActive: boolean;  // Active goals show up in tracking
  isCompleted: boolean;
  streak?: number;  // For habit streak tracking
  lastUpdated?: string;  // Last time progress was updated
  reminderEnabled: boolean;
  notes?: string;
}

export interface GoalProgress {
  goalId: number;
  date: string;
  value: number;  // Progress value for that day
  notes?: string;
}

export interface AppData {
  sobrietyDate: string;
  checkIns: CheckIn[];
  meetings: Meeting[];
  growthLogs: GrowthLog[];
  challenges: Challenge[];
  gratitude: Gratitude[];
  contacts: Contact[];
  events: CalendarEvent[];
  cravings: Craving[];
  meditations: Meditation[];
  relapsePlan: RelapsePlan;
  darkMode: boolean;
  costPerDay: number;
  savingsGoal: string;
  savingsGoalAmount: number;
  reasonsForSobriety: ReasonForSobriety[];
  unlockedBadges: string[];
  notificationSettings: NotificationSettings;
  onboardingCompleted: boolean;
  celebrationsEnabled: boolean;
  goals: Goal[];
  goalProgress: GoalProgress[];
}

export const MEDITATION_TYPES = [
  'Mindfulness',
  'Guided Meditation',
  'Breathing Exercise',
  'Body Scan',
  'Loving-Kindness',
  'Visualization',
  'Walking Meditation',
  'Mantra',
  'Other'
] as const;

export const TRIGGER_TYPES = [
  'Stress',
  'Boredom',
  'Social Situation',
  'Loneliness',
  'Anger',
  'Celebration',
  'Sadness',
  'Physical Pain',
  'Seeing Substance',
  'Old Habits',
  'Other'
] as const;

export const EVENT_TYPES = [
  'meeting',
  'appointment',
  'reminder',
  'other'
] as const;

export type MeditationType = typeof MEDITATION_TYPES[number];
export type TriggerType = typeof TRIGGER_TYPES[number];
export type EventType = typeof EVENT_TYPES[number];

