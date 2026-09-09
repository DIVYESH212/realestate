import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    mobilenumber: {
        type: String,
        required: false,
        default: '',
        trim: true,
    },
    email: {
        type: String,
        required: false,
        default: '',
        trim: true,
    },
    propertyAddress: {
        type: String,
        required: false,
        trim: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'hold', 'assign'],
        default: 'active',
    },
    lead_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
    }],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register',
        required: true
    },
    notes: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export default mongoose.model('Buyer', buyerSchema);
