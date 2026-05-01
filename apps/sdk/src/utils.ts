/**
 * Computes the statistical variance of an array of numbers.
 * Used by detection rules to identify unnaturally uniform timing patterns.
 *
 * A low variance on keystroke dwells or flights signals machine-generated input.
 */
export function computeVariance(arr: number[]): number {
  if (arr.length === 0) return 0
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length
}
