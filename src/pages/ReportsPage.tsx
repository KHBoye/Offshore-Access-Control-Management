import React, { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { t } from '../i18n'
import type { AccessRecord } from '../types'

function isExpired(r: AccessRecord) {
  return r.status === 'active' && new Date(r.validTo) < new Date()
}

export function ReportsPage() {
  const { accessRecords, keys, assets, zones, companies, getCompanyById, getPersonnelById, getZoneById } =
    useData()
  const { isAdmin, isHseLead } = useAuth()

  if (!isAdmin && !isHseLead) {
    return (
      <div className="page">
        <div className="alert alert-danger">Access denied.</div>
      </div>
    )
  }

  const activeByAsset = useMemo(() => {
    const map: Record<string, number> = {}
    accessRecords.filter((r) => r.status === 'active').forEach((r) => {
      map[r.assetId] = (map[r.assetId] ?? 0) + 1
    })
    return assets.map((a) => ({ asset: a, count: map[a.id] ?? 0 }))
  }, [accessRecords, assets])

  const activeByCompany = useMemo(() => {
    const map: Record<string, number> = {}
    accessRecords.filter((r) => r.status === 'active').forEach((r) => {
      const person = getPersonnelById(r.personnelId)
      if (person) {
        map[person.companyId] = (map[person.companyId] ?? 0) + 1
      }
    })
    return companies
      .map((c) => ({ company: c, count: map[c.id] ?? 0 }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [accessRecords, companies, getPersonnelById])

  const keysOutstanding = useMemo(
    () => keys.filter((k) => k.status === 'issued'),
    [keys]
  )

  const complianceRisks = useMemo(
    () => accessRecords.filter(isExpired),
    [accessRecords]
  )

  const adHocOverdue = useMemo(
    () =>
      accessRecords.filter(
        (r) =>
          r.accessType === 'ad-hoc' &&
          r.status === 'active' &&
          new Date(r.validTo) < new Date()
      ),
    [accessRecords]
  )

  const activeByType = useMemo(() => {
    const active = accessRecords.filter((r) => r.status === 'active')
    return {
      permanent: active.filter((r) => r.accessType === 'permanent').length,
      'ad-hoc': active.filter((r) => r.accessType === 'ad-hoc').length,
      project: active.filter((r) => r.accessType === 'project').length,
    }
  }, [accessRecords])

  const exportCsv = (rows: string[][], filename: string) => {
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t('h_reports')}</h1>
        <span className="badge badge-blue">Cross-asset overview</span>
      </div>

      {/* Compliance risks alert */}
      {complianceRisks.length > 0 && (
        <div className="alert alert-danger">
          <strong>⚠️ Compliance Risk:</strong> {complianceRisks.length} access record(s) are marked
          <em> active</em> but past their Valid To date.
        </div>
      )}

      {/* Summary cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-value">{accessRecords.filter((r) => r.status === 'active').length}</div>
          <div className="stat-label">Total Active Access</div>
        </div>
        <div className="stat-card stat-card-teal">
          <div className="stat-value">{keysOutstanding.length}</div>
          <div className="stat-label">Keys Outstanding</div>
        </div>
        <div className={`stat-card ${complianceRisks.length > 0 ? 'stat-card-danger' : 'stat-card-grey'}`}>
          <div className="stat-value">{complianceRisks.length}</div>
          <div className="stat-label">Compliance Risks</div>
        </div>
        <div className={`stat-card ${adHocOverdue.length > 0 ? 'stat-card-warning' : 'stat-card-grey'}`}>
          <div className="stat-value">{adHocOverdue.length}</div>
          <div className="stat-label">Overdue Ad-hoc</div>
        </div>
      </div>

      <div className="reports-grid">
        {/* Active access by asset */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Active Access by Asset</h2>
            <button
              className="btn btn-xs btn-secondary"
              onClick={() => exportCsv(
                [['Asset', 'Code', 'Location', 'Active Access Count'],
                  ...activeByAsset.map((x) => [x.asset.name, x.asset.code, x.asset.location, String(x.count)])],
                'active-by-asset'
              )}
            >
              📥 CSV
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Code</th>
                <th>Location</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {activeByAsset.map(({ asset, count }) => (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td className="td-mono">{asset.code}</td>
                  <td className="td-muted">{asset.location}</td>
                  <td>
                    <div className="bar-cell">
                      <span>{count}</span>
                      <div className="mini-bar" style={{ width: `${Math.min(count * 10, 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active access by company */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Active Access by Company</h2>
          </div>
          {activeByCompany.length === 0 ? (
            <p className="table-empty">{t('no_data')}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {activeByCompany.map(({ company, count }) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>
                      <span className={`badge ${company.type === 'akerbp' ? 'badge-blue' : company.type === 'contractor' ? 'badge-purple' : 'badge-orange'}`}>
                        {t(`company_${company.type}`)}
                      </span>
                    </td>
                    <td>
                      <div className="bar-cell">
                        <span>{count}</span>
                        <div className="mini-bar" style={{ width: `${Math.min(count * 15, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Access by type */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Access by Type</h2>
          </div>
          <table className="table">
            <thead>
              <tr><th>Type</th><th>Count</th></tr>
            </thead>
            <tbody>
              {(Object.entries(activeByType) as [string, number][]).map(([type, count]) => (
                <tr key={type}>
                  <td>
                    <span className={`badge ${type === 'permanent' ? 'badge-blue' : type === 'ad-hoc' ? 'badge-orange' : 'badge-purple'}`}>
                      {type}
                    </span>
                  </td>
                  <td>
                    <div className="bar-cell">
                      <span>{count}</span>
                      <div className="mini-bar" style={{ width: `${Math.min(count * 15, 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compliance risks */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">⚠️ Compliance Risks</h2>
            <span className="badge badge-red">{complianceRisks.length}</span>
          </div>
          {complianceRisks.length === 0 ? (
            <p className="table-empty">✅ No compliance risks</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Asset</th>
                    <th>Zone</th>
                    <th>Valid To</th>
                    <th>Days Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceRisks.map((r) => {
                    const person = getPersonnelById(r.personnelId)
                    const zone = getZoneById(r.zoneId)
                    const asset = assets.find((a) => a.id === r.assetId)
                    const daysOverdue = Math.floor(
                      (new Date().getTime() - new Date(r.validTo).getTime()) / 86400000
                    )
                    return (
                      <tr key={r.id} className="row-danger">
                        <td>{person?.fullName ?? r.personnelId}</td>
                        <td>{asset?.code ?? r.assetId}</td>
                        <td>{zone?.name ?? r.zoneId}</td>
                        <td>{r.validTo}</td>
                        <td className="text-danger font-bold">+{daysOverdue}d</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Keys outstanding */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🗝️ Keys Outstanding</h2>
            <span className="badge badge-blue">{keysOutstanding.length}</span>
          </div>
          {keysOutstanding.length === 0 ? (
            <p className="table-empty">No keys currently issued</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Key ID</th>
                    <th>Zone</th>
                    <th>Asset</th>
                    <th>Current Holder</th>
                  </tr>
                </thead>
                <tbody>
                  {keysOutstanding.map((k) => {
                    const zone = getZoneById(k.zoneId)
                    const asset = assets.find((a) => a.id === k.assetId)
                    const record = accessRecords.find((r) => r.keyId === k.id && r.status === 'active')
                    const holder = record ? getPersonnelById(record.personnelId) : undefined
                    return (
                      <tr key={k.id}>
                        <td className="td-mono">{k.keyId}</td>
                        <td>{zone?.name ?? '—'}</td>
                        <td>{asset?.code ?? '—'}</td>
                        <td>{holder?.fullName ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
