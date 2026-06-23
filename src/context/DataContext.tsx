import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  Asset,
  Zone,
  Key,
  Company,
  Personnel,
  AccessRecord,
  AuditLogEntry,
  AuditAction,
} from '../types'
import {
  DEMO_USERS,
  INITIAL_ASSETS,
  INITIAL_ZONES,
  INITIAL_KEYS,
  INITIAL_COMPANIES,
  INITIAL_PERSONNEL,
  INITIAL_ACCESS_RECORDS,
  INITIAL_AUDIT_LOG,
} from '../data/mockData'
import { loadFromStorage, saveToStorage } from '../data/storage'
import { useAuth } from './AuthContext'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function load<T>(key: string, fallback: T): T {
  return loadFromStorage<T>(key, fallback)
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface DataContextValue {
  // Data
  assets: Asset[]
  zones: Zone[]
  keys: Key[]
  companies: Company[]
  personnel: Personnel[]
  accessRecords: AccessRecord[]
  auditLog: AuditLogEntry[]

  // Asset CRUD
  addAsset: (a: Omit<Asset, 'id'>) => void
  updateAsset: (a: Asset) => void

  // Zone CRUD
  addZone: (z: Omit<Zone, 'id'>) => void
  updateZone: (z: Zone) => void
  deleteZone: (id: string) => void

  // Key CRUD
  addKey: (k: Omit<Key, 'id'>) => void
  updateKey: (k: Key) => void

  // Company CRUD
  addCompany: (c: Omit<Company, 'id'>) => void
  updateCompany: (c: Company) => void

  // Personnel CRUD
  addPersonnel: (p: Omit<Personnel, 'id'>) => void
  updatePersonnel: (p: Personnel) => void

  // Access Record operations
  addAccessRecord: (r: Omit<AccessRecord, 'id'>) => AccessRecord
  updateAccessRecord: (r: AccessRecord) => void
  revokeAccess: (id: string) => void
  returnKey: (accessRecordId: string) => void

  // Helpers
  getPersonnelById: (id: string) => Personnel | undefined
  getAssetById: (id: string) => Asset | undefined
  getZoneById: (id: string) => Zone | undefined
  getKeyById: (id: string) => Key | undefined
  getCompanyById: (id: string) => Company | undefined
  getUserNameById: (id: string) => string
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [assets, setAssets] = useState<Asset[]>(() => load('assets', INITIAL_ASSETS))
  const [zones, setZones] = useState<Zone[]>(() => load('zones', INITIAL_ZONES))
  const [keys, setKeys] = useState<Key[]>(() => load('keys', INITIAL_KEYS))
  const [companies, setCompanies] = useState<Company[]>(() => load('companies', INITIAL_COMPANIES))
  const [personnel, setPersonnel] = useState<Personnel[]>(() => load('personnel', INITIAL_PERSONNEL))
  const [accessRecords, setAccessRecords] = useState<AccessRecord[]>(() =>
    load('access_records', INITIAL_ACCESS_RECORDS)
  )
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() =>
    load('audit_log', INITIAL_AUDIT_LOG)
  )

  // ── Audit helper ──────────────────────────────────────────────────────────

  const appendAudit = useCallback(
    (
      action: AuditAction,
      recordId: string,
      recordReference: string,
      changeDetails: string
    ) => {
      const entry: AuditLogEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        action,
        recordReference,
        recordId,
        performedBy: user?.id ?? 'system',
        changeDetails,
      }
      setAuditLog((prev) => {
        const next = [entry, ...prev]
        saveToStorage('audit_log', next)
        return next
      })
    },
    [user]
  )

  // ── Asset ─────────────────────────────────────────────────────────────────

  const addAsset = useCallback(
    (a: Omit<Asset, 'id'>) => {
      const next: Asset = { ...a, id: generateId() }
      setAssets((prev) => {
        const arr = [...prev, next]
        saveToStorage('assets', arr)
        return arr
      })
      appendAudit('created', next.id, `Asset: ${next.name}`, JSON.stringify(next))
    },
    [appendAudit]
  )

  const updateAsset = useCallback(
    (a: Asset) => {
      setAssets((prev) => {
        const arr = prev.map((x) => (x.id === a.id ? a : x))
        saveToStorage('assets', arr)
        return arr
      })
      appendAudit('updated', a.id, `Asset: ${a.name}`, JSON.stringify(a))
    },
    [appendAudit]
  )

  // ── Zone ──────────────────────────────────────────────────────────────────

  const addZone = useCallback(
    (z: Omit<Zone, 'id'>) => {
      const next: Zone = { ...z, id: generateId() }
      setZones((prev) => {
        const arr = [...prev, next]
        saveToStorage('zones', arr)
        return arr
      })
      appendAudit('created', next.id, `Zone: ${next.name}`, JSON.stringify(next))
    },
    [appendAudit]
  )

  const updateZone = useCallback(
    (z: Zone) => {
      setZones((prev) => {
        const arr = prev.map((x) => (x.id === z.id ? z : x))
        saveToStorage('zones', arr)
        return arr
      })
      appendAudit('updated', z.id, `Zone: ${z.name}`, JSON.stringify(z))
    },
    [appendAudit]
  )

  const deleteZone = useCallback(
    (id: string) => {
      setZones((prev) => {
        const arr = prev.filter((x) => x.id !== id)
        saveToStorage('zones', arr)
        return arr
      })
      appendAudit('deleted', id, `Zone deleted`, JSON.stringify({ id }))
    },
    [appendAudit]
  )

  // ── Key ───────────────────────────────────────────────────────────────────

  const addKey = useCallback(
    (k: Omit<Key, 'id'>) => {
      const next: Key = { ...k, id: generateId() }
      setKeys((prev) => {
        const arr = [...prev, next]
        saveToStorage('keys', arr)
        return arr
      })
      appendAudit('created', next.id, `Key: ${next.keyId}`, JSON.stringify(next))
    },
    [appendAudit]
  )

  const updateKey = useCallback(
    (k: Key) => {
      setKeys((prev) => {
        const arr = prev.map((x) => (x.id === k.id ? k : x))
        saveToStorage('keys', arr)
        return arr
      })
      appendAudit('updated', k.id, `Key: ${k.keyId}`, JSON.stringify(k))
    },
    [appendAudit]
  )

  // ── Company ───────────────────────────────────────────────────────────────

  const addCompany = useCallback(
    (c: Omit<Company, 'id'>) => {
      const next: Company = { ...c, id: generateId() }
      setCompanies((prev) => {
        const arr = [...prev, next]
        saveToStorage('companies', arr)
        return arr
      })
      appendAudit('created', next.id, `Company: ${next.name}`, JSON.stringify(next))
    },
    [appendAudit]
  )

  const updateCompany = useCallback(
    (c: Company) => {
      setCompanies((prev) => {
        const arr = prev.map((x) => (x.id === c.id ? c : x))
        saveToStorage('companies', arr)
        return arr
      })
      appendAudit('updated', c.id, `Company: ${c.name}`, JSON.stringify(c))
    },
    [appendAudit]
  )

  // ── Personnel ─────────────────────────────────────────────────────────────

  const addPersonnel = useCallback(
    (p: Omit<Personnel, 'id'>) => {
      const next: Personnel = { ...p, id: generateId() }
      setPersonnel((prev) => {
        const arr = [...prev, next]
        saveToStorage('personnel', arr)
        return arr
      })
      appendAudit('created', next.id, `Personnel: ${next.fullName}`, JSON.stringify(next))
    },
    [appendAudit]
  )

  const updatePersonnel = useCallback(
    (p: Personnel) => {
      setPersonnel((prev) => {
        const arr = prev.map((x) => (x.id === p.id ? p : x))
        saveToStorage('personnel', arr)
        return arr
      })
      appendAudit('updated', p.id, `Personnel: ${p.fullName}`, JSON.stringify(p))
    },
    [appendAudit]
  )

  // ── Access Records ────────────────────────────────────────────────────────

  const addAccessRecord = useCallback(
    (r: Omit<AccessRecord, 'id'>): AccessRecord => {
      const next: AccessRecord = { ...r, id: generateId() }
      setAccessRecords((prev) => {
        const arr = [...prev, next]
        saveToStorage('access_records', arr)
        return arr
      })
      // Mark key as issued if one was assigned
      if (next.keyId) {
        setKeys((prev) => {
          const arr = prev.map((k) =>
            k.id === next.keyId ? { ...k, status: 'issued' as const } : k
          )
          saveToStorage('keys', arr)
          return arr
        })
      }
      appendAudit(
        'created',
        next.id,
        `Access record created`,
        JSON.stringify({ personnelId: next.personnelId, assetId: next.assetId, zoneId: next.zoneId, keyId: next.keyId })
      )
      return next
    },
    [appendAudit]
  )

  const updateAccessRecord = useCallback(
    (r: AccessRecord) => {
      setAccessRecords((prev) => {
        const arr = prev.map((x) => (x.id === r.id ? r : x))
        saveToStorage('access_records', arr)
        return arr
      })
      appendAudit('updated', r.id, `Access record updated`, JSON.stringify(r))
    },
    [appendAudit]
  )

  const revokeAccess = useCallback(
    (id: string) => {
      let revokedRecord: AccessRecord | undefined
      setAccessRecords((prev) => {
        revokedRecord = prev.find((x) => x.id === id)
        const arr = prev.map((x) =>
          x.id === id ? { ...x, status: 'revoked' as const } : x
        )
        saveToStorage('access_records', arr)
        return arr
      })
      if (revokedRecord?.keyId) {
        setKeys((prev) => {
          const arr = prev.map((k) =>
            k.id === revokedRecord?.keyId ? { ...k, status: 'available' as const } : k
          )
          saveToStorage('keys', arr)
          return arr
        })
      }
      appendAudit('revoked', id, `Access revoked`, JSON.stringify({ id, revokedAt: new Date().toISOString() }))
    },
    [appendAudit]
  )

  const returnKey = useCallback(
    (accessRecordId: string) => {
      let keyIdToReturn: string | undefined
      setAccessRecords((prev) => {
        const record = prev.find((x) => x.id === accessRecordId)
        keyIdToReturn = record?.keyId
        const arr = prev.map((x) =>
          x.id === accessRecordId
            ? { ...x, returnedDate: new Date().toISOString().split('T')[0], keyId: undefined }
            : x
        )
        saveToStorage('access_records', arr)
        return arr
      })
      if (keyIdToReturn) {
        setKeys((prev) => {
          const arr = prev.map((k) =>
            k.id === keyIdToReturn ? { ...k, status: 'available' as const } : k
          )
          saveToStorage('keys', arr)
          return arr
        })
      }
      appendAudit(
        'key_returned',
        accessRecordId,
        `Key returned`,
        JSON.stringify({ accessRecordId, keyId: keyIdToReturn, returnedAt: new Date().toISOString() })
      )
    },
    [appendAudit]
  )

  // ── Lookup helpers ────────────────────────────────────────────────────────

  const getPersonnelById = useCallback(
    (id: string) => personnel.find((p) => p.id === id),
    [personnel]
  )
  const getAssetById = useCallback((id: string) => assets.find((a) => a.id === id), [assets])
  const getZoneById = useCallback((id: string) => zones.find((z) => z.id === id), [zones])
  const getKeyById = useCallback((id: string) => keys.find((k) => k.id === id), [keys])
  const getCompanyById = useCallback(
    (id: string) => companies.find((c) => c.id === id),
    [companies]
  )
  const getUserNameById = useCallback(
    (id: string) => DEMO_USERS.find((u) => u.id === id)?.name ?? id,
    []
  )

  return (
    <DataContext.Provider
      value={{
        assets,
        zones,
        keys,
        companies,
        personnel,
        accessRecords,
        auditLog,
        addAsset,
        updateAsset,
        addZone,
        updateZone,
        deleteZone,
        addKey,
        updateKey,
        addCompany,
        updateCompany,
        addPersonnel,
        updatePersonnel,
        addAccessRecord,
        updateAccessRecord,
        revokeAccess,
        returnKey,
        getPersonnelById,
        getAssetById,
        getZoneById,
        getKeyById,
        getCompanyById,
        getUserNameById,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
