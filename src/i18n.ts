/**
 * Simple bilingual (Norwegian / English) i18n helper.
 * Labels are shown in both languages: "Norwegian (English)"
 * or single language when they match.
 */

export type Lang = 'no' | 'en'

let currentLang: Lang = (localStorage.getItem('oacm_lang') as Lang) ?? 'no'

export function getLang(): Lang {
  return currentLang
}

export function setLang(lang: Lang): void {
  currentLang = lang
  localStorage.setItem('oacm_lang', lang)
}

type TranslationMap = {
  no: string
  en: string
}

const translations: Record<string, TranslationMap> = {
  // Navigation
  nav_dashboard: { no: 'Oversikt', en: 'Dashboard' },
  nav_access: { no: 'Adgangsliste', en: 'Access Records' },
  nav_new_access: { no: 'Ny adgang', en: 'New Access' },
  nav_personnel: { no: 'Personell', en: 'Personnel' },
  nav_keys: { no: 'Nøkler', en: 'Key Inventory' },
  nav_audit: { no: 'Revisjonslogg', en: 'Audit Log' },
  nav_admin: { no: 'Administrasjon', en: 'Admin' },
  nav_reports: { no: 'Rapporter', en: 'Reports' },
  nav_logout: { no: 'Logg ut', en: 'Log out' },

  // Common labels
  lbl_asset: { no: 'Anlegg', en: 'Asset' },
  lbl_zone: { no: 'Sone/Skap', en: 'Zone/Cabinet' },
  lbl_key: { no: 'Nøkkel', en: 'Key' },
  lbl_personnel: { no: 'Person', en: 'Person' },
  lbl_company: { no: 'Selskap', en: 'Company' },
  lbl_access_type: { no: 'Adgangstype', en: 'Access Type' },
  lbl_valid_from: { no: 'Gyldig fra', en: 'Valid From' },
  lbl_valid_to: { no: 'Gyldig til', en: 'Valid To' },
  lbl_status: { no: 'Status', en: 'Status' },
  lbl_issued_by: { no: 'Utstedt av', en: 'Issued By' },
  lbl_issued_date: { no: 'Utstedelsesdato', en: 'Issue Date' },
  lbl_justification: { no: 'Begrunnelse', en: 'Justification' },
  lbl_comments: { no: 'Kommentarer', en: 'Comments' },
  lbl_approver: { no: 'Godkjenner', en: 'Approver' },
  lbl_actions: { no: 'Handlinger', en: 'Actions' },
  lbl_search: { no: 'Søk', en: 'Search' },
  lbl_filter: { no: 'Filter', en: 'Filter' },
  lbl_all: { no: 'Alle', en: 'All' },
  lbl_save: { no: 'Lagre', en: 'Save' },
  lbl_cancel: { no: 'Avbryt', en: 'Cancel' },
  lbl_confirm: { no: 'Bekreft', en: 'Confirm' },
  lbl_delete: { no: 'Slett', en: 'Delete' },
  lbl_edit: { no: 'Rediger', en: 'Edit' },
  lbl_add: { no: 'Legg til', en: 'Add' },
  lbl_name: { no: 'Navn', en: 'Name' },
  lbl_email: { no: 'E-post', en: 'Email' },
  lbl_phone: { no: 'Telefon', en: 'Phone' },
  lbl_role: { no: 'Stilling', en: 'Role / Title' },
  lbl_id_number: { no: 'ID-nummer', en: 'ID Number' },
  lbl_active: { no: 'Aktiv', en: 'Active' },
  lbl_inactive: { no: 'Inaktiv', en: 'Inactive' },
  lbl_notes: { no: 'Notater', en: 'Notes' },
  lbl_type: { no: 'Type', en: 'Type' },
  lbl_criticality: { no: 'Kritikalitet', en: 'Criticality' },
  lbl_description: { no: 'Beskrivelse', en: 'Description' },
  lbl_contact: { no: 'Kontakt', en: 'Contact' },
  lbl_code: { no: 'Kode', en: 'Code' },
  lbl_location: { no: 'Lokasjon', en: 'Location' },
  lbl_timestamp: { no: 'Tidsstempel', en: 'Timestamp' },
  lbl_action: { no: 'Handling', en: 'Action' },
  lbl_performed_by: { no: 'Utført av', en: 'Performed By' },
  lbl_changes: { no: 'Endringer', en: 'Changes' },
  lbl_record_ref: { no: 'Referanse', en: 'Reference' },
  lbl_returned_date: { no: 'Returnert dato', en: 'Returned Date' },
  lbl_loading: { no: 'Laster...', en: 'Loading...' },

  // Access types
  access_permanent: { no: 'Permanent', en: 'Permanent' },
  access_ad_hoc: { no: 'Ad-hoc', en: 'Ad-hoc' },
  access_project: { no: 'Prosjekt', en: 'Project' },

  // Access status
  status_active: { no: 'Aktiv', en: 'Active' },
  status_expired: { no: 'Utgått', en: 'Expired' },
  status_revoked: { no: 'Tilbakekalt', en: 'Revoked' },
  status_returned: { no: 'Returnert', en: 'Returned' },

  // Key status
  key_available: { no: 'Tilgjengelig', en: 'Available' },
  key_issued: { no: 'Utlevert', en: 'Issued' },
  key_lost: { no: 'Tapt', en: 'Lost' },
  key_retired: { no: 'Pensjonert', en: 'Retired' },

  // Zone types
  zone_type_zone: { no: 'Sone', en: 'Zone' },
  zone_type_door: { no: 'Dør', en: 'Door' },
  zone_type_cabinet: { no: 'Skap', en: 'Cabinet' },
  zone_type_equipment: { no: 'Utstyr', en: 'Equipment' },

  // Criticality
  crit_low: { no: 'Lav', en: 'Low' },
  crit_medium: { no: 'Medium', en: 'Medium' },
  crit_high: { no: 'Høy', en: 'High' },
  crit_critical: { no: 'Kritisk', en: 'Critical' },

  // Company types
  company_akerbp: { no: 'Aker BP', en: 'Aker BP' },
  company_contractor: { no: 'Entreprenør', en: 'Contractor' },
  company_service: { no: 'Serviceselskap', en: 'Service Company' },

  // Dashboard
  dash_active_access: { no: 'Aktive adganger', en: 'Active Access Records' },
  dash_keys_issued: { no: 'Utleverte nøkler', en: 'Keys Issued' },
  dash_expiring: { no: 'Utgår innen 7 dager', en: 'Expiring Within 7 Days' },
  dash_overdue: { no: 'Forfalt ad-hoc adgang', en: 'Overdue Ad-hoc Access' },
  dash_welcome: { no: 'Velkommen', en: 'Welcome' },
  dash_asset_filter: { no: 'Viser data for', en: 'Showing data for' },

  // Actions
  act_revoke: { no: 'Tilbakekall', en: 'Revoke' },
  act_return_key: { no: 'Returner nøkkel', en: 'Return Key' },
  act_view: { no: 'Vis', en: 'View' },
  act_new_access: { no: 'Registrer ny adgang', en: 'Register New Access' },
  act_login: { no: 'Logg inn', en: 'Log In' },
  act_select_user: { no: 'Velg bruker', en: 'Select User' },

  // Confirm messages
  confirm_revoke: { no: 'Er du sikker på at du vil tilbakekalle denne adgangen?', en: 'Are you sure you want to revoke this access?' },
  confirm_return_key: { no: 'Bekreft retur av nøkkel', en: 'Confirm key return' },
  confirm_delete: { no: 'Er du sikker på at du vil slette denne posten?', en: 'Are you sure you want to delete this record?' },

  // Headings
  h_login: { no: 'Innlogging – Adgangskontroll', en: 'Login – Access Control' },
  h_register_access: { no: 'Registrer ny adgang', en: 'Register New Access' },
  h_access_records: { no: 'Adgangsregister', en: 'Access Records' },
  h_personnel: { no: 'Personellregister', en: 'Personnel Register' },
  h_key_inventory: { no: 'Nøkkeloversikt', en: 'Key Inventory' },
  h_audit_log: { no: 'Revisjonslogg', en: 'Audit Log' },
  h_admin: { no: 'Administrasjon', en: 'Administration' },
  h_reports: { no: 'Rapporter', en: 'Reports' },
  h_assets: { no: 'Anlegg', en: 'Assets' },
  h_zones: { no: 'Soner og skap', en: 'Zones & Cabinets' },
  h_companies: { no: 'Selskaper', en: 'Companies' },

  // Misc
  no_data: { no: 'Ingen data funnet', en: 'No data found' },
  required_field: { no: 'Dette feltet er påkrevd', en: 'This field is required' },
  success_saved: { no: 'Lagret!', en: 'Saved!' },
  success_revoked: { no: 'Adgang tilbakekalt', en: 'Access revoked' },
  success_key_returned: { no: 'Nøkkel returnert', en: 'Key returned' },
  err_generic: { no: 'En feil oppstod. Prøv igjen.', en: 'An error occurred. Please try again.' },
  lbl_language: { no: 'Språk / Language', en: 'Språk / Language' },
  lbl_role_coordinator: { no: 'Adgangskoordinator', en: 'Access Coordinator' },
  lbl_role_hse: { no: 'HMS/Sikkerhetsleder', en: 'HSE / Security Lead' },
  lbl_role_admin: { no: 'Administrator', en: 'System Admin' },
  demo_login_hint: { no: 'Demo: velg en bruker for å logge inn', en: 'Demo: select a user to log in' },
  lbl_history: { no: 'Historikk', en: 'History' },
  lbl_current_access: { no: 'Gjeldende adgang', en: 'Current Access' },
  lbl_all_access: { no: 'All adgang', en: 'All Access' },
  lbl_expiring_soon: { no: 'Utgår snart', en: 'Expiring Soon' },
  export_csv: { no: 'Eksporter CSV', en: 'Export CSV' },
  lbl_key_id: { no: 'Nøkkel-ID', en: 'Key ID' },
}

export function t(key: string): string {
  const entry = translations[key]
  if (!entry) return key
  return currentLang === 'no' ? entry.no : entry.en
}

/** Returns "Norwegian (English)" bilingual label */
export function bi(key: string): string {
  const entry = translations[key]
  if (!entry) return key
  if (entry.no === entry.en) return entry.no
  return `${entry.no} (${entry.en})`
}
