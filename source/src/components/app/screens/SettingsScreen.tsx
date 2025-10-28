import { useState, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/LoadingSkeletons';
import { Bell, Download, Upload, Trash2, AlertCircle, Sparkles, FileCheck, X } from 'lucide-react';
import { requestNotificationPermission, checkNotificationPermission, isNative } from '@/lib/notifications';
import { exportBackupData, importBackupData, getBackupStats } from '@/lib/data-backup';
import type { BackupData } from '@/lib/data-backup';
import { toast } from 'sonner';

export function SettingsScreen() {
  const context = useAppContext();
  const {
    notificationSettings,
    setNotificationSettings,
    onboardingCompleted,
    setOnboardingCompleted,
    celebrationsEnabled,
    setCelebrationsEnabled,
  } = context;

  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<BackupData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check notification permission on mount
  useState(() => {
    if (isNative()) {
      checkNotificationPermission().then(setHasNotificationPermission);
    }
  });

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && isNative() && !hasNotificationPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error('Notification permission denied');
        return;
      }
      setHasNotificationPermission(true);
    }

    setNotificationSettings({
      ...notificationSettings,
      enabled,
    });

    toast.success(enabled ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleTimeChange = (time: string) => {
    setNotificationSettings({
      ...notificationSettings,
      dailyReminderTime: time,
    });
    toast.success('Reminder time updated');
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Get all app data from context
      const { loading, ...appData } = context;

      // Simulate slight delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Export using our backup utility
      exportBackupData(appData);

      toast.success('Backup exported successfully! 📦');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // Import and validate the backup file
      const result = await importBackupData(file);

      if (!result.success || !result.data) {
        // Show validation errors
        const errors = result.errors || ['Unknown error'];
        toast.error(
          <div>
            <div className="font-semibold">Invalid backup file</div>
            <ul className="list-disc list-inside text-xs mt-1">
              {errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>,
          { duration: 5000 }
        );
        setIsImporting(false);
        return;
      }

      // Show confirmation dialog with backup preview
      setImportPreview(result.data as BackupData);
      setShowImportConfirm(true);
      setIsImporting(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to read backup file');
      setIsImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;

    setIsImporting(true);

    // Save the imported data to localStorage
    const { version, exportDate, appVersion, ...appData } = importPreview;
    localStorage.setItem('recovery_journey_data', JSON.stringify(appData));

    toast.success('Data restored successfully! Refreshing... 🔄');
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleCancelImport = () => {
    setShowImportConfirm(false);
    setImportPreview(null);
  };

  const handleClearData = async () => {
    if (
      confirm(
        'Are you sure you want to delete all your data? This action cannot be undone. Consider exporting your data first.'
      )
    ) {
      setIsClearing(true);
      // Simulate slight delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorage.removeItem('recovery_journey_data');
      toast.success('All data cleared. Refreshing...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleResetOnboarding = () => {
    if (confirm('Reset onboarding? You\'ll be taken through the setup again.')) {
      setOnboardingCompleted(false);
      toast.success('Onboarding reset');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isNative() && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">
                Notifications are only available on iOS and Android devices. Install
                the app from your device's app store to enable notifications.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled" className="text-base">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive daily reminders and milestone alerts
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationSettings.enabled}
              onCheckedChange={handleNotificationToggle}
              disabled={!isNative()}
            />
          </div>

          {notificationSettings.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={notificationSettings.dailyReminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="streak-reminders" className="text-base">
                    Streak Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified if you haven't checked in today
                  </p>
                </div>
                <Switch
                  id="streak-reminders"
                  checked={notificationSettings.streakReminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      streakReminders: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="meeting-reminders" className="text-base">
                    Meeting Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for upcoming meetings
                  </p>
                </div>
                <Switch
                  id="meeting-reminders"
                  checked={notificationSettings.meetingReminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      meetingReminders: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="milestone-notifications" className="text-base">
                    Milestone Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Celebrate your achievements
                  </p>
                </div>
                <Switch
                  id="milestone-notifications"
                  checked={notificationSettings.milestoneNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      milestoneNotifications: checked,
                    })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* App Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            App Preferences
          </CardTitle>
          <CardDescription>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="celebrations-enabled" className="text-base">
                Celebration Animations
              </Label>
              <p className="text-sm text-muted-foreground">
                Show confetti when achieving milestones and unlocking badges
              </p>
            </div>
            <Switch
              id="celebrations-enabled"
              checked={celebrationsEnabled}
              onCheckedChange={(checked) => {
                setCelebrationsEnabled(checked);
                toast.success(checked ? 'Celebrations enabled 🎉' : 'Celebrations disabled');
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Backup, restore, or clear your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating Backup...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Create Backup
              </>
            )}
          </Button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="import-file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Restore from Backup
                </>
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={handleClearData}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Other Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Other</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleResetOnboarding}
          >
            Reset Onboarding
          </Button>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-muted-foreground text-center">
              Recovery Journey v1.0.0
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Made with ❤️ for the recovery community
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import Confirmation Modal */}
      {showImportConfirm && importPreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
        >
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-green-500" />
                  <CardTitle id="import-modal-title">Restore Backup?</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelImport}
                  aria-label="Cancel import"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Backup Info */}
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Backup Date</span>
                  <span className="text-sm font-medium">
                    {importPreview.exportDate
                      ? new Date(importPreview.exportDate).toLocaleString()
                      : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">App Version</span>
                  <span className="text-sm font-medium">
                    {importPreview.appVersion || importPreview.version || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Records</span>
                  <span className="text-sm font-medium">
                    {getBackupStats(importPreview).totalRecords}
                  </span>
                </div>
              </div>

              {/* Backup Contents Preview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Backup Contains:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {importPreview.checkIns?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-ins:</span>
                      <span className="font-medium">{importPreview.checkIns.length}</span>
                    </div>
                  )}
                  {importPreview.cravings?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cravings:</span>
                      <span className="font-medium">{importPreview.cravings.length}</span>
                    </div>
                  )}
                  {importPreview.meetings?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meetings:</span>
                      <span className="font-medium">{importPreview.meetings.length}</span>
                    </div>
                  )}
                  {importPreview.meditations?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meditations:</span>
                      <span className="font-medium">{importPreview.meditations.length}</span>
                    </div>
                  )}
                  {importPreview.gratitude?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gratitude:</span>
                      <span className="font-medium">{importPreview.gratitude.length}</span>
                    </div>
                  )}
                  {importPreview.growthLogs?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Growth Logs:</span>
                      <span className="font-medium">{importPreview.growthLogs.length}</span>
                    </div>
                  )}
                  {importPreview.contacts?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contacts:</span>
                      <span className="font-medium">{importPreview.contacts.length}</span>
                    </div>
                  )}
                  {importPreview.reasonsForSobriety?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reasons:</span>
                      <span className="font-medium">{importPreview.reasonsForSobriety.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  This will replace all your current data with the backup. This action cannot be undone.
                  Consider exporting your current data first.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelImport}
                  className="flex-1"
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <Spinner className="mr-2" />
                      Restoring...
                    </>
                  ) : (
                    'Restore Backup'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
