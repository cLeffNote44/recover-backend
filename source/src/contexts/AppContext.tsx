import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { AppData, CheckIn, Meeting, GrowthLog, Challenge, Gratitude, Contact, CalendarEvent, Craving, Meditation, RelapsePlan, ReasonForSobriety, NotificationSettings, Goal, GoalProgress } from '@/types/app';
import { MOTIVATIONAL_QUOTES } from '@/lib/constants';
import { initializeNotifications } from '@/lib/notifications';

interface AppContextType extends AppData {
  // Setters
  setSobrietyDate: (date: string) => void;
  setCheckIns: (checkIns: CheckIn[]) => void;
  setMeetings: (meetings: Meeting[]) => void;
  setGrowthLogs: (logs: GrowthLog[]) => void;
  setChallenges: (challenges: Challenge[]) => void;
  setGratitude: (gratitude: Gratitude[]) => void;
  setContacts: (contacts: Contact[]) => void;
  setEvents: (events: CalendarEvent[]) => void;
  setCravings: (cravings: Craving[]) => void;
  setMeditations: (meditations: Meditation[]) => void;
  setRelapsePlan: (plan: RelapsePlan) => void;
  setDarkMode: (mode: boolean) => void;
  setCostPerDay: (cost: number) => void;
  setSavingsGoal: (goal: string) => void;
  setSavingsGoalAmount: (amount: number) => void;
  setReasonsForSobriety: (reasons: ReasonForSobriety[]) => void;
  setUnlockedBadges: (badges: string[]) => void;
  setNotificationSettings: (settings: NotificationSettings) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setCelebrationsEnabled: (enabled: boolean) => void;
  setGoals: (goals: Goal[]) => void;
  setGoalProgress: (progress: GoalProgress[]) => void;

  // Helpers
  currentQuote: string;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

const STORAGE_KEY = 'recovery_journey_data';

const defaultRelapsePlan: RelapsePlan = {
  warningSigns: [],
  highRiskSituations: [],
  greenActions: [],
  yellowActions: [],
  redActions: []
};

const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  dailyReminderTime: '09:00',
  streakReminders: true,
  meetingReminders: true,
  milestoneNotifications: true,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [sobrietyDate, setSobrietyDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [growthLogs, setGrowthLogs] = useState<GrowthLog[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [gratitude, setGratitude] = useState<Gratitude[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [relapsePlan, setRelapsePlan] = useState<RelapsePlan>(defaultRelapsePlan);
  const [darkMode, setDarkMode] = useState(false);
  const [costPerDay, setCostPerDay] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState('');
  const [savingsGoalAmount, setSavingsGoalAmount] = useState(0);
  const [reasonsForSobriety, setReasonsForSobriety] = useState<ReasonForSobriety[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [celebrationsEnabled, setCelebrationsEnabled] = useState(true); // Default to enabled
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  // Memoize loadData function to prevent unnecessary re-renders
  const loadData = useCallback(async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data: AppData = JSON.parse(stored);
          setSobrietyDate(data.sobrietyDate || new Date().toISOString().split('T')[0]);
          setCheckIns(data.checkIns || []);
          setMeetings(data.meetings || []);
          setGrowthLogs(data.growthLogs || []);
          setChallenges(data.challenges || []);
          setGratitude(data.gratitude || []);
          setContacts(data.contacts || []);
          setEvents(data.events || []);
          setCravings(data.cravings || []);
          setMeditations(data.meditations || []);
          setRelapsePlan(data.relapsePlan || defaultRelapsePlan);
          setDarkMode(data.darkMode || false);
          setCostPerDay(data.costPerDay || 0);
          setSavingsGoal(data.savingsGoal || '');
          setSavingsGoalAmount(data.savingsGoalAmount || 0);
          setReasonsForSobriety(data.reasonsForSobriety || []);
          setUnlockedBadges(data.unlockedBadges || []);
          setNotificationSettings(data.notificationSettings || defaultNotificationSettings);
          setOnboardingCompleted(data.onboardingCompleted || false);
          setCelebrationsEnabled(data.celebrationsEnabled !== undefined ? data.celebrationsEnabled : true);
          setGoals(data.goals || []);
          setGoalProgress(data.goalProgress || []);
        } catch (parseError) {
          console.error('Error parsing stored data. Data may be corrupted:', parseError);
          // Show error toast if toast is available
          if (typeof window !== 'undefined' && (window as any).toast) {
            (window as any).toast.error('Could not load saved data. Starting fresh.');
          }
          // Clear corrupted data
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // Set random quote
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setCurrentQuote(randomQuote);
    } catch (error) {
      console.error('Error loading data:', error);
      // Don't crash the app, just log the error
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.error('Failed to load data. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since setters are stable

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save data whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        const dataToSave: AppData = {
          sobrietyDate,
          checkIns,
          meetings,
          growthLogs,
          challenges,
          gratitude,
          contacts,
          events,
          cravings,
          meditations,
          relapsePlan,
          darkMode,
          costPerDay,
          savingsGoal,
          savingsGoalAmount,
          reasonsForSobriety,
          unlockedBadges,
          notificationSettings,
          onboardingCompleted,
          celebrationsEnabled,
          goals,
          goalProgress
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (saveError) {
        console.error('Error saving data to localStorage:', saveError);
        // Show error toast if storage is full or other error
        if (typeof window !== 'undefined' && (window as any).toast) {
          (window as any).toast.error('Could not save your data. Storage may be full.');
        }
      }
    }
  }, [
    loading, sobrietyDate, checkIns, meetings, growthLogs, challenges,
    gratitude, contacts, events, cravings, meditations, relapsePlan,
    darkMode, costPerDay, savingsGoal, savingsGoalAmount, reasonsForSobriety,
    unlockedBadges, notificationSettings, onboardingCompleted, celebrationsEnabled,
    goals, goalProgress
  ]);

  // Initialize notifications when settings change
  useEffect(() => {
    if (!loading && onboardingCompleted) {
      initializeNotifications(notificationSettings);
    }
  }, [notificationSettings, loading, onboardingCompleted]);

  // Memoize context value to prevent unnecessary re-renders
  const value: AppContextType = useMemo(() => ({
    sobrietyDate,
    checkIns,
    meetings,
    growthLogs,
    challenges,
    gratitude,
    contacts,
    events,
    cravings,
    meditations,
    relapsePlan,
    darkMode,
    costPerDay,
    savingsGoal,
    savingsGoalAmount,
    reasonsForSobriety,
    unlockedBadges,
    notificationSettings,
    onboardingCompleted,
    celebrationsEnabled,
    goals,
    goalProgress,
    setSobrietyDate,
    setCheckIns,
    setMeetings,
    setGrowthLogs,
    setChallenges,
    setGratitude,
    setContacts,
    setEvents,
    setCravings,
    setMeditations,
    setRelapsePlan,
    setDarkMode,
    setCostPerDay,
    setSavingsGoal,
    setSavingsGoalAmount,
    setReasonsForSobriety,
    setUnlockedBadges,
    setNotificationSettings,
    setOnboardingCompleted,
    setCelebrationsEnabled,
    setGoals,
    setGoalProgress,
    currentQuote,
    loading,
    refreshData: loadData
  }), [
    sobrietyDate, checkIns, meetings, growthLogs, challenges,
    gratitude, contacts, events, cravings, meditations, relapsePlan,
    darkMode, costPerDay, savingsGoal, savingsGoalAmount, reasonsForSobriety,
    unlockedBadges, notificationSettings, onboardingCompleted, celebrationsEnabled,
    goals, goalProgress, currentQuote, loading, loadData
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

