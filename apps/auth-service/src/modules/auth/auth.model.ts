import { Schema, model, Types } from 'mongoose';

export interface IRefreshToken {
  token: string;
  expiresAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerificationToken: string;
  emailVerificationExpiredAt: Date | null;
  phoneOtp: string | null;
  phoneOtpExpiredAt: Date | null;
  refreshTokens: Types.DocumentArray<IRefreshToken>;
  isActive: boolean;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpiredAt: Date,
    phoneOtp: String,
    phoneOtpExpiredAt: Date,
    refreshTokens: [refreshTokenSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', userSchema);
