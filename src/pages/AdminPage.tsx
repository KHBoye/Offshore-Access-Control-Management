import React, { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { t } from '../i18n'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CriticalityBadge } from '../components/Badges'
import type { Asset, Zone, ZoneType, CriticalityLevel, Company, CompanyType } from '../types'
import { clearStorage } from '../data/storage'

type AdminTab = 'assets' | 'zones' | 'companies'

export function AdminPage() {
  const { isAdmin } = useAuth()
  const {
    assets, zones, companies,
    addAsset, updateAsset,
    addZone, updateZone, deleteZone,
    addCompany, updateCompany,
  } = useData()

  const [tab, setTab] = useState<AdminTab>('assets')

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="alert alert-danger">
          Access denied. Admin role required.
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t('h_admin')}</h1>
      </div>

      <div className="tab-bar">
        {(['assets', 'zones', 'companies'] as AdminTab[]).map((tab_) => (
          <button
            key={tab_}
            className={`tab-btn ${tab === tab_ ? 'tab-btn-active' : ''}`}
            onClick={() => setTab(tab_)}
          >
            {tab_ === 'assets' ? t('h_assets') : tab_ === 'zones' ? t('h_zones') : t('h_companies')}
          </button>
        ))}
      </div>

      {tab === 'assets' && (
        <AssetsTab assets={assets} onAdd={addAsset} onUpdate={updateAsset} />
      )}
      {tab === 'zones' && (
        <ZonesTab zones={zones} assets={assets} onAdd={addZone} onUpdate={updateZone} onDelete={deleteZone} />
      )}
      {tab === 'companies' && (
        <CompaniesTab companies={companies} onAdd={addCompany} onUpdate={updateCompany} />
      )}

      <div className="danger-zone">
        <h3>🗑️ Reset Demo Data</h3>
        <p className="text-muted">Clears all localStorage and reloads the demo data.</p>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm('Reset all data to demo state? This cannot be undone.')) {
              clearStorage()
              window.location.reload()
            }
          }}
        >
          Reset to Demo Data
        </button>
      </div>
    </div>
  )
}

// ─── Assets tab ───────────────────────────────────────────────────────────────

function AssetsTab({
  assets,
  onAdd,
  onUpdate,
}: {
  assets: Asset[]
  onAdd: (a: Omit<Asset, 'id'>) => void
  onUpdate: (a: Asset) => void
}) {
  const [edit, setEdit] = useState<Asset | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="section-header">
        <h2>{t('h_assets')}</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ {t('lbl_add')}</button>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>{t('lbl_name')}</th>
              <th>{t('lbl_code')}</th>
              <th>{t('lbl_location')}</th>
              <th>{t('lbl_active')}</th>
              <th>{t('lbl_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td className="td-mono">{a.code}</td>
                <td className="td-muted">{a.location}</td>
                <td>
                  <span className={a.active ? 'badge badge-green' : 'badge badge-grey'}>
                    {a.active ? t('lbl_active') : t('lbl_inactive')}
                  </span>
                </td>
                <td>
                  <button className="btn btn-xs btn-secondary" onClick={() => setEdit(a)}>
                    {t('lbl_edit')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={!!edit} onClose={() => setEdit(null)} title={t('lbl_edit')}>
        {edit && (
          <AssetForm
            initial={edit}
            onSave={(d) => { onUpdate({ ...edit, ...d }); setEdit(null) }}
            onCancel={() => setEdit(null)}
          />
        )}
      </Modal>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={`+ ${t('h_assets')}`}>
        <AssetForm
          initial={null}
          onSave={(d) => { onAdd(d); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}

function AssetForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Asset | null
  onSave: (d: Omit<Asset, 'id'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    code: initial?.code ?? '',
    location: initial?.location ?? '',
    active: initial?.active ?? true,
  })
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.code) return
    onSave(form)
  }
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div className="form-group form-group-full">
          <label className="form-label required">{t('lbl_name')}</label>
          <input type="text" className="form-control" value={form.name}
            onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label required">{t('lbl_code')}</label>
          <input type="text" className="form-control" value={form.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())} required maxLength={6} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_location')}</label>
          <input type="text" className="form-control" value={form.location}
            onChange={(e) => set('location', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_active')}</label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.active}
              onChange={(e) => set('active', e.target.checked)} />
            {form.active ? t('lbl_active') : t('lbl_inactive')}
          </label>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{t('lbl_save')}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('lbl_cancel')}</button>
      </div>
    </form>
  )
}

// ─── Zones tab ────────────────────────────────────────────────────────────────

function ZonesTab({
  zones,
  assets,
  onAdd,
  onUpdate,
  onDelete,
}: {
  zones: Zone[]
  assets: Asset[]
  onAdd: (z: Omit<Zone, 'id'>) => void
  onUpdate: (z: Zone) => void
  onDelete: (id: string) => void
}) {
  const [assetFilter, setAssetFilter] = useState('')
  const [edit, setEdit] = useState<Zone | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = useMemo(
    () => (assetFilter ? zones.filter((z) => z.assetId === assetFilter) : zones),
    [zones, assetFilter]
  )

  const getAssetName = (id: string) => assets.find((a) => a.id === id)?.name ?? id

  return (
    <div>
      <div className="section-header">
        <h2>{t('h_zones')}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="form-control filter-select" value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}>
            <option value="">{t('lbl_all')} {t('lbl_asset')}</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ {t('lbl_add')}</button>
        </div>
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('lbl_name')}</th>
                <th>{t('lbl_type')}</th>
                <th>{t('lbl_asset')}</th>
                <th>{t('lbl_criticality')}</th>
                <th>{t('lbl_description')}</th>
                <th>{t('lbl_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((z) => (
                <tr key={z.id}>
                  <td>{z.name}</td>
                  <td><span className="badge badge-grey">{z.type}</span></td>
                  <td>{getAssetName(z.assetId)}</td>
                  <td><CriticalityBadge level={z.criticalityLevel} /></td>
                  <td className="td-muted td-truncate">{z.description}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-xs btn-secondary" onClick={() => setEdit(z)}>
                        {t('lbl_edit')}
                      </button>
                      <button className="btn btn-xs btn-danger" onClick={() => setConfirmDelete(z.id)}>
                        {t('lbl_delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={!!edit} onClose={() => setEdit(null)} title={t('lbl_edit')}>
        {edit && (
          <ZoneForm initial={edit} assets={assets}
            onSave={(d) => { onUpdate({ ...edit, ...d }); setEdit(null) }}
            onCancel={() => setEdit(null)} />
        )}
      </Modal>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={`+ ${t('h_zones')}`}>
        <ZoneForm initial={null} assets={assets}
          onSave={(d) => { onAdd(d); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)} />
      </Modal>
      <ConfirmDialog
        isOpen={!!confirmDelete}
        message={t('confirm_delete')}
        onConfirm={() => { confirmDelete && onDelete(confirmDelete); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel={t('lbl_delete')}
        danger
      />
    </div>
  )
}

function ZoneForm({
  initial,
  assets,
  onSave,
  onCancel,
}: {
  initial: Zone | null
  assets: Asset[]
  onSave: (d: Omit<Zone, 'id'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    assetId: initial?.assetId ?? assets[0]?.id ?? '',
    type: initial?.type ?? ('zone' as ZoneType),
    description: initial?.description ?? '',
    criticalityLevel: initial?.criticalityLevel ?? ('medium' as CriticalityLevel),
  })
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.assetId) return
    onSave(form)
  }
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div className="form-group form-group-full">
          <label className="form-label required">{t('lbl_name')}</label>
          <input type="text" className="form-control" value={form.name}
            onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label required">{t('lbl_asset')}</label>
          <select className="form-control" value={form.assetId}
            onChange={(e) => set('assetId', e.target.value)} required>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_type')}</label>
          <select className="form-control" value={form.type}
            onChange={(e) => set('type', e.target.value as ZoneType)}>
            {(['zone', 'door', 'cabinet', 'equipment'] as ZoneType[]).map((t_) => (
              <option key={t_} value={t_}>{t_}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_criticality')}</label>
          <select className="form-control" value={form.criticalityLevel}
            onChange={(e) => set('criticalityLevel', e.target.value as CriticalityLevel)}>
            {(['low', 'medium', 'high', 'critical'] as CriticalityLevel[]).map((c) => (
              <option key={c} value={c}>{t(`crit_${c}`)}</option>
            ))}
          </select>
        </div>
        <div className="form-group form-group-full">
          <label className="form-label">{t('lbl_description')}</label>
          <textarea className="form-control" rows={2} value={form.description}
            onChange={(e) => set('description', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{t('lbl_save')}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('lbl_cancel')}</button>
      </div>
    </form>
  )
}

// ─── Companies tab ────────────────────────────────────────────────────────────

function CompaniesTab({
  companies,
  onAdd,
  onUpdate,
}: {
  companies: Company[]
  onAdd: (c: Omit<Company, 'id'>) => void
  onUpdate: (c: Company) => void
}) {
  const [edit, setEdit] = useState<Company | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="section-header">
        <h2>{t('h_companies')}</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ {t('lbl_add')}</button>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>{t('lbl_name')}</th>
              <th>{t('lbl_type')}</th>
              <th>{t('lbl_contact')}</th>
              <th>{t('lbl_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>
                  <span className={`badge ${c.type === 'akerbp' ? 'badge-blue' : c.type === 'contractor' ? 'badge-purple' : 'badge-orange'}`}>
                    {t(`company_${c.type}`)}
                  </span>
                </td>
                <td>{c.contact}</td>
                <td>
                  <button className="btn btn-xs btn-secondary" onClick={() => setEdit(c)}>
                    {t('lbl_edit')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={!!edit} onClose={() => setEdit(null)} title={t('lbl_edit')}>
        {edit && (
          <CompanyForm initial={edit}
            onSave={(d) => { onUpdate({ ...edit, ...d }); setEdit(null) }}
            onCancel={() => setEdit(null)} />
        )}
      </Modal>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={`+ ${t('h_companies')}`}>
        <CompanyForm initial={null}
          onSave={(d) => { onAdd(d); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)} />
      </Modal>
    </div>
  )
}

function CompanyForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Company | null
  onSave: (d: Omit<Company, 'id'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? ('contractor' as CompanyType),
    contact: initial?.contact ?? '',
  })
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    onSave(form)
  }
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div className="form-group form-group-full">
          <label className="form-label required">{t('lbl_name')}</label>
          <input type="text" className="form-control" value={form.name}
            onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_type')}</label>
          <select className="form-control" value={form.type}
            onChange={(e) => set('type', e.target.value as CompanyType)}>
            <option value="akerbp">{t('company_akerbp')}</option>
            <option value="contractor">{t('company_contractor')}</option>
            <option value="service">{t('company_service')}</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_contact')}</label>
          <input type="text" className="form-control" value={form.contact}
            onChange={(e) => set('contact', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{t('lbl_save')}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('lbl_cancel')}</button>
      </div>
    </form>
  )
}
