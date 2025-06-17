import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { withJWTAuth, AuthenticatedRequest } from "@/lib/auth/withJWTAuth"
import { withRateLimit, rateLimitConfigs } from "@/lib/auth/rateLimit"

// POST handler for creating/updating user profiles (JWT authenticated)
const handlePost = async (request: AuthenticatedRequest) => {
  try {
    await connectDB()

    const { verifiedAddress } = request
    const bodyData = await request.json()

    const {
      username,
      email,
      name,
      agreedToMarketing,
    } = bodyData as {
      username?: string
      email?: string
      name?: string
      agreedToMarketing?: boolean
    }

    if (!verifiedAddress) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      )
    }

    const normalizedAddress = verifiedAddress.toLowerCase()

    // Check if username is taken (if provided)
    if (username) {
      const existingUserByUsername = await User.findOne({
        username: username.toLowerCase(),
        address: { $ne: normalizedAddress },
      })

      if (existingUserByUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        )
      }
    }

    let user = await User.findOne({ address: normalizedAddress })

    if (!user) {
      user = new User({ address: normalizedAddress })
    }

    // Update user information
    if (username) user.username = username.toLowerCase()
    if (email) user.email = email
    if (name) user.name = name
    if (typeof agreedToMarketing === "boolean")
      user.agreedToMarketing = agreedToMarketing

    await user.save()

    return NextResponse.json({
      success: true,
      user: {
        address: user.address,
        username: user.username,
        email: user.email,
        name: user.name,
        profile_picture_url: user.profile_picture_url,
        emoji_url: user.emoji_url,
        agreedToMarketing: user.agreedToMarketing,
      },
    })
  } catch (error: any) {
    console.error("Save user error:", error)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        {
          error: `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is already in use.`,
        },
        { status: 409 }
      )
    }
    return NextResponse.json(
      {
        error: "Internal server error while saving user data.",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// PUT handler for updating user profiles (JWT authenticated)
async function handlePut(request: AuthenticatedRequest) {
  try {
    await connectDB()

    const { verifiedAddress } = request
    const bodyData = await request.json()

    if (!verifiedAddress) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      )
    }

    const { name, email } = bodyData as { name?: string; email?: string }

    // Basic validation
    if (name === undefined && email === undefined) {
      return NextResponse.json(
        {
          error: "At least one field (name or email) must be provided for update.",
        },
        { status: 400 }
      )
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const normalizedAddress = verifiedAddress.toLowerCase()
    const user = await User.findOne({ address: normalizedAddress })

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    // Update fields
    if (name !== undefined) user.name = name
    if (email !== undefined) user.email = email

    await user.save()

    return NextResponse.json({
      success: true,
      user: {
        address: user.address,
        username: user.username,
        email: user.email,
        name: user.name,
        profile_picture_url: user.profile_picture_url,
        emoji_url: user.emoji_url,
        agreedToMarketing: user.agreedToMarketing,
      },
    })
  } catch (error: any) {
    console.error("Update user error:", error)
    return NextResponse.json(
      {
        error: "Internal server error while updating user data.",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// Apply JWT authentication and rate limiting
export const POST = withRateLimit(
  withJWTAuth(handlePost),
  rateLimitConfigs.userUpdate
)

export const PUT = withRateLimit(
  withJWTAuth(handlePut),
  rateLimitConfigs.userUpdate
)

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const username = searchParams.get("username") // For username check

    if (username) {
      // Check username availability (case-insensitive)
      const existingUser = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
      })
      return NextResponse.json({ available: !existingUser })
    }

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
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
    const user = await User.findOne({ address: normalizedAddress })

    if (!user) {
      return NextResponse.json({ exists: false }, { status: 200 }) // User not found, but it's a valid check
    }

    return NextResponse.json({
      exists: true,
      user: {
        address: user.address,
        username: user.username,
        email: user.email,
        name: user.name,
        profile_picture_url: user.profile_picture_url,
        emoji_url: user.emoji_url,
        agreedToMarketing: user.agreedToMarketing,
      },
    })
  } catch (error: any) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
