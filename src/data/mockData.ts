import type {
  Asset,
  Zone,
  Key,
  Company,
  Personnel,
  AccessRecord,
  AuditLogEntry,
  AppUser,
} from '../types'

// ─── Demo Users ───────────────────────────────────────────────────────────────

export const DEMO_USERS: AppUser[] = [
  {
    id: 'u1',
    name: 'Kari Nordmann',
    email: 'kari.nordmann@akerbp.com',
    role: 'coordinator',
    assetId: 'a1',
  },
  {
    id: 'u2',
    name: 'Bjørn Hansen',
    email: 'bjorn.hansen@akerbp.com',
    role: 'coordinator',
    assetId: 'a2',
  },
  {
    id: 'u3',
    name: 'Elin Sørensen',
    email: 'elin.sorensen@akerbp.com',
    role: 'hse_lead',
  },
  {
    id: 'u4',
    name: 'System Administrator',
    email: 'sysadmin@akerbp.com',
    role: 'admin',
  },
]

// ─── Assets ───────────────────────────────────────────────────────────────────

export const INITIAL_ASSETS: Asset[] = [
  { id: 'a1', name: 'Ivar Aasen', code: 'IVA', location: 'North Sea, Block 16/1', active: true },
  { id: 'a2', name: 'Edvard Grieg', code: 'EDG', location: 'North Sea, Block 16/1', active: true },
  { id: 'a3', name: 'Alvheim FPSO', code: 'ALV', location: 'North Sea, Block 24/6', active: true },
  { id: 'a4', name: 'Valhall', code: 'VAL', location: 'North Sea, Block 2/8', active: true },
]

// ─── Zones ────────────────────────────────────────────────────────────────────

export const INITIAL_ZONES: Zone[] = [
  // Ivar Aasen
  { id: 'z1', assetId: 'a1', name: 'Boredekk', type: 'zone', description: 'Drill deck area', criticalityLevel: 'critical' },
  { id: 'z2', assetId: 'a1', name: 'Kontrollrom', type: 'zone', description: 'Main control room', criticalityLevel: 'critical' },
  { id: 'z3', assetId: 'a1', name: 'El-rom A', type: 'cabinet', description: 'Electrical cabinet room A', criticalityLevel: 'high' },
  { id: 'z4', assetId: 'a1', name: 'Hoveddør inngang', type: 'door', description: 'Main entrance door', criticalityLevel: 'medium' },
  { id: 'z5', assetId: 'a1', name: 'Kjemikalierom', type: 'zone', description: 'Chemical storage', criticalityLevel: 'high' },
  // Edvard Grieg
  { id: 'z6', assetId: 'a2', name: 'Prosessområde', type: 'zone', description: 'Process area', criticalityLevel: 'critical' },
  { id: 'z7', assetId: 'a2', name: 'HVAC rom', type: 'equipment', description: 'HVAC equipment room', criticalityLevel: 'medium' },
  { id: 'z8', assetId: 'a2', name: 'Nødgeneratorrom', type: 'zone', description: 'Emergency generator room', criticalityLevel: 'critical' },
  // Alvheim
  { id: 'z9', assetId: 'a3', name: 'Cargo deck', type: 'zone', description: 'Cargo operations area', criticalityLevel: 'medium' },
  { id: 'z10', assetId: 'a3', name: 'Engine room', type: 'zone', description: 'Main engine room', criticalityLevel: 'critical' },
  // Valhall
  { id: 'z11', assetId: 'a4', name: 'WP Process', type: 'zone', description: 'Wellhead process area', criticalityLevel: 'critical' },
  { id: 'z12', assetId: 'a4', name: 'Telecom rom', type: 'cabinet', description: 'Telecom equipment cabinet', criticalityLevel: 'high' },
]

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const INITIAL_KEYS: Key[] = [
  { id: 'k1', keyId: 'IVA-K-001', zoneId: 'z1', assetId: 'a1', status: 'available', notes: '' },
  { id: 'k2', keyId: 'IVA-K-002', zoneId: 'z2', assetId: 'a1', status: 'issued', notes: 'Master key' },
  { id: 'k3', keyId: 'IVA-K-003', zoneId: 'z3', assetId: 'a1', status: 'available', notes: '' },
  { id: 'k4', keyId: 'IVA-K-004', zoneId: 'z4', assetId: 'a1', status: 'available', notes: '' },
  { id: 'k5', keyId: 'IVA-K-005', zoneId: 'z5', assetId: 'a1', status: 'lost', notes: 'Reported lost 2025-01-10' },
  { id: 'k6', keyId: 'EDG-K-001', zoneId: 'z6', assetId: 'a2', status: 'available', notes: '' },
  { id: 'k7', keyId: 'EDG-K-002', zoneId: 'z7', assetId: 'a2', status: 'issued', notes: '' },
  { id: 'k8', keyId: 'EDG-K-003', zoneId: 'z8', assetId: 'a2', status: 'available', notes: '' },
  { id: 'k9', keyId: 'ALV-K-001', zoneId: 'z9', assetId: 'a3', status: 'available', notes: '' },
  { id: 'k10', keyId: 'ALV-K-002', zoneId: 'z10', assetId: 'a3', status: 'retired', notes: 'Replaced 2024-11-01' },
  { id: 'k11', keyId: 'VAL-K-001', zoneId: 'z11', assetId: 'a4', status: 'issued', notes: '' },
  { id: 'k12', keyId: 'VAL-K-002', zoneId: 'z12', assetId: 'a4', status: 'available', notes: '' },
]

// ─── Companies ────────────────────────────────────────────────────────────────

export const INITIAL_COMPANIES: Company[] = [
  { id: 'c1', name: 'Aker BP ASA', type: 'akerbp', contact: 'hr@akerbp.com' },
  { id: 'c2', name: 'Halliburton', type: 'service', contact: 'operations@halliburton.com' },
  { id: 'c3', name: 'Schlumberger (SLB)', type: 'service', contact: 'ops@slb.com' },
  { id: 'c4', name: 'NES Fircroft', type: 'contractor', contact: 'offshore@nesfircroft.com' },
  { id: 'c5', name: 'Bilfinger Industrial Services', type: 'contractor', contact: 'norway@bilfinger.com' },
  { id: 'c6', name: 'Baker Hughes', type: 'service', contact: 'ops@bakerhughes.com' },
]

// ─── Personnel ────────────────────────────────────────────────────────────────

export const INITIAL_PERSONNEL: Personnel[] = [
  { id: 'p1', fullName: 'Ole Kristiansen', companyId: 'c1', role: 'Drilling Engineer', email: 'ole.k@akerbp.com', phone: '+47 900 00001', idNumber: 'NO-100001', active: true },
  { id: 'p2', fullName: 'Ingrid Bakke', companyId: 'c1', role: 'Safety Officer', email: 'ingrid.b@akerbp.com', phone: '+47 900 00002', idNumber: 'NO-100002', active: true },
  { id: 'p3', fullName: 'Tom Richards', companyId: 'c2', role: 'Service Technician', email: 'tom.r@halliburton.com', phone: '+47 900 00003', idNumber: 'UK-200001', active: true },
  { id: 'p4', fullName: 'Lars Pettersen', companyId: 'c4', role: 'Maintenance Contractor', email: 'lars.p@nesfircroft.com', phone: '+47 900 00004', idNumber: 'NO-300001', active: true },
  { id: 'p5', fullName: 'Ahmed Al-Rashid', companyId: 'c3', role: 'SLB Engineer', email: 'ahmed.r@slb.com', phone: '+47 900 00005', idNumber: 'SA-400001', active: true },
  { id: 'p6', fullName: 'Sofia Andersen', companyId: 'c1', role: 'Process Operator', email: 'sofia.a@akerbp.com', phone: '+47 900 00006', idNumber: 'NO-100003', active: true },
  { id: 'p7', fullName: 'Henrik Moe', companyId: 'c5', role: 'Electrical Contractor', email: 'henrik.m@bilfinger.com', phone: '+47 900 00007', idNumber: 'NO-300002', active: true },
  { id: 'p8', fullName: 'Emma Jacobsen', companyId: 'c6', role: 'BH Field Engineer', email: 'emma.j@bakerhughes.com', phone: '+47 900 00008', idNumber: 'GB-500001', active: false },
]

// ─── Access Records ───────────────────────────────────────────────────────────

const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const daysFromNow = (n: number) => fmt(new Date(today.getTime() + n * 86400000))
const daysAgo = (n: number) => fmt(new Date(today.getTime() - n * 86400000))

export const INITIAL_ACCESS_RECORDS: AccessRecord[] = [
  {
    id: 'ar1',
    personnelId: 'p1',
    assetId: 'a1',
    zoneId: 'z1',
    keyId: 'k1',
    accessType: 'permanent',
    validFrom: daysAgo(180),
    validTo: daysFromNow(185),
    status: 'active',
    issuedBy: 'u1',
    issuedDate: daysAgo(180),
    justification: 'Permanent drilling engineer – standing access',
    comments: '',
  },
  {
    id: 'ar2',
    personnelId: 'p3',
    assetId: 'a1',
    zoneId: 'z2',
    keyId: 'k2',
    accessType: 'ad-hoc',
    validFrom: daysAgo(3),
    validTo: daysFromNow(4),
    status: 'active',
    issuedBy: 'u1',
    issuedDate: daysAgo(3),
    approver: 'u1',
    justification: 'Halliburton service visit – mud logging system',
    comments: 'Escorted at all times',
  },
  {
    id: 'ar3',
    personnelId: 'p4',
    assetId: 'a1',
    zoneId: 'z3',
    accessType: 'project',
    validFrom: daysAgo(10),
    validTo: daysFromNow(20),
    status: 'active',
    issuedBy: 'u1',
    issuedDate: daysAgo(10),
    justification: 'Electrical maintenance project phase 2',
  },
  {
    id: 'ar4',
    personnelId: 'p5',
    assetId: 'a1',
    zoneId: 'z1',
    accessType: 'ad-hoc',
    validFrom: daysAgo(15),
    validTo: daysAgo(8),
    status: 'expired',
    issuedBy: 'u1',
    issuedDate: daysAgo(15),
    justification: 'SLB cementing operation',
  },
  {
    id: 'ar5',
    personnelId: 'p2',
    assetId: 'a1',
    zoneId: 'z5',
    accessType: 'permanent',
    validFrom: daysAgo(365),
    validTo: daysFromNow(5),  // expiring soon
    status: 'active',
    issuedBy: 'u1',
    issuedDate: daysAgo(365),
    justification: 'Safety officer – chemical area standing access',
  },
  {
    id: 'ar6',
    personnelId: 'p6',
    assetId: 'a1',
    zoneId: 'z2',
    accessType: 'permanent',
    validFrom: daysAgo(90),
    validTo: daysFromNow(275),
    status: 'active',
    issuedBy: 'u1',
    issuedDate: daysAgo(90),
    justification: 'Process operator – control room access',
  },
  // Edvard Grieg records
  {
    id: 'ar7',
    personnelId: 'p7',
    assetId: 'a2',
    zoneId: 'z6',
    keyId: 'k7',
    accessType: 'project',
    validFrom: daysAgo(5),
    validTo: daysFromNow(3),  // expiring soon
    status: 'active',
    issuedBy: 'u2',
    issuedDate: daysAgo(5),
    justification: 'Process area insulation work',
  },
  {
    id: 'ar8',
    personnelId: 'p3',
    assetId: 'a2',
    zoneId: 'z8',
    accessType: 'ad-hoc',
    validFrom: daysAgo(20),
    validTo: daysAgo(18),  // overdue ad-hoc
    status: 'active',     // still active = compliance risk
    issuedBy: 'u2',
    issuedDate: daysAgo(20),
    justification: 'Emergency generator inspection',
    comments: 'ACCESS NOT RETURNED – FOLLOW UP',
  },
]

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'al1',
    timestamp: new Date(today.getTime() - 180 * 86400000).toISOString(),
    action: 'created',
    recordReference: 'ar1 – Ole Kristiansen / Boredekk / IVA',
    recordId: 'ar1',
    performedBy: 'u1',
    changeDetails: JSON.stringify({ status: 'active', accessType: 'permanent' }),
  },
  {
    id: 'al2',
    timestamp: new Date(today.getTime() - 15 * 86400000).toISOString(),
    action: 'created',
    recordReference: 'ar4 – Ahmed Al-Rashid / Boredekk / IVA',
    recordId: 'ar4',
    performedBy: 'u1',
    changeDetails: JSON.stringify({ status: 'active', accessType: 'ad-hoc' }),
  },
  {
    id: 'al3',
    timestamp: new Date(today.getTime() - 8 * 86400000).toISOString(),
    action: 'updated',
    recordReference: 'ar4 – Ahmed Al-Rashid / Boredekk / IVA',
    recordId: 'ar4',
    performedBy: 'u1',
    changeDetails: JSON.stringify({ status: { from: 'active', to: 'expired' } }),
  },
  {
    id: 'al4',
    timestamp: new Date(today.getTime() - 3 * 86400000).toISOString(),
    action: 'created',
    recordReference: 'ar2 – Tom Richards / Kontrollrom / IVA',
    recordId: 'ar2',
    performedBy: 'u1',
    changeDetails: JSON.stringify({ status: 'active', accessType: 'ad-hoc', keyId: 'k2' }),
  },
]
