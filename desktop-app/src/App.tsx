import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Super Admin sees different interface
  const isSuperAdmin = user?.role === 'super_admin'

  return (
    <Layout>
      <Routes>
        {isSuperAdmin ? (
          <>
            <Route path="/" element={<SuperAdminDashboard />} />
            <Route path="/admin" element={<SuperAdminDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  )
}

export default App
