import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  address: string // Primary key - wallet address in lowercase
  username?: string
  email?: string
  name?: string
  profile_picture_url?: string
  emoji_url?: string
  agreedToMarketing?: boolean // Added field
  challenge?: {
    message: string
    timestamp: number
  }
  lastVerifiedChallengeHash?: string // For replay attack prevention
  lastVerified?: Date // Track when user last successfully authenticated
  created_at: Date
  updated_at: Date
}

const UserSchema: Schema = new Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^0x[a-fA-F0-9]{40}$/.test(v)
        },
        message: "Invalid Ethereum address format",
      },
    },
    username: {
      type: String,
      unique: true, // This already creates an index
      sparse: true, // Allow multiple null values but unique non-null values
      minlength: 3,
      maxlength: 30,
      validate: {
        validator: function (v: string) {
          return !v || /^[a-zA-Z0-9_]+$/.test(v)
        },
        message: "Username can only contain letters, numbers, and underscores",
      },
    },
    email: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: "Invalid email format",
      },
    },
    name: {
      type: String,
      maxlength: 100,
    },
    agreedToMarketing: {
      // Added field
      type: Boolean,
      default: false,
    },
    profile_picture_url: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v)
        },
        message: "Profile picture URL must be a valid HTTP/HTTPS URL",
      },
    },
    emoji_url: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v)
        },
        message: "Emoji URL must be a valid HTTP/HTTPS URL",
      },
    },    challenge: {
      message: String,
      timestamp: Number,
    },
    lastVerifiedChallengeHash: {
      type: String,
      // Used to prevent replay attacks
    },
    lastVerified: {
      type: Date,
      // Track successful authentications
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
