import { NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

// Nonce tracking to prevent replay attacks
const usedNonces = new Set<string>()
const MAX_NONCE_AGE = 30 * 60 * 1000 // 30 minutes

// Clean up old nonces periodically
setInterval(() => {
  // In production, this should be handled by a proper cache/database cleanup
  usedNonces.clear()
}, MAX_NONCE_AGE)

export interface VerifiedRequest extends NextRequest {
  verifiedAddress?: string
}

export function withSignatureVerification(
  handler: (req: VerifiedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    if (
      request.method !== "POST" &&
      request.method !== "PUT" &&
      request.method !== "DELETE"
    ) {
      // For non-sensitive methods, just pass through
      return handler(request as VerifiedRequest) // Cast here if handler expects VerifiedRequest
    }

    let originalParsedBody
    try {
      originalParsedBody = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }    try {
      const {
        signature,
        message,
        address: providedAddressInOriginalBody,
        originalChallenge,
      } = originalParsedBody

      if (!signature || !message || !providedAddressInOriginalBody) {
        return NextResponse.json(
          { error: "Missing signature, message, or address for verification." },
          { status: 400 }
        )
      }

      // Validate request origin and timestamp for additional security
      const origin = request.headers.get('origin')
      const referer = request.headers.get('referer')
      
      // In production, validate against allowed origins
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
      
      if (origin && !allowedOrigins.some(allowed => origin.includes(allowed))) {
        console.warn(`Suspicious request from origin: ${origin}`)
        // In production, you might want to reject this
        // return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 })
      }

      let parsedMessagePayload = message
      const messageToVerifyAgainstSignature =
        originalChallenge ||
        (typeof message === "string" ? message : JSON.stringify(message))

      // Generate a nonce from the message to prevent replay attacks
      const messageHash = ethers.keccak256(ethers.toUtf8Bytes(messageToVerifyAgainstSignature))
      if (usedNonces.has(messageHash)) {
        return NextResponse.json(
          { error: "Message has already been used (replay attack protection)" },
          { status: 400 }
        )
      }

      if (
        typeof parsedMessagePayload === "object" &&
        parsedMessagePayload.address &&
        parsedMessagePayload.address.toLowerCase() !==
          providedAddressInOriginalBody.toLowerCase()
      ) {
        return NextResponse.json(
          {
            error:
              "Address in message payload does not match provided address in original body.",
          },
          { status: 401 }
        )
      }

      let recoveredAddress
      try {
        recoveredAddress = ethers.verifyMessage(
          messageToVerifyAgainstSignature,
          signature
        )
      } catch (e) {
        console.error("Error with direct verifyMessage:", e)
        try {
          const messageHash = ethers.hashMessage(
            ethers.toUtf8Bytes(messageToVerifyAgainstSignature)
          )
          const sig = ethers.Signature.from(signature)
          recoveredAddress = ethers.recoverAddress(messageHash, sig)
        } catch (e2) {
          console.error("Error with manual signature verification:", e2)
          return NextResponse.json(
            { error: "Failed to verify signature format." },
            { status: 400 }
          )
        }
      }      if (
        recoveredAddress.toLowerCase() !==
        providedAddressInOriginalBody.toLowerCase()
      ) {
        return NextResponse.json(
          {
            error:
              "Signature verification failed. Invalid signature for the provided address.",
          },
          { status: 401 }
        )
      }

      // Mark this message as used to prevent replay attacks
      usedNonces.add(messageHash)

      // Construct the new body for the downstream handler
      const {
        signature: _sig,
        message: _msg, // This was the structured data or the string if no originalChallenge
        address: _providedAddr,
        originalChallenge: _oc,
        ...restOfOriginalBody // Contains fields like 'agreedToMarketing'
      } = originalParsedBody

      const newBodyForHandler = {
        ...restOfOriginalBody,
        // Spread the actual data that was part of the signed message structure (parsedMessagePayload)
        // If parsedMessagePayload was a string (e.g. just the challenge text, not typical for /api/users), wrap it.
        ...(typeof parsedMessagePayload === "object" &&
        parsedMessagePayload !== null
          ? parsedMessagePayload
          : { data: parsedMessagePayload }),
        address: recoveredAddress, // Crucially, overwrite/set address to the one recovered from the signature
      }

      // Create a new Request object to pass to the handler
      // The body must be a string, Blob, BufferSource, FormData, URLSearchParams, or ReadableStream.
      const newRequestInit: RequestInit = {
        method: request.method,
        headers: request.headers, // Pass original headers
        body: JSON.stringify(newBodyForHandler),
      }

      // Create a standard Request object. Next.js handlers are compatible.
      const downstreamRequest = new Request(request.url, newRequestInit)

      // Attach the verifiedAddress to the request object for explicit access if needed by the handler.
      // This requires casting to 'any' or to our 'VerifiedRequest' interface.
      ;(downstreamRequest as VerifiedRequest).verifiedAddress = recoveredAddress

      return handler(downstreamRequest as VerifiedRequest)
    } catch (error: any) {
      console.error("Signature verification error:", error)
      return NextResponse.json(
        { error: "Error verifying signature.", details: error.message },
        { status: 500 }
      )
    }
  }
}
