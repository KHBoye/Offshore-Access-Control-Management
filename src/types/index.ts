// ─── Core Domain Types ───────────────────────────────────────────────────────

export type AssetStatus = 'active' | 'inactive'

export interface Asset {
  id: string
  name: string
  code: string
  location: string
  active: boolean
}

// ─── Zone / Cabinet / Door / Equipment ───────────────────────────────────────

export type ZoneType = 'zone' | 'door' | 'cabinet' | 'equipment'
export type CriticalityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Zone {
  id: string
  assetId: string
  name: string
  type: ZoneType
  description: string
  criticalityLevel: CriticalityLevel
}

// ─── Physical Keys ────────────────────────────────────────────────────────────

export type KeyStatus = 'available' | 'issued' | 'lost' | 'retired'

export interface Key {
  id: string
  keyId: string          // human-readable key label (e.g. "K-001")
  zoneId: string
  assetId: string
  status: KeyStatus
  notes: string
}

// ─── Companies ────────────────────────────────────────────────────────────────

export type CompanyType = 'akerbp' | 'contractor' | 'service'

export interface Company {
  id: string
  name: string
  type: CompanyType
  contact: string
}

// ─── Personnel ────────────────────────────────────────────────────────────────

export interface Personnel {
  id: string
  fullName: string
  companyId: string
  role: string
  email: string
  phone: string
  idNumber: string
  active: boolean
}

// ─── Access Records ───────────────────────────────────────────────────────────

export type AccessType = 'permanent' | 'ad-hoc' | 'project'
export type AccessStatus = 'active' | 'expired' | 'revoked' | 'returned'

export interface AccessRecord {
  id: string
  personnelId: string
  assetId: string
  zoneId: string
  keyId?: string
  accessType: AccessType
  validFrom: string      // ISO date string
  validTo: string        // ISO date string
  status: AccessStatus
  issuedBy: string       // userId of the coordinator who created it
  issuedDate: string     // ISO date string
  returnedDate?: string
  approver?: string
  justification: string
  comments?: string
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export type AuditAction = 'created' | 'updated' | 'revoked' | 'key_returned' | 'deleted'

export interface AuditLogEntry {
  id: string
  timestamp: string       // ISO date-time string
  action: AuditAction
  recordReference: string // human-readable description or ID
  recordId: string
  performedBy: string     // userId
  changeDetails: string   // JSON or human-readable diff
}

// ─── Users / Authentication ───────────────────────────────────────────────────

export type UserRole = 'coordinator' | 'hse_lead' | 'admin'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  assetId?: string        // coordinators are bound to a single asset
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
}

export interface DashboardStats {
  activeAccessCount: number
  keysIssued: number
  expiringWithin7Days: number
  overdueAdHoc: number
}
