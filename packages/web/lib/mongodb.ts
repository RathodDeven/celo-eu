import mongoose from "mongoose"

// Determine which MongoDB URI to use based on environment
const isProduction = process.env.NEXT_PUBLIC_IS_PROD === "true"
const MONGO_DB_URI_KEY = isProduction
  ? "MONGO_DB_URI_PRODUCTION"
  : "MONGO_DB_URI_DEVELOPMENT"

if (!process.env[MONGO_DB_URI_KEY]) {
  throw new Error(`Please add your ${MONGO_DB_URI_KEY} to .env.local`)
}

const MONGODB_URI: string = process.env[MONGO_DB_URI_KEY]!

interface MongooseConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var _mongoose: MongooseConnection | undefined
}

let cached = global._mongoose

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached?.conn) {
    return cached.conn
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached!.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}

export default connectDB
