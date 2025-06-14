import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    )
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid wallet address format" },
      { status: 400 }
    )
  }

  try {
    await dbConnect()

    const user = await User.findOne({ address: address.toLowerCase() }).lean()

    if (user) {
      return NextResponse.json({ exists: true, user }, { status: 200 })
    } else {
      return NextResponse.json({ exists: false }, { status: 200 })
    }
  } catch (error) {
    console.error("Error checking user existence:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
