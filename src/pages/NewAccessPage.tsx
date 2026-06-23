import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { t } from '../i18n'
import type { AccessType, Personnel } from '../types'
import { Modal } from '../components/Modal'

interface FormState {
  personnelId: string
  assetId: string
  zoneId: string
  keyId: string
  accessType: AccessType
  validFrom: string
  validTo: string
  justification: string
  comments: string
  approver: string
}

const today = new Date().toISOString().split('T')[0]

function defaultForm(assetId: string): FormState {
  return {
    personnelId: '',
    assetId,
    zoneId: '',
    keyId: '',
    accessType: 'ad-hoc',
    validFrom: today,
    validTo: today,
    justification: '',
    comments: '',
    approver: '',
  }
}

export function NewAccessPage() {
  const { user, isAdmin } = useAuth()
  const { assets, zones, keys, personnel, companies, addAccessRecord, addPersonnel, getCompanyById } =
    useData()
  const navigate = useNavigate()

  const defaultAsset = user?.assetId ?? assets[0]?.id ?? ''
  const [form, setForm] = useState<FormState>(defaultForm(defaultAsset))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [showNewPerson, setShowNewPerson] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const visibleAssets = useMemo(
    () =>
      user?.assetId && !isAdmin ? assets.filter((a) => a.id === user.assetId) : assets,
    [assets, user, isAdmin]
  )

  const filteredZones = useMemo(
    () => zones.filter((z) => z.assetId === form.assetId),
    [zones, form.assetId]
  )

  const availableKeys = useMemo(
    () =>
      keys.filter(
        (k) =>
          k.assetId === form.assetId &&
          k.zoneId === form.zoneId &&
          k.status === 'available'
      ),
    [keys, form.assetId, form.zoneId]
  )

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.personnelId) e.personnelId = t('required_field')
    if (!form.assetId) e.assetId = t('required_field')
    if (!form.zoneId) e.zoneId = t('required_field')
    if (!form.validFrom) e.validFrom = t('required_field')
    if (!form.validTo) e.validTo = t('required_field')
    if (!form.justification.trim()) e.justification = t('required_field')
    if (form.validTo < form.validFrom) e.validTo = 'Valid To must be after Valid From'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    addAccessRecord({
      personnelId: form.personnelId,
      assetId: form.assetId,
      zoneId: form.zoneId,
      keyId: form.keyId || undefined,
      accessType: form.accessType,
      validFrom: form.validFrom,
      validTo: form.validTo,
      status: 'active',
      issuedBy: user?.id ?? 'unknown',
      issuedDate: today,
      approver: form.approver || undefined,
      justification: form.justification,
      comments: form.comments || undefined,
    })

    setSubmitted(true)
    setTimeout(() => {
      navigate('/access')
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="success-banner">
          <span className="success-icon">✅</span>
          <h2>{t('success_saved')}</h2>
          <p>Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t('h_register_access')}</h1>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Asset */}
            <div className="form-group">
              <label className="form-label required">{t('lbl_asset')}</label>
              <select
                className={`form-control ${errors.assetId ? 'is-invalid' : ''}`}
                value={form.assetId}
                onChange={(e) => {
                  set('assetId', e.target.value)
                  set('zoneId', '')
                  set('keyId', '')
                }}
                disabled={!isAdmin && !!user?.assetId}
              >
                <option value="">— {t('lbl_asset')} —</option>
                {visibleAssets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                ))}
              </select>
              {errors.assetId && <div className="field-error">{errors.assetId}</div>}
            </div>

            {/* Zone */}
            <div className="form-group">
              <label className="form-label required">{t('lbl_zone')}</label>
              <select
                className={`form-control ${errors.zoneId ? 'is-invalid' : ''}`}
                value={form.zoneId}
                onChange={(e) => { set('zoneId', e.target.value); set('keyId', '') }}
                disabled={!form.assetId}
              >
                <option value="">— {t('lbl_zone')} —</option>
                {filteredZones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name} ({z.type})</option>
                ))}
              </select>
              {errors.zoneId && <div className="field-error">{errors.zoneId}</div>}
            </div>

            {/* Personnel */}
            <div className="form-group">
              <label className="form-label required">{t('lbl_personnel')}</label>
              <div className="input-with-button">
                <select
                  className={`form-control ${errors.personnelId ? 'is-invalid' : ''}`}
                  value={form.personnelId}
                  onChange={(e) => set('personnelId', e.target.value)}
                >
                  <option value="">— {t('lbl_personnel')} —</option>
                  {personnel.filter((p) => p.active).map((p) => {
                    const company = getCompanyById(p.companyId)
                    return (
                      <option key={p.id} value={p.id}>
                        {p.fullName} — {company?.name ?? p.companyId}
                      </option>
                    )
                  })}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNewPerson(true)}
                  title="Add new person"
                >
                  + {t('lbl_add')}
                </button>
              </div>
              {errors.personnelId && <div className="field-error">{errors.personnelId}</div>}
            </div>

            {/* Key (optional) */}
            <div className="form-group">
              <label className="form-label">{t('lbl_key')} (optional)</label>
              <select
                className="form-control"
                value={form.keyId}
                onChange={(e) => set('keyId', e.target.value)}
                disabled={!form.zoneId}
              >
                <option value="">— {t('lbl_all')} / {t('key_available')} —</option>
                {availableKeys.map((k) => (
                  <option key={k.id} value={k.id}>{k.keyId}</option>
                ))}
              </select>
            </div>

            {/* Access Type */}
            <div className="form-group">
              <label className="form-label required">{t('lbl_access_type')}</label>
              <select
                className="form-control"
                value={form.accessType}
                onChange={(e) => set('accessType', e.target.value as AccessType)}
              >
                <option value="permanent">{t('access_permanent')}</option>
                <option value="ad-hoc">{t('access_ad_hoc')}</option>
                <option value="project">{t('access_project')}</option>
              </select>
            </div>

            {/* Approver (for ad-hoc) */}
            {form.accessType === 'ad-hoc' && (
              <div className="form-group">
                <label className="form-label">{t('lbl_approver')}</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.approver}
                  onChange={(e) => set('approver', e.target.value)}
                  placeholder="Name of approver"
                />
              </div>
            )}

            {/* Valid From */}
            <div className="form-group">
              <label className="form-label required">{t('lbl_valid_from')}</label>
              <input
                type="date"
                className={`form-control ${errors.validFrom ? 'is-invalid' : ''}`}
                value={form.validFrom}
                onChange={(e) => set('validFrom', e.target.value)}
              />
              {errors.validFrom && <div className="field-error">{errors.validFrom}</div>}
            </div>

            {/* Valid To */}
            <div className="form-group">
              <label className="form-label required">{t('lbl_valid_to')}</label>
              <input
                type="date"
                className={`form-control ${errors.validTo ? 'is-invalid' : ''}`}
                value={form.validTo}
                min={form.validFrom}
                onChange={(e) => set('validTo', e.target.value)}
              />
              {errors.validTo && <div className="field-error">{errors.validTo}</div>}
            </div>

            {/* Justification */}
            <div className="form-group form-group-full">
              <label className="form-label required">{t('lbl_justification')}</label>
              <textarea
                className={`form-control ${errors.justification ? 'is-invalid' : ''}`}
                rows={3}
                value={form.justification}
                onChange={(e) => set('justification', e.target.value)}
                placeholder="Describe the reason for granting access..."
              />
              {errors.justification && <div className="field-error">{errors.justification}</div>}
            </div>

            {/* Comments */}
            <div className="form-group form-group-full">
              <label className="form-label">{t('lbl_comments')}</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.comments}
                onChange={(e) => set('comments', e.target.value)}
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              ✅ {t('lbl_save')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/access')}
            >
              {t('lbl_cancel')}
            </button>
          </div>
        </form>
      </div>

      {/* New Personnel Modal */}
      <Modal
        isOpen={showNewPerson}
        onClose={() => setShowNewPerson(false)}
        title={`+ ${t('lbl_add')} ${t('lbl_personnel')}`}
        maxWidth="540px"
      >
        <NewPersonnelForm
          companies={companies.map((c) => ({ value: c.id, label: c.name }))}
          onSave={(p) => {
            addPersonnel(p)
            setShowNewPerson(false)
          }}
          onCancel={() => setShowNewPerson(false)}
        />
      </Modal>
    </div>
  )
}

// ─── Inline New Personnel Form ────────────────────────────────────────────────

interface NPFProps {
  companies: { value: string; label: string }[]
  onSave: (p: Omit<Personnel, 'id'>) => void
  onCancel: () => void
}

function NewPersonnelForm({ companies, onSave, onCancel }: NPFProps) {
  const [form, setForm] = useState({
    fullName: '',
    companyId: '',
    role: '',
    email: '',
    phone: '',
    idNumber: '',
    active: true,
  })

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.companyId) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSave}>
      <div className="form-grid">
        <div className="form-group form-group-full">
          <label className="form-label required">{t('lbl_name')}</label>
          <input
            type="text"
            className="form-control"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label required">{t('lbl_company')}</label>
          <select
            className="form-control"
            value={form.companyId}
            onChange={(e) => set('companyId', e.target.value)}
            required
          >
            <option value="">—</option>
            {companies.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_role')}</label>
          <input
            type="text"
            className="form-control"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_email')}</label>
          <input
            type="email"
            className="form-control"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_phone')}</label>
          <input
            type="tel"
            className="form-control"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('lbl_id_number')}</label>
          <input
            type="text"
            className="form-control"
            value={form.idNumber}
            onChange={(e) => set('idNumber', e.target.value)}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{t('lbl_save')}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('lbl_cancel')}</button>
      </div>
    </form>
  )
}
