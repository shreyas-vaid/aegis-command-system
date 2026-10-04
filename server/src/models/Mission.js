import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  missionId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  disasterType: {
    type: String,
    required: true,
    default: 'FLASH_FLOOD'
  },
  severity: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE', 'CRITICAL'],
    default: 'CRITICAL'
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'RESOLVED', 'ARCHIVED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

const Mission = mongoose.models.Mission || mongoose.model('Mission', missionSchema);
export default Mission;
