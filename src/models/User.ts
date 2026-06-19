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
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['learner', 'tutor', 'admin'], default: 'learner' },
    avatar: { type: String },
    approved: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    refreshTokenHash: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpiry: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
