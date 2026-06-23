/**
 * Tests for the localStorage persistence helpers.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { loadFromStorage, saveToStorage, clearStorage } from '../data/storage'

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns fallback when key does not exist', () => {
    const result = loadFromStorage('missing_key', [1, 2, 3])
    expect(result).toEqual([1, 2, 3])
  })

  it('saves and loads a value', () => {
    saveToStorage('test_key', { hello: 'world' })
    const result = loadFromStorage('test_key', {})
    expect(result).toEqual({ hello: 'world' })
  })

  it('saves and loads an array', () => {
    const data = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]
    saveToStorage('test_arr', data)
    const result = loadFromStorage<typeof data>('test_arr', [])
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Alice')
  })

  it('clearStorage removes all oacm_v1_ keys', () => {
    saveToStorage('assets', [{ id: 'a1' }])
    saveToStorage('zones', [{ id: 'z1' }])
    // A non-namespaced key should not be removed
    localStorage.setItem('unrelated_key', 'value')

    clearStorage()

    expect(loadFromStorage('assets', null)).toBeNull()
    expect(loadFromStorage('zones', null)).toBeNull()
    expect(localStorage.getItem('unrelated_key')).toBe('value')
  })

  it('returns fallback on malformed JSON', () => {
    localStorage.setItem('oacm_v1_corrupt', '{bad json[}')
    const result = loadFromStorage('corrupt', 'default')
    expect(result).toBe('default')
  })
})
