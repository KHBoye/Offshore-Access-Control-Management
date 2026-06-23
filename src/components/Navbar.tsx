import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { t, getLang, setLang, type Lang } from '../i18n'

export function Navbar() {
  const { user, logout, isAdmin, isHseLead, isCoordinator } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLangState] = useState<Lang>(getLang())

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleLang = () => {
    const next: Lang = lang === 'no' ? 'en' : 'no'
    setLang(next)
    setLangState(next)
    // Force re-render by state update – pages will re-read t()
    window.location.reload()
  }

  const close = () => setMenuOpen(false)

  const navCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link'

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🔑</span>
        <span className="navbar-title">Aker BP Access Control</span>
        {user && (
          <span className="navbar-asset-tag">
            {user.assetId
              ? `${user.assetId.toUpperCase()}`
              : user.role === 'hse_lead'
              ? 'HSE'
              : 'ADMIN'}
          </span>
        )}
      </div>

      <button
        className="navbar-hamburger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <nav className={`navbar-nav ${menuOpen ? 'navbar-nav-open' : ''}`}>
        <NavLink to="/" end className={navCls} onClick={close}>
          {t('nav_dashboard')}
        </NavLink>
        <NavLink to="/access" className={navCls} onClick={close}>
          {t('nav_access')}
        </NavLink>
        {(isCoordinator || isAdmin) && (
          <NavLink to="/access/new" className={navCls} onClick={close}>
            {t('nav_new_access')}
          </NavLink>
        )}
        <NavLink to="/personnel" className={navCls} onClick={close}>
          {t('nav_personnel')}
        </NavLink>
        <NavLink to="/keys" className={navCls} onClick={close}>
          {t('nav_keys')}
        </NavLink>
        <NavLink to="/audit" className={navCls} onClick={close}>
          {t('nav_audit')}
        </NavLink>
        {(isAdmin || isHseLead) && (
          <NavLink to="/reports" className={navCls} onClick={close}>
            {t('nav_reports')}
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin" className={navCls} onClick={close}>
            {t('nav_admin')}
          </NavLink>
        )}

        <div className="navbar-divider" />

        <button className="nav-link nav-btn" onClick={toggleLang} title={t('lbl_language')}>
          {lang === 'no' ? '🇬🇧 EN' : '🇳🇴 NO'}
        </button>

        {user && (
          <div className="navbar-user">
            <span className="navbar-user-name">{user.name}</span>
            <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
              {t('nav_logout')}
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
