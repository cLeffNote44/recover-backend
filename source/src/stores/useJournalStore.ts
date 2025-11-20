/**
 * Journal Store
 *
 * Manages check-ins, gratitude entries, growth logs, meetings, meditations, and challenges
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckIn, Gratitude, GrowthLog, Meeting, Meditation, Challenge } from '@/types/app';

interface JournalState {
  // State
  checkIns: CheckIn[];
  gratitude: Gratitude[];
  growthLogs: GrowthLog[];
  meetings: Meeting[];
  meditations: Meditation[];
  challenges: Challenge[];

  // Actions
  setCheckIns: (checkIns: CheckIn[]) => void;
  setGratitude: (gratitude: Gratitude[]) => void;
  setGrowthLogs: (logs: GrowthLog[]) => void;
  setMeetings: (meetings: Meeting[]) => void;
  setMeditations: (meditations: Meditation[]) => void;
  setChallenges: (challenges: Challenge[]) => void;

  // Helpers
  addCheckIn: (checkIn: CheckIn) => void;
  addGratitude: (item: Gratitude) => void;
  addGrowthLog: (log: GrowthLog) => void;
  addMeeting: (meeting: Meeting) => void;
  addMeditation: (meditation: Meditation) => void;
  addChallenge: (challenge: Challenge) => void;

  updateCheckIn: (id: number, updates: Partial<CheckIn>) => void;
  updateMeeting: (id: number, updates: Partial<Meeting>) => void;
  updateMeditation: (id: number, updates: Partial<Meditation>) => void;
  updateGrowthLog: (id: number, updates: Partial<GrowthLog>) => void;
  updateChallenge: (id: number, updates: Partial<Challenge>) => void;
  updateGratitude: (id: number, updates: Partial<Gratitude>) => void;

  deleteCheckIn: (id: number) => void;
  deleteMeeting: (id: number) => void;
  deleteMeditation: (id: number) => void;
  deleteGrowthLog: (id: number) => void;
  deleteChallenge: (id: number) => void;
  deleteGratitude: (id: number) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      // Initial state
      checkIns: [],
      gratitude: [],
      growthLogs: [],
      meetings: [],
      meditations: [],
      challenges: [],

      // Actions
      setCheckIns: (checkIns) => set({ checkIns }),
      setGratitude: (gratitude) => set({ gratitude }),
      setGrowthLogs: (logs) => set({ growthLogs: logs }),
      setMeetings: (meetings) => set({ meetings }),
      setMeditations: (meditations) => set({ meditations }),
      setChallenges: (challenges) => set({ challenges }),

      // Helper methods - Add
      addCheckIn: (checkIn) =>
        set((state) => ({
          checkIns: [...state.checkIns, checkIn],
        })),
      addGratitude: (item) =>
        set((state) => ({
          gratitude: [...state.gratitude, item],
        })),
      addGrowthLog: (log) =>
        set((state) => ({
          growthLogs: [...state.growthLogs, log],
        })),
      addMeeting: (meeting) =>
        set((state) => ({
          meetings: [...state.meetings, meeting],
        })),
      addMeditation: (meditation) =>
        set((state) => ({
          meditations: [...state.meditations, meditation],
        })),
      addChallenge: (challenge) =>
        set((state) => ({
          challenges: [...state.challenges, challenge],
        })),

      // Helper methods - Update
      updateCheckIn: (id, updates) =>
        set((state) => ({
          checkIns: state.checkIns.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      updateMeeting: (id, updates) =>
        set((state) => ({
          meetings: state.meetings.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      updateMeditation: (id, updates) =>
        set((state) => ({
          meditations: state.meditations.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      updateGrowthLog: (id, updates) =>
        set((state) => ({
          growthLogs: state.growthLogs.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      updateChallenge: (id, updates) =>
        set((state) => ({
          challenges: state.challenges.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      updateGratitude: (id, updates) =>
        set((state) => ({
          gratitude: state.gratitude.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      // Helper methods - Delete
      deleteCheckIn: (id) =>
        set((state) => ({
          checkIns: state.checkIns.filter((item) => item.id !== id),
        })),
      deleteMeeting: (id) =>
        set((state) => ({
          meetings: state.meetings.filter((item) => item.id !== id),
        })),
      deleteMeditation: (id) =>
        set((state) => ({
          meditations: state.meditations.filter((item) => item.id !== id),
        })),
      deleteGrowthLog: (id) =>
        set((state) => ({
          growthLogs: state.growthLogs.filter((item) => item.id !== id),
        })),
      deleteChallenge: (id) =>
        set((state) => ({
          challenges: state.challenges.filter((item) => item.id !== id),
        })),
      deleteGratitude: (id) =>
        set((state) => ({
          gratitude: state.gratitude.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'journal-store',
    }
  )
);
