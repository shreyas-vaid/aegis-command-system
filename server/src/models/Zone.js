import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  zoneId: { type: String, required: true },
  missionId: { type: String, required: true, default: '027' },
  name: { type: String, required: true },
  risk: { type: Number, default: 0 },
  population: { type: Number, default: 0 },
  health: { type: Number, default: 100 },
  roadAccess: { type: Number, default: 100 },
  roads: { type: Number, default: 100 },
  infrastructure: { type: Number, default: 100 },
  reports: { type: Number, default: 0 },
  connectivity: { type: Number, default: 100 },
  hospitalAccess: { type: Number, default: 100 },
  status: { type: String, default: 'STABLE' },
  type: { type: String },
  isUnknown: { type: Boolean, default: false },
  gpsActivity: { type: String, default: 'NORMAL' },
  imageryAge: { type: String },
  floodLevel: { type: Number, default: 0 },
  keyAsset: { type: String },
  coordinates: {
    x: Number,
    y: Number
  },
  previousRisk: { type: Number, default: 0 }
}, { timestamps: true });

zoneSchema.index({ missionId: 1, zoneId: 1 }, { unique: true });

const Zone = mongoose.model('Zone', zoneSchema);
export default Zone;

