# fedsdk

US ABA routing number validation against live FedACH + Fedwire directories.

[![npm](https://img.shields.io/npm/v/fedsdk)](https://www.npmjs.com/package/fedsdk)
[![license](https://img.shields.io/npm/l/fedsdk)](./LICENSE)

## Install

```bash
npm install fedsdk
# or
bun add fedsdk
```

## Usage

```ts
import { validate, validateABA, lookup } from 'fedsdk'

// Full validate: ABA checksum + directory lookup
validate('021000021')
// { valid: true, result: { routingNumber: '021000021', name: 'JPMORGAN CHASE', ach: true, wire: true, networks: ['ACH', 'Fedwire'] } }

// Checksum only (no directory hit)
validateABA('021000021') // true
validateABA('021000022') // false

// Directory lookup only
lookup('021000021')
// { routingNumber: '021000021', name: 'JPMORGAN CHASE', ach: true, wire: true, networks: ['ACH', 'Fedwire'] }

lookup('000000000') // null — not in directory
```

### Browser / Edge / Lightweight Usage

To use only the checksum validation (e.g., in browsers, Cloudflare Workers, Edge functions) without importing Node.js modules or loading the 750KB database, import from the `./validate` subpath:

```ts
import { validateABA } from 'fedsdk/validate'

validateABA('021000021') // true
```

## API

### `validate(rn: string): ValidationResult`

Runs ABA checksum **and** directory lookup. Returns `{ valid: false, result: null }` if checksum fails; `result` is `null` if the number is not in the FedACH/Fedwire directories even when the checksum passes.

### `validateABA(rn: string): boolean`

ABA mod-10 checksum only — no network or file I/O. Fast, synchronous.

### `lookup(rn: string): LookupResult | null`

Directory lookup only. Returns `null` if routing number is not found.

### Types

```ts
interface LookupResult {
  routingNumber: string
  name: string
  ach: boolean      // present in FedACH directory
  wire: boolean     // present in Fedwire directory
  networks: ('ACH' | 'Fedwire')[]
}

interface ValidationResult {
  valid: boolean
  result: LookupResult | null
}
```

## Data

Routing number data is sourced from the [Federal Reserve's FedACH and Fedwire directories](https://www.frbservices.org/financial-services/fednow/routing-transit-number.html), mirrored by [moov-io/fed](https://github.com/moov-io/fed). The dataset (~19,000 routing numbers) ships bundled with the package.

To refresh the data manually:

```bash
npm run sync
```

## License

MIT — see [LICENSE](./LICENSE)
