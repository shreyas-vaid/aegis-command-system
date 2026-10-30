import mongoose from 'mongoose';

const simulationSchema = new mongoose.Schema({
  missionId: {
    type: String,
    required: true,
    default: '027'
  },
  timeOffset: {
    type: Number,
    required: true,
    default: 0
  },
  actions: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

simulationSchema.index({ missionId: 1 });

const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', simulationSchema);
export default Simulation;
