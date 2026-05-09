import { describe, expect, it, beforeAll } from 'bun:test'
import { validate, validateABA, lookup, _setDb } from '../src/index'
import type { RoutingEntry } from '../src/types'

const FIXTURE: Record<string, RoutingEntry> = {
  '021000021': { name: 'JPMORGAN CHASE', ach: true, wire: true },
  '026009593': { name: 'BANK OF AMERICA NA', ach: false, wire: true },
}

beforeAll(() => _setDb(FIXTURE))

describe('validate', () => {
  it('valid + in directory → valid:true with result', () => {
    const r = validate('021000021')
    expect(r.valid).toBe(true)
    expect(r.result).not.toBeNull()
    expect(r.result!.name).toBe('JPMORGAN CHASE')
    expect(r.result!.networks).toEqual(['ACH', 'Fedwire'])
  })

  it('valid checksum + not in directory → valid:true, result:null', () => {
    // 111000025 passes ABA checksum but is not in fixture
    const r = validate('111000025')
    expect(r.valid).toBe(true)
    expect(r.result).toBeNull()
  })

  it('invalid checksum → valid:false, result:null', () => {
    const r = validate('021000022')
    expect(r.valid).toBe(false)
    expect(r.result).toBeNull()
  })

  it('non-digit input → valid:false', () => {
    expect(validate('abcdefghi').valid).toBe(false)
  })

  it('wrong length → valid:false', () => {
    expect(validate('12345').valid).toBe(false)
    expect(validate('').valid).toBe(false)
  })
})

describe('re-exports', () => {
  it('validateABA exported from index', () => {
    expect(typeof validateABA).toBe('function')
    expect(validateABA('021000021')).toBe(true)
  })

  it('lookup exported from index', () => {
    expect(typeof lookup).toBe('function')
    const r = lookup('026009593')
    expect(r?.name).toBe('BANK OF AMERICA NA')
  })
})
