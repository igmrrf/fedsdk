export { validateABA } from './validate'
export { lookup, _setDb } from './lookup'
export type { RoutingEntry, LookupResult, ValidationResult } from './types'

import { validateABA } from './validate'
import { lookup } from './lookup'
import type { ValidationResult } from './types'

export function validate(rn: string): ValidationResult {
  if (!validateABA(rn)) return { valid: false, result: null }
  return { valid: true, result: lookup(rn) }
}
