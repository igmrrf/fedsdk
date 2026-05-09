import { describe, expect, it } from 'bun:test'

// Unit-test the parse logic extracted from sync.mjs by re-implementing inline
// (avoids network calls; tests the parsing logic independently)

function parseACH(text: string): Record<string, { name: string; ach: boolean; wire: boolean }> {
  const map: Record<string, { name: string; ach: boolean; wire: boolean }> = {}
  for (const line of text.split('\n')) {
    if (line.length < 71) continue
    const rtn = line.slice(0, 9).trim()
    const name = line.slice(35, 71).trim()
    if (!rtn || !name) continue
    if (!map[rtn]) map[rtn] = { name: '', ach: false, wire: false }
    map[rtn].name = name
    map[rtn].ach = true
  }
  return map
}

function parseWire(
  text: string,
  map: Record<string, { name: string; ach: boolean; wire: boolean }>,
) {
  for (const line of text.split('\n')) {
    if (line.length < 65) continue
    const rtn = line.slice(0, 9).trim()
    const name = line.slice(27, 63).trim()
    if (!rtn || !name) continue
    if (!map[rtn]) map[rtn] = { name: '', ach: false, wire: false }
    if (!map[rtn].name) map[rtn].name = name
    map[rtn].wire = true
  }
  return map
}

// Craft minimal fixed-width lines matching FedACH / Fedwire formats
const achLine = (rtn: string, name: string) => {
  // cols 0-8: routing, 9-34: filler (26 chars), 35-70: name (36 chars)
  const filler = ' '.repeat(26)
  const paddedName = name.padEnd(36).slice(0, 36)
  return `${rtn}${filler}${paddedName}  ` // >71 chars total
}

const wireLine = (rtn: string, name: string) => {
  // cols 0-8: routing, 9-26: telegraphic name (18 chars), 27-62: name (36 chars)
  const tele = ' '.repeat(18)
  const paddedName = name.padEnd(36).slice(0, 36)
  return `${rtn}${tele}${paddedName}  ` // >65 chars total
}

describe('parseACH', () => {
  it('parses a single ACH line', () => {
    const text = achLine('021000021', 'JPMORGAN CHASE')
    const map = parseACH(text)
    expect(map['021000021']).toEqual({ name: 'JPMORGAN CHASE', ach: true, wire: false })
  })

  it('skips short lines', () => {
    const map = parseACH('short\n')
    expect(Object.keys(map)).toHaveLength(0)
  })

  it('deduplicates entries (last name wins)', () => {
    const text = [achLine('021000021', 'NAME ONE'), achLine('021000021', 'NAME TWO')].join('\n')
    const map = parseACH(text)
    expect(map['021000021'].name).toBe('NAME TWO')
    expect(Object.keys(map)).toHaveLength(1)
  })
})

describe('parseWire', () => {
  it('adds wire flag to existing ACH entry without overwriting name', () => {
    const achMap = { '021000021': { name: 'JPMORGAN CHASE', ach: true, wire: false } }
    const text = wireLine('021000021', 'JPMC WIRE NAME')
    const map = parseWire(text, achMap)
    // name should NOT be overwritten — ACH name takes precedence
    expect(map['021000021'].name).toBe('JPMORGAN CHASE')
    expect(map['021000021'].wire).toBe(true)
  })

  it('creates new entry for wire-only routing number', () => {
    const text = wireLine('026009593', 'BANK OF AMERICA')
    const map = parseWire(text, {})
    expect(map['026009593']).toEqual({ name: 'BANK OF AMERICA', ach: false, wire: true })
  })

  it('skips short lines', () => {
    const map = parseWire('short\n', {})
    expect(Object.keys(map)).toHaveLength(0)
  })
})

describe('parseACH + parseWire combined', () => {
  it('produces correct flags for ACH-only, wire-only, and both', () => {
    const achText = achLine('111000025', 'FRB DALLAS')
    const wireText = [wireLine('111000025', 'FRB DALLAS WIRE'), wireLine('026009593', 'BOFA')].join(
      '\n',
    )
    let map = parseACH(achText)
    map = parseWire(wireText, map)

    expect(map['111000025']).toEqual({ name: 'FRB DALLAS', ach: true, wire: true })
    expect(map['026009593']).toEqual({ name: 'BOFA', ach: false, wire: true })
  })
})
