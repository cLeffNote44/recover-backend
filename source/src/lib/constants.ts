import { Badge } from '@/types/app';

export const MOTIVATIONAL_QUOTES = [
  "One day at a time. You've got this.",
  "Recovery is not a race. You don't have to feel guilty about taking your time.",
  "Fall seven times, stand up eight.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "Your recovery is worth fighting for, every single day.",
  "Progress, not perfection.",
  "You are stronger than you know, braver than you believe.",
  "Today is another chance to get better.",
  "Recovery is an acceptance that your life is in shambles and you have to change.",
  "The only person you are destined to become is the person you decide to be.",
  "Every moment is a fresh beginning.",
  "You didn't come this far to only come this far.",
  "The comeback is always stronger than the setback.",
  "Your story isn't over yet.",
  "Courage doesn't always roar. Sometimes it's the quiet voice saying, 'I will try again tomorrow.'"
];

export const COPING_STRATEGIES = [
  { id: 1, title: "Deep Breathing", description: "Take 10 slow, deep breaths. Inhale for 4, hold for 4, exhale for 6.", icon: "💨" },
  { id: 2, title: "Call Your Sponsor", description: "Reach out to your sponsor or a trusted person in your support network.", icon: "📞" },
  { id: 3, title: "Go for a Walk", description: "Physical movement helps. Even 5 minutes outside can shift your mindset.", icon: "🚶" },
  { id: 4, title: "Play the Tape Forward", description: "Imagine the consequences of using. Where will you be in 1 hour? 1 day? 1 week?", icon: "⏭️" },
  { id: 5, title: "HALT Check", description: "Are you Hungry, Angry, Lonely, or Tired? Address the real need.", icon: "✋" },
  { id: 6, title: "Gratitude List", description: "Write down 3 things you're grateful for right now.", icon: "🙏" },
  { id: 7, title: "Attend a Meeting", description: "Find an online or in-person meeting happening now.", icon: "👥" },
  { id: 8, title: "Read Recovery Literature", description: "Open your recovery book or app and read for 10 minutes.", icon: "📖" },
  { id: 9, title: "Distract Yourself", description: "Do something engaging: puzzle, game, music, cleaning, cooking.", icon: "🎮" },
  { id: 10, title: "Remember Your Why", description: "Look at your reasons for recovery. What do you have to lose?", icon: "❤️" }
];

export const BADGES: Badge[] = [
  { id: '24h', name: '24 Hours Strong', description: 'First full day sober', icon: '🌅', requirement: 1 },
  { id: '1week', name: 'One Week Warrior', description: '7 days of sobriety', icon: '⭐', requirement: 7 },
  { id: '30days', name: '30-Day Champion', description: 'One month sober', icon: '🏆', requirement: 30 },
  { id: '60days', name: '60-Day Hero', description: 'Two months strong', icon: '💪', requirement: 60 },
  { id: '90days', name: '90-Day Legend', description: 'Three months of recovery', icon: '👑', requirement: 90 },
  { id: '6months', name: 'Half-Year Milestone', description: '6 months sober', icon: '🎖️', requirement: 180 },
  { id: '1year', name: 'One Year Anniversary', description: 'Full year of sobriety', icon: '🎂', requirement: 365 },
  { id: 'checkin50', name: 'Consistent Checker', description: '50 check-ins', icon: '✅', requirement: 50, type: 'checkins' },
  { id: 'checkin100', name: 'Check-In Master', description: '100 check-ins', icon: '💯', requirement: 100, type: 'checkins' },
  { id: 'meditation25', name: 'Mindful Beginner', description: '25 meditations', icon: '🧘', requirement: 25, type: 'meditations' },
  { id: 'meditation50', name: 'Zen Master', description: '50 meditations', icon: '☮️', requirement: 50, type: 'meditations' },
  { id: 'craving25', name: 'Urge Warrior', description: 'Overcame 25 cravings', icon: '⚔️', requirement: 25, type: 'cravings' },
  { id: 'meeting25', name: 'Meeting Regular', description: '25 meetings attended', icon: '👥', requirement: 25, type: 'meetings' },
  { id: 'gratitude30', name: 'Grateful Heart', description: '30 gratitude entries', icon: '💖', requirement: 30, type: 'gratitude' },
  { id: 'streak30', name: 'Streak Superstar', description: '30-day check-in streak', icon: '🔥', requirement: 30, type: 'streak' }
];

export const MOOD_EMOJIS = [
  { value: 1, emoji: '😢', label: 'Very Bad', color: 'text-red-500' },
  { value: 2, emoji: '😟', label: 'Bad', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'text-yellow-500' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'text-green-500' },
  { value: 5, emoji: '😄', label: 'Great', color: 'text-emerald-500' }
];

