import mongoose from 'mongoose';

const registerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobilenumber: {
        type: String,
        required: true,
    },
    token: {
      type: String,
      default: undefined,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
}, { timestamps: true });

export default mongoose.model("Register", registerSchema);
