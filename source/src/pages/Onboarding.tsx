import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { OnboardingStep } from '@/components/OnboardingStep';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { requestNotificationPermission, isNative } from '@/lib/notifications';
import {
  Award, Bell, Calendar, Heart, Shield, Sparkles, User, Clock
} from 'lucide-react';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const {
    setSobrietyDate,
    setContacts,
    setNotificationSettings,
    setOnboardingCompleted,
    notificationSettings,
    contacts,
  } = useAppContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [sobrietyDateInput, setSobrietyDateInput] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reminderTime, setReminderTime] = useState('09:00');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorPhone, setSponsorPhone] = useState('');

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToEnd = () => {
    setCurrentStep(totalSteps);
  };

  const completeOnboarding = () => {
    // Save sobriety date
    setSobrietyDate(sobrietyDateInput);

    // Save sponsor contact if provided
    if (sponsorName && sponsorPhone) {
      setContacts([
        ...contacts,
        {
          id: Date.now(),
          name: sponsorName,
          role: 'Sponsor',
          phone: sponsorPhone,
        },
      ]);
    }

    // Save notification settings
    setNotificationSettings({
      ...notificationSettings,
      dailyReminderTime: reminderTime,
    });

    // Mark onboarding as completed
    setOnboardingCompleted(true);

    // Navigate to app
    setLocation('/app');
  };

  const requestNotifications = async () => {
    if (isNative()) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationSettings({
          ...notificationSettings,
          enabled: true,
        });
      }
    }
    handleNext();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep
            title="Welcome to Recovery Journey"
            description="Your personal companion for sobriety and recovery"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-3xl">
                  <Award className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Track Your Progress
                </h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  Daily check-ins, mood tracking, craving logs, meditation, and
                  comprehensive analytics to support your recovery journey.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-2">
                    <Heart className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-300">Mood Tracking</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-full mb-2">
                    <Shield className="w-6 h-6 text-pink-400" />
                  </div>
                  <p className="text-sm text-gray-300">Prevention Plan</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300">Meeting Tracker</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-2">
                    <Sparkles className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-300">Achievements</p>
                </div>
              </div>
            </div>
          </OnboardingStep>
        );

      case 2:
        return (
          <OnboardingStep
            title="Set Your Sobriety Date"
            description="When did you start your recovery journey?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobriety-date" className="text-white text-base">
                  Sobriety Start Date
                </Label>
                <Input
                  id="sobriety-date"
                  type="date"
                  value={sobrietyDateInput}
                  onChange={(e) => setSobrietyDateInput(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-sm text-gray-400">
                  This will be used to calculate your days sober and milestone
                  achievements. You can change this later if needed.
                </p>
              </div>
            </div>
          </OnboardingStep>
        );

      case 3:
        return (
          <OnboardingStep
            title="Add Your Sponsor"
            description="Quick access to your support network when you need it most"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            showSkip
            onSkip={handleNext}
          >
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsor-name" className="text-white text-base">
                    Sponsor Name (Optional)
                  </Label>
                  <Input
                    id="sponsor-name"
                    type="text"
                    placeholder="John Doe"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsor-phone" className="text-white text-base">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="sponsor-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={sponsorPhone}
                    onChange={(e) => setSponsorPhone(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <p className="text-sm text-gray-400">
                  You can add more support contacts later in the Contacts tab.
                </p>
              </div>
            </div>
          </OnboardingStep>
        );

      case 4:
        return (
          <OnboardingStep
            title="Daily Reminder"
            description="Stay accountable with a daily check-in reminder"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl">
                  <Clock className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-time" className="text-white text-base">
                  Preferred Reminder Time
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-sm text-gray-400">
                  We'll send you a daily reminder to complete your check-in and
                  log your progress.
                </p>
              </div>
              <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
                <p className="text-sm text-purple-200">
                  💡 <strong>Tip:</strong> Choose a time when you can take a
                  moment for self-reflection, like morning coffee or evening
                  wind-down.
                </p>
              </div>
            </div>
          </OnboardingStep>
        );

      case 5:
        return (
          <OnboardingStep
            title="Enable Notifications"
            description={
              isNative()
                ? 'Get reminders and celebrate milestones'
                : 'Notifications are available on mobile devices'
            }
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={isNative() ? requestNotifications : handleNext}
            onBack={handleBack}
            nextLabel={isNative() ? 'Allow Notifications' : 'Next'}
            showSkip
            onSkip={handleNext}
          >
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
                  <Bell className="w-12 h-12 text-white" />
                </div>
              </div>
              {isNative() ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <p className="text-white font-medium">Daily Check-In</p>
                        <p className="text-sm text-gray-400">
                          Never forget your daily accountability
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <p className="text-white font-medium">Streak Alerts</p>
                        <p className="text-sm text-gray-400">
                          Keep your momentum going
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <p className="text-white font-medium">Milestone Celebrations</p>
                        <p className="text-sm text-gray-400">
                          Get recognized for your progress
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <p className="text-white font-medium">Meeting Reminders</p>
                        <p className="text-sm text-gray-400">
                          Never miss your support meetings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-300">
                    Notifications are currently only available when using the app
                    on iOS or Android devices. You can enable them later in
                    Settings.
                  </p>
                </div>
              )}
            </div>
          </OnboardingStep>
        );

      case 6:
        return (
          <OnboardingStep
            title="You're All Set!"
            description="Ready to start your recovery journey?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={completeOnboarding}
            onBack={handleBack}
            nextLabel="Get Started"
          >
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-3xl">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Your Journey Begins Now
                </h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  Recovery Journey is ready to support you every step of the way.
                  Remember: One day at a time. You've got this! 💪
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-lg p-6 mt-8">
                <p className="text-white font-medium mb-2">Quick Start Guide:</p>
                <ul className="text-sm text-gray-300 space-y-2 text-left max-w-md mx-auto">
                  <li>• Complete your first daily check-in on the Home tab</li>
                  <li>• Build your prevention plan in Quick Actions</li>
                  <li>• Log cravings and meetings in the Journal tab</li>
                  <li>• Track your progress in Analytics</li>
                  <li>• Add emergency contacts for crisis support</li>
                </ul>
              </div>
            </div>
          </OnboardingStep>
        );

      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
}
