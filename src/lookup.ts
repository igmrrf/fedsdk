import { createRequire } from 'node:module'
import type { RoutingEntry, LookupResult } from './types'

const _require = createRequire(import.meta.url)

let _db: Record<string, RoutingEntry> | null = null

function getDb(): Record<string, RoutingEntry> {
  if (_db) return _db
  try {
    _db = _require('../data/data.json') as Record<string, RoutingEntry>
  } catch {
    _db = {}
  }
  return _db
}

export function lookup(rn: string): LookupResult | null {
  const db = getDb()
  const entry = db[rn]
  if (!entry) return null
  return {
    routingNumber: rn,
    name: entry.name,
    ach: entry.ach,
    wire: entry.wire,
    networks: [
      ...(entry.ach ? (['ACH'] as const) : []),
      ...(entry.wire ? (['Fedwire'] as const) : []),
    ],
  }
}

/** Inject a custom database (useful for testing or offline use). */
export function _setDb(db: Record<string, RoutingEntry>): void {
  _db = db
}
