import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'GOVERNMENT',
      'EMERGENCY_RESPONSE',
      'NGO',
      'INDUSTRIAL',
      'HEALTHCARE',
      'TRAINING',
      'OTHER'
    ],
    default: 'EMERGENCY_RESPONSE'
  },
  location: {
    type: String,
    trim: true,
    default: 'Chandigarh'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
export default Organization;
