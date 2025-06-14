import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { challengeStore, cleanExpiredChallenges } from "@/lib/challengeStore"

export async function POST(request: NextRequest) {
  try {
    // Don't clean up challenges during creation to avoid race conditions
    // cleanExpiredChallenges()

    const { address } = await request.json()

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      )
    }

    // Validate address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      )
    }
    const normalizedAddress = address.toLowerCase()

    // Check if there's already a recent challenge for this address
    const existingChallenge = challengeStore.get(normalizedAddress)
    if (existingChallenge) {
      const age = Date.now() - existingChallenge.timestamp
      // If challenge is less than 1 minute old, return it instead of creating a new one
      if (age < 60000) {
        // 1 minute
        console.log(
          `[CHALLENGE] Returning existing challenge for address: ${normalizedAddress} (age: ${age}ms)`
        )
        return NextResponse.json({
          message: existingChallenge.message,
          nonce: "existing",
          timestamp: existingChallenge.timestamp,
        })
      }
    }

    const timestamp = Date.now()
    const nonce = crypto.randomBytes(16).toString("hex")

    const message = `Welcome to Celo Europe!\n\nPlease sign this message to authenticate.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.` // Store challenge for verification with longer expiration
    challengeStore.set(normalizedAddress, { message, timestamp })

    // Verify challenge was stored correctly
    const storedChallenge = challengeStore.get(normalizedAddress)
    if (!storedChallenge) {
      console.error(
        `[CHALLENGE] CRITICAL: Failed to store challenge for address: ${normalizedAddress}`
      )
      return NextResponse.json(
        { error: "Failed to create challenge. Please try again." },
        { status: 500 }
      )
    }
    console.log(`[CHALLENGE] Created for address: ${normalizedAddress}`)
    console.log(
      `[CHALLENGE] Challenge store is global:`,
      !!globalThis.challengeStore
    )
    console.log(`[CHALLENGE] Timestamp: ${timestamp}`)
    console.log(`[CHALLENGE] Total challenges in store: ${challengeStore.size}`)
    console.log(
      `[CHALLENGE] All addresses in store:`,
      Array.from(challengeStore.keys())
    )
    console.log(
      `[CHALLENGE] Verification - stored timestamp: ${storedChallenge.timestamp}`
    )

    return NextResponse.json({
      message,
      nonce,
      timestamp,
    })
  } catch (error) {
    console.error("Challenge generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
