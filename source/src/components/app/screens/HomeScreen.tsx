import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { StatCard } from '../StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HALTCheck } from '@/components/HALTCheck';
import { HomeScreenSkeleton } from '@/components/LoadingSkeletons';
import {
  Calendar, CheckCircle, Heart, Brain, Flame,
  Shield, DollarSign, Trophy, AlertCircle, Moon, Sun
} from 'lucide-react';
import { calculateDaysSober, calculateStreak, getMilestone, getMoodTrend, calculateTotalSavings } from '@/lib/utils-app';
import { MOOD_EMOJIS } from '@/lib/constants';
import { celebrate } from '@/lib/celebrations';
import type { HALTCheck as HALTCheckType } from '@/types/app';
import { toast } from 'sonner';

export function HomeScreen() {
  const {
    sobrietyDate,
    setSobrietyDate,
    checkIns,
    setCheckIns,
    meditations,
    cravings,
    meetings,
    gratitude,
    currentQuote,
    darkMode,
    setDarkMode,
    costPerDay,
    reasonsForSobriety,
    celebrationsEnabled,
    loading
  } = useAppContext();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInMood, setCheckInMood] = useState<number | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [showHALT, setShowHALT] = useState(false);
  const [haltData, setHaltData] = useState<HALTCheckType | null>(null);

  // Memoize expensive calculations to prevent unnecessary recalculations
  const daysSober = useMemo(() => calculateDaysSober(sobrietyDate), [sobrietyDate]);
  const streak = useMemo(() => calculateStreak(checkIns), [checkIns]);
  const milestone = useMemo(() => getMilestone(daysSober), [daysSober]);
  const moodTrend = useMemo(() => getMoodTrend(checkIns), [checkIns]);
  const totalSavings = useMemo(() => calculateTotalSavings(daysSober, costPerDay), [daysSober, costPerDay]);

  const hasCheckedInToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return checkIns.some(c => c.date === today);
  }, [checkIns]);

  // Celebrate milestone days
  useEffect(() => {
    if (!celebrationsEnabled) return;

    const milestoneDays = [7, 30, 60, 90, 180, 365, 730, 1095];
    const isMilestoneDay = milestoneDays.includes(daysSober);

    // Check if we've already celebrated today
    const today = new Date().toISOString().split('T')[0];
    const celebratedToday = localStorage.getItem(`celebrated_${today}`);

    if (isMilestoneDay && !celebratedToday && daysSober > 0) {
      // Delay celebration slightly to let the page load
      setTimeout(() => {
        celebrate('milestone');
        localStorage.setItem(`celebrated_${today}`, 'true');
      }, 1000);
    }
  }, [daysSober, celebrationsEnabled]);

  const handleCheckIn = () => {
    const newCheckIn = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      mood: checkInMood || undefined,
      notes: checkInNotes || undefined,
      halt: haltData || undefined
    };
    const newCheckIns = [...checkIns, newCheckIn];
    setCheckIns(newCheckIns);

    // Show success message
    const newStreak = calculateStreak(newCheckIns);
    if (newStreak === 7 || newStreak === 30 || newStreak === 90 || newStreak === 100) {
      toast.success(`Amazing! You've hit a ${newStreak}-day streak! 🔥`);
    } else {
      toast.success('Daily check-in complete! Keep it up! ✓');
    }

    // Celebrate check-in completion
    if (celebrationsEnabled) {
      // Celebrate streak milestones
      if (newStreak === 7 || newStreak === 30 || newStreak === 90 || newStreak === 100) {
        setTimeout(() => celebrate('streak'), 300);
      } else {
        // Regular check-in celebration
        setTimeout(() => celebrate('checkIn'), 300);
      }
    }

    setShowCheckInModal(false);
    setCheckInMood(null);
    setCheckInNotes('');
    setShowHALT(false);
    setHaltData(null);
  };

  // Show loading skeleton while data is loading
  if (loading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Recovery Journey
          </h1>
          <p className="text-sm text-muted-foreground mt-1">One day at a time</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Days Sober Card */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              <span className="font-semibold">Days Sober</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              Change Date
            </Button>
          </div>
          
          <div className="text-6xl font-black mb-2">{daysSober}</div>
          <div className="text-lg opacity-90">{milestone.text}</div>
          
          {showDatePicker && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <Input
                type="date"
                value={sobrietyDate}
                onChange={(e) => {
                  setSobrietyDate(e.target.value);
                  setShowDatePicker(false);
                  toast.success('Sobriety date updated');
                }}
                className="bg-white/20 border-white/30 text-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivational Quote */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-4xl">💪</div>
            <div className="flex-1">
              <p className="text-lg font-medium italic">"{currentQuote}"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Check-in Streak"
          value={streak}
          gradient="from-green-500 to-emerald-600"
        />
        <StatCard
          icon={Brain}
          label="Meditations"
          value={meditations.length}
          gradient="from-purple-500 to-indigo-600"
        />
        <StatCard
          icon={Flame}
          label="Cravings Overcome"
          value={cravings.filter(c => c.overcame).length}
          gradient="from-orange-500 to-red-600"
        />
        <StatCard
          icon={Heart}
          label="Gratitude Entries"
          value={gratitude.length}
          gradient="from-pink-500 to-rose-600"
        />
      </div>

      {/* Daily Check-In */}
      {!hasCheckedInToday && (
        <Card className="border-2 border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Daily Check-In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Complete your daily check-in to maintain your streak!
            </p>
            <Button 
              onClick={() => setShowCheckInModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
            >
              Check In Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cost Savings */}
      {costPerDay > 0 && (
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6" />
              <span className="font-semibold">Money Saved</span>
            </div>
            <div className="text-4xl font-black mb-1">${totalSavings.toFixed(2)}</div>
            <div className="text-sm opacity-90">
              Saving ${costPerDay}/day × {daysSober} days
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reasons for Sobriety */}
      {reasonsForSobriety.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Your Why
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reasonsForSobriety.slice(0, 3).map(reason => (
                <div key={reason.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{reason.text}</p>
                </div>
              ))}
              {reasonsForSobriety.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{reasonsForSobriety.length - 3} more reasons
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Shield className="w-6 h-6" />
          <span className="text-xs">Prevention Plan</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Trophy className="w-6 h-6" />
          <span className="text-xs">View Badges</span>
        </Button>
      </div>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Daily Check-In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                <div className="flex gap-2 justify-center">
                  {MOOD_EMOJIS.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setCheckInMood(mood.value)}
                      className={`text-4xl p-2 rounded-lg transition-all ${
                        checkInMood === mood.value
                          ? 'bg-primary/20 scale-110'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="How's your day going?"
                  rows={3}
                />
              </div>

              {/* HALT Assessment Toggle */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowHALT(!showHALT)}
                  className="w-full"
                >
                  {showHALT ? '✓ HALT Assessment Included' : '+ Add HALT Assessment (Recommended)'}
                </Button>
              </div>

              {/* HALT Component */}
              {showHALT && (
                <div className="border-t pt-4">
                  <HALTCheck
                    onComplete={(halt) => setHaltData(halt)}
                    initialValues={haltData || undefined}
                    showSuggestions={false}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCheckInModal(false);
                    setCheckInMood(null);
                    setCheckInNotes('');
                    setShowHALT(false);
                    setHaltData(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckIn}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  Complete Check-In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

