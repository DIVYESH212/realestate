import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
  },
  order: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model('Stage', stageSchema);
