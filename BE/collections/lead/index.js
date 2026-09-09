import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
    trim: true,
  },
  email: {
    type: String,
    default: '',
    trim: true,
  },
  mobilenumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  leadsource: {
    type: String,
    enum: ['website', 'referral', 'social media', 'other'],
    default: 'other'
  },
  market_segment: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'other'],
    default: 'other'
  },
  leadstatus: {
    type: String,
    default: 'New Leads'
  },
  stage_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage'
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    default: null
  },
  ownername: {
    type: String,
  },
  ownermailingaddress: {
    type: String,   
  },
  propertyAddress: {
    type: String,
    default: ''
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true,
  },
  estimatedvalue: {
    type: Number,
  },
  estimatedtotallens: {
    type: Number,
  },
  estimatedequity: {
    type: Number,
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  zip: {
    type: String,
    default: ''
  },
  propertytype: {
    type: String,
    default: ''
  },
  loanamount: {
    type: Number,
  },
  loaninterest: {
    type: Number,
  },
  loanterm: {
    type: Number,
  },
  loanduration: {
    type: Number,
  },
  loanpayment: {
    type: Number,
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
