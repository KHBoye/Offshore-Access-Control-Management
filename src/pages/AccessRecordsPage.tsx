import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { t } from '../i18n'
import { AccessStatusBadge, AccessTypeBadge } from '../components/Badges'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Modal } from '../components/Modal'
import type { AccessRecord, AccessStatus, AccessType } from '../types'

export function AccessRecordsPage() {
  const { user, isCoordinator, isAdmin } = useAuth()
  const {
    accessRecords,
    assets,
    zones,
    keys,
    companies,
    getPersonnelById,
    getZoneById,
    getAssetById,
    getKeyById,
    getCompanyById,
    revokeAccess,
    returnKey,
    getUserNameById,
  } = useData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AccessStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<AccessType | ''>('')
  const [assetFilter, setAssetFilter] = useState(user?.assetId ?? '')
  const [zoneFilter, setZoneFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')

  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)
  const [confirmReturnKey, setConfirmReturnKey] = useState<string | null>(null)
  const [detailRecord, setDetailRecord] = useState<AccessRecord | null>(null)

  const visibleAssets = useMemo(
    () => (isCoordinator && user?.assetId ? assets.filter((a) => a.id === user.assetId) : assets),
    [assets, isCoordinator, user]
  )

  const filtered = useMemo(() => {
    return accessRecords.filter((r) => {
      // Row-level security: coordinators see only their asset
      if (isCoordinator && user?.assetId && r.assetId !== user.assetId) return false

      if (assetFilter && r.assetId !== assetFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      if (typeFilter && r.accessType !== typeFilter) return false

      const person = getPersonnelById(r.personnelId)
      const zone = getZoneById(r.zoneId)
      const company = person ? getCompanyById(person.companyId) : undefined

      if (companyFilter && person?.companyId !== companyFilter) return false
      if (zoneFilter && r.zoneId !== zoneFilter) return false

      if (search) {
        const q = search.toLowerCase()
        const personMatch = person?.fullName.toLowerCase().includes(q)
        const zoneMatch = zone?.name.toLowerCase().includes(q)
        const companyMatch = company?.name.toLowerCase().includes(q)
        if (!personMatch && !zoneMatch && !companyMatch) return false
      }

      return true
    })
  }, [
    accessRecords,
    isCoordinator,
    user,
    search,
    statusFilter,
    typeFilter,
    assetFilter,
    zoneFilter,
    companyFilter,
    getPersonnelById,
    getZoneById,
    getCompanyById,
  ])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()),
    [filtered]
  )

  const visibleZones = useMemo(
    () => (assetFilter ? zones.filter((z) => z.assetId === assetFilter) : zones),
    [zones, assetFilter]
  )

  const handleRevoke = (id: string) => {
    revokeAccess(id)
    setConfirmRevoke(null)
  }

  const handleReturnKey = (id: string) => {
    returnKey(id)
    setConfirmReturnKey(null)
  }

  const exportCsv = () => {
    const header = [
      'ID', 'Person', 'Company', 'Asset', 'Zone', 'Key', 'Type', 'Valid From', 'Valid To',
      'Status', 'Issued By', 'Issue Date', 'Justification',
    ]
    const rows = sorted.map((r) => {
      const person = getPersonnelById(r.personnelId)
      const company = person ? getCompanyById(person.companyId) : undefined
      const zone = getZoneById(r.zoneId)
      const asset = getAssetById(r.assetId)
      const key = r.keyId ? getKeyById(r.keyId) : undefined
      return [
        r.id, person?.fullName ?? '', company?.name ?? '', asset?.name ?? '',
        zone?.name ?? '', key?.keyId ?? '', r.accessType, r.validFrom, r.validTo,
        r.status, getUserNameById(r.issuedBy), r.issuedDate, `"${r.justification}"`,
      ].join(',')
    })
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access-records-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t('h_access_records')}</h1>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={exportCsv}>
            📥 {t('export_csv')}
          </button>
          {(isCoordinator || isAdmin) && (
            <Link to="/access/new" className="btn btn-primary">
              + {t('act_new_access')}
            </Link>
          )}
        </div>
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
        {!isCoordinator && (
          <select
            className="form-control filter-select"
            value={assetFilter}
            onChange={(e) => { setAssetFilter(e.target.value); setZoneFilter('') }}
          >
            <option value="">{t('lbl_all')} {t('lbl_asset')}</option>
            {visibleAssets.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}
        <select
          className="form-control filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AccessStatus | '')}
        >
          <option value="">{t('lbl_all')} {t('lbl_status')}</option>
          <option value="active">{t('status_active')}</option>
          <option value="expired">{t('status_expired')}</option>
          <option value="revoked">{t('status_revoked')}</option>
          <option value="returned">{t('status_returned')}</option>
        </select>
        <select
          className="form-control filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AccessType | '')}
        >
          <option value="">{t('lbl_all')} {t('lbl_access_type')}</option>
          <option value="permanent">{t('access_permanent')}</option>
          <option value="ad-hoc">{t('access_ad_hoc')}</option>
          <option value="project">{t('access_project')}</option>
        </select>
        <select
          className="form-control filter-select"
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
        >
          <option value="">{t('lbl_all')} {t('lbl_zone')}</option>
          {visibleZones.map((z) => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </select>
        <select
          className="form-control filter-select"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">{t('lbl_all')} {t('lbl_company')}</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="table-meta">
        {sorted.length} {t('lbl_all_access').toLowerCase()}
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('lbl_personnel')}</th>
                <th>{t('lbl_company')}</th>
                <th>{t('lbl_zone')}</th>
                {!isCoordinator && <th>{t('lbl_asset')}</th>}
                <th>{t('lbl_access_type')}</th>
                <th>{t('lbl_valid_from')}</th>
                <th>{t('lbl_valid_to')}</th>
                <th>{t('lbl_key')}</th>
                <th>{t('lbl_status')}</th>
                <th>{t('lbl_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="table-empty">{t('no_data')}</td>
                </tr>
              ) : (
                sorted.map((r) => {
                  const person = getPersonnelById(r.personnelId)
                  const zone = getZoneById(r.zoneId)
                  const asset = getAssetById(r.assetId)
                  const key = r.keyId ? getKeyById(r.keyId) : undefined
                  const company = person ? getCompanyById(person.companyId) : undefined
                  const canAct = (isCoordinator && r.assetId === user?.assetId) || isAdmin
                  const isOverdue =
                    r.status === 'active' &&
                    r.accessType === 'ad-hoc' &&
                    new Date(r.validTo) < new Date()

                  return (
                    <tr
                      key={r.id}
                      className={isOverdue ? 'row-danger' : ''}
                    >
                      <td className="td-name">{person?.fullName ?? r.personnelId}</td>
                      <td className="td-muted">{company?.name ?? '—'}</td>
                      <td>{zone?.name ?? r.zoneId}</td>
                      {!isCoordinator && <td>{asset?.code ?? r.assetId}</td>}
                      <td><AccessTypeBadge type={r.accessType} /></td>
                      <td>{r.validFrom}</td>
                      <td>{r.validTo}</td>
                      <td>{key?.keyId ?? '—'}</td>
                      <td><AccessStatusBadge status={r.status} /></td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-xs btn-secondary"
                            onClick={() => setDetailRecord(r)}
                          >
                            {t('act_view')}
                          </button>
                          {canAct && r.status === 'active' && (
                            <>
                              {r.keyId && (
                                <button
                                  className="btn btn-xs btn-warning"
                                  onClick={() => setConfirmReturnKey(r.id)}
                                >
                                  {t('act_return_key')}
                                </button>
                              )}
                              <button
                                className="btn btn-xs btn-danger"
                                onClick={() => setConfirmRevoke(r.id)}
                              >
                                {t('act_revoke')}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        title={t('h_access_records')}
        maxWidth="640px"
      >
        {detailRecord && (
          <AccessRecordDetail
            record={detailRecord}
            onClose={() => setDetailRecord(null)}
            onRevoke={(id) => { setDetailRecord(null); setConfirmRevoke(id) }}
            onReturnKey={(id) => { setDetailRecord(null); setConfirmReturnKey(id) }}
          />
        )}
      </Modal>

      {/* Confirm revoke */}
      <ConfirmDialog
        isOpen={!!confirmRevoke}
        message={t('confirm_revoke')}
        onConfirm={() => confirmRevoke && handleRevoke(confirmRevoke)}
        onCancel={() => setConfirmRevoke(null)}
        confirmLabel={t('act_revoke')}
        danger
      />

      {/* Confirm return key */}
      <ConfirmDialog
        isOpen={!!confirmReturnKey}
        message={t('confirm_return_key')}
        onConfirm={() => confirmReturnKey && handleReturnKey(confirmReturnKey)}
        onCancel={() => setConfirmReturnKey(null)}
        confirmLabel={t('act_return_key')}
      />
    </div>
  )
}

// ─── Detail view ──────────────────────────────────────────────────────────────

interface DetailProps {
  record: AccessRecord
  onClose: () => void
  onRevoke: (id: string) => void
  onReturnKey: (id: string) => void
}

function AccessRecordDetail({ record, onClose, onRevoke, onReturnKey }: DetailProps) {
  const { user, isCoordinator, isAdmin } = useAuth()
  const { getPersonnelById, getZoneById, getAssetById, getKeyById, getCompanyById, getUserNameById } =
    useData()

  const person = getPersonnelById(record.personnelId)
  const zone = getZoneById(record.zoneId)
  const asset = getAssetById(record.assetId)
  const key = record.keyId ? getKeyById(record.keyId) : undefined
  const company = person ? getCompanyById(person.companyId) : undefined
  const canAct = (isCoordinator && record.assetId === user?.assetId) || isAdmin

  const rows = [
    [t('lbl_personnel'), person?.fullName ?? record.personnelId],
    [t('lbl_company'), company?.name ?? '—'],
    [t('lbl_role'), person?.role ?? '—'],
    [t('lbl_asset'), asset?.name ?? record.assetId],
    [t('lbl_zone'), zone?.name ?? record.zoneId],
    [t('lbl_key'), key?.keyId ?? '—'],
    [t('lbl_access_type'), record.accessType],
    [t('lbl_valid_from'), record.validFrom],
    [t('lbl_valid_to'), record.validTo],
    [t('lbl_status'), record.status],
    [t('lbl_issued_by'), getUserNameById(record.issuedBy)],
    [t('lbl_issued_date'), record.issuedDate],
    [t('lbl_approver'), record.approver ? getUserNameById(record.approver) : '—'],
    [t('lbl_returned_date'), record.returnedDate ?? '—'],
    [t('lbl_justification'), record.justification],
    [t('lbl_comments'), record.comments ?? '—'],
  ]

  return (
    <div>
      <table className="detail-table">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="detail-label">{label}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {canAct && record.status === 'active' && (
        <div className="form-actions" style={{ marginTop: '1rem' }}>
          {record.keyId && (
            <button className="btn btn-warning" onClick={() => onReturnKey(record.id)}>
              {t('act_return_key')}
            </button>
          )}
          <button className="btn btn-danger" onClick={() => onRevoke(record.id)}>
            {t('act_revoke')}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            {t('lbl_cancel')}
          </button>
        </div>
      )}
    </div>
  )
}
