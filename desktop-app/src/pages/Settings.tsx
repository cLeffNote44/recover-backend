import { useAuthStore } from '../stores/authStore'
import { User, Bell, Shield, Building, LogOut } from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuthStore()

  return (
    <div className="animate-fadeIn max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <User className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                defaultValue={user?.first_name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                defaultValue={user?.last_name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <Bell className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">New patient check-ins</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary-600" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Missed check-in alerts</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary-600" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">New messages</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary-600" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Appointment reminders</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary-600" />
            </label>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-4">
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Change Password
            </button>
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700">Two-factor authentication</span>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded text-primary-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Facility Section (Admin only) */}
        {user?.role === 'super_admin' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <Building className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Facility Management</h2>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Manage facilities, staff accounts, and system settings.
            </p>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
              Manage Facilities
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
