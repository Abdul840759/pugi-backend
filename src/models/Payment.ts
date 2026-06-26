import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  reference: string;
  amount: number; // in kobo
  currency: string;
  plan: 'pro';
  status: 'pending' | 'success' | 'failed';
  paystackData?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    plan: { type: String, enum: ['pro'], default: 'pro' },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paystackData: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
