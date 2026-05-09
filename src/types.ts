export interface RoutingEntry {
  name: string
  ach: boolean
  wire: boolean
}

export interface LookupResult extends RoutingEntry {
  routingNumber: string
  networks: ('ACH' | 'Fedwire')[]
}

export interface ValidationResult {
  valid: boolean
  result: LookupResult | null
}
