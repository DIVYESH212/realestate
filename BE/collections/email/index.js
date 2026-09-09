import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true
  },
  type: {
    type: String,
    enum: ['sent'],
    default: 'sent'
  },
  from: {
    type: String,
    trim: true,
    required: true
  },
  senderName: {
    type: String,
    trim: true
  },
  to: {
    type: String,
    required: true,
    trim: true
  },
  recipientName: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed'],
    default: 'sent'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Email', emailSchema);
