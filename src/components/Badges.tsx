import React from 'react'
import type { AccessStatus, KeyStatus, CriticalityLevel, AccessType } from '../types'
import { t } from '../i18n'

// ─── Access status badge ──────────────────────────────────────────────────────

interface AccessStatusBadgeProps {
  status: AccessStatus
}

export function AccessStatusBadge({ status }: AccessStatusBadgeProps) {
  const map: Record<AccessStatus, { cls: string; label: string }> = {
    active: { cls: 'badge badge-green', label: t('status_active') },
    expired: { cls: 'badge badge-yellow', label: t('status_expired') },
    revoked: { cls: 'badge badge-red', label: t('status_revoked') },
    returned: { cls: 'badge badge-grey', label: t('status_returned') },
  }
  const { cls, label } = map[status]
  return <span className={cls}>{label}</span>
}

// ─── Key status badge ─────────────────────────────────────────────────────────

interface KeyStatusBadgeProps {
  status: KeyStatus
}

export function KeyStatusBadge({ status }: KeyStatusBadgeProps) {
  const map: Record<KeyStatus, { cls: string; label: string }> = {
    available: { cls: 'badge badge-green', label: t('key_available') },
    issued: { cls: 'badge badge-blue', label: t('key_issued') },
    lost: { cls: 'badge badge-red', label: t('key_lost') },
    retired: { cls: 'badge badge-grey', label: t('key_retired') },
  }
  const { cls, label } = map[status]
  return <span className={cls}>{label}</span>
}

// ─── Criticality badge ────────────────────────────────────────────────────────

interface CriticalityBadgeProps {
  level: CriticalityLevel
}

export function CriticalityBadge({ level }: CriticalityBadgeProps) {
  const map: Record<CriticalityLevel, { cls: string; label: string }> = {
    low: { cls: 'badge badge-grey', label: t('crit_low') },
    medium: { cls: 'badge badge-yellow', label: t('crit_medium') },
    high: { cls: 'badge badge-orange', label: t('crit_high') },
    critical: { cls: 'badge badge-red', label: t('crit_critical') },
  }
  const { cls, label } = map[level]
  return <span className={cls}>{label}</span>
}

// ─── Access type badge ────────────────────────────────────────────────────────

interface AccessTypeBadgeProps {
  type: AccessType
}

export function AccessTypeBadge({ type }: AccessTypeBadgeProps) {
  const map: Record<AccessType, { cls: string; label: string }> = {
    permanent: { cls: 'badge badge-blue', label: t('access_permanent') },
    'ad-hoc': { cls: 'badge badge-orange', label: t('access_ad_hoc') },
    project: { cls: 'badge badge-purple', label: t('access_project') },
  }
  const { cls, label } = map[type]
  return <span className={cls}>{label}</span>
}
