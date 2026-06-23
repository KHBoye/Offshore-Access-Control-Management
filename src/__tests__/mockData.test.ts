/**
 * Tests for the mock / seed data integrity.
 */
import { describe, it, expect } from 'vitest'
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

describe('mock data integrity', () => {
  it('all assets have unique IDs and required fields', () => {
    const ids = INITIAL_ASSETS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    INITIAL_ASSETS.forEach((a) => {
      expect(a.name).toBeTruthy()
      expect(a.code).toBeTruthy()
      expect(typeof a.active).toBe('boolean')
    })
  })

  it('all zones reference a valid asset', () => {
    const assetIds = new Set(INITIAL_ASSETS.map((a) => a.id))
    INITIAL_ZONES.forEach((z) => {
      expect(assetIds.has(z.assetId), `Zone ${z.id} references unknown asset ${z.assetId}`).toBe(true)
    })
  })

  it('all keys reference a valid asset and zone', () => {
    const assetIds = new Set(INITIAL_ASSETS.map((a) => a.id))
    const zoneIds = new Set(INITIAL_ZONES.map((z) => z.id))
    INITIAL_KEYS.forEach((k) => {
      expect(assetIds.has(k.assetId), `Key ${k.keyId} references unknown asset`).toBe(true)
      expect(zoneIds.has(k.zoneId), `Key ${k.keyId} references unknown zone`).toBe(true)
    })
  })

  it('all personnel reference a valid company', () => {
    const companyIds = new Set(INITIAL_COMPANIES.map((c) => c.id))
    INITIAL_PERSONNEL.forEach((p) => {
      expect(companyIds.has(p.companyId), `Personnel ${p.fullName} references unknown company`).toBe(true)
    })
  })

  it('all access records reference valid personnel, asset, and zone', () => {
    const personnelIds = new Set(INITIAL_PERSONNEL.map((p) => p.id))
    const assetIds = new Set(INITIAL_ASSETS.map((a) => a.id))
    const zoneIds = new Set(INITIAL_ZONES.map((z) => z.id))
    const keyIds = new Set(INITIAL_KEYS.map((k) => k.id))

    INITIAL_ACCESS_RECORDS.forEach((r) => {
      expect(personnelIds.has(r.personnelId), `Record ${r.id}: unknown personnelId`).toBe(true)
      expect(assetIds.has(r.assetId), `Record ${r.id}: unknown assetId`).toBe(true)
      expect(zoneIds.has(r.zoneId), `Record ${r.id}: unknown zoneId`).toBe(true)
      if (r.keyId) {
        expect(keyIds.has(r.keyId), `Record ${r.id}: unknown keyId`).toBe(true)
      }
    })
  })

  it('all access records have valid date format and validTo >= validFrom', () => {
    const dateRe = /^\d{4}-\d{2}-\d{2}$/
    INITIAL_ACCESS_RECORDS.forEach((r) => {
      expect(dateRe.test(r.validFrom), `${r.id}: invalid validFrom`).toBe(true)
      expect(dateRe.test(r.validTo), `${r.id}: invalid validTo`).toBe(true)
      expect(r.validTo >= r.validFrom, `${r.id}: validTo < validFrom`).toBe(true)
    })
  })

  it('all access records have valid status and accessType values', () => {
    const validStatuses = new Set(['active', 'expired', 'revoked', 'returned'])
    const validTypes = new Set(['permanent', 'ad-hoc', 'project'])
    INITIAL_ACCESS_RECORDS.forEach((r) => {
      expect(validStatuses.has(r.status), `${r.id}: invalid status "${r.status}"`).toBe(true)
      expect(validTypes.has(r.accessType), `${r.id}: invalid accessType "${r.accessType}"`).toBe(true)
    })
  })

  it('all keys have valid status values', () => {
    const validStatuses = new Set(['available', 'issued', 'lost', 'retired'])
    INITIAL_KEYS.forEach((k) => {
      expect(validStatuses.has(k.status), `Key ${k.keyId}: invalid status "${k.status}"`).toBe(true)
    })
  })

  it('demo users have distinct IDs and valid roles', () => {
    const validRoles = new Set(['coordinator', 'hse_lead', 'admin'])
    const ids = DEMO_USERS.map((u) => u.id)
    expect(new Set(ids).size).toBe(ids.length)
    DEMO_USERS.forEach((u) => {
      expect(validRoles.has(u.role), `User ${u.id}: invalid role "${u.role}"`).toBe(true)
    })
  })

  it('coordinators are bound to an asset that exists', () => {
    const assetIds = new Set(INITIAL_ASSETS.map((a) => a.id))
    DEMO_USERS.filter((u) => u.role === 'coordinator').forEach((u) => {
      expect(u.assetId, `Coordinator ${u.id} has no assetId`).toBeTruthy()
      expect(assetIds.has(u.assetId!), `Coordinator ${u.id} references unknown asset`).toBe(true)
    })
  })

  it('audit log entries have valid ISO timestamps', () => {
    INITIAL_AUDIT_LOG.forEach((e) => {
      const d = new Date(e.timestamp)
      expect(isNaN(d.getTime()), `AuditLog ${e.id}: invalid timestamp`).toBe(false)
    })
  })
})
