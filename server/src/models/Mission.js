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
    trim: true
  },
  locationCountry: {
    type: String,
    trim: true,
    default: ''
  },
  locationRegion: {
    type: String,
    trim: true,
    default: ''
  },
  locationDisplayName: {
    type: String,
    trim: true,
    default: ''
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
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
