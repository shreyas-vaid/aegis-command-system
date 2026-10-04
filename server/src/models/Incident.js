import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incidentId: { type: Number, required: true },
  missionId: { type: String, required: true },
  type: { type: String, required: true },
  zone: { type: String },
  location: { type: String },
  source: { type: String },
  severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE', 'CRITICAL'], default: 'HIGH' },
  confidence: { type: Number, default: 50 },
  summary: { type: String },
  timestamp: { type: String },
  status: { type: String, enum: ['ACTIVE', 'CONTAINED', 'RESOLVED'], default: 'ACTIVE' }
}, { timestamps: true });

incidentSchema.index({ missionId: 1 });

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
