/**
 * JournalScreen Component Tests
 *
 * Tests the journaling screen including:
 * - Craving management
 * - Meeting tracking
 * - Growth logs
 * - Challenges tracking
 * - Gratitude journal
 * - Meditation logs
 * - HALT check integration
 * - Tab navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/user Event';
import userEvent from '@testing-library/user-event';
import { JournalScreen } from './JournalScreen';
import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock HALTCheck component
vi.mock('@/components/HALTCheck', () => ({
  HALTCheck: ({ onSave, onCancel }: any) => (
    <div data-testid="halt-check">
      <button onClick={() => onSave({ hungry: 1, angry: 1, lonely: 1, tired: 1 })}>
        Save HALT
      </button>
      <button onClick={onCancel}>Cancel HALT</button>
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('JournalScreen', () => {
  beforeEach(() => {
    // Reset all stores
    const recoveryStore = useRecoveryStore.getState();
    const journalStore = useJournalStore.getState();
    const activitiesStore = useActivitiesStore.getState();
    const settingsStore = useSettingsStore.getState();

    // Set up initial state
    const today = new Date().toISOString().split('T')[0];
    recoveryStore.setSobrietyDate(today);
    recoveryStore.setRelapses([]);
    recoveryStore.setCleanPeriods([]);

    journalStore.setMeetings([]);
    journalStore.setGrowthLogs([]);
    journalStore.setChallenges([]);
    journalStore.setGratitude([]);
    journalStore.setMeditations([]);

    activitiesStore.setCravings([]);

    settingsStore.setCelebrationsEnabled(true);

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render journal screen', () => {
      renderWithRouter(<JournalScreen />);

      expect(screen.getByText(/Journal/i)).toBeInTheDocument();
    });

    it('should display tab navigation', () => {
      renderWithRouter(<JournalScreen />);

      expect(screen.getByRole('tab', { name: /Cravings/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Meetings/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Growth/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Challenges/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Gratitude/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Meditation/i })).toBeInTheDocument();
    });

    it('should show cravings tab by default', () => {
      renderWithRouter(<JournalScreen />);

      const cravingsTab = screen.getByRole('tab', { name: /Cravings/i });
      expect(cravingsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Cravings Tab', () => {
    it('should show add craving button', () => {
      renderWithRouter(<JournalScreen />);

      const addButton = screen.getByRole('button', { name: /Add craving/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should open add craving form', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const addButton = screen.getByRole('button', { name: /Add craving/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Intensity/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Trigger/i)).toBeInTheDocument();
      });
    });

    it('should allow adding a craving', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const addButton = screen.getByRole('button', { name: /Add craving/i });
      await user.click(addButton);

      await waitFor(async () => {
        // Set intensity
        const intensitySlider = screen.getByLabelText(/Intensity/i);
        await user.click(intensitySlider);

        // Select trigger
        const triggerSelect = screen.getByLabelText(/Trigger/i);
        await user.click(triggerSelect);
        await user.click(screen.getByText('Stress'));

        // Add notes
        const notesInput = screen.getByLabelText(/Notes/i);
        await user.type(notesInput, 'Feeling stressed from work');

        // Add coping strategy
        const copingInput = screen.getByLabelText(/Coping strategy/i);
        await user.type(copingInput, 'Deep breathing exercises');

        // Mark as overcame
        const overcameCheckbox = screen.getByLabelText(/Overcame/i);
        await user.click(overcameCheckbox);

        // Save craving
        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);
      });

      // Check that craving was added
      const cravings = useActivitiesStore.getState().cravings;
      expect(cravings.length).toBe(1);
      expect(cravings[0].trigger).toBe('Stress');
      expect(cravings[0].overcame).toBe(true);
    });

    it('should show HALT check option when adding craving', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const addButton = screen.getByRole('button', { name: /Add craving/i });
      await user.click(addButton);

      await waitFor(() => {
        const haltButton = screen.getByRole('button', { name: /HALT check/i });
        expect(haltButton).toBeInTheDocument();
      });
    });

    it('should integrate HALT check with craving', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const addButton = screen.getByRole('button', { name: /Add craving/i });
      await user.click(addButton);

      await waitFor(async () => {
        const haltButton = screen.getByRole('button', { name: /HALT check/i });
        await user.click(haltButton);

        expect(screen.getByTestId('halt-check')).toBeInTheDocument();
      });
    });

    it('should display list of cravings', () => {
      // Add some cravings
      useActivitiesStore.getState().setCravings([
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          intensity: 8,
          trigger: 'Stress',
          triggerNotes: 'Work deadline',
          copingStrategy: 'Exercise',
          overcame: true,
        },
        {
          id: 2,
          date: new Date().toISOString().split('T')[0],
          intensity: 5,
          trigger: 'Social',
          triggerNotes: 'Party invitation',
          copingStrategy: 'Called sponsor',
          overcame: false,
        },
      ]);

      renderWithRouter(<JournalScreen />);

      expect(screen.getByText(/Work deadline/i)).toBeInTheDocument();
      expect(screen.getByText(/Party invitation/i)).toBeInTheDocument();
    });

    it('should allow deleting a craving', async () => {
      const user = userEvent.setup();

      useActivitiesStore.getState().setCravings([
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          intensity: 8,
          trigger: 'Stress',
          overcame: true,
        },
      ]);

      renderWithRouter(<JournalScreen />);

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      // Craving should be removed
      const cravings = useActivitiesStore.getState().cravings;
      expect(cravings.length).toBe(0);
    });

    it('should show empty state when no cravings', () => {
      renderWithRouter(<JournalScreen />);

      expect(screen.getByText(/No cravings tracked/i)).toBeInTheDocument();
    });
  });

  describe('Meetings Tab', () => {
    it('should switch to meetings tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const meetingsTab = screen.getByRole('tab', { name: /Meetings/i });
      await user.click(meetingsTab);

      expect(meetingsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should show add meeting button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const meetingsTab = screen.getByRole('tab', { name: /Meetings/i });
      await user.click(meetingsTab);

      const addButton = screen.getByRole('button', { name: /Add meeting/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should allow adding a meeting', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const meetingsTab = screen.getByRole('tab', { name: /Meetings/i });
      await user.click(meetingsTab);

      const addButton = screen.getByRole('button', { name: /Add meeting/i });
      await user.click(addButton);

      await waitFor(async () => {
        // Select meeting type
        const typeSelect = screen.getByLabelText(/Type/i);
        await user.click(typeSelect);
        await user.click(screen.getByText('AA'));

        // Add location
        const locationInput = screen.getByLabelText(/Location/i);
        await user.type(locationInput, 'Community Center');

        // Add notes
        const notesInput = screen.getByLabelText(/Notes/i);
        await user.type(notesInput, 'Great meeting, felt supported');

        // Save meeting
        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);
      });

      const meetings = useJournalStore.getState().meetings;
      expect(meetings.length).toBe(1);
      expect(meetings[0].type).toBe('AA');
      expect(meetings[0].location).toBe('Community Center');
    });

    it('should display list of meetings', async () => {
      const user = userEvent.setup();

      useJournalStore.getState().setMeetings([
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          type: 'AA',
          location: 'Downtown Hall',
          notes: 'Inspiring stories',
        },
      ]);

      renderWithRouter(<JournalScreen />);

      const meetingsTab = screen.getByRole('tab', { name: /Meetings/i });
      await user.click(meetingsTab);

      expect(screen.getByText(/Downtown Hall/i)).toBeInTheDocument();
    });
  });

  describe('Growth Logs Tab', () => {
    it('should switch to growth logs tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const growthTab = screen.getByRole('tab', { name: /Growth/i });
      await user.click(growthTab);

      expect(growthTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should allow adding a growth log', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const growthTab = screen.getByRole('tab', { name: /Growth/i });
      await user.click(growthTab);

      const addButton = screen.getByRole('button', { name: /Add growth log/i });
      await user.click(addButton);

      await waitFor(async () => {
        // Add title
        const titleInput = screen.getByLabelText(/Title/i);
        await user.type(titleInput, 'Learned to set boundaries');

        // Add description
        const descInput = screen.getByLabelText(/Description/i);
        await user.type(descInput, 'Practiced saying no to unhealthy situations');

        // Save
        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);
      });

      const growthLogs = useJournalStore.getState().growthLogs;
      expect(growthLogs.length).toBe(1);
      expect(growthLogs[0].milestone).toContain('boundaries');
    });

    it('should display list of growth logs', async () => {
      const user = userEvent.setup();

      useJournalStore.getState().setGrowthLogs([
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          milestone: 'First week sober',
          reflection: 'Feeling proud and hopeful',
        },
      ]);

      renderWithRouter(<JournalScreen />);

      const growthTab = screen.getByRole('tab', { name: /Growth/i });
      await user.click(growthTab);

      expect(screen.getByText(/First week sober/i)).toBeInTheDocument();
    });
  });

  describe('Challenges Tab', () => {
    it('should switch to challenges tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const challengesTab = screen.getByRole('tab', { name: /Challenges/i });
      await user.click(challengesTab);

      expect(challengesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should allow adding a challenge', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const challengesTab = screen.getByRole('tab', { name: /Challenges/i });
      await user.click(challengesTab);

      const addButton = screen.getByRole('button', { name: /Add challenge/i });
      await user.click(addButton);

      await waitFor(async () => {
        // Add situation
        const situationInput = screen.getByLabelText(/Situation/i);
        await user.type(situationInput, 'Tempted at social event');

        // Add response
        const responseInput = screen.getByLabelText(/Response/i);
        await user.type(responseInput, 'Left early and called sponsor');

        // Add outcome
        const outcomeInput = screen.getByLabelText(/Outcome/i);
        await user.type(outcomeInput, 'Felt proud of myself');

        // Save
        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);
      });

      const challenges = useJournalStore.getState().challenges;
      expect(challenges.length).toBe(1);
      expect(challenges[0].challenge).toContain('social event');
    });
  });

  describe('Gratitude Tab', () => {
    it('should switch to gratitude tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const gratitudeTab = screen.getByRole('tab', { name: /Gratitude/i });
      await user.click(gratitudeTab);

      expect(gratitudeTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should allow adding gratitude entry', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const gratitudeTab = screen.getByRole('tab', { name: /Gratitude/i });
      await user.click(gratitudeTab);

      const addButton = screen.getByRole('button', { name: /Add gratitude/i });
      await user.click(addButton);

      await waitFor(async () => {
        const entryInput = screen.getByLabelText(/What are you grateful for/i);
        await user.type(entryInput, 'Grateful for my supportive family');

        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);
      });

      const gratitude = useJournalStore.getState().gratitude;
      expect(gratitude.length).toBe(1);
      expect(gratitude[0].content).toContain('supportive family');
    });

    it('should display list of gratitude entries', async () => {
      const user = userEvent.setup();

      useJournalStore.getState().setGratitude([
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          content: 'Grateful for my health',
        },
        {
          id: 2,
          date: new Date().toISOString().split('T')[0],
          content: 'Grateful for second chances',
        },
      ]);

      renderWithRouter(<JournalScreen />);

      const gratitudeTab = screen.getByRole('tab', { name: /Gratitude/i });
      await user.click(gratitudeTab);

      expect(screen.getByText(/my health/i)).toBeInTheDocument();
      expect(screen.getByText(/second chances/i)).toBeInTheDocument();
    });
  });

  describe('Meditation Tab', () => {
    it('should switch to meditation tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const meditationTab = screen.getByRole('tab', { name: /Meditation/i });
      await user.click(meditationTab);

      expect(meditationTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should allow adding meditation session', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const meditationTab = screen.getByRole('tab', { name: /Meditation/i });
      await user.click(meditationTab);

      const addButton = screen.getByRole('button', { name: /Add meditation/i });
      await user.click(addButton);

      await waitFor(async () => {
        // Select duration
        const durationInput = screen.getByLabelText(/Duration/i);
        await user.type(durationInput, '20');

        // Select type
        const typeSelect = screen.getByLabelText(/Type/i);
        await user.click(typeSelect);
        await user.click(screen.getByText('Breathing'));

        // Save
        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);
      });

      const meditations = useJournalStore.getState().meditations;
      expect(meditations.length).toBe(1);
      expect(meditations[0].duration).toBe(20);
      expect(meditations[0].type).toBe('breathing');
    });

    it('should display total meditation time', async () => {
      const user = userEvent.setup();

      useJournalStore.getState().setMeditations([
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          duration: 15,
          type: 'breathing',
        },
        {
          id: 2,
          date: new Date().toISOString().split('T')[0],
          duration: 20,
          type: 'mindfulness',
        },
      ]);

      renderWithRouter(<JournalScreen />);

      const meditationTab = screen.getByRole('tab', { name: /Meditation/i });
      await user.click(meditationTab);

      // Should show total of 35 minutes
      expect(screen.getByText(/35.*minutes/i)).toBeInTheDocument();
    });
  });

  describe('Toast Notifications', () => {
    it('should show success toast when adding entry', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const addButton = screen.getByRole('button', { name: /Add craving/i });
      await user.click(addButton);

      await waitFor(async () => {
        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);

        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should show success toast when deleting entry', async () => {
      const user = userEvent.setup();

      useActivitiesStore.getState().setCravings([
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          intensity: 5,
          trigger: 'Stress',
          overcame: true,
        },
      ]);

      renderWithRouter(<JournalScreen />);

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('deleted'));
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for tabs', () => {
      renderWithRouter(<JournalScreen />);

      const cravingsTab = screen.getByRole('tab', { name: /Cravings/i });
      expect(cravingsTab).toHaveAccessibleName();
    });

    it('should support keyboard navigation between tabs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<JournalScreen />);

      const cravingsTab = screen.getByRole('tab', { name: /Cravings/i });
      cravingsTab.focus();

      // Arrow right should move to next tab
      await user.keyboard('{ArrowRight}');

      const meetingsTab = screen.getByRole('tab', { name: /Meetings/i });
      expect(meetingsTab).toHaveFocus();
    });
  });
});
