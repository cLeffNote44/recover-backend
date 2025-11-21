import { useState, useEffect } from 'react'
import {
  Building2,
  Users,
  UserCog,
  Stethoscope,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Pause,
  Trash2,
  RefreshCw,
  Download,
  ChevronRight,
} from 'lucide-react'
import WelcomeWizard from './WelcomeWizard'
import { superAdminAPI } from '../../services/api'

type TabType = 'overview' | 'facilities' | 'administrators' | 'clinicians' | 'patients' | 'analytics'

// Mock data for offline mode
const mockStats = {
  total_facilities: 12,
  total_staff: 156,
  total_patients: 842,
  active_today: 623,
  facilities_change: 2,
  staff_change: 8,
  patients_change: 45,
  active_change: -12,
}

const mockFacilities = [
  { id: '1', name: 'Hope Recovery Center', city: 'Austin', state: 'TX', status: 'active', patient_count: 85, staff_count: 18, last_active: '2024-11-21T10:30:00Z' },
  { id: '2', name: 'New Beginnings Treatment', city: 'Houston', state: 'TX', status: 'active', patient_count: 120, staff_count: 25, last_active: '2024-11-21T09:15:00Z' },
  { id: '3', name: 'Serenity Springs', city: 'Dallas', state: 'TX', status: 'active', patient_count: 65, staff_count: 12, last_active: '2024-11-21T08:45:00Z' },
  { id: '4', name: 'Pathway to Wellness', city: 'San Antonio', state: 'TX', status: 'pending', patient_count: 0, staff_count: 3, last_active: '2024-11-20T14:00:00Z' },
  { id: '5', name: 'Horizon Health', city: 'Denver', state: 'CO', status: 'suspended', patient_count: 45, staff_count: 8, last_active: '2024-11-15T16:30:00Z' },
]

const mockAdministrators = [
  { id: '1', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@hoperecovery.com', facility_name: 'Hope Recovery Center', status: 'active', last_login: '2024-11-21T08:00:00Z' },
  { id: '2', first_name: 'Michael', last_name: 'Chen', email: 'michael@newbeginnings.com', facility_name: 'New Beginnings Treatment', status: 'active', last_login: '2024-11-21T07:30:00Z' },
  { id: '3', first_name: 'Emily', last_name: 'Rodriguez', email: 'emily@serenitysprings.com', facility_name: 'Serenity Springs', status: 'active', last_login: '2024-11-20T18:00:00Z' },
  { id: '4', first_name: 'James', last_name: 'Wilson', email: 'james@pathway.com', facility_name: 'Pathway to Wellness', status: 'pending', last_login: null },
]

const mockClinicians = [
  { id: '1', first_name: 'Dr. Maria', last_name: 'Martinez', role: 'counselor', facility_name: 'Hope Recovery Center', patients_assigned: 12, last_active: '2024-11-21T10:00:00Z' },
  { id: '2', first_name: 'Dr. Robert', last_name: 'Thompson', role: 'therapist', facility_name: 'Hope Recovery Center', patients_assigned: 15, last_active: '2024-11-21T09:45:00Z' },
  { id: '3', first_name: 'Lisa', last_name: 'Anderson', role: 'case_manager', facility_name: 'New Beginnings Treatment', patients_assigned: 20, last_active: '2024-11-21T09:30:00Z' },
  { id: '4', first_name: 'Dr. Kevin', last_name: 'Park', role: 'counselor', facility_name: 'Serenity Springs', patients_assigned: 8, last_active: '2024-11-21T08:15:00Z' },
  { id: '5', first_name: 'Amanda', last_name: 'White', role: 'nurse', facility_name: 'New Beginnings Treatment', patients_assigned: 30, last_active: '2024-11-21T10:15:00Z' },
]

const mockPatients = [
  { id: '1', first_name: 'John', last_name: 'Doe', facility_name: 'Hope Recovery Center', status: 'active', days_in_program: 45, counselor_name: 'Dr. Martinez' },
  { id: '2', first_name: 'Jane', last_name: 'Smith', facility_name: 'Hope Recovery Center', status: 'active', days_in_program: 30, counselor_name: 'Dr. Thompson' },
  { id: '3', first_name: 'Michael', last_name: 'Brown', facility_name: 'New Beginnings Treatment', status: 'active', days_in_program: 60, counselor_name: 'Lisa Anderson' },
  { id: '4', first_name: 'Sarah', last_name: 'Davis', facility_name: 'Serenity Springs', status: 'pending', days_in_program: 0, counselor_name: 'Dr. Park' },
  { id: '5', first_name: 'David', last_name: 'Wilson', facility_name: 'New Beginnings Treatment', status: 'discharged', days_in_program: 90, counselor_name: 'Lisa Anderson' },
]

const mockRecentActivity = [
  { id: '1', type: 'patient_added', message: 'New patient registered at Hope Recovery Center', time: '10 minutes ago' },
  { id: '2', type: 'staff_login', message: 'Dr. Martinez logged in', time: '25 minutes ago' },
  { id: '3', type: 'facility_created', message: 'New facility "Pathway to Wellness" created', time: '2 hours ago' },
  { id: '4', type: 'alert', message: 'Missed check-in alert for 3 patients at New Beginnings', time: '3 hours ago' },
]

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showWizard, setShowWizard] = useState(false)
  const [stats, setStats] = useState(mockStats)
  const [facilities, setFacilities] = useState(mockFacilities)
  const [administrators, setAdministrators] = useState(mockAdministrators)
  const [clinicians, setClinicians] = useState(mockClinicians)
  const [patients, setPatients] = useState(mockPatients)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, facilitiesRes] = await Promise.all([
          superAdminAPI.getStats(),
          superAdminAPI.getFacilities(),
        ])
        if (statsRes.success) setStats(statsRes.stats)
        if (facilitiesRes.success) {
          setFacilities(facilitiesRes.facilities)
          // Check if first time (no facilities)
          if (facilitiesRes.facilities.length === 0) {
            setShowWizard(true)
          }
        }
      } catch (err) {
        console.log('Using mock data - API unavailable')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (showWizard) {
    return <WelcomeWizard onComplete={() => setShowWizard(false)} />
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
    { id: 'administrators', label: 'Administrators', icon: UserCog },
    { id: 'clinicians', label: 'Clinicians', icon: Stethoscope },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      discharged: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      counselor: 'bg-blue-100 text-blue-800',
      therapist: 'bg-purple-100 text-purple-800',
      case_manager: 'bg-indigo-100 text-indigo-800',
      nurse: 'bg-pink-100 text-pink-800',
      facility_admin: 'bg-orange-100 text-orange-800',
    }
    const labels: Record<string, string> = {
      counselor: 'Counselor',
      therapist: 'Therapist',
      case_manager: 'Case Manager',
      nurse: 'Nurse',
      facility_admin: 'Admin',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
      </span>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">Manage all facilities and system settings</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Facility
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.facilities_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.facilities_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(stats.facilities_change)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stats.total_facilities}</p>
                <p className="text-sm text-gray-600">Total Facilities</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-purple-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.staff_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.staff_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(stats.staff_change)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stats.total_staff}</p>
                <p className="text-sm text-gray-600">Total Staff</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.patients_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.patients_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(stats.patients_change)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stats.total_patients}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.active_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.active_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(stats.active_change)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stats.active_today}</p>
                <p className="text-sm text-gray-600">Active Today</p>
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
              </div>
              <div className="space-y-3">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'alert' ? 'bg-red-100' :
                      activity.type === 'facility_created' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {activity.type === 'alert' ? (
                        <AlertCircle className={`w-4 h-4 text-red-600`} />
                      ) : activity.type === 'facility_created' ? (
                        <Building2 className={`w-4 h-4 text-blue-600`} />
                      ) : (
                        <CheckCircle className={`w-4 h-4 text-green-600`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setShowWizard(true)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add Facility</p>
                    <p className="text-xs text-gray-500">Create new facility</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add Administrator</p>
                    <p className="text-xs text-gray-500">Create new admin</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Export Report</p>
                    <p className="text-xs text-gray-500">Download system report</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </button>
              </div>
            </div>
          </div>

          {/* Facilities Overview Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Facilities Overview</h2>
              <button
                onClick={() => setActiveTab('facilities')}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Facility</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Patients</th>
                  <th className="pb-3 font-medium">Staff</th>
                  <th className="pb-3 font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {facilities.slice(0, 5).map((facility) => (
                  <tr key={facility.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{facility.name}</td>
                    <td className="py-3 text-gray-600">{facility.city}, {facility.state}</td>
                    <td className="py-3">{getStatusBadge(facility.status)}</td>
                    <td className="py-3 text-gray-900">{facility.patient_count}</td>
                    <td className="py-3 text-gray-900">{facility.staff_count}</td>
                    <td className="py-3 text-gray-600">{formatDate(facility.last_active)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Facilities Tab */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Patients</th>
                  <th className="px-5 py-3 font-medium">Staff</th>
                  <th className="px-5 py-3 font-medium">Last Active</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {facilities
                  .filter(f => statusFilter === 'all' || f.status === statusFilter)
                  .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((facility) => (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{facility.name}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{facility.city}, {facility.state}</td>
                    <td className="px-5 py-4">{getStatusBadge(facility.status)}</td>
                    <td className="px-5 py-4 text-gray-900">{facility.patient_count}</td>
                    <td className="px-5 py-4 text-gray-900">{facility.staff_count}</td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(facility.last_active)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded">
                          <Pause className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Administrators Tab */}
      {activeTab === 'administrators' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search administrators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Administrator
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last Login</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {administrators
                  .filter(a => `${a.first_name} ${a.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{admin.first_name} {admin.last_name}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{admin.email}</td>
                    <td className="px-5 py-4 text-gray-900">{admin.facility_name}</td>
                    <td className="px-5 py-4">{getStatusBadge(admin.status)}</td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(admin.last_login)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clinicians Tab */}
      {activeTab === 'clinicians' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clinicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="counselor">Counselor</option>
              <option value="therapist">Therapist</option>
              <option value="case_manager">Case Manager</option>
              <option value="nurse">Nurse</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Patients Assigned</th>
                  <th className="px-5 py-3 font-medium">Last Active</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {clinicians
                  .filter(c => statusFilter === 'all' || c.role === statusFilter)
                  .filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((clinician) => (
                  <tr key={clinician.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{clinician.first_name} {clinician.last_name}</p>
                    </td>
                    <td className="px-5 py-4">{getRoleBadge(clinician.role)}</td>
                    <td className="px-5 py-4 text-gray-900">{clinician.facility_name}</td>
                    <td className="px-5 py-4 text-gray-900">{clinician.patients_assigned}</td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(clinician.last_active)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="discharged">Discharged</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Days in Program</th>
                  <th className="px-5 py-3 font-medium">Assigned Counselor</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {patients
                  .filter(p => statusFilter === 'all' || p.status === statusFilter)
                  .filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{patient.first_name} {patient.last_name}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-900">{patient.facility_name}</td>
                    <td className="px-5 py-4">{getStatusBadge(patient.status)}</td>
                    <td className="px-5 py-4 text-gray-900">{patient.days_in_program}</td>
                    <td className="px-5 py-4 text-gray-600">{patient.counselor_name}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600">Avg. Patients per Facility</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">70.2</p>
              <p className="text-xs text-green-600 mt-1">+5.3% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600">Avg. Length of Stay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">42 days</p>
              <p className="text-xs text-green-600 mt-1">+2 days from last month</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">78%</p>
              <p className="text-xs text-green-600 mt-1">+3% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600">Check-in Compliance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">91%</p>
              <p className="text-xs text-red-600 mt-1">-1% from last month</p>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Patient Admissions Over Time</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart coming soon</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Facility Comparison</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Staff Workload Distribution</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
