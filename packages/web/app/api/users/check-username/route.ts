import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    })

    return NextResponse.json({
      exists: !!existingUser,
      available: !existingUser,
    })
  } catch (error) {
    console.error("Username check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
