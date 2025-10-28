import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { 
  Award, 
  Brain, 
  Calendar, 
  CheckCircle, 
  Heart, 
  Moon, 
  Shield, 
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Download,
  Github
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const features = [
    {
      icon: CheckCircle,
      title: "Daily Check-Ins",
      description: "Build accountability with daily check-ins and streak tracking. Never miss a day.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Heart,
      title: "Mood Tracking",
      description: "Track your emotional state with 5-level mood scale and identify patterns over time.",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Brain,
      title: "Meditation Timer",
      description: "Built-in meditation timer with 9 types. Track streaks and total mindfulness time.",
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      icon: Shield,
      title: "Prevention Plan",
      description: "Build a personalized relapse prevention plan with warning signs and action levels.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Zap,
      title: "Craving Tracker",
      description: "Log cravings with intensity and triggers. Analyze patterns to prevent relapse.",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Comprehensive insights with charts, trends, and milestone progress tracking.",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Support Network",
      description: "Manage contacts, quick-dial sponsor, and access emergency support instantly.",
      gradient: "from-teal-500 to-emerald-600"
    },
    {
      icon: Calendar,
      title: "Event Calendar",
      description: "Schedule meetings, appointments, and recovery events with reminders.",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      icon: Moon,
      title: "Dark Mode",
      description: "Beautiful dark theme for comfortable viewing anytime, with smooth transitions.",
      gradient: "from-slate-500 to-gray-600"
    }
  ];

  const stats = [
    { label: "Features", value: "40+", icon: Sparkles },
    { label: "Tabs", value: "8", icon: Award },
    { label: "Privacy", value: "100%", icon: Shield },
    { label: "Free", value: "Always", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-3xl shadow-2xl shadow-purple-500/50">
              <Award className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Recovery Journey
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Your Complete Sobriety Companion
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Track your progress, build healthy habits, and stay accountable with a comprehensive recovery app featuring mood tracking, meditation, relapse prevention planning, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg px-8 py-6 text-lg rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all transform hover:scale-105"
                onClick={() => setLocation('/app')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Launch App
              </Button>
            <a href="/sobriety-app-v4-complete.zip" download>
              <Button size="lg" variant="outline" className="border-2 border-purple-500 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg rounded-2xl">
                <Download className="w-5 h-5 mr-2" />
                Download v4.0
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            Everything You Need for Recovery
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            A comprehensive toolkit built on evidence-based recovery principles from AA, NA, CBT, DBT, and mindfulness practices.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl">
                  <CardHeader>
                    <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-2xl w-fit mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* What's New in v4 */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" />
              What's New in Version 4.0
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">😊 Mood Tracking</h3>
                <p className="text-gray-300">Track emotional state with daily check-ins using a 5-level emoji scale. Identify patterns and trends over time.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">🛡️ Relapse Prevention Plan</h3>
                <p className="text-gray-300">Build a personalized safety plan with warning signs, high-risk situations, and action levels for crisis management.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">🧘 Meditation Tracker</h3>
                <p className="text-gray-300">Built-in timer with 9 meditation types. Track streaks, total time, and build a consistent mindfulness practice.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">🌙 Dark Mode</h3>
                <p className="text-gray-300">Beautiful dark theme with smooth transitions. Toggle anytime for comfortable viewing in any environment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Your Daily Workflow
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-green-500/50">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Morning Check-In</h3>
              <p className="text-gray-400">Start your day with a check-in and mood selection. Build your streak one day at a time.</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-purple-500/50">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Track & Log</h3>
              <p className="text-gray-400">Log cravings, meetings, growth, and challenges throughout your day. Identify patterns.</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-blue-500/50">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Evening Reflection</h3>
              <p className="text-gray-400">Meditate, journal gratitude, and review your analytics. Celebrate your progress.</p>
            </div>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-400" />
                Your Privacy Matters
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                <div className="space-y-2 mt-4">
                  <p>✅ <strong>100% Local Storage</strong> - All data stays on your device</p>
                  <p>✅ <strong>No Account Required</strong> - Start using immediately</p>
                  <p>✅ <strong>No External Servers</strong> - Complete privacy and control</p>
                  <p>✅ <strong>Export Anytime</strong> - Download your data as JSON backup</p>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl shadow-purple-500/50">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Your Recovery Journey Today
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands using this comprehensive recovery companion. One day at a time. You've got this. 💪
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-lg font-bold">
                <Sparkles className="w-5 h-5 mr-2" />
                Launch App Now
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-2xl">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p className="mb-2">Recovery Journey v4.0 - Built with ❤️ for the recovery community</p>
          <p>Not a substitute for professional treatment. Consult healthcare providers for serious issues.</p>
          <p className="mt-4">Crisis Support: <strong className="text-purple-400">988 Suicide & Crisis Lifeline</strong></p>
        </div>
      </div>
    </div>
  );
}

