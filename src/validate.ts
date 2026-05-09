// ABA mod-10 checksum: weights [3,7,1] × 3
const WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1]

export function validateABA(rn: string): boolean {
  if (!/^\d{9}$/.test(rn)) return false
  const sum = rn.split('').reduce((acc, d, i) => acc + parseInt(d, 10) * WEIGHTS[i], 0)
  return sum % 10 === 0
}
