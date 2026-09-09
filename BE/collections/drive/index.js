import mongoose from 'mongoose';

const driveSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: { type: String, required: true, trim: true },
  folderPath: { type: String, default: '/', trim: true },
  publicUrl: { type: String, default: '' },
  isDirectory: { type: Boolean, default: false },
  size: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
  extension: { type: String, default: '' },
  category: { type: String, default: 'other' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('DriveItem', driveSchema);
