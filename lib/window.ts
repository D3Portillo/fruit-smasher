"use client"

export const vibrate = (pattern?: number | number[]) => {
  // Default to a short 50ms vibration if no pattern provided
  const defaultPattern = 50

  // Check if vibration is supported
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern || defaultPattern)
    return true
  }

  return false // Vibration not supported
}

export const VIBRATES = {
  tap: () => vibrate(50), // Quick tap
  doubleTap: () => vibrate([50, 50, 50]), // Double buzz
  success: () => vibrate([100, 50, 100]), // Success feel
  error: () => vibrate(200), // Long error buzz
  heartbeat: () => vibrate([100, 100, 100, 100]), // Heartbeat pattern
}
