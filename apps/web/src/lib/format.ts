export function variance(arr: number[]): number {
  if (arr.length === 0) return 0
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export function fmtNum(n: number, digits = 2): string {
  return Number.isFinite(n) ? n.toFixed(digits) : '—'
}

export function fmtElapsed(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}
