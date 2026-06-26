import mongoose, { Document, Schema } from 'mongoose';
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'learner' | 'tutor' | 'admin';
  avatar?: string;
  approved: boolean;
  emailVerified: boolean;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  refreshTokenHash?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  techLevel?: 'beginner' | 'intermediate' | 'advanced';
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  onboardingComplete: boolean;
  plan: 'free' | 'pro';
  planActivatedAt?: Date;
  planExpiresAt?: Date;
  adminPinFailCount?: number;
  adminPinLockedUntil?: Date;
  xp: number;
  streak: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['learner', 'tutor', 'admin'], default: 'learner' },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    avatar: { type: String },
    approved: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    refreshTokenHash: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpiry: { type: Date },
    techLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    onboardingComplete: { type: Boolean, default: false },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    planActivatedAt: { type: Date },
    planExpiresAt: { type: Date },
    adminPinFailCount: { type: Number, default: 0 },
    adminPinLockedUntil: { type: Date },
  },
  { timestamps: true }
);
export default mongoose.model<IUser>('User', UserSchema);
