/**
 * Tests for the bilingual i18n helper.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { t, bi, setLang, getLang } from '../i18n'

describe('i18n helpers', () => {
  beforeEach(() => {
    setLang('no')
  })

  it('getLang returns the current language', () => {
    expect(getLang()).toBe('no')
    setLang('en')
    expect(getLang()).toBe('en')
  })

  it('t() returns Norwegian string when lang is no', () => {
    setLang('no')
    expect(t('nav_dashboard')).toBe('Oversikt')
  })

  it('t() returns English string when lang is en', () => {
    setLang('en')
    expect(t('nav_dashboard')).toBe('Dashboard')
  })

  it('t() returns the key itself for unknown keys', () => {
    expect(t('totally_unknown_key_xyz')).toBe('totally_unknown_key_xyz')
  })

  it('bi() returns "Norwegian (English)" for distinct translations', () => {
    setLang('no')
    const result = bi('nav_dashboard')
    expect(result).toBe('Oversikt (Dashboard)')
  })

  it('bi() returns single value when both translations are identical', () => {
    // access_permanent is 'Permanent' in both languages
    const result = bi('access_permanent')
    expect(result).toBe('Permanent')
  })

  it('t() returns correct status labels', () => {
    setLang('no')
    expect(t('status_active')).toBe('Aktiv')
    expect(t('status_expired')).toBe('Utgått')
    expect(t('status_revoked')).toBe('Tilbakekalt')
    expect(t('status_returned')).toBe('Returnert')
  })

  it('t() returns correct key status labels', () => {
    setLang('no')
    expect(t('key_available')).toBe('Tilgjengelig')
    expect(t('key_issued')).toBe('Utlevert')
    expect(t('key_lost')).toBe('Tapt')
    expect(t('key_retired')).toBe('Pensjonert')
  })

  it('t() returns correct criticality labels', () => {
    setLang('no')
    expect(t('crit_critical')).toBe('Kritisk')
    expect(t('crit_high')).toBe('Høy')
    setLang('en')
    expect(t('crit_critical')).toBe('Critical')
    expect(t('crit_high')).toBe('High')
  })
})
