import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { AppUser } from '../types'
import { DEMO_USERS } from '../data/mockData'

interface AuthContextValue {
  user: AppUser | null
  login: (userId: string) => void
  logout: () => void
  isCoordinator: boolean
  isHseLead: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const SESSION_KEY = 'oacm_session_userId'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    const savedId = sessionStorage.getItem(SESSION_KEY)
    if (savedId) {
      return DEMO_USERS.find((u) => u.id === savedId) ?? null
    }
    return null
  })

  const login = useCallback((userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId)
    if (found) {
      setUser(found)
      sessionStorage.setItem(SESSION_KEY, found.id)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  const isCoordinator = user?.role === 'coordinator'
  const isHseLead = user?.role === 'hse_lead'
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isCoordinator, isHseLead, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
