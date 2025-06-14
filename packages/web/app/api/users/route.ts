import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { address, username, email, name } = await request.json()

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

    // Check if username is taken (if provided)
    if (username) {
      const existingUser = await User.findOne({
        username: username.toLowerCase(),
        address: { $ne: normalizedAddress }, // Exclude current user
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        )
      }
    }

    // Find or create user
    let user = await User.findOne({ address: normalizedAddress })

    if (!user) {
      user = new User({ address: normalizedAddress })
    }

    // Update user information
    if (username) user.username = username.toLowerCase()
    if (email) user.email = email
    if (name) user.name = name

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
      },
    })
  } catch (error: any) {
    console.error("Save user error:", error)

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        { error: `${field} is already taken` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

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
      return NextResponse.json({
        success: false,
        user: null,
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        address: user.address,
        username: user.username,
        email: user.email,
        name: user.name,
        profile_picture_url: user.profile_picture_url,
        emoji_url: user.emoji_url,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
