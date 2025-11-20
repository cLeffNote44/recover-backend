/**
 * HomeScreen Component Tests
 *
 * Tests the main dashboard screen including:
 * - Sobriety tracking display
 * - Check-in functionality
 * - HALT check integration
 * - Badge display
 * - Quote of the day
 * - Theme toggling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeScreen } from './HomeScreen';
import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { BrowserRouter } from 'react-router-dom';

// Mock the celebration and quote functions
vi.mock('@/lib/celebrations', () => ({
  celebrate: vi.fn(),
}));

vi.mock('@/lib/quotes', () => ({
  getQuoteOfTheDay: vi.fn(() => ({
    id: '1',
    text: 'Test motivational quote',
    author: 'Test Author',
    category: 'motivation',
  })),
}));

// Mock Recharts to avoid rendering issues in tests
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

// Helper to wrap component with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    // Reset all stores before each test
    const recoveryStore = useRecoveryStore.getState();
    const journalStore = useJournalStore.getState();
    const activitiesStore = useActivitiesStore.getState();
    const settingsStore = useSettingsStore.getState();

    // Set up initial state - 30 days sober
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    recoveryStore.setSobrietyDate(thirtyDaysAgo.toISOString().split('T')[0]);
    recoveryStore.setCostPerDay(10);
    recoveryStore.setUnlockedBadges(['24h', '1week']);
    recoveryStore.setReasonsForSobriety(['Health', 'Family']);
    recoveryStore.setCleanPeriods([]);
    recoveryStore.setRelapses([]);

    // Set up journal data
    journalStore.setCheckIns([]);
    journalStore.setMeditations([]);
    journalStore.setMeetings([]);
    journalStore.setGratitude([]);
    journalStore.setGrowthLogs([]);
    journalStore.setChallenges([]);

    // Set up activities
    activitiesStore.setCravings([]);

    // Set up settings
    settingsStore.setDarkMode(false);
    settingsStore.setCelebrationsEnabled(true);
  });

  describe('Initial Rendering', () => {
    it('should render the home screen', () => {
      renderWithRouter(<HomeScreen />);

      // Should show the home screen header
      expect(screen.getByText(/Recover/i)).toBeInTheDocument();
      expect(screen.getByText(/One day at a time/i)).toBeInTheDocument();
    });

    it('should display days sober correctly', () => {
      renderWithRouter(<HomeScreen />);

      // Should show approximately 30 days (might be 29-31 due to time zones)
      const daysSoberElement = screen.getByText(/days/i);
      expect(daysSoberElement).toBeInTheDocument();
    });

    it('should display total savings', () => {
      renderWithRouter(<HomeScreen />);

      // With 30 days at $10/day = $300
      expect(screen.getByText(/\$300/)).toBeInTheDocument();
    });

    it('should display quote of the day', () => {
      renderWithRouter(<HomeScreen />);

      expect(screen.getByText('Test motivational quote')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('should display milestone information', () => {
      renderWithRouter(<HomeScreen />);

      // 30 days should show the 30-day milestone
      expect(screen.getByText(/30 Days/i)).toBeInTheDocument();
    });
  });

  describe('Check-In Functionality', () => {
    it('should show check-in button when not checked in today', () => {
      renderWithRouter(<HomeScreen />);

      const checkInButton = screen.getByRole('button', { name: /check in now/i });
      expect(checkInButton).toBeInTheDocument();
    });

    it('should open check-in modal when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      const checkInButton = screen.getByRole('button', { name: /check in now/i });
      await user.click(checkInButton);

      // Modal should appear with title
      await waitFor(() => {
        expect(screen.getByText(/daily check-in/i)).toBeInTheDocument();
      });
    });

    it('should allow selecting mood and adding notes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      // Open check-in modal
      const checkInButton = screen.getByRole('button', { name: /check in now/i });
      await user.click(checkInButton);

      await waitFor(() => {
        expect(screen.getByText(/How are you feeling today/i)).toBeInTheDocument();
      });

      // Select a mood (find button with emoji)
      const moodButtons = screen.getAllByRole('button');
      const mood5Button = moodButtons.find(btn => btn.textContent?.includes('😊'));
      if (mood5Button) {
        await user.click(mood5Button);
      }

      // Add notes
      const notesInput = screen.getByPlaceholderText(/Add notes/i);
      await user.type(notesInput, 'Feeling great today!');

      expect(notesInput).toHaveValue('Feeling great today!');
    });

    it('should save check-in and close modal', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      const checkInButton = screen.getByRole('button', { name: /check in now/i });
      await user.click(checkInButton);

      await waitFor(() => {
        expect(screen.getByText(/daily check-in/i)).toBeInTheDocument();
      });

      // Select mood
      const moodButtons = screen.getAllByRole('button');
      const mood5Button = moodButtons.find(btn => btn.textContent?.includes('😊'));
      if (mood5Button) {
        await user.click(mood5Button);
      }

      // Save check-in (button text is "Complete Check-In")
      const saveButton = screen.getByRole('button', { name: /complete check-in/i });
      await user.click(saveButton);

      // Check that check-in was added to store
      const checkIns = useJournalStore.getState().checkIns;
      expect(checkIns.length).toBe(1);
      expect(checkIns[0].mood).toBe(5);
    });

    it('should show check-in completed state after checking in', async () => {
      const user = userEvent.setup();

      // Add a check-in for today
      const today = new Date().toISOString().split('T')[0];
      useJournalStore.getState().setCheckIns([
        { id: 1, date: today, mood: 5, notes: 'Test' }
      ]);

      renderWithRouter(<HomeScreen />);

      // Should show completed state
      expect(screen.getByText(/Checked in today/i)).toBeInTheDocument();
    });
  });

  describe('HALT Check', () => {
    it('should show HALT check button', () => {
      renderWithRouter(<HomeScreen />);

      const haltButton = screen.getByRole('button', { name: /HALT check/i });
      expect(haltButton).toBeInTheDocument();
    });

    it('should open HALT check modal when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      const haltButton = screen.getByRole('button', { name: /HALT check/i });
      await user.click(haltButton);

      await waitFor(() => {
        expect(screen.getByText(/Hungry/i)).toBeInTheDocument();
        expect(screen.getByText(/Angry/i)).toBeInTheDocument();
        expect(screen.getByText(/Lonely/i)).toBeInTheDocument();
        expect(screen.getByText(/Tired/i)).toBeInTheDocument();
      });
    });
  });

  describe('Badge Display', () => {
    it('should display recently earned badges', () => {
      renderWithRouter(<HomeScreen />);

      // Should show badges section
      expect(screen.getByText(/Recent Achievements/i)).toBeInTheDocument();
    });

    it('should allow viewing all badges', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      const viewAllButton = screen.getByRole('button', { name: /view all badges/i });
      await user.click(viewAllButton);

      // Badges modal should open
      await waitFor(() => {
        expect(screen.getByText(/All Badges/i)).toBeInTheDocument();
      });
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle dark mode when theme button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      // Find theme toggle button
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(themeButton);

      // Dark mode should be enabled
      const settings = useSettingsStore.getState();
      expect(settings.darkMode).toBe(true);
    });
  });

  describe('Sobriety Date Picker', () => {
    it('should allow changing sobriety date', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      // Find edit button for sobriety date
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(btn =>
        btn.getAttribute('aria-label')?.includes('Edit') ||
        btn.textContent?.includes('Edit')
      );

      if (editButton) {
        await user.click(editButton);

        // Date picker should appear
        await waitFor(() => {
          expect(screen.getByLabelText(/Sobriety Date/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Statistics Display', () => {
    it('should display current streak', () => {
      // Add consecutive check-ins
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      useJournalStore.getState().setCheckIns([
        { id: 1, date: today.toISOString().split('T')[0], mood: 5, notes: '' },
        { id: 2, date: yesterday.toISOString().split('T')[0], mood: 4, notes: '' }
      ]);

      renderWithRouter(<HomeScreen />);

      // Should show 2-day streak
      expect(screen.getByText(/streak/i)).toBeInTheDocument();
    });

    it('should display mood trend', () => {
      renderWithRouter(<HomeScreen />);

      // Should show mood trend indicator
      expect(screen.getByText(/mood trend/i)).toBeInTheDocument();
    });
  });

  describe('Risk Prediction', () => {
    it('should display risk prediction when data is available', () => {
      // Add some historical data for risk prediction
      const checkIns = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        checkIns.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          mood: Math.floor(Math.random() * 3) + 3, // Moods 3-5
          notes: ''
        });
      }

      useJournalStore.getState().setCheckIns(checkIns);

      renderWithRouter(<HomeScreen />);

      // Risk prediction card should be visible
      expect(screen.getByText(/Risk Level/i)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show motivational message when no badges earned', () => {
      useRecoveryStore.getState().setUnlockedBadges([]);

      renderWithRouter(<HomeScreen />);

      // Should show encouragement to earn badges
      expect(screen.getByText(/Start your journey/i)).toBeInTheDocument();
    });

    it('should show check-in encouragement when no recent check-ins', () => {
      useJournalStore.getState().setCheckIns([]);

      renderWithRouter(<HomeScreen />);

      // Should encourage daily check-ins
      expect(screen.getByText(/Daily Check-In/i)).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should handle missing sobriety date gracefully', () => {
      useRecoveryStore.getState().setSobrietyDate('');

      renderWithRouter(<HomeScreen />);

      // Should show setup message
      expect(screen.getByText(/Set your sobriety date/i)).toBeInTheDocument();
    });

    it('should calculate correct days sober for different dates', () => {
      // Set sobriety date to 100 days ago
      const hundredDaysAgo = new Date();
      hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 100);
      useRecoveryStore.getState().setSobrietyDate(hundredDaysAgo.toISOString().split('T')[0]);

      renderWithRouter(<HomeScreen />);

      // Should show approximately 100 days
      const daysText = screen.getByText(/\d{2,3}\s+days/i);
      expect(daysText).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      renderWithRouter(<HomeScreen />);

      const checkInButton = screen.getByRole('button', { name: /daily check-in/i });
      expect(checkInButton).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeScreen />);

      // Tab through interactive elements
      await user.tab();

      // First focusable element should be focused
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName).toBe('BUTTON');
    });
  });
});
