import React, { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { t } from '../i18n'
import { Modal } from '../components/Modal'
import { AccessStatusBadge, AccessTypeBadge } from '../components/Badges'
import type { Personnel } from '../types'

export function PersonnelPage() {
  const { accessRecords, companies, getCompanyById, addPersonnel, updatePersonnel, getZoneById, getAssetById } =
    useData()
  const { isAdmin, isCoordinator, user } = useAuth()

  const { personnel } = useData()

  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null)
  const [editPerson, setEditPerson] = useState<Personnel | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    return personnel.filter((p) => {
      if (companyFilter && p.companyId !== companyFilter) return false
      if (activeFilter === 'active' && !p.active) return false
      if (activeFilter === 'inactive' && p.active) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.fullName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.idNumber.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [personnel, search, companyFilter, activeFilter])

  const getPersonAccessHistory = (personId: string) =>
    accessRecords
      .filter((r) => r.personnelId === personId)
      .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t('h_personnel')}</h1>
        {(isAdmin || isCoordinator) && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + {t('lbl_add')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="search"
          className="form-control filter-search"
          placeholder={`🔍 ${t('lbl_search')} (name, email, ID)...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        <select
          className="form-control filter-select"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
        >
          <option value="all">{t('lbl_all')}</option>
          <option value="active">{t('lbl_active')}</option>
          <option value="inactive">{t('lbl_inactive')}</option>
        </select>
      </div>

      <div className="table-meta">{filtered.length} {t('nav_personnel').toLowerCase()}</div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('lbl_name')}</th>
                <th>{t('lbl_company')}</th>
                <th>{t('lbl_role')}</th>
                <th>{t('lbl_email')}</th>
                <th>{t('lbl_id_number')}</th>
                <th>{t('lbl_status')}</th>
                <th>{t('lbl_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">{t('no_data')}</td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const company = getCompanyById(p.companyId)
                  const activeAccess = getPersonAccessHistory(p.id).filter(
                    (r) => r.status === 'active'
                  ).length
                  return (
                    <tr key={p.id}>
                      <td className="td-name">{p.fullName}</td>
                      <td className="td-muted">{company?.name ?? '—'}</td>
                      <td>{p.role || '—'}</td>
                      <td>{p.email || '—'}</td>
                      <td className="td-mono">{p.idNumber || '—'}</td>
                      <td>
                        <span className={p.active ? 'badge badge-green' : 'badge badge-grey'}>
                          {p.active ? t('lbl_active') : t('lbl_inactive')}
                        </span>
                        {activeAccess > 0 && (
                          <span className="badge badge-blue" style={{ marginLeft: '4px' }}>
                            {activeAccess} access
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-xs btn-secondary"
                            onClick={() => setSelectedPerson(p)}
                          >
                            {t('lbl_history')}
                          </button>
                          {(isAdmin || isCoordinator) && (
                            <button
                              className="btn btn-xs btn-secondary"
                              onClick={() => setEditPerson(p)}
                            >
                              {t('lbl_edit')}
                            </button>
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

      {/* Access history modal */}
      <Modal
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        title={selectedPerson ? `${selectedPerson.fullName} — ${t('lbl_history')}` : ''}
        maxWidth="800px"
      >
        {selectedPerson && (
          <PersonAccessHistory
            person={selectedPerson}
            records={getPersonAccessHistory(selectedPerson.id)}
            getZoneById={getZoneById}
            getAssetById={getAssetById}
          />
        )}
      </Modal>

      {/* Edit personnel modal */}
      <Modal
        isOpen={!!editPerson}
        onClose={() => setEditPerson(null)}
        title={t('lbl_edit')}
      >
        {editPerson && (
          <PersonnelForm
            initial={editPerson}
            companies={companies.map((c) => ({ value: c.id, label: c.name }))}
            onSave={(data) => {
              updatePersonnel({ ...editPerson, ...data })
              setEditPerson(null)
            }}
            onCancel={() => setEditPerson(null)}
          />
        )}
      </Modal>

      {/* Add personnel modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title={`+ ${t('lbl_add')} ${t('lbl_personnel')}`}
      >
        <PersonnelForm
          initial={null}
          companies={companies.map((c) => ({ value: c.id, label: c.name }))}
          onSave={(data) => {
            addPersonnel(data)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}

// ─── Access history sub-component ─────────────────────────────────────────────

function PersonAccessHistory({
  person,
  records,
  getZoneById,
  getAssetById,
}: {
  person: Personnel
  records: ReturnType<typeof useData>['accessRecords']
  getZoneById: ReturnType<typeof useData>['getZoneById']
  getAssetById: ReturnType<typeof useData>['getAssetById']
}) {
  return (
    <div>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>
        {records.length} {t('lbl_history').toLowerCase()} record(s) found
      </p>
      {records.length === 0 ? (
        <p>{t('no_data')}</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('lbl_asset')}</th>
                <th>{t('lbl_zone')}</th>
                <th>{t('lbl_access_type')}</th>
                <th>{t('lbl_valid_from')}</th>
                <th>{t('lbl_valid_to')}</th>
                <th>{t('lbl_status')}</th>
                <th>{t('lbl_justification')}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const zone = getZoneById(r.zoneId)
                const asset = getAssetById(r.assetId)
                return (
                  <tr key={r.id}>
                    <td>{asset?.code ?? r.assetId}</td>
                    <td>{zone?.name ?? r.zoneId}</td>
                    <td><AccessTypeBadge type={r.accessType} /></td>
                    <td>{r.validFrom}</td>
                    <td>{r.validTo}</td>
                    <td><AccessStatusBadge status={r.status} /></td>
                    <td className="td-truncate">{r.justification}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Personnel form ───────────────────────────────────────────────────────────

interface PersonnelFormProps {
  initial: Personnel | null
  companies: { value: string; label: string }[]
  onSave: (data: Omit<Personnel, 'id'>) => void
  onCancel: () => void
}

function PersonnelForm({ initial, companies, onSave, onCancel }: PersonnelFormProps) {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? '',
    companyId: initial?.companyId ?? '',
    role: initial?.role ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    idNumber: initial?.idNumber ?? '',
    active: initial?.active ?? true,
  })

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.companyId) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group form-group-full">
          <label className="form-label required">{t('lbl_name')}</label>
          <input type="text" className="form-control" value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label required">{t('lbl_company')}</label>
          <select className="form-control" value={form.companyId}
            onChange={(e) => set('companyId', e.target.value)} required>
            <option value="">—</option>
            {companies.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_role')}</label>
          <input type="text" className="form-control" value={form.role}
            onChange={(e) => set('role', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_email')}</label>
          <input type="email" className="form-control" value={form.email}
            onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_phone')}</label>
          <input type="tel" className="form-control" value={form.phone}
            onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_id_number')}</label>
          <input type="text" className="form-control" value={form.idNumber}
            onChange={(e) => set('idNumber', e.target.value)} />
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
