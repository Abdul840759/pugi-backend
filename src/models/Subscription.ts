import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: 'pro';
  status: 'active' | 'expired' | 'pending';
  startDate?: Date;
  expiryDate?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  paymentRequest?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['pro'], default: 'pro' },
    status: { type: String, enum: ['active', 'expired', 'pending'], default: 'pending' },
    startDate: { type: Date },
    expiryDate: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    paymentRequest: { type: Schema.Types.ObjectId, ref: 'PaymentRequest' },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
