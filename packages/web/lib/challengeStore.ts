// Shared challenge store for authentication
// In production, this should be replaced with Redis or a database

// Make the challenge store persistent across hot reloads in development
declare global {
  var _challengeStore:
    | Map<string, { message: string; timestamp: number }>
    | undefined
}

// Initialize the store with global persistence for development
let store: Map<string, { message: string; timestamp: number }>

if (process.env.NODE_ENV === "development") {
  // In development, use global to persist across hot reloads
  if (!globalThis._challengeStore) {
    globalThis._challengeStore = new Map<
      string,
      { message: string; timestamp: number }
    >()
    console.log(
      "[CHALLENGE_STORE] Initialized new global challenge store for development"
    )
  } else {
    console.log(
      "[CHALLENGE_STORE] Reusing existing global challenge store for development"
    )
  }
  store = globalThis._challengeStore
} else {
  // In production, use a regular Map
  store = new Map<string, { message: string; timestamp: number }>()
  console.log(
    "[CHALLENGE_STORE] Initialized new challenge store for production"
  )
}

export const challengeStore = store

// Clean expired challenges (older than 30 minutes) - very conservative
export const cleanExpiredChallenges = () => {
  const now = Date.now()
  const expirationTime = 30 * 60 * 1000 // 30 minutes (very generous)

  let cleanedCount = 0
  const toDelete: string[] = []

  challengeStore.forEach((challenge, address) => {
    if (now - challenge.timestamp > expirationTime) {
      toDelete.push(address)
      cleanedCount++
    }
  })

  // Delete after iteration to avoid concurrent modification
  toDelete.forEach((address) => {
    challengeStore.delete(address)
    console.log(`[CLEANUP] Removed expired challenge for address: ${address}`)
  })

  if (cleanedCount > 0) {
    console.log(
      `[CLEANUP] Cleaned ${cleanedCount} expired challenges. Remaining: ${challengeStore.size}`
    )
  }
}
