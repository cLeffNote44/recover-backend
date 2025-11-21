import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, FileText, Target, Calendar } from 'lucide-react'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock patient data - will be replaced with API call
  const patient = {
    id,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1985-03-15',
    phone: '(555) 123-4567',
    email: 'john.doe@email.com',
    status: 'active',
    admission_date: '2024-10-01',
    sobriety_date: '2024-10-01',
    days_sober: 51,
    check_in_streak: 7,
    total_check_ins: 45,
    counselor_name: 'Dr. Maria Martinez',
    substances: ['Alcohol', 'Cocaine'],
  }

  const recentCheckIns = [
    { date: '2024-11-21', mood: 9, notes: 'Best day yet! Feeling strong.' },
    { date: '2024-11-20', mood: 7, notes: 'Attended group therapy.' },
    { date: '2024-11-19', mood: 8, notes: 'One month milestone!' },
    { date: '2024-11-18', mood: 7, notes: 'Good day at work.' },
    { date: '2024-11-17', mood: 6, notes: 'Had a tough day.' },
  ]

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-gray-500">Patient Profile</p>
        </div>
        <span className={`badge ${patient.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
          {patient.status}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500">Days Sober</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{patient.days_sober}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500">Check-in Streak</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{patient.check_in_streak}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500">Total Check-ins</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{patient.total_check_ins}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500">Craving Success</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">87%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Patient Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="text-gray-900">{patient.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900">{patient.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Date of Birth</p>
                <p className="text-gray-900">{patient.date_of_birth}</p>
              </div>
            </div>
          </div>

          {/* Treatment Info */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Treatment Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Assigned Counselor</p>
                <p className="text-gray-900">{patient.counselor_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Admission Date</p>
                <p className="text-gray-900">{patient.admission_date}</p>
              </div>
              <div>
                <p className="text-gray-500">Sobriety Date</p>
                <p className="text-gray-900">{patient.sobriety_date}</p>
              </div>
              <div>
                <p className="text-gray-500">Substances</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.substances.map((s) => (
                    <span key={s} className="badge badge-primary">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium">Send Message</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium">Upload Document</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Target className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium">Assign Goal</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Calendar className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium">Schedule Appointment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column - Recent Activity */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-card">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recent Check-ins</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {recentCheckIns.map((checkIn, index) => (
                <div key={index} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{checkIn.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Mood:</span>
                      <span className={`font-semibold ${
                        checkIn.mood >= 8 ? 'text-green-600' :
                        checkIn.mood >= 6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{checkIn.mood}/10</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{checkIn.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
