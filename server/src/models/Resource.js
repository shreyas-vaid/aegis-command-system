import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  missionId: { type: String, required: true, default: '027' },
  type: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['AVAILABLE', 'DEPLOYED', 'EN_ROUTE', 'STANDBY'], default: 'AVAILABLE' },
  currentZone: { type: String, default: 'A' },
  capacity: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  deployed: {
    A: { type: Number, default: 0 },
    B: { type: Number, default: 0 },
    C: { type: Number, default: 0 },
    D: { type: Number, default: 0 },
    E: { type: Number, default: 0 }
  }
}, { timestamps: true });

resourceSchema.index({ missionId: 1, type: 1 });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;

