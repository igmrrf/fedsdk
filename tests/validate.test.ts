import { describe, expect, it } from 'bun:test'
import { validateABA } from '../src/validate'

describe('validateABA', () => {
  it('accepts valid routing numbers', () => {
    // Real routing numbers with valid ABA checksums
    expect(validateABA('021000021')).toBe(true) // JPMorgan Chase
    expect(validateABA('021000089')).toBe(true) // Citibank NY
    expect(validateABA('021200339')).toBe(true) // JPMorgan Chase Bank
    expect(validateABA('011000138')).toBe(true) // BofA New England
    expect(validateABA('021300077')).toBe(true) // JPMorgan Chase
    expect(validateABA('026009593')).toBe(true) // BofA
    expect(validateABA('111000025')).toBe(true) // FRB Dallas
  })

  it('rejects routing numbers with bad checksum', () => {
    expect(validateABA('021000022')).toBe(false) // off by 1 from valid 021000021
    expect(validateABA('123456789')).toBe(false)
    expect(validateABA('999999999')).toBe(false)
  })

  it('accepts mathematically valid all-zero number (checksum = 0)', () => {
    // 000000000: sum = 0, passes ABA mod-10 — not a real bank but structurally valid
    expect(validateABA('000000000')).toBe(true)
  })

  it('rejects non-digit input', () => {
    expect(validateABA('02100002A')).toBe(false)
    expect(validateABA('abcdefghi')).toBe(false)
    expect(validateABA('021 00021')).toBe(false)
  })

  it('rejects wrong length', () => {
    expect(validateABA('')).toBe(false)
    expect(validateABA('02100002')).toBe(false)    // 8 digits
    expect(validateABA('0210000210')).toBe(false)  // 10 digits
    expect(validateABA('021000021 ')).toBe(false)  // trailing space
  })

  it('rejects leading zeros in wrong position (checksum still applies)', () => {
    expect(validateABA('000000001')).toBe(false)
    expect(validateABA('000000002')).toBe(false)
  })
})
