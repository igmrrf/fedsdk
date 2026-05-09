import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { lookup, _setDb } from '../src/lookup'
import type { RoutingEntry } from '../src/types'

const FIXTURE: Record<string, RoutingEntry> = {
  '021000021': { name: 'JPMORGAN CHASE', ach: true, wire: true },
  '021200339': { name: 'JPMORGAN CHASE BANK NA', ach: true, wire: false },
  '026009593': { name: 'BANK OF AMERICA NA', ach: false, wire: true },
}

beforeAll(() => _setDb(FIXTURE))
afterAll(() => _setDb(FIXTURE)) // leave fixture in place; tests are isolated

describe('lookup', () => {
  it('returns full result for ACH+wire entry', () => {
    const r = lookup('021000021')
    expect(r).not.toBeNull()
    expect(r!.routingNumber).toBe('021000021')
    expect(r!.name).toBe('JPMORGAN CHASE')
    expect(r!.ach).toBe(true)
    expect(r!.wire).toBe(true)
    expect(r!.networks).toEqual(['ACH', 'Fedwire'])
  })

  it('returns ACH-only entry with correct networks', () => {
    const r = lookup('021200339')
    expect(r).not.toBeNull()
    expect(r!.ach).toBe(true)
    expect(r!.wire).toBe(false)
    expect(r!.networks).toEqual(['ACH'])
  })

  it('returns wire-only entry with correct networks', () => {
    const r = lookup('026009593')
    expect(r).not.toBeNull()
    expect(r!.ach).toBe(false)
    expect(r!.wire).toBe(true)
    expect(r!.networks).toEqual(['Fedwire'])
  })

  it('returns null for unknown routing number', () => {
    expect(lookup('000000000')).toBeNull()
    expect(lookup('999999999')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(lookup('')).toBeNull()
  })
})
