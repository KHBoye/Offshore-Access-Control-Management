import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { t } from '../i18n'
import { AccessStatusBadge, AccessTypeBadge } from '../components/Badges'
import type { AccessRecord } from '../types'

function isExpiringSoon(record: AccessRecord): boolean {
  if (record.status !== 'active') return false
  const validTo = new Date(record.validTo)
  const now = new Date()
  const diff = validTo.getTime() - now.getTime()
  return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

function isOverdueAdHoc(record: AccessRecord): boolean {
  if (record.accessType !== 'ad-hoc') return false
  if (record.status !== 'active') return false
  const validTo = new Date(record.validTo)
  return validTo < new Date()
}

export function DashboardPage() {
  const { user, isCoordinator } = useAuth()
  const { accessRecords, keys, assets, getPersonnelById, getZoneById, getAssetById, getCompanyById } =
    useData()

  const filteredRecords = useMemo(() => {
    if (isCoordinator && user?.assetId) {
      return accessRecords.filter((r) => r.assetId === user.assetId)
    }
    return accessRecords
  }, [accessRecords, isCoordinator, user])

  const filteredKeys = useMemo(() => {
    if (isCoordinator && user?.assetId) {
      return keys.filter((k) => k.assetId === user.assetId)
    }
    return keys
  }, [keys, isCoordinator, user])

  const stats = useMemo(() => {
    const activeAccessCount = filteredRecords.filter((r) => r.status === 'active').length
    const keysIssued = filteredKeys.filter((k) => k.status === 'issued').length
    const expiringWithin7Days = filteredRecords.filter(isExpiringSoon).length
    const overdueAdHoc = filteredRecords.filter(isOverdueAdHoc).length
    return { activeAccessCount, keysIssued, expiringWithin7Days, overdueAdHoc }
  }, [filteredRecords, filteredKeys])

  const expiringRecords = useMemo(
    () => filteredRecords.filter(isExpiringSoon),
    [filteredRecords]
  )

  const overdueRecords = useMemo(
    () => filteredRecords.filter(isOverdueAdHoc),
    [filteredRecords]
  )

  const recentActive = useMemo(
    () =>
      filteredRecords
        .filter((r) => r.status === 'active')
        .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())
        .slice(0, 8),
    [filteredRecords]
  )

  const assetName = user?.assetId
    ? assets.find((a) => a.id === user.assetId)?.name ?? user.assetId
    : null

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('nav_dashboard')}</h1>
          <p className="page-subtitle">
            {t('dash_welcome')}, {user?.name}
            {assetName && (
              <span className="text-muted">
                {' '}— {t('dash_asset_filter')} <strong>{assetName}</strong>
              </span>
            )}
          </p>
        </div>
        {(user?.role === 'coordinator' || user?.role === 'admin') && (
          <Link to="/access/new" className="btn btn-primary">
            + {t('act_new_access')}
          </Link>
        )}
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-value">{stats.activeAccessCount}</div>
          <div className="stat-label">{t('dash_active_access')}</div>
        </div>
        <div className="stat-card stat-card-teal">
          <div className="stat-value">{stats.keysIssued}</div>
          <div className="stat-label">{t('dash_keys_issued')}</div>
        </div>
        <div className={`stat-card ${stats.expiringWithin7Days > 0 ? 'stat-card-warning' : 'stat-card-grey'}`}>
          <div className="stat-value">{stats.expiringWithin7Days}</div>
          <div className="stat-label">{t('dash_expiring')}</div>
        </div>
        <div className={`stat-card ${stats.overdueAdHoc > 0 ? 'stat-card-danger' : 'stat-card-grey'}`}>
          <div className="stat-value">{stats.overdueAdHoc}</div>
          <div className="stat-label">{t('dash_overdue')}</div>
        </div>
      </div>

      {/* Alerts */}
      {stats.overdueAdHoc > 0 && (
        <div className="alert alert-danger">
          <strong>⚠️ {t('dash_overdue')}:</strong>{' '}
          {overdueRecords.map((r) => {
            const person = getPersonnelById(r.personnelId)
            const zone = getZoneById(r.zoneId)
            return (
              <span key={r.id} className="alert-item">
                {person?.fullName ?? r.personnelId} / {zone?.name ?? r.zoneId}
              </span>
            )
          })}
          <Link to="/access" className="alert-link">
            {t('act_view')} →
          </Link>
        </div>
      )}

      {stats.expiringWithin7Days > 0 && (
        <div className="alert alert-warning">
          <strong>⏰ {t('dash_expiring')}:</strong>{' '}
          {expiringRecords.map((r) => {
            const person = getPersonnelById(r.personnelId)
            const zone = getZoneById(r.zoneId)
            return (
              <span key={r.id} className="alert-item">
                {person?.fullName ?? r.personnelId} / {zone?.name ?? r.zoneId} ({r.validTo})
              </span>
            )
          })}
          <Link to="/access" className="alert-link">
            {t('act_view')} →
          </Link>
        </div>
      )}

      {/* Recent active access */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t('lbl_current_access')}</h2>
          <Link to="/access" className="btn btn-sm btn-secondary">
            {t('lbl_all_access')} →
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('lbl_personnel')}</th>
                <th>{t('lbl_company')}</th>
                <th>{t('lbl_zone')}</th>
                {!isCoordinator && <th>{t('lbl_asset')}</th>}
                <th>{t('lbl_access_type')}</th>
                <th>{t('lbl_valid_to')}</th>
                <th>{t('lbl_status')}</th>
              </tr>
            </thead>
            <tbody>
              {recentActive.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">
                    {t('no_data')}
                  </td>
                </tr>
              ) : (
                recentActive.map((r) => {
                  const person = getPersonnelById(r.personnelId)
                  const zone = getZoneById(r.zoneId)
                  const asset = getAssetById(r.assetId)
                  const company = person ? getCompanyById(person.companyId) : undefined
                  const expiring = isExpiringSoon(r)
                  return (
                    <tr key={r.id} className={expiring ? 'row-warning' : ''}>
                      <td className="td-name">{person?.fullName ?? r.personnelId}</td>
                      <td className="td-muted">{company?.name ?? '—'}</td>
                      <td>{zone?.name ?? r.zoneId}</td>
                      {!isCoordinator && <td>{asset?.name ?? r.assetId}</td>}
                      <td>
                        <AccessTypeBadge type={r.accessType} />
                      </td>
                      <td className={expiring ? 'text-warning' : ''}>{r.validTo}</td>
                      <td>
                        <AccessStatusBadge status={r.status} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="quick-links">
        <Link to="/personnel" className="quick-link-card">
          <span className="quick-link-icon">👥</span>
          <span>{t('nav_personnel')}</span>
        </Link>
        <Link to="/keys" className="quick-link-card">
          <span className="quick-link-icon">🗝️</span>
          <span>{t('nav_keys')}</span>
        </Link>
        <Link to="/audit" className="quick-link-card">
          <span className="quick-link-icon">📋</span>
          <span>{t('nav_audit')}</span>
        </Link>
        {(user?.role === 'hse_lead' || user?.role === 'admin') && (
          <Link to="/reports" className="quick-link-card">
            <span className="quick-link-icon">📊</span>
            <span>{t('nav_reports')}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
