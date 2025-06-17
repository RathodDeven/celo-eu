import { NextRequest, NextResponse } from "next/server"
import { verifyMessage } from "viem"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { generateAuthToken, generateRefreshToken } from "@/lib/auth/jwt"
import { withRateLimit, rateLimitConfigs } from "@/lib/auth/rateLimit"

async function handleVerify(request: NextRequest) {
  try {
    await connectDB()

    const { address, signature, message } = await request.json()

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: "Address, signature, and message are required" },
        { status: 400 }
      )
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      )
    }

    const normalizedAddress = address.toLowerCase()
    console.log(
      `[VERIFY] Verification attempt for address: ${normalizedAddress}`
    )

    // Find user and check if challenge exists
    const user = await User.findOne({ address: normalizedAddress })
    if (!user?.challenge) {
      console.log(
        `[VERIFY] ERROR: No challenge found for address: ${normalizedAddress}`
      )
      return NextResponse.json(
        {
          error:
            "No challenge found for this address. Please request a new challenge.",
        },
        { status: 400 }
      )
    }

    console.log(`[VERIFY] Challenge found for address: ${normalizedAddress}`)
    console.log(`[VERIFY] Challenge timestamp: ${user.challenge.timestamp}`)
    console.log(
      `[VERIFY] Challenge age: ${Date.now() - user.challenge.timestamp}ms`
    )

    // Check if challenge has expired (30 minutes)
    const now = Date.now()
    const expirationTime = 30 * 60 * 1000 // 30 minutes
    if (now - user.challenge.timestamp > expirationTime) {
      console.log(
        `[VERIFY] Challenge expired for address: ${normalizedAddress}`
      )
      user.challenge = undefined
      await user.save()
      return NextResponse.json(
        { error: "Challenge has expired. Please request a new challenge." },
        { status: 400 }
      )
    }    // Verify that the message matches the stored challenge
    if (message !== user.challenge.message) {
      console.log(`[VERIFY] Message mismatch for address: ${normalizedAddress}`)
      console.log(
        `[VERIFY] Expected message length: ${user.challenge.message.length}`
      )
      console.log(`[VERIFY] Received message length: ${message.length}`)
      return NextResponse.json(
        { error: "Message does not match challenge" },
        { status: 400 }
      )
    }

    // Check for replay attacks by comparing against last verified challenge
    const currentChallengeHash = require('crypto').createHash('sha256')
      .update(user.challenge.message + user.challenge.timestamp)
      .digest('hex')
    
    if (user.lastVerifiedChallengeHash === currentChallengeHash) {
      console.log(`[VERIFY] Replay attack detected for address: ${normalizedAddress}`)
      return NextResponse.json(
        { error: "This challenge has already been used" },
        { status: 400 }
      )
    }

    console.log(
      `[VERIFY] Message verified successfully for address: ${normalizedAddress}`
    )

    try {
      // Verify the signature
      console.log(
        `[VERIFY] Starting signature verification for address: ${normalizedAddress}`
      )
      const isValid = await verifyMessage({
        address: address as `0x${string}`,
        message: message,
        signature: signature as `0x${string}`,
      })

      if (!isValid) {
        console.log(
          `[VERIFY] Invalid signature for address: ${normalizedAddress}`
        )
        // Don't delete challenge on invalid signature - allow retry
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        )
      }

      console.log(
        `[VERIFY] Signature verified successfully for address: ${normalizedAddress}`
      )
    // Only remove the challenge after successful verification
    // Also track used challenge to prevent replay attacks even if database fails
    const challengeHash = require('crypto').createHash('sha256')
      .update(user.challenge.message + user.challenge.timestamp)
      .digest('hex')
    
    user.challenge = undefined
    user.lastVerifiedChallengeHash = challengeHash
    user.lastVerified = new Date()
    await user.save()
    console.log(
      `[VERIFY] Challenge removed for address: ${normalizedAddress}`
    )// Generate secure JWT tokens
      const token = generateAuthToken(address)
      const refreshToken = generateRefreshToken(address)

      return NextResponse.json({
        success: true,
        token,
        refreshToken,
        address: normalizedAddress,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      })
    } catch (verificationError) {
      console.error("[VERIFY] Signature verification error:", verificationError)
      // Don't delete challenge on verification error - allow retry
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }    )
  }
}

// Apply rate limiting to the verify endpoint
export const POST = withRateLimit(handleVerify, rateLimitConfigs.verify)
