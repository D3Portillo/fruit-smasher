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
