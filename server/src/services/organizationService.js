import mongoose from 'mongoose';
import Organization from '../models/Organization.js';

export const DEFAULT_DEMO_ORG = {
  _id: 'org_demo_aegis_chandigarh',
  name: 'AEGIS DEMO RESPONSE',
  type: 'EMERGENCY_RESPONSE',
  location: 'Chandigarh',
  description: 'AEGIS Prototype Emergency Command & Multi-Agency Coordination Response'
};

/**
 * Ensures the default demo organization exists and returns it
 */
export async function getOrCreateDefaultOrg() {
  if (mongoose.connection.readyState === 1) {
    try {
      let org = await Organization.findOne({ name: DEFAULT_DEMO_ORG.name });
      if (!org) {
        org = await Organization.create({
          name: DEFAULT_DEMO_ORG.name,
          type: DEFAULT_DEMO_ORG.type,
          location: DEFAULT_DEMO_ORG.location,
          description: DEFAULT_DEMO_ORG.description
        });
      }
      return org;
    } catch (err) {
      console.warn('[AEGIS-ORG] Falling back to default demo organization:', err.message);
      return DEFAULT_DEMO_ORG;
    }
  }
  return DEFAULT_DEMO_ORG;
}
