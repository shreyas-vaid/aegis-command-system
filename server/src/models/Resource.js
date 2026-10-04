import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  missionId: {
    type: String,
    required: true,
    default: '027'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'AMBULANCE',
      'RESCUE_TEAM',
      'MEDICAL_UNIT',
      'SHELTER',
      'COMMUNICATION_UNIT',
      'medical',
      'fire',
      'logistics',
      'engineering'
    ]
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'DEPLOYED', 'EN_ROUTE', 'STANDBY'],
    default: 'AVAILABLE'
  },
  currentZone: {
    type: String,
    default: 'A'
  },
  capacity: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

resourceSchema.index({ missionId: 1, type: 1 });

const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
export default Resource;
