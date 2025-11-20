/**
 * Activities Store
 *
 * Manages cravings and calendar events
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Craving, CalendarEvent } from '@/types/app';

interface ActivitiesState {
  // State
  cravings: Craving[];
  events: CalendarEvent[];

  // Actions
  setCravings: (cravings: Craving[]) => void;
  setEvents: (events: CalendarEvent[]) => void;

  // Helpers - Add
  addCraving: (craving: Craving) => void;
  addEvent: (event: CalendarEvent) => void;

  // Helpers - Update
  updateCraving: (id: number, updates: Partial<Craving>) => void;
  updateEvent: (id: number, updates: Partial<CalendarEvent>) => void;

  // Helpers - Delete
  deleteCraving: (id: number) => void;
  deleteEvent: (id: number) => void;
}

export const useActivitiesStore = create<ActivitiesState>()(
  persist(
    (set) => ({
      // Initial state
      cravings: [],
      events: [],

      // Actions
      setCravings: (cravings) => set({ cravings }),
      setEvents: (events) => set({ events }),

      // Helper methods - Add
      addCraving: (craving) =>
        set((state) => ({
          cravings: [...state.cravings, craving],
        })),
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),

      // Helper methods - Update
      updateCraving: (id, updates) =>
        set((state) => ({
          cravings: state.cravings.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      // Helper methods - Delete
      deleteCraving: (id) =>
        set((state) => ({
          cravings: state.cravings.filter((item) => item.id !== id),
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'activities-store',
    }
  )
);
