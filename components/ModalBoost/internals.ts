import { MAX_MULTIPLIER } from "./index"

const MIN_MULTIPLIER = 1
const MIN_PRICE = 0.84
const MAX_PRICE = 2.5

export function calculatePriceForNextMultiplier(nextMultiplier: number) {
  if (nextMultiplier >= MAX_MULTIPLIER) return MAX_PRICE

  // Normalize to a 0 → 1 range
  const progress =
    (nextMultiplier - MIN_MULTIPLIER) / (MAX_MULTIPLIER - MIN_MULTIPLIER)

  // Use quadratic ease-out curve
  const curveFactor = progress ** 2 // Smoothly increases

  // Interpolate between MIN_PRICE and MAX_PRICE
  const price = MIN_PRICE + (MAX_PRICE - MIN_PRICE) * curveFactor

  return Number(price.toFixed(2))
}

export const tapPowerCurve = (
  multiplier: number, // e.g. 1.1 to 2.5
  maxPower = 4,
  curve = 0.6 // Lower means faster growth at start
): number => {
  if (multiplier < 1) return MIN_MULTIPLIER
  const NORMALIZED = (multiplier - 1) / (MAX_MULTIPLIER - 1) // normalize to 0-1
  const SCALED = Math.pow(NORMALIZED, curve)
  return MIN_MULTIPLIER + (maxPower - MIN_MULTIPLIER) * SCALED
}
