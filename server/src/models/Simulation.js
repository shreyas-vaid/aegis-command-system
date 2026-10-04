import mongoose from 'mongoose';

const simulationSchema = new mongoose.Schema({
  simulationId: { type: String, required: true, unique: true },
  missionId: { type: String, required: true },
  timeOffset: { type: Number, required: true },
  actions: { type: mongoose.Schema.Types.Mixed, default: [] },
  result: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'COMPLETED' }
}, { timestamps: true });

simulationSchema.index({ missionId: 1 });

const Simulation = mongoose.model('Simulation', simulationSchema);
export default Simulation;
