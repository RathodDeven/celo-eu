import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User, { IUser } from "@/lib/models/User"

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
    const user = (await User.findOne({
      address: address.toLowerCase(),
    }).lean()) as IUser | null

    if (user) {
      // Check if profile is complete (all required fields present)
      const hasName = !!(user.name && user.name.trim())
      const hasEmail = !!(user.email && user.email.trim())
      const hasUsername = !!(user.username && user.username.trim())
      const isProfileComplete = hasName && hasEmail && hasUsername

      return NextResponse.json(
        {
          exists: true,
          user,
          isProfileComplete,
          missingFields: {
            name: !hasName,
            email: !hasEmail,
            username: !hasUsername,
          },
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          exists: false,
          isProfileComplete: false,
          missingFields: {
            name: true,
            email: true,
            username: true,
          },
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Error checking user existence:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
