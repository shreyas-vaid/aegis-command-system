import mongoose from 'mongoose';

export const VALID_REPORT_TYPES = [
  'FLOODING',
  'ROAD_BLOCKED',
  'INFRASTRUCTURE_DAMAGE',
  'MEDICAL',
  'FIRE',
  'POWER_FAILURE',
  'EVACUATION',
  'WATER_LEVEL',
  'OTHER'
];

export const VALID_REPORT_SEVERITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
];

export const VALID_REPORT_STATUSES = [
  'NEW',
  'REVIEWED',
  'RESOLVED',
  'DISMISSED'
];

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Organization',
    required: true,
    index: true
  },
  missionId: {
    type: String,
    required: true,
    index: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submitterName: {
    type: String,
    default: 'Field Operator'
  },
  submitterCallsign: {
    type: String,
    default: 'OPERATOR'
  },
  submitterRole: {
    type: String,
    default: 'FIELD_OPERATOR'
  },
  locationName: {
    type: String,
    required: true,
    trim: true
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
  type: {
    type: String,
    required: true,
    enum: VALID_REPORT_TYPES
  },
  severity: {
    type: String,
    required: true,
    enum: VALID_REPORT_SEVERITIES,
    default: 'MEDIUM'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    required: true,
    enum: VALID_REPORT_STATUSES,
    default: 'NEW'
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report;
