import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { withRateLimit, rateLimitConfigs } from "@/lib/auth/rateLimit"

async function handleChallenge(request: NextRequest) {
  try {
    await connectDB()

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

    // Find or create user
    let user = await User.findOne({ address: normalizedAddress })

    // Check if there's already a recent challenge for this address
    if (user?.challenge) {
      const age = Date.now() - user.challenge.timestamp
      // If challenge is less than 1 minute old, return it instead of creating a new one
      if (age < 60000) {
        // 1 minute
        console.log(
          `[CHALLENGE] Returning existing challenge for address: ${normalizedAddress} (age: ${age}ms)`
        )
        return NextResponse.json({
          message: user.challenge.message,
          nonce: "existing",
          timestamp: user.challenge.timestamp,
        })
      }
    }

    const timestamp = Date.now()
    const nonce = crypto.randomBytes(16).toString("hex")

    const message = `Welcome to Celo Europe!\n\nPlease sign this message to authenticate.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`

    // Store challenge in user document
    if (!user) {
      user = new User({
        address: normalizedAddress,
        challenge: { message, timestamp },
      })
    } else {
      user.challenge = { message, timestamp }
    }

    await user.save()

    console.log(`[CHALLENGE] Created for address: ${normalizedAddress}`)
    console.log(`[CHALLENGE] Timestamp: ${timestamp}`)
    console.log(`[CHALLENGE] Stored in MongoDB successfully`)

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

// Apply rate limiting to the challenge endpoint
export const POST = withRateLimit(handleChallenge, rateLimitConfigs.challenge)
