import { NextRequest, NextResponse } from "next/server"

export async function POST(_request: NextRequest) {
  try {
    // In a real application, you might want to blacklist the token
    // or remove it from a database/Redis store

    return NextResponse.json({
      success: true,
      message: "Successfully logged out",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
