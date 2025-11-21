import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  Copy,
  Check,
  X,
} from 'lucide-react'

// Mock data
const mockPatients = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    first_name: 'John',
    last_name: 'Doe',
    status: 'active',
    days_sober: 51,
    check_in_streak: 7,
    admission_date: '2024-10-01',
    counselor_name: 'Dr. Martinez',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    first_name: 'Jane',
    last_name: 'Smith',
    status: 'pending',
    days_sober: 0,
    check_in_streak: 0,
    admission_date: '2024-11-20',
    counselor_name: 'Dr. Thompson',
    registration_key: 'HOP3-N7B4-Q2K9',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    first_name: 'Michael',
    last_name: 'Johnson',
    status: 'active',
    days_sober: 67,
    check_in_streak: 12,
    admission_date: '2024-09-15',
    counselor_name: 'Dr. Thompson',
  },
]

export default function Patients() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewPatientModal, setShowNewPatientModal] = useState(searchParams.get('new') === 'true')
  const [newPatientKey, setNewPatientKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  const filteredPatients = mockPatients.filter((p) => {
    const matchesSearch = `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreatePatient = async (formData: any) => {
    // TODO: API call to create patient
    // const response = await api.post('/patients', formData)

    // Mock response
    const generatedKey = 'REC' + Math.random().toString(36).substring(2, 3).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase()

    setNewPatientKey(generatedKey)
  }

  const copyKey = () => {
    if (newPatientKey) {
      navigator.clipboard.writeText(newPatientKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your patients</p>
        </div>
        <button
          onClick={() => setShowNewPatientModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="discharged">Discharged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Days Sober
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Streak
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Counselor
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admitted
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPatients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="table-row-hover cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-600">
                      {patient.first_name[0]}{patient.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </p>
                      {patient.registration_key && (
                        <p className="text-xs text-gray-400 font-mono">
                          Key: {patient.registration_key}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${
                    patient.status === 'active' ? 'badge-success' :
                    patient.status === 'pending' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{patient.days_sober}</span>
                  <span className="text-gray-400 text-sm"> days</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{patient.check_in_streak}</span>
                  <span className="text-gray-400 text-sm"> days</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{patient.counselor_name}</td>
                <td className="px-6 py-4 text-gray-600">{patient.admission_date}</td>
                <td className="px-6 py-4">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {newPatientKey ? 'Patient Created!' : 'Add New Patient'}
              </h2>
              <button
                onClick={() => {
                  setShowNewPatientModal(false)
                  setNewPatientKey(null)
                  setSearchParams({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newPatientKey ? (
              // Success - Show Registration Key
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Registration Key Generated
                </h3>
                <p className="text-gray-500 mb-6">
                  Give this key to the patient to register on the mobile app.
                </p>

                <div className="bg-gray-100 rounded-xl p-6 mb-6">
                  <p className="text-3xl font-mono font-bold text-primary-600 tracking-wider">
                    {newPatientKey}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Expires in 48 hours</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyKey}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Key
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewPatientModal(false)
                      setNewPatientKey(null)
                      setSearchParams({})
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // Form
              <NewPatientForm
                onSubmit={handleCreatePatient}
                onCancel={() => {
                  setShowNewPatientModal(false)
                  setSearchParams({})
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface NewPatientFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

function NewPatientForm({ onSubmit, onCancel }: NewPatientFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    email: '',
    sobriety_date: new Date().toISOString().split('T')[0],
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onSubmit(formData)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth *
        </label>
        <input
          type="date"
          required
          value={formData.date_of_birth}
          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="patient@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sobriety Date *
        </label>
        <input
          type="date"
          required
          value={formData.sobriety_date}
          onChange={(e) => setFormData({ ...formData, sobriety_date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Patient'}
        </button>
      </div>
    </form>
  )
}
