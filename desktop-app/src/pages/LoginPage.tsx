import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { authAPI, healthCheck } from '../services/api'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  const { login } = useAuthStore()

  // Check server status on mount
  useState(() => {
    healthCheck().then((result) => {
      setServerStatus(result.status === 'healthy' ? 'online' : 'offline')
    })
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authAPI.staffLogin(email, password)

      if (response.success) {
        login(response.user, response.accessToken, response.refreshToken)
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (err: any) {
      // If server is offline, use mock login for demo
      if (err.code === 'ERR_NETWORK' || serverStatus === 'offline') {
        console.log('Server offline, using mock login')
        if (email === 'admin@recoversystem.com' && password === 'SuperAdmin123!') {
          login(
            {
              id: '00000000-0000-0000-0000-000000000001',
              email: 'admin@recoversystem.com',
              first_name: 'System',
              last_name: 'Administrator',
              role: 'super_admin',
            },
            'mock-access-token',
            'mock-refresh-token'
          )
          return
        } else if (email === 'dr.martinez@hoperecovery.com' && password === 'Counselor123!') {
          login(
            {
              id: '20000000-0000-0000-0000-000000000002',
              email: 'dr.martinez@hoperecovery.com',
              first_name: 'Maria',
              last_name: 'Martinez',
              role: 'counselor',
              facility_id: '10000000-0000-0000-0000-000000000001',
            },
            'mock-access-token',
            'mock-refresh-token'
          )
          return
        }
        setError('Server offline. Use demo credentials to test.')
      } else {
        setError(err.response?.data?.error || err.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recover</h1>
          <p className="text-primary-300 mt-1">Facility Portal</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Empowering recovery,<br />
            one patient at a time.
          </h2>
          <p className="text-primary-200 text-lg max-w-md">
            Access your facility dashboard, manage patients, and track recovery progress all in one place.
          </p>
        </div>

        <div className="text-primary-400 text-sm">
          2024 Recover System. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-900">Recover</h1>
            <p className="text-gray-500">Facility Portal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500 mb-6">Sign in to your account</p>

            {/* Server Status */}
            {serverStatus === 'offline' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Server offline - Demo mode available</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Admin:</strong> admin@recoversystem.com / SuperAdmin123!</p>
                <p><strong>Counselor:</strong> dr.martinez@hoperecovery.com / Counselor123!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
