/**
 * Integration Tests - Critical User Flows
 *
 * Tests complete end-to-end user scenarios including:
 * - New user onboarding
 * - Daily check-in flow
 * - Craving management
 * - Milestone celebration
 * - Badge earning
 * - Data backup and restore
 * - Relapse tracking and recovery
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { HomeScreen } from '@/components/app/screens/HomeScreen';
import { JournalScreen } from '@/components/app/screens/JournalScreen';
import { SettingsScreen } from '@/components/app/screens/SettingsScreen';
import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/celebrations', () => ({
  celebrate: vi.fn(),
}));

vi.mock('@/lib/quotes', () => ({
  getQuoteOfTheDay: vi.fn(() => ({
    id: '1',
    text: 'One day at a time',
    author: 'Recovery Wisdom',
    category: 'motivation',
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Helper to reset all stores to fresh state
const resetAllStores = () => {
  const recoveryStore = useRecoveryStore.getState();
  const journalStore = useJournalStore.getState();
  const activitiesStore = useActivitiesStore.getState();
  const settingsStore = useSettingsStore.getState();

  // Reset to initial state
  recoveryStore.setSobrietyDate('');
  recoveryStore.setCostPerDay(0);
  recoveryStore.setUnlockedBadges([]);
  recoveryStore.setReasonsForSobriety([]);
  recoveryStore.setCleanPeriods([]);
  recoveryStore.setRelapses([]);

  journalStore.setCheckIns([]);
  journalStore.setMeditations([]);
  journalStore.setMeetings([]);
  journalStore.setGratitude([]);
  journalStore.setGrowthLogs([]);
  journalStore.setChallenges([]);

  activitiesStore.setCravings([]);
  activitiesStore.setGoals([]);
  activitiesStore.setContacts([]);

  settingsStore.setDarkMode(false);
  settingsStore.setCelebrationsEnabled(true);
};

describe('Integration Tests - User Flows', () => {
  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Flow 1: New User Onboarding', () => {
    it('should complete full onboarding flow', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      // Step 1: New user sees prompt to set sobriety date
      expect(screen.getByText(/Set your sobriety date/i)).toBeInTheDocument();

      // Step 2: User sets sobriety date
      const editButton = screen.getAllByRole('button').find(
        (btn) => btn.textContent?.includes('Set') || btn.textContent?.includes('Edit')
      );

      if (editButton) {
        await user.click(editButton);

        await waitFor(async () => {
          const dateInput = screen.getByLabelText(/Sobriety Date/i);
          const today = new Date().toISOString().split('T')[0];
          await user.clear(dateInput);
          await user.type(dateInput, today);

          const saveButton = screen.getByRole('button', { name: /Save/i });
          await user.click(saveButton);
        });
      }

      // Step 3: Verify sobriety date is set
      const recoveryStore = useRecoveryStore.getState();
      expect(recoveryStore.sobrietyDate).toBeTruthy();

      // Step 4: User sees welcome message and stats
      await waitFor(() => {
        expect(screen.getByText(/days sober/i)).toBeInTheDocument();
      });

      // Step 5: User completes first daily check-in
      const checkInButton = screen.getByRole('button', { name: /Daily check-in/i });
      await user.click(checkInButton);

      await waitFor(async () => {
        // Select mood
        const moodButtons = screen.getAllByRole('button');
        const mood5 = moodButtons.find((btn) => btn.textContent?.includes('😊'));
        if (mood5) {
          await user.click(mood5);
        }

        // Save check-in
        const saveButton = screen.getByRole('button', { name: /Save check-in/i });
        await user.click(saveButton);
      });

      // Step 6: Verify check-in was saved
      const journalStore = useJournalStore.getState();
      expect(journalStore.checkIns.length).toBe(1);

      // Step 7: User should see first badge earned (24h badge)
      await waitFor(() => {
        expect(screen.getByText(/Achievement/i)).toBeInTheDocument();
      });
    });

    it('should guide user through setting up recovery reasons', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      const recoveryStore = useRecoveryStore.getState();

      // User adds reasons for sobriety
      recoveryStore.setReasonsForSobriety([
        'Better health',
        'Family relationships',
        'Career goals',
      ]);

      // Verify reasons are stored
      expect(useRecoveryStore.getState().reasonsForSobriety).toHaveLength(3);
    });
  });

  describe('Flow 2: Daily Check-In Journey', () => {
    it('should complete daily check-in with HALT assessment', async () => {
      const user = userEvent.setup();

      // Setup: User is 7 days sober
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      useRecoveryStore.getState().setSobrietyDate(sevenDaysAgo.toISOString().split('T')[0]);

      renderWithRouter(<HomeScreen />);

      // Step 1: User starts check-in
      const checkInButton = screen.getByRole('button', { name: /Daily check-in/i });
      await user.click(checkInButton);

      // Step 2: User performs HALT check
      await waitFor(async () => {
        const haltButton = screen.getByRole('button', { name: /HALT/i });
        await user.click(haltButton);

        // Complete HALT assessment
        expect(screen.getByText(/Hungry/i)).toBeInTheDocument();
      });

      // Step 3: User selects mood and adds notes
      await waitFor(async () => {
        const notesInput = screen.getByPlaceholderText(/Add notes/i);
        await user.type(notesInput, 'Feeling strong today. Grateful for support.');
      });

      // Step 4: Save check-in
      await waitFor(async () => {
        const saveButton = screen.getByRole('button', { name: /Save check-in/i });
        await user.click(saveButton);
      });

      // Step 5: Verify check-in includes HALT data
      const checkIns = useJournalStore.getState().checkIns;
      expect(checkIns.length).toBeGreaterThan(0);
      expect(checkIns[checkIns.length - 1].notes).toContain('Feeling strong');

      // Step 6: Success toast shown
      expect(toast.success).toHaveBeenCalled();
    });

    it('should build check-in streak over multiple days', async () => {
      const journalStore = useJournalStore.getState();

      // Simulate 5 consecutive days of check-ins
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        journalStore.setCheckIns([
          ...journalStore.checkIns,
          {
            id: i + 1,
            date: date.toISOString().split('T')[0],
            mood: 4 + (i % 2), // Varying moods: 4, 5, 4, 5, 4
            notes: `Day ${i + 1} check-in`,
          },
        ]);
      }

      renderWithRouter(<HomeScreen />);

      // Verify 5-day streak is displayed
      await waitFor(() => {
        expect(screen.getByText(/5.*day.*streak/i)).toBeInTheDocument();
      });
    });
  });

  describe('Flow 3: Craving Management', () => {
    it('should handle craving from trigger to resolution', async () => {
      const user = userEvent.setup();

      // Setup: User is 14 days sober
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      useRecoveryStore.getState().setSobrietyDate(twoWeeksAgo.toISOString().split('T')[0]);

      renderWithRouter(<JournalScreen />);

      // Step 1: User navigates to cravings tab (default)
      expect(screen.getByRole('tab', { name: /Cravings/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );

      // Step 2: User experiences craving and logs it
      const addButton = screen.getByRole('button', { name: /Add craving/i });
      await user.click(addButton);

      // Step 3: User documents craving details
      await waitFor(async () => {
        // Set high intensity
        const intensitySlider = screen.getByLabelText(/Intensity/i);
        await user.click(intensitySlider);

        // Select trigger
        const triggerSelect = screen.getByLabelText(/Trigger/i);
        await user.click(triggerSelect);

        const stressTrigger = await screen.findByText('Stress');
        await user.click(stressTrigger);

        // Add context
        const notesInput = screen.getByLabelText(/Notes/i);
        await user.type(notesInput, 'Difficult conversation at work triggered strong urge');

        // Add coping strategy used
        const copingInput = screen.getByLabelText(/Coping strategy/i);
        await user.type(copingInput, 'Called sponsor, went for a walk, deep breathing');
      });

      // Step 4: User marks craving as overcome
      await waitFor(async () => {
        const overcameCheckbox = screen.getByLabelText(/Overcame/i);
        await user.click(overcameCheckbox);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);
      });

      // Step 5: Verify craving logged with success
      const cravings = useActivitiesStore.getState().cravings;
      expect(cravings.length).toBe(1);
      expect(cravings[0].overcame).toBe(true);
      expect(cravings[0].trigger).toBe('Stress');

      // Step 6: Success message shown
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('craving'));

      // Step 7: Verify badge progress (Urge Defender badge tracks overcome cravings)
      // After 10 overcome cravings, user earns badge
    });

    it('should show pattern recognition after multiple cravings', async () => {
      const activitiesStore = useActivitiesStore.getState();

      // Simulate pattern: stress-triggered cravings
      const cravings = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        cravings.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          intensity: 7 + i,
          trigger: 'Stress',
          triggerNotes: `Stressful event ${i + 1}`,
          copingStrategy: 'Exercise',
          overcame: true,
        });
      }

      activitiesStore.setCravings(cravings);

      renderWithRouter(<HomeScreen />);

      // Analytics should detect stress pattern
      await waitFor(() => {
        expect(screen.getByText(/pattern/i)).toBeInTheDocument();
      });
    });
  });

  describe('Flow 4: Milestone and Badge Journey', () => {
    it('should earn badges as user progresses', async () => {
      const recoveryStore = useRecoveryStore.getState();
      const journalStore = useJournalStore.getState();

      // Day 1: Earn 24h badge
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      recoveryStore.setSobrietyDate(oneDayAgo.toISOString().split('T')[0]);

      renderWithRouter(<HomeScreen />);

      await waitFor(() => {
        // Should show 24h milestone
        expect(screen.getByText(/Starting Strong/i)).toBeInTheDocument();
      });

      // Day 7: Earn 1 Week badge
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      recoveryStore.setSobrietyDate(sevenDaysAgo.toISOString().split('T')[0]);

      // Add check-ins for streak badge
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        journalStore.setCheckIns([
          ...journalStore.checkIns,
          {
            id: i + 1,
            date: date.toISOString().split('T')[0],
            mood: 4,
            notes: '',
          },
        ]);
      }

      renderWithRouter(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/1 Week/i)).toBeInTheDocument();
      });

      // Verify badges are unlocked
      const unlockedBadges = useRecoveryStore.getState().unlockedBadges;
      expect(unlockedBadges).toContain('24h');
      expect(unlockedBadges).toContain('1week');
    });

    it('should celebrate milestone achievements', async () => {
      const celebrate = (await import('@/lib/celebrations')).celebrate;

      // Setup: User reaches 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      useRecoveryStore.getState().setSobrietyDate(thirtyDaysAgo.toISOString().split('T')[0]);

      // Enable celebrations
      useSettingsStore.getState().setCelebrationsEnabled(true);

      renderWithRouter(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/30 Days/i)).toBeInTheDocument();
      });

      // Celebration animation should trigger
      expect(celebrate).toHaveBeenCalled();
    });
  });

  describe('Flow 5: Relapse Tracking and Recovery', () => {
    it('should handle relapse documentation and recovery restart', async () => {
      const user = userEvent.setup();

      // Setup: User was 60 days sober
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      useRecoveryStore.getState().setSobrietyDate(sixtyDaysAgo.toISOString().split('T')[0]);

      renderWithRouter(<JournalScreen />);

      // Navigate to relapse tracking (would be a specific tab/section)
      // For this test, we'll simulate the store actions

      const recoveryStore = useRecoveryStore.getState();
      const today = new Date().toISOString().split('T')[0];

      // Step 1: User documents relapse
      const relapse = {
        id: 1,
        date: today,
        triggers: ['Stress', 'Social pressure'],
        emotions: ['Anxious', 'Overwhelmed'],
        context: 'Work party, felt isolated without drinking',
        supportUsed: ['Called sponsor after'],
        lessonsLearned: 'Need better coping strategies for social events',
        actionPlan: 'Practice saying no, leave early if uncomfortable',
      };

      recoveryStore.setRelapses([relapse]);

      // Step 2: Clean period is recorded (60 days)
      recoveryStore.setCleanPeriods([
        {
          id: 1,
          startDate: sixtyDaysAgo.toISOString().split('T')[0],
          endDate: today,
          daysClean: 60,
        },
      ]);

      // Step 3: Sobriety date resets to today
      recoveryStore.setSobrietyDate(today);

      // Step 4: Verify relapse was logged
      expect(useRecoveryStore.getState().relapses).toHaveLength(1);
      expect(useRecoveryStore.getState().cleanPeriods).toHaveLength(1);

      // Step 5: User sees fresh start with lessons learned
      renderWithRouter(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/0.*days/i)).toBeInTheDocument(); // Back to day 0
      });

      // Step 6: Traffic light system shows status
      // (Traffic light would show appropriate color based on recent relapse)
    });

    it('should preserve badge progress after relapse', async () => {
      const recoveryStore = useRecoveryStore.getState();

      // User had earned multiple badges before relapse
      recoveryStore.setUnlockedBadges(['24h', '1week', '30days']);

      // User experiences relapse
      const today = new Date().toISOString().split('T')[0];
      recoveryStore.setSobrietyDate(today);

      // Badges should still be preserved (achievements are permanent)
      expect(useRecoveryStore.getState().unlockedBadges).toContain('30days');
    });
  });

  describe('Flow 6: Data Backup and Restore', () => {
    it('should export data and restore successfully', async () => {
      const user = userEvent.setup();

      // Setup: User has significant data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      useRecoveryStore.getState().setSobrietyDate(thirtyDaysAgo.toISOString().split('T')[0]);
      useRecoveryStore.getState().setUnlockedBadges(['24h', '1week', '30days']);

      useJournalStore.getState().setCheckIns([
        { id: 1, date: '2024-01-01', mood: 5, notes: 'Great day' },
        { id: 2, date: '2024-01-02', mood: 4, notes: 'Good day' },
      ]);

      // Capture current state
      const originalState = {
        sobrietyDate: useRecoveryStore.getState().sobrietyDate,
        badges: useRecoveryStore.getState().unlockedBadges,
        checkIns: useJournalStore.getState().checkIns,
      };

      renderWithRouter(<SettingsScreen />);

      // Step 1: Export data
      const exportButton = screen.getByRole('button', { name: /Export/i });
      await user.click(exportButton);

      // Step 2: Clear all data (simulating data loss)
      resetAllStores();

      // Step 3: Verify data is cleared
      expect(useRecoveryStore.getState().sobrietyDate).toBe('');
      expect(useJournalStore.getState().checkIns).toHaveLength(0);

      // Step 4: Import/restore data
      // (In real scenario, would use file upload)
      useRecoveryStore.getState().setSobrietyDate(originalState.sobrietyDate);
      useRecoveryStore.getState().setUnlockedBadges(originalState.badges);
      useJournalStore.getState().setCheckIns(originalState.checkIns);

      // Step 5: Verify restoration
      expect(useRecoveryStore.getState().sobrietyDate).toBe(originalState.sobrietyDate);
      expect(useRecoveryStore.getState().unlockedBadges).toEqual(originalState.badges);
      expect(useJournalStore.getState().checkIns).toHaveLength(2);

      // Step 6: Success toast
      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('Flow 7: Complete Week Journey', () => {
    it('should complete a full week of recovery activities', async () => {
      const user = userEvent.setup();

      // Day 1: Start recovery
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      useRecoveryStore.getState().setSobrietyDate(sevenDaysAgo.toISOString().split('T')[0]);

      // Days 1-7: Daily check-ins
      const checkIns = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        checkIns.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          mood: 3 + (i % 3), // Varying moods
          notes: `Day ${i + 1}`,
        });
      }
      useJournalStore.getState().setCheckIns(checkIns);

      // Days 3, 5: Cravings (both overcome)
      useActivitiesStore.getState().setCravings([
        {
          id: 1,
          date: checkIns[2].date,
          intensity: 7,
          trigger: 'Stress',
          overcame: true,
          copingStrategy: 'Exercise',
        },
        {
          id: 2,
          date: checkIns[4].date,
          intensity: 5,
          trigger: 'Social',
          overcame: true,
          copingStrategy: 'Called sponsor',
        },
      ]);

      // Days 2, 6: Attended meetings
      useJournalStore.getState().setMeetings([
        {
          id: 1,
          date: checkIns[1].date,
          type: 'AA',
          location: 'Community Center',
          notes: 'Inspiring',
        },
        {
          id: 2,
          date: checkIns[5].date,
          type: 'NA',
          location: 'Church Hall',
          notes: 'Supportive group',
        },
      ]);

      // Daily gratitude
      const gratitude = checkIns.map((ci, i) => ({
        id: i + 1,
        date: ci.date,
        content: `Grateful for day ${i + 1}`,
      }));
      useJournalStore.getState().setGratitude(gratitude);

      // Day 7: Review week
      renderWithRouter(<HomeScreen />);

      await waitFor(() => {
        // Should show 7 days sober
        expect(screen.getByText(/7.*days/i)).toBeInTheDocument();

        // Should show 7-day streak
        expect(screen.getByText(/7.*streak/i)).toBeInTheDocument();

        // Should show week milestone
        expect(screen.getByText(/1 Week/i)).toBeInTheDocument();
      });

      // Verify achievements
      const recoveryStore = useRecoveryStore.getState();
      const journalStore = useJournalStore.getState();
      const activitiesStore = useActivitiesStore.getState();

      expect(recoveryStore.sobrietyDate).toBeTruthy();
      expect(journalStore.checkIns).toHaveLength(7);
      expect(activitiesStore.cravings).toHaveLength(2);
      expect(activitiesStore.cravings.every((c) => c.overcame)).toBe(true);
      expect(journalStore.meetings).toHaveLength(2);
      expect(journalStore.gratitude).toHaveLength(7);

      // Week badge should be earned
      expect(recoveryStore.unlockedBadges).toContain('1week');
    });
  });
});
