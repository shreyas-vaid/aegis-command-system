import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  missionId: {
    type: String,
    required: true,
    default: '027'
  },
  type: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE', 'CRITICAL'],
    default: 'HIGH'
  },
  source: {
    type: String,
    default: 'Sensor Array'
  },
  confidence: {
    type: Number,
    default: 90
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CONTAINED', 'RESOLVED'],
    default: 'ACTIVE'
  },
  timestamp: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

incidentSchema.index({ missionId: 1 });

const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);
export default Incident;
