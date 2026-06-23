import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AccessRecordsPage } from './pages/AccessRecordsPage'
import { NewAccessPage } from './pages/NewAccessPage'
import { PersonnelPage } from './pages/PersonnelPage'
import { KeyInventoryPage } from './pages/KeyInventoryPage'
import { AuditLogPage } from './pages/AuditLogPage'
import { AdminPage } from './pages/AdminPage'
import { ReportsPage } from './pages/ReportsPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

/**
 * Authenticated shell: wraps all protected routes with a single
 * DataProvider so state is shared across navigations.
 */
function AuthenticatedApp() {
  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/access" element={<AccessRecordsPage />} />
          <Route path="/access/new" element={<NewAccessPage />} />
          <Route path="/personnel" element={<PersonnelPage />} />
          <Route path="/keys" element={<KeyInventoryPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </DataProvider>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AuthenticatedApp />
          </RequireAuth>
        }
      />
    </Routes>
  )
}
