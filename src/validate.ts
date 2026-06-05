export function validateABA(rn: string): boolean {
  if (!/^\d{9}$/.test(rn)) return false

  let sum = 0
  sum += (rn.charCodeAt(0) - 48) * 3
  sum += (rn.charCodeAt(1) - 48) * 7
  sum += (rn.charCodeAt(2) - 48) * 1
  sum += (rn.charCodeAt(3) - 48) * 3
  sum += (rn.charCodeAt(4) - 48) * 7
  sum += (rn.charCodeAt(5) - 48) * 1
  sum += (rn.charCodeAt(6) - 48) * 3
  sum += (rn.charCodeAt(7) - 48) * 7
  sum += (rn.charCodeAt(8) - 48) * 1

  return sum % 10 === 0
}

