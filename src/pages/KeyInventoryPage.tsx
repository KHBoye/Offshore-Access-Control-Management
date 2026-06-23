import React, { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { t } from '../i18n'
import { KeyStatusBadge } from '../components/Badges'
import { Modal } from '../components/Modal'
import type { Key, KeyStatus } from '../types'

export function KeyInventoryPage() {
  const { keys, zones, assets, companies, personnel, accessRecords, addKey, updateKey, getPersonnelById, getZoneById, getAssetById, getCompanyById } =
    useData()
  const { isAdmin, isCoordinator, user } = useAuth()

  const [assetFilter, setAssetFilter] = useState(user?.assetId ?? '')
  const [statusFilter, setStatusFilter] = useState<KeyStatus | ''>('')
  const [search, setSearch] = useState('')
  const [editKey, setEditKey] = useState<Key | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const visibleAssets = useMemo(
    () =>
      isCoordinator && user?.assetId ? assets.filter((a) => a.id === user.assetId) : assets,
    [assets, isCoordinator, user]
  )

  const filtered = useMemo(() => {
    return keys.filter((k) => {
      if (isCoordinator && user?.assetId && k.assetId !== user.assetId) return false
      if (assetFilter && k.assetId !== assetFilter) return false
      if (statusFilter && k.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const zone = getZoneById(k.zoneId)
        return (
          k.keyId.toLowerCase().includes(q) ||
          zone?.name.toLowerCase().includes(q) ||
          false
        )
      }
      return true
    })
  }, [keys, isCoordinator, user, assetFilter, statusFilter, search, getZoneById])

  const getCurrentHolder = (keyId: string) => {
    const record = accessRecords.find(
      (r) => r.keyId === keyId && r.status === 'active'
    )
    if (!record) return null
    return getPersonnelById(record.personnelId)
  }

  const exportCsv = () => {
    const header = ['Key ID', 'Zone', 'Asset', 'Status', 'Current Holder', 'Notes']
    const rows = filtered.map((k) => {
      const zone = getZoneById(k.zoneId)
      const asset = getAssetById(k.assetId)
      const holder = getCurrentHolder(k.id)
      return [k.keyId, zone?.name ?? '', asset?.code ?? '', k.status, holder?.fullName ?? '', `"${k.notes}"`].join(',')
    })
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `key-inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t('h_key_inventory')}</h1>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={exportCsv}>
            📥 {t('export_csv')}
          </button>
          {(isAdmin || isCoordinator) && (
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              + {t('lbl_add')}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid stats-grid-compact">
        {(['available', 'issued', 'lost', 'retired'] as KeyStatus[]).map((s) => {
          const count = filtered.filter((k) => k.status === s).length
          const cls =
            s === 'available' ? 'stat-card-green' :
            s === 'issued' ? 'stat-card-blue' :
            s === 'lost' ? 'stat-card-danger' : 'stat-card-grey'
          return (
            <div key={s} className={`stat-card ${cls}`}>
              <div className="stat-value">{count}</div>
              <div className="stat-label">{t(`key_${s}`)}</div>
            </div>
          )
        })}
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
            onChange={(e) => setAssetFilter(e.target.value)}
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
          onChange={(e) => setStatusFilter(e.target.value as KeyStatus | '')}
        >
          <option value="">{t('lbl_all')} {t('lbl_status')}</option>
          <option value="available">{t('key_available')}</option>
          <option value="issued">{t('key_issued')}</option>
          <option value="lost">{t('key_lost')}</option>
          <option value="retired">{t('key_retired')}</option>
        </select>
      </div>

      <div className="table-meta">{filtered.length} {t('nav_keys').toLowerCase()}</div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('lbl_key_id')}</th>
                <th>{t('lbl_zone')}</th>
                {!isCoordinator && <th>{t('lbl_asset')}</th>}
                <th>{t('lbl_status')}</th>
                <th>Current Holder</th>
                <th>{t('lbl_notes')}</th>
                {(isAdmin || isCoordinator) && <th>{t('lbl_actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">{t('no_data')}</td>
                </tr>
              ) : (
                filtered.map((k) => {
                  const zone = getZoneById(k.zoneId)
                  const asset = getAssetById(k.assetId)
                  const holder = getCurrentHolder(k.id)
                  return (
                    <tr key={k.id}>
                      <td className="td-mono td-name">{k.keyId}</td>
                      <td>{zone?.name ?? '—'}</td>
                      {!isCoordinator && <td>{asset?.code ?? '—'}</td>}
                      <td><KeyStatusBadge status={k.status} /></td>
                      <td>{holder ? holder.fullName : '—'}</td>
                      <td className="td-muted">{k.notes || '—'}</td>
                      {(isAdmin || isCoordinator) && (
                        <td>
                          <button
                            className="btn btn-xs btn-secondary"
                            onClick={() => setEditKey(k)}
                          >
                            {t('lbl_edit')}
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit key modal */}
      <Modal
        isOpen={!!editKey}
        onClose={() => setEditKey(null)}
        title={t('lbl_edit')}
      >
        {editKey && (
          <KeyForm
            initial={editKey}
            assets={visibleAssets}
            zones={zones}
            onSave={(data) => {
              updateKey({ ...editKey, ...data })
              setEditKey(null)
            }}
            onCancel={() => setEditKey(null)}
          />
        )}
      </Modal>

      {/* Add key modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title={`+ ${t('lbl_add')} ${t('nav_keys')}`}
      >
        <KeyForm
          initial={null}
          assets={visibleAssets}
          zones={zones}
          onSave={(data) => {
            addKey(data)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}

// ─── Key form ─────────────────────────────────────────────────────────────────

interface KeyFormProps {
  initial: Key | null
  assets: ReturnType<typeof useData>['assets']
  zones: ReturnType<typeof useData>['zones']
  onSave: (data: Omit<Key, 'id'>) => void
  onCancel: () => void
}

function KeyForm({ initial, assets, zones, onSave, onCancel }: KeyFormProps) {
  const { user, isCoordinator } = useAuth()
  const [form, setForm] = useState({
    keyId: initial?.keyId ?? '',
    assetId: initial?.assetId ?? (user?.assetId ?? assets[0]?.id ?? ''),
    zoneId: initial?.zoneId ?? '',
    status: initial?.status ?? ('available' as KeyStatus),
    notes: initial?.notes ?? '',
  })

  const filteredZones = zones.filter((z) => z.assetId === form.assetId)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.keyId || !form.assetId || !form.zoneId) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label required">{t('lbl_key_id')}</label>
          <input type="text" className="form-control" value={form.keyId}
            onChange={(e) => set('keyId', e.target.value)} required placeholder="e.g. IVA-K-010" />
        </div>
        <div className="form-group">
          <label className="form-label required">{t('lbl_asset')}</label>
          <select className="form-control" value={form.assetId}
            onChange={(e) => { set('assetId', e.target.value); set('zoneId', '') }}
            disabled={isCoordinator && !!user?.assetId}>
            <option value="">—</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label required">{t('lbl_zone')}</label>
          <select className="form-control" value={form.zoneId}
            onChange={(e) => set('zoneId', e.target.value)} required disabled={!form.assetId}>
            <option value="">—</option>
            {filteredZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_status')}</label>
          <select className="form-control" value={form.status}
            onChange={(e) => set('status', e.target.value as KeyStatus)}>
            <option value="available">{t('key_available')}</option>
            <option value="issued">{t('key_issued')}</option>
            <option value="lost">{t('key_lost')}</option>
            <option value="retired">{t('key_retired')}</option>
          </select>
        </div>
        <div className="form-group form-group-full">
          <label className="form-label">{t('lbl_notes')}</label>
          <textarea className="form-control" rows={2} value={form.notes}
            onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{t('lbl_save')}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('lbl_cancel')}</button>
      </div>
    </form>
  )
}
