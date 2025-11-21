import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  Home,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/patients', icon: Users, label: 'Patients' },
  { path: '/messages', icon: MessageSquare, label: 'Messages', badge: 4 },
  { path: '/appointments', icon: Calendar, label: 'Appointments' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  return (
    <aside className="sidebar w-64 bg-primary-900 text-white flex flex-col">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-primary-800">
        <h1 className="text-xl font-bold tracking-tight">
          Recover
        </h1>
        <p className="text-primary-300 text-xs mt-1">Clinician Portal</p>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-primary-800">
        <button className="flex items-center gap-3 w-full hover:bg-primary-800 rounded-lg p-2 transition-colors no-drag">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-semibold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-sm">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-primary-300 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-primary-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors no-drag ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Support Section */}
      <div className="border-t border-primary-800 p-4">
        <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-3">
          Support
        </p>
        <div className="space-y-2">
          <a
            href="tel:1-800-RECOVER"
            className="flex items-center gap-2 text-primary-300 hover:text-white text-sm no-drag"
          >
            <Phone className="w-4 h-4" />
            <span>1-800-RECOVER</span>
          </a>
          <a
            href="mailto:support@recover.com"
            className="flex items-center gap-2 text-primary-300 hover:text-white text-sm no-drag"
          >
            <Mail className="w-4 h-4" />
            <span>Email Support</span>
          </a>
          <button className="flex items-center gap-2 text-primary-300 hover:text-white text-sm no-drag">
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-primary-800">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-primary-300 hover:text-white text-sm w-full no-drag"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
