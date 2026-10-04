import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  missionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  organizationId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Organization',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  disasterType: {
    type: String,
    required: true,
    enum: [
      'FLOOD',
      'FLASH_FLOOD',
      'FIRE',
      'EARTHQUAKE',
      'STORM',
      'INDUSTRIAL',
      'LANDSLIDE',
      'HEATWAVE',
      'OTHER'
    ],
    default: 'FLOOD'
  },
  locationName: {
    type: String,
    required: true,
    trim: true,
    default: 'Chandigarh'
  },
  latitude: {
    type: Number,
    required: true,
    default: 30.7333
  },
  longitude: {
    type: Number,
    required: true,
    default: 76.7794
  },
  severity: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE', 'CRITICAL'],
    default: 'HIGH'
  },
  status: {
    type: String,
    enum: ['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'],
    default: 'ACTIVE'
  },
  createdBy: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

const Mission = mongoose.models.Mission || mongoose.model('Mission', missionSchema);
export default Mission;
