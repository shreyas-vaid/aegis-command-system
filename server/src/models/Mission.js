import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  missionId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String },
  disasterType: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE', 'CRITICAL'], default: 'HIGH' },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'RESOLVED', 'ARCHIVED'], default: 'ACTIVE' },
  time: { type: String },
  timeOffset: { type: Number, default: 0 },
  mode: { type: String, enum: ['LIVE', 'SIMULATION', 'CHESS'], default: 'LIVE' },
  weather: {
    rainfall: Number,
    wind: Number,
    visibility: Number,
    barometricPressure: Number,
    riverCrestMeters: Number,
    floodStage: String
  }
}, { timestamps: true });

const Mission = mongoose.model('Mission', missionSchema);
export default Mission;
