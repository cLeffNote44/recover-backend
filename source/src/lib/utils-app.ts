import { CheckIn, Badge } from '@/types/app';

export function calculateDaysSober(sobrietyDate: string): number {
  const start = new Date(sobrietyDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateStreak(checkIns: CheckIn[]): number {
  if (!checkIns || checkIns.length === 0) return 0;
  
  const sortedCheckIns = [...checkIns].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const checkIn of sortedCheckIns) {
    const checkInDate = new Date(checkIn.date);
    checkInDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
}

export function getMoodTrend(checkIns: CheckIn[]): 'improving' | 'declining' | 'stable' {
  if (!checkIns || checkIns.length < 2) return 'stable';
  
  const recentCheckIns = checkIns
    .filter(c => c.mood)
    .slice(-7)
    .map(c => c.mood!);
  
  if (recentCheckIns.length < 2) return 'stable';
  
  const avgRecent = recentCheckIns.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, recentCheckIns.length);
  const avgPrevious = recentCheckIns.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, recentCheckIns.length - 3);
  
  if (avgRecent > avgPrevious + 0.5) return 'improving';
  if (avgRecent < avgPrevious - 0.5) return 'declining';
  return 'stable';
}

export function getMilestone(days: number): { text: string; color: string } {
  if (days >= 365) {
    const years = Math.floor(days / 365);
    return { text: `${years} Year${years > 1 ? 's' : ''}`, color: 'from-purple-500 to-purple-600' };
  }
  if (days >= 180) return { text: '6 Months', color: 'from-blue-500 to-blue-600' };
  if (days >= 90) return { text: '90 Days', color: 'from-green-500 to-green-600' };
  if (days >= 30) return { text: '30 Days', color: 'from-orange-500 to-orange-600' };
  if (days >= 7) return { text: '1 Week', color: 'from-red-500 to-red-600' };
  return { text: 'Starting Strong', color: 'from-pink-500 to-pink-600' };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getBreathingPhase(time: number): { phase: string; color: string; instruction: string } {
  const cycle = time % 14; // 4 in + 4 hold + 6 out
  if (cycle >= 10) return { phase: 'Inhale', color: 'bg-blue-500', instruction: '4 seconds - Breathe in slowly' };
  if (cycle >= 6) return { phase: 'Hold', color: 'bg-yellow-500', instruction: '4 seconds - Hold your breath' };
  return { phase: 'Exhale', color: 'bg-green-500', instruction: '6 seconds - Breathe out slowly' };
}

export function calculateBadgeProgress(
  badge: Badge,
  data: {
    daysSober: number;
    checkIns: CheckIn[];
    meditations: any[];
    cravings: any[];
    meetings: any[];
    gratitude: any[];
  }
): number {
  const { daysSober, checkIns, meditations, cravings, meetings, gratitude } = data;
  
  let current = 0;
  if (!badge.type) {
    current = daysSober;
  } else if (badge.type === 'checkins') {
    current = checkIns?.length || 0;
  } else if (badge.type === 'meditations') {
    current = meditations?.length || 0;
  } else if (badge.type === 'cravings') {
    current = cravings?.filter(c => c.overcame).length || 0;
  } else if (badge.type === 'meetings') {
    current = meetings?.length || 0;
  } else if (badge.type === 'gratitude') {
    current = gratitude?.length || 0;
  } else if (badge.type === 'streak') {
    current = calculateStreak(checkIns);
  }
  
  return Math.min((current / badge.requirement) * 100, 100);
}

export function calculateTotalSavings(daysSober: number, costPerDay: number): number {
  return daysSober * costPerDay;
}

export function getSavingsProgress(totalSavings: number, goalAmount: number): number {
  if (!goalAmount) return 0;
  return Math.min((totalSavings / goalAmount) * 100, 100);
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(date: string): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function getTotalMeditationMinutes(meditations: any[]): number {
  if (!meditations || meditations.length === 0) return 0;
  return meditations.reduce((total, m) => total + (m.duration || 0), 0);
}

