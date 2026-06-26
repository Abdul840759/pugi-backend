import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentRequest extends Document {
  user: mongoose.Types.ObjectId;
  receiptUrl: string;
  reference?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRequestSchema = new Schema<IPaymentRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiptUrl: { type: String, required: true },
    reference: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentRequest>('PaymentRequest', PaymentRequestSchema);
