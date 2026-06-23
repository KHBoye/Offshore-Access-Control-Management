import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEMO_USERS } from '../data/mockData'
import { t } from '../i18n'
import type { UserRole } from '../types'

const ROLE_LABELS: Record<UserRole, string> = {
  coordinator: 'lbl_role_coordinator',
  hse_lead: 'lbl_role_hse',
  admin: 'lbl_role_admin',
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [selectedUserId, setSelectedUserId] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return
    login(selectedUserId)
    navigate('/')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🔑</div>
        <h1 className="login-title">Aker BP</h1>
        <h2 className="login-subtitle">{t('h_login')}</h2>
        <p className="login-hint">{t('demo_login_hint')}</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="user-select" className="form-label">
              {t('act_select_user')}
            </label>
            <select
              id="user-select"
              className="form-control"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">— {t('act_select_user')} —</option>
              {DEMO_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {t(ROLE_LABELS[u.role])}{u.assetId ? ` (${u.assetId.toUpperCase()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedUserId && (
            <div className="login-user-info">
              {(() => {
                const u = DEMO_USERS.find((x) => x.id === selectedUserId)
                if (!u) return null
                return (
                  <>
                    <p>
                      <strong>{t('lbl_role')}:</strong> {t(ROLE_LABELS[u.role])}
                    </p>
                    <p>
                      <strong>{t('lbl_email')}:</strong> {u.email}
                    </p>
                    {u.assetId && (
                      <p>
                        <strong>{t('lbl_asset')}:</strong> {u.assetId.toUpperCase()}
                      </p>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={!selectedUserId}>
            {t('act_login')}
          </button>
        </form>

        <div className="login-disclaimer">
          <p>🛡️ This system handles confidential operational data.</p>
          <p>Sensitivity label: <strong>Internal / Konfidensielt</strong></p>
        </div>
      </div>
    </div>
  )
}
