import { useAuthStore } from '../stores/authStore'
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Clock,
} from 'lucide-react'

// Mock data - will be replaced with API calls
const mockStats = {
  totalPatients: 24,
  activePatients: 18,
  pendingAdmissions: 3,
  checkInsToday: 15,
  alertsCount: 2,
  avgDaysSober: 47,
}

const mockAppointments = [
  { id: 1, patient: 'John Doe', date: 'Today', time: '2:00 PM', status: 'confirmed' },
  { id: 2, patient: 'Jane Smith', date: 'Today', time: '3:30 PM', status: 'confirmed' },
  { id: 3, patient: 'Michael Johnson', date: 'Tomorrow', time: '10:00 AM', status: 'pending' },
  { id: 4, patient: 'Sarah Wilson', date: 'Nov 23', time: '11:30 AM', status: 'confirmed' },
]

const mockMessages = [
  { id: 1, from: 'John Doe', preview: 'Thank you for the session today...', time: 'Just now' },
  { id: 2, from: 'Jane Smith', preview: 'I wanted to share my progress...', time: '2 min ago' },
  { id: 3, from: 'Michael Johnson', preview: 'Can we reschedule tomorrow...', time: '15 min ago' },
  { id: 4, from: 'Sarah Wilson', preview: 'I completed my weekly goals!', time: '1 hour ago' },
]

const mockReminders = [
  { id: 1, title: 'Review Treatment Plans', description: '3 patients have treatment plan reviews due this week', icon: ClipboardCheck },
  { id: 2, title: 'Pending Registrations', description: '2 patients haven\'t completed their app registration', icon: Users },
  { id: 3, title: 'Check-in Alerts', description: '1 patient missed their daily check-in', icon: AlertTriangle },
]

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Welcome Banner */}
      <div className="bg-primary-600 text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-primary-100 mt-1">
          Here's an overview of your facility's activity today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={mockStats.totalPatients}
          subtitle={`${mockStats.activePatients} active`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Check-ins Today"
          value={mockStats.checkInsToday}
          subtitle="out of 18 active"
          icon={ClipboardCheck}
          color="green"
        />
        <StatCard
          title="Alerts"
          value={mockStats.alertsCount}
          subtitle="needs attention"
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          title="Avg. Days Sober"
          value={mockStats.avgDaysSober}
          subtitle="across all patients"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Reminders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Reminders</h2>
        <div className="grid grid-cols-3 gap-4">
          {mockReminders.map((reminder) => {
            const Icon = reminder.icon
            return (
              <div
                key={reminder.id}
                className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {mockAppointments.map((apt) => (
              <div
                key={apt.id}
                className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-600">
                  {apt.patient.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{apt.patient}</p>
                  <p className="text-sm text-gray-500">{apt.date} at {apt.time}</p>
                </div>
                <span className={`badge ${
                  apt.status === 'confirmed' ? 'badge-success' : 'badge-warning'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all appointments
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Messages</h2>
            <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full font-medium">
              4 new
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">{msg.from}</p>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {msg.time}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{msg.preview}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all messages
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
