import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String,
  senderAvatar: String,
  content: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participantName: String,
  participantAvatar: String,
  messages: [messageSchema],
  unreadCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Conversation = mongoose.model('Conversation', conversationSchema);
