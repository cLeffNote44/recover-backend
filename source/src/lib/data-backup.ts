import type { AppData } from '@/types/app';

/**
 * Data Backup & Restore utilities
 * Handles exporting and importing user data for backup/restore functionality
 */

export interface BackupData extends AppData {
  version: string;
  exportDate: string;
  appVersion: string;
}

const CURRENT_BACKUP_VERSION = '1.0';
const APP_VERSION = '1.0.0';

/**
 * Export all app data as a JSON backup file
 */
export function exportBackupData(data: AppData): void {
  const backup: BackupData = {
    ...data,
    version: CURRENT_BACKUP_VERSION,
    exportDate: new Date().toISOString(),
    appVersion: APP_VERSION
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = generateBackupFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a descriptive filename for backup
 */
export function generateBackupFilename(): string {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
  return `recovery-backup-${date}-${time}.json`;
}

/**
 * Validate backup data structure
 */
export function validateBackupData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push('Invalid backup file format');
    return { valid: false, errors };
  }

  // Check for required fields
  const requiredFields = [
    'sobrietyDate',
    'checkIns',
    'cravings',
    'meetings',
    'meditations',
    'gratitude',
    'growthLogs',
    'contacts',
    'reasonsForSobriety',
    'unlockedBadges'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate array fields
  const arrayFields = [
    'checkIns',
    'cravings',
    'meetings',
    'meditations',
    'gratitude',
    'growthLogs',
    'contacts',
    'reasonsForSobriety',
    'unlockedBadges'
  ];

  for (const field of arrayFields) {
    if (data[field] && !Array.isArray(data[field])) {
      errors.push(`Invalid data type for ${field}: expected array`);
    }
  }

  // Validate sobriety date format
  if (data.sobrietyDate && typeof data.sobrietyDate !== 'string') {
    errors.push('Invalid sobriety date format');
  }

  // Validate numeric fields
  if (data.costPerDay !== undefined && typeof data.costPerDay !== 'number') {
    errors.push('Invalid cost per day: must be a number');
  }

  // Check backup version compatibility
  if (data.version && typeof data.version === 'string') {
    const backupVersion = parseFloat(data.version);
    const currentVersion = parseFloat(CURRENT_BACKUP_VERSION);

    if (backupVersion > currentVersion) {
      errors.push('Backup file is from a newer version of the app. Please update the app to restore this backup.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Import data from backup file
 */
export async function importBackupData(file: File): Promise<{ success: boolean; data?: AppData; errors?: string[] }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    // Validate the data
    const validation = validateBackupData(parsed);

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    // Extract only the app data (exclude metadata fields)
    const appData: AppData = {
      sobrietyDate: parsed.sobrietyDate,
      checkIns: parsed.checkIns || [],
      cravings: parsed.cravings || [],
      meetings: parsed.meetings || [],
      meditations: parsed.meditations || [],
      gratitude: parsed.gratitude || [],
      growthLogs: parsed.growthLogs || [],
      contacts: parsed.contacts || [],
      reasonsForSobriety: parsed.reasonsForSobriety || [],
      unlockedBadges: parsed.unlockedBadges || [],
      costPerDay: parsed.costPerDay || 0,
      currentQuote: parsed.currentQuote || '',
      darkMode: parsed.darkMode !== undefined ? parsed.darkMode : false,
      celebrationsEnabled: parsed.celebrationsEnabled !== undefined ? parsed.celebrationsEnabled : true,
      loading: false
    };

    return {
      success: true,
      data: appData
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        errors: ['Invalid JSON file format']
      };
    }

    return {
      success: false,
      errors: ['Failed to read backup file: ' + (error instanceof Error ? error.message : 'Unknown error')]
    };
  }
}

/**
 * Get backup file statistics
 */
export function getBackupStats(data: BackupData): {
  totalRecords: number;
  exportDate: string;
  version: string;
} {
  const totalRecords =
    (data.checkIns?.length || 0) +
    (data.cravings?.length || 0) +
    (data.meetings?.length || 0) +
    (data.meditations?.length || 0) +
    (data.gratitude?.length || 0) +
    (data.growthLogs?.length || 0) +
    (data.contacts?.length || 0) +
    (data.reasonsForSobriety?.length || 0);

  return {
    totalRecords,
    exportDate: data.exportDate || 'Unknown',
    version: data.version || 'Unknown'
  };
}
