import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import {
  withSignatureVerification,
  VerifiedRequest,
} from "@/lib/auth/verifySignature" // Import VerifiedRequest

// Helper function to handle POST requests, wrapped with signature verification
// The request type here can be VerifiedRequest if you want to access request.verifiedAddress directly
const handlePost = async (request: VerifiedRequest) => {
  try {
    await connectDB()

    // The request object is the new one created by withSignatureVerification.
    // Its body contains the processed data with the verified address.
    const bodyData = await request.json()

    // Destructure from bodyData. The 'address' field here is the verified one.
    const {
      address: verifiedAddress, // This is the recoveredAddress from the signature
      username,
      email,
      name,
      agreedToMarketing,
    } = bodyData as {
      // Define a more specific type or cast as needed
      address: string
      username?: string
      email?: string
      name?: string
      agreedToMarketing?: boolean
      // Include other potential fields from parsedMessagePayload if they are not top-level
      data?: any // If parsedMessagePayload was a string and got wrapped
    }

    // You can also use request.verifiedAddress if you prefer, it's the same value
    // console.log("Address from request.verifiedAddress:", request.verifiedAddress);
    // console.log("Address from bodyData.address:", verifiedAddress);

    if (!verifiedAddress) {
      return NextResponse.json(
        {
          error:
            "Address could not be verified or is missing in processed body.",
        },
        { status: 401 }
      )
    }

    const normalizedAddress = verifiedAddress.toLowerCase()

    // Check if username is taken (if provided)
    if (username) {
      const existingUserByUsername = await User.findOne({
        username: username.toLowerCase(),
        address: { $ne: normalizedAddress }, // Exclude current user if they are renaming
      })

      if (existingUserByUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 } // 409 Conflict is more appropriate
        )
      }
    }

    let user = await User.findOne({ address: normalizedAddress })

    if (!user) {
      user = new User({ address: normalizedAddress })
    }

    // Update user information
    if (username) user.username = username.toLowerCase()
    if (email) user.email = email // Consider email verification flow for production
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
        }, // Improved error message
        { status: 409 } // 409 Conflict
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

// Wrap the handler with the verification middleware
export const POST = withSignatureVerification(handlePost)

async function handlePut(request: VerifiedRequest) {
  try {
    await connectDB()

    const bodyData = await request.json()

    // The request.verifiedAddress is the most reliable source for the address.
    const { verifiedAddress } = request

    if (!verifiedAddress) {
      return NextResponse.json(
        { error: "Address could not be verified from signature." },
        { status: 401 }
      )
    }

    // The withSignatureVerification middleware has already processed the body
    // and the actual data (name, email, etc.) should be directly in bodyData
    const { name, email } = bodyData as { name?: string; email?: string }

    // Basic validation: ensure at least one field to update is provided
    if (name === undefined && email === undefined) {
      return NextResponse.json(
        {
          error:
            "At least one field (name or email) must be provided for update.",
        },
        { status: 400 }
      )
    }
    // Add more specific validation if needed (e.g., email format)
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

    // Update fields if they are provided in the request body
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
    if (error.code === 11000) {
      // Handle potential unique constraint errors if any
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
        error: "Internal server error while updating user data.",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

export const PUT = withSignatureVerification(handlePut)

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
