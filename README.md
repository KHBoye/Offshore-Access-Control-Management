# Offshore Access Control Management

A **mobile-first web application** for Aker BP offshore operations to manage physical key management and access control across multiple offshore assets (rigs/platforms). This solution replaces fragmented Excel sheets currently used on installations and provides a unified, auditable interim system.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **React Router v6** – client-side navigation
- **localStorage** – offline-capable data persistence (no backend required)
- **CSS custom properties** – responsive, mobile-first design with Aker BP brand colours

## Features

### 👥 Roles & Access Control
| Role | Access |
|---|---|
| **Access Coordinator** (offshore, per rig) | Registers personnel, issues/returns keys, grants/revokes zone access. Sees only their own asset's data. |
| **HSE / Security Lead** (onshore) | Read-only cross-asset overview, audit reports, expiring access alerts. |
| **System Admin** | Manages master data (assets, zones, keys, companies), all users. |

### 📋 Core Data Tables
1. **Assets** – Rig/platform register (name, code, location, active)
2. **Zones & Cabinets** – Linked to asset; type (zone, door, cabinet, equipment), criticality level
3. **Keys** – Physical key inventory with status (available, issued, lost, retired) and current holder
4. **Companies** – Aker BP, contractors, service companies
5. **Personnel** – Full register with company, role, email, phone, ID number
6. **Access Records** – Main transactional table: person, asset, zone, key, validity period, status, justification
7. **Audit Log** – Full change history: timestamp, action, performer, field-level details

### 🖥️ Screens

| Screen | Path | Description |
|---|---|---|
| Login | `/login` | Demo user selection with role info |
| Dashboard | `/` | Stats cards, expiry alerts, overdue ad-hoc warnings, recent access table |
| Access Records | `/access` | Searchable, filterable list; inline revoke/key-return actions; CSV export |
| Register New Access | `/access/new` | Full form with person lookup/create, zone selection, key assignment, validity period |
| Personnel | `/personnel` | Register with full access history per person |
| Key Inventory | `/keys` | Status per key with current holder; CSV export |
| Audit Log | `/audit` | Full change history; filterable by action and user; CSV export |
| Reports | `/reports` | Cross-asset overview (admin/HSE only): access by asset, company, type; compliance risks |
| Administration | `/admin` | Master data CRUD for assets, zones/cabinets, companies (admin only) |

### 🔔 Alerts (Dashboard)
- **Expiring access** – records expiring within 7 days shown in amber alert
- **Overdue ad-hoc** – ad-hoc access past its Valid To date still active (compliance risk) shown in red alert

### 🌐 Bilingual UI
All labels are available in **Norwegian** and **English**. Switch with the 🇬🇧/🇳🇴 toggle in the navigation bar. Language preference is persisted in localStorage.

### 📥 Data Export
Every major list (access records, key inventory, audit log, reports) can be exported as standard **CSV** files for migration to a permanent access control system.

### 🔒 Security & Compliance
- **Row-level security**: Coordinators see only their assigned asset's data
- **Audit trail**: Every create/update/revoke/key-return writes an immutable audit log entry with user, timestamp, and change details
- **Sensitivity label**: Internal / Konfidensielt
- No personal data beyond what is operationally required (name, company, role, ID for verification)

## Demo Accounts

| User | Role | Asset |
|---|---|---|
| Kari Nordmann | Access Coordinator | Ivar Aasen (IVA) |
| Bjørn Hansen | Access Coordinator | Edvard Grieg (EDG) |
| Elin Sørensen | HSE / Security Lead | All assets |
| System Administrator | Admin | All assets |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run development server for other devices on the same network
npm run dev:host

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## Access from Phone, Tablet, or Another PC

Use the app on your private network with a local-only link:

`http://<your-local-ip>:5173`

Example:

`http://192.168.1.23:5173`

### Steps

1. Open a terminal in `/home/runner/work/Offshore-Access-Control-Management/Offshore-Access-Control-Management`.
2. Install dependencies with `npm install`.
3. Start the LAN-accessible development server with `npm run dev:host`.
4. Find your computer's local IP address:
   - Windows: `ipconfig`
   - macOS/Linux: `ifconfig` or `ip a`
5. Keep the development server running.
6. On your phone, tablet, or another PC connected to the same Wi-Fi or local network, open `http://<your-local-ip>:5173`.
7. If the page does not open, allow Node.js/Vite through your firewall and try again.

## Project Structure

```
src/
├── __tests__/          # Unit tests (storage, i18n, data integrity)
├── components/         # Reusable UI components (Layout, Navbar, Modal, Badges, ConfirmDialog)
├── context/            # React contexts (AuthContext, DataContext with audit logging)
├── data/               # Seed/mock data and localStorage persistence layer
├── pages/              # Page components (one per route)
├── types/              # TypeScript type definitions for all domain entities
├── i18n.ts             # Bilingual Norwegian/English translation helper
├── App.tsx             # Router and authenticated shell
├── main.tsx            # React entry point
└── index.css           # Mobile-first CSS with Aker BP brand colours
```

## Migration Path

All data is stored as structured JSON in localStorage using the same schema as the TypeScript types in `src/types/index.ts`. Records can be exported as standard CSV from every list view. The data model is designed to map cleanly to Dataverse entities (SharePoint Lists or Power Platform) when the permanent access control system is evaluated.

---

*Aker BP Offshore Access Control Management — Internal Use Only — Sensitivity: Konfidensielt/Internal*
