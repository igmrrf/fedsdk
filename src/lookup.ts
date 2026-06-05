import { createRequire } from 'node:module'
import type { RoutingEntry, LookupResult } from './types'

const _require = createRequire(import.meta.url)

let _db: Record<string, RoutingEntry | [string, number]> | null = null

function getDb(): Record<string, RoutingEntry | [string, number]> {
  if (_db) return _db
  try {
    _db = _require('../data/data.json') as Record<string, RoutingEntry | [string, number]>
  } catch {
    _db = {}
  }
  return _db
}

export function lookup(rn: string): LookupResult | null {
  const db = getDb()
  const entry = db[rn]
  if (!entry) return null

  let name: string
  let ach: boolean
  let wire: boolean

  if (Array.isArray(entry)) {
    const [n, flags] = entry
    name = n
    ach = (flags & 1) !== 0
    wire = (flags & 2) !== 0
  } else {
    name = entry.name
    ach = entry.ach
    wire = entry.wire
  }

  return {
    routingNumber: rn,
    name,
    ach,
    wire,
    networks: [
      ...(ach ? (['ACH'] as const) : []),
      ...(wire ? (['Fedwire'] as const) : []),
    ],
  }
}

/** Inject a custom database (useful for testing or offline use). */
export function _setDb(db: Record<string, RoutingEntry | [string, number]>): void {
  _db = db
}

