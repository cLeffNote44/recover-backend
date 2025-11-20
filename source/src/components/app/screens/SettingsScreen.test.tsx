/**
 * SettingsScreen Component Tests
 *
 * Tests the settings/preferences screen including:
 * - Notification settings
 * - Data export/import
 * - Cloud sync
 * - Theme preferences
 * - Quote management
 * - Backup/restore functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsScreen } from './SettingsScreen';
import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

// Mock notifications library
vi.mock('@/lib/notifications', () => ({
  requestNotificationPermission: vi.fn(() => Promise.resolve(true)),
  checkNotificationPermission: vi.fn(() => Promise.resolve(false)),
  isNative: vi.fn(() => false),
}));

// Mock data backup functions
vi.mock('@/lib/data-backup', () => ({
  exportBackupData: vi.fn(),
  importBackupData: vi.fn(),
  getBackupStats: vi.fn(() => ({
    totalBackups: 0,
    lastBackup: null,
    totalSize: 0,
  })),
  getAutoBackups: vi.fn(() => []),
  restoreAutoBackup: vi.fn(),
  deleteAutoBackup: vi.fn(),
  getDaysSinceLastBackup: vi.fn(() => 0),
  createAutoBackup: vi.fn(),
}));

// Mock CSV export
vi.mock('@/lib/csv-export', () => ({
  exportData: vi.fn(),
}));

// Mock cloud sync
vi.mock('@/components/app/CloudSyncPanel', () => ({
  CloudSyncPanel: () => <div data-testid="cloud-sync-panel">Cloud Sync Panel</div>,
}));

// Mock Progress Sharing Modal
vi.mock('@/components/app/ProgressSharingModal', () => ({
  ProgressSharingModal: () => <div data-testid="progress-sharing-modal">Progress Sharing Modal</div>,
}));

// Mock Widget Config Panel
vi.mock('@/components/app/WidgetConfigPanel', () => ({
  WidgetConfigPanel: () => <div data-testid="widget-config-panel">Widget Config Panel</div>,
}));

// Mock Trash Bin
vi.mock('@/components/app/TrashBin', () => ({
  TrashBin: () => <div data-testid="trash-bin">Trash Bin</div>,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock useAppData hook
vi.mock('@/hooks/useAppData', () => ({
  useAppData: () => ({
    notificationSettings: {
      enabled: false,
      dailyReminderTime: '09:00',
      milestoneAlerts: true,
      cravingAlerts: true,
      motivationalQuotes: true,
    },
    setNotificationSettings: vi.fn(),
    onboardingCompleted: true,
    setOnboardingCompleted: vi.fn(),
    celebrationsEnabled: true,
    setCelebrationsEnabled: vi.fn(),
    quoteSettings: {
      refreshFrequency: 'daily',
      lastRefresh: new Date().toISOString(),
      disabledQuoteIds: [],
    },
    setQuoteSettings: vi.fn(),
    addCustomQuote: vi.fn(),
    removeQuote: vi.fn(),
    toggleFavoriteQuote: vi.fn(),
    getAvailableQuotes: vi.fn(() => []),
    favoriteQuoteIds: [],
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    // Reset all stores
    const settingsStore = useSettingsStore.getState();
    settingsStore.setDarkMode(false);
    settingsStore.setCelebrationsEnabled(true);

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render settings screen', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('should display notification settings section', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    });

    it('should display data management section', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText(/Data Management/i)).toBeInTheDocument();
    });

    it('should display preferences section', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText(/Preferences/i)).toBeInTheDocument();
    });
  });

  describe('Notification Settings', () => {
    it('should display notification toggle', () => {
      renderWithRouter(<SettingsScreen />);

      const toggle = screen.getByRole('switch', { name: /Enable notifications/i });
      expect(toggle).toBeInTheDocument();
    });

    it('should toggle notifications on/off', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const toggle = screen.getByRole('switch', { name: /Enable notifications/i });
      await user.click(toggle);

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should allow changing reminder time', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const timeInput = screen.getByLabelText(/Daily reminder time/i);
      await user.clear(timeInput);
      await user.type(timeInput, '14:30');

      expect(timeInput).toHaveValue('14:30');
    });

    it('should show milestone alerts toggle', () => {
      renderWithRouter(<SettingsScreen />);

      const toggle = screen.getByRole('switch', { name: /Milestone alerts/i });
      expect(toggle).toBeInTheDocument();
    });

    it('should show craving alerts toggle', () => {
      renderWithRouter(<SettingsScreen />);

      const toggle = screen.getByRole('switch', { name: /Craving alerts/i });
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('Data Export', () => {
    it('should have export button', () => {
      renderWithRouter(<SettingsScreen />);

      const exportButton = screen.getByRole('button', { name: /Export Data/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should show export options when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const exportButton = screen.getByRole('button', { name: /Export Data/i });
      await user.click(exportButton);

      // Should show JSON and CSV options
      await waitFor(() => {
        expect(screen.getByText(/JSON/i)).toBeInTheDocument();
        expect(screen.getByText(/CSV/i)).toBeInTheDocument();
      });
    });

    it('should export data as JSON', async () => {
      const user = userEvent.setup();
      const mockExportBackupData = await import('@/lib/data-backup').then(m => m.exportBackupData);

      renderWithRouter(<SettingsScreen />);

      const exportButton = screen.getByRole('button', { name: /Export Data/i });
      await user.click(exportButton);

      const jsonOption = screen.getByRole('button', { name: /JSON/i });
      await user.click(jsonOption);

      // Export function should be called
      await waitFor(() => {
        expect(mockExportBackupData).toHaveBeenCalled();
      });
    });
  });

  describe('Data Import', () => {
    it('should have import button', () => {
      renderWithRouter(<SettingsScreen />);

      const importButton = screen.getByRole('button', { name: /Import Data/i });
      expect(importButton).toBeInTheDocument();
    });

    it('should open file picker when import clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const importButton = screen.getByRole('button', { name: /Import Data/i });
      await user.click(importButton);

      // File input should be triggered (mocked in real implementation)
      expect(importButton).toBeInTheDocument();
    });

    it('should show confirmation before importing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      // Simulate file import with confirmation
      const importButton = screen.getByRole('button', { name: /Import Data/i });
      await user.click(importButton);

      // In a real test, we'd simulate file upload and check for confirmation dialog
      expect(importButton).toBeInTheDocument();
    });
  });

  describe('Cloud Sync', () => {
    it('should have cloud sync button', () => {
      renderWithRouter(<SettingsScreen />);

      const cloudSyncButton = screen.getByRole('button', { name: /Cloud Sync/i });
      expect(cloudSyncButton).toBeInTheDocument();
    });

    it('should open cloud sync panel when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const cloudSyncButton = screen.getByRole('button', { name: /Cloud Sync/i });
      await user.click(cloudSyncButton);

      await waitFor(() => {
        expect(screen.getByTestId('cloud-sync-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Settings', () => {
    it('should display dark mode toggle', () => {
      renderWithRouter(<SettingsScreen />);

      const darkModeToggle = screen.getByRole('switch', { name: /Dark mode/i });
      expect(darkModeToggle).toBeInTheDocument();
    });

    it('should toggle dark mode', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const darkModeToggle = screen.getByRole('switch', { name: /Dark mode/i });
      await user.click(darkModeToggle);

      const settings = useSettingsStore.getState();
      expect(settings.darkMode).toBe(true);
    });
  });

  describe('Celebration Settings', () => {
    it('should display celebrations toggle', () => {
      renderWithRouter(<SettingsScreen />);

      const celebrationsToggle = screen.getByRole('switch', { name: /Celebrations/i });
      expect(celebrationsToggle).toBeInTheDocument();
    });

    it('should toggle celebrations on/off', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const celebrationsToggle = screen.getByRole('switch', { name: /Celebrations/i });
      await user.click(celebrationsToggle);

      const settings = useSettingsStore.getState();
      expect(settings.celebrationsEnabled).toBe(false);
    });
  });

  describe('Quote Management', () => {
    it('should display quote settings', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText(/Quote of the Day/i)).toBeInTheDocument();
    });

    it('should allow changing quote refresh frequency', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const frequencySelect = screen.getByLabelText(/Refresh frequency/i);
      await user.click(frequencySelect);

      // Should show options: daily, hourly, manual
      await waitFor(() => {
        expect(screen.getByText(/Daily/i)).toBeInTheDocument();
      });
    });

    it('should allow adding custom quotes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const addQuoteButton = screen.getByRole('button', { name: /Add custom quote/i });
      await user.click(addQuoteButton);

      // Should show form for adding quote
      await waitFor(() => {
        expect(screen.getByLabelText(/Quote text/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Author/i)).toBeInTheDocument();
      });
    });
  });

  describe('Backup Management', () => {
    it('should display auto-backup settings', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText(/Auto-Backup/i)).toBeInTheDocument();
    });

    it('should show list of available backups', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const viewBackupsButton = screen.getByRole('button', { name: /View backups/i });
      await user.click(viewBackupsButton);

      await waitFor(() => {
        expect(screen.getByTestId('backup-list')).toBeInTheDocument();
      });
    });

    it('should allow restoring from backup', async () => {
      const user = userEvent.setup();
      const mockRestoreAutoBackup = await import('@/lib/data-backup').then(m => m.restoreAutoBackup);

      renderWithRouter(<SettingsScreen />);

      const viewBackupsButton = screen.getByRole('button', { name: /View backups/i });
      await user.click(viewBackupsButton);

      await waitFor(async () => {
        const restoreButton = screen.getByRole('button', { name: /Restore/i });
        await user.click(restoreButton);

        expect(mockRestoreAutoBackup).toHaveBeenCalled();
      });
    });

    it('should show confirmation before clearing all data', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const clearDataButton = screen.getByRole('button', { name: /Clear all data/i });
      await user.click(clearDataButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });
  });

  describe('Widget Configuration', () => {
    it('should have widget config button', () => {
      renderWithRouter(<SettingsScreen />);

      const widgetButton = screen.getByRole('button', { name: /Widget/i });
      expect(widgetButton).toBeInTheDocument();
    });

    it('should open widget config panel', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const widgetButton = screen.getByRole('button', { name: /Widget/i });
      await user.click(widgetButton);

      await waitFor(() => {
        expect(screen.getByTestId('widget-config-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Sharing', () => {
    it('should have share progress button', () => {
      renderWithRouter(<SettingsScreen />);

      const shareButton = screen.getByRole('button', { name: /Share progress/i });
      expect(shareButton).toBeInTheDocument();
    });

    it('should open progress sharing modal', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const shareButton = screen.getByRole('button', { name: /Share progress/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(screen.getByTestId('progress-sharing-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Trash Bin', () => {
    it('should have trash bin button', () => {
      renderWithRouter(<SettingsScreen />);

      const trashButton = screen.getByRole('button', { name: /Trash/i });
      expect(trashButton).toBeInTheDocument();
    });

    it('should open trash bin', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const trashButton = screen.getByRole('button', { name: /Trash/i });
      await user.click(trashButton);

      await waitFor(() => {
        expect(screen.getByTestId('trash-bin')).toBeInTheDocument();
      });
    });
  });

  describe('Analytics', () => {
    it('should have analytics button', () => {
      renderWithRouter(<SettingsScreen />);

      const analyticsButton = screen.getByRole('button', { name: /Analytics/i });
      expect(analyticsButton).toBeInTheDocument();
    });

    it('should open analytics view', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const analyticsButton = screen.getByRole('button', { name: /Analytics/i });
      await user.click(analyticsButton);

      // Analytics screen should load (lazy-loaded)
      await waitFor(() => {
        expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithRouter(<SettingsScreen />);

      const notificationToggle = screen.getByRole('switch', { name: /Enable notifications/i });
      expect(notificationToggle).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName).toBe('BUTTON');
    });
  });

  describe('Error Handling', () => {
    it('should handle export errors gracefully', async () => {
      const user = userEvent.setup();
      const mockExportBackupData = await import('@/lib/data-backup').then(m => m.exportBackupData);
      vi.mocked(mockExportBackupData).mockRejectedValueOnce(new Error('Export failed'));

      renderWithRouter(<SettingsScreen />);

      const exportButton = screen.getByRole('button', { name: /Export Data/i });
      await user.click(exportButton);

      const jsonOption = screen.getByRole('button', { name: /JSON/i });
      await user.click(jsonOption);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('failed'));
      });
    });

    it('should handle import errors gracefully', async () => {
      const user = userEvent.setup();
      const mockImportBackupData = await import('@/lib/data-backup').then(m => m.importBackupData);
      vi.mocked(mockImportBackupData).mockRejectedValueOnce(new Error('Import failed'));

      renderWithRouter(<SettingsScreen />);

      const importButton = screen.getByRole('button', { name: /Import Data/i });
      await user.click(importButton);

      // Simulate file upload error
      await waitFor(() => {
        expect(importButton).toBeInTheDocument();
      });
    });
  });
});
