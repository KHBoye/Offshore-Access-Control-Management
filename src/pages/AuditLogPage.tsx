import React, { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { t } from '../i18n'
import type { AuditAction } from '../types'
import { DEMO_USERS } from '../data/mockData'

export function AuditLogPage() {
  const { auditLog } = useData()
  const { isCoordinator, user } = useAuth()

  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('')
  const [userFilter, setUserFilter] = useState('')

  const filtered = useMemo(() => {
    return auditLog.filter((entry) => {
      if (actionFilter && entry.action !== actionFilter) return false
      if (userFilter && entry.performedBy !== userFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          entry.recordReference.toLowerCase().includes(q) ||
          entry.changeDetails.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [auditLog, search, actionFilter, userFilter])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [filtered]
  )

  const exportCsv = () => {
    const header = ['Timestamp', 'Action', 'Reference', 'Performed By', 'Changes']
    const rows = sorted.map((e) => {
      const performedBy = DEMO_USERS.find((u) => u.id === e.performedBy)?.name ?? e.performedBy
      return [
        e.timestamp,
        e.action,
        `"${e.recordReference}"`,
        performedBy,
        `"${e.changeDetails}"`,
      ].join(',')
    })
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const actionColor: Record<AuditAction, string> = {
    created: 'badge-green',
    updated: 'badge-blue',
    revoked: 'badge-red',
    key_returned: 'badge-teal',
    deleted: 'badge-red',
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t('h_audit_log')}</h1>
        <button className="btn btn-secondary btn-sm" onClick={exportCsv}>
          📥 {t('export_csv')}
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="search"
          className="form-control filter-search"
          placeholder={`🔍 ${t('lbl_search')}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-control filter-select"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as AuditAction | '')}
        >
          <option value="">{t('lbl_all')} {t('lbl_action')}</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="revoked">Revoked</option>
          <option value="key_returned">Key Returned</option>
          <option value="deleted">Deleted</option>
        </select>
        {!isCoordinator && (
          <select
            className="form-control filter-select"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="">{t('lbl_all')} {t('lbl_performed_by')}</option>
            {DEMO_USERS.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="table-meta">{sorted.length} {t('lbl_action').toLowerCase()}(s)</div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('lbl_timestamp')}</th>
                <th>{t('lbl_action')}</th>
                <th>{t('lbl_record_ref')}</th>
                <th>{t('lbl_performed_by')}</th>
                <th>{t('lbl_changes')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">{t('no_data')}</td>
                </tr>
              ) : (
                sorted.map((entry) => {
                  const performedByUser = DEMO_USERS.find((u) => u.id === entry.performedBy)
                  return (
                    <tr key={entry.id}>
                      <td className="td-mono td-nowrap">
                        {new Date(entry.timestamp).toLocaleString('no-NO')}
                      </td>
                      <td>
                        <span className={`badge ${actionColor[entry.action] ?? 'badge-grey'}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="td-truncate">{entry.recordReference}</td>
                      <td>{performedByUser?.name ?? entry.performedBy}</td>
                      <td>
                        <code className="code-cell">{entry.changeDetails}</code>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
