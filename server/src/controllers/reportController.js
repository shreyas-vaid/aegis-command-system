import mongoose from 'mongoose';
import Report, { 
  VALID_REPORT_TYPES, 
  VALID_REPORT_SEVERITIES, 
  VALID_REPORT_STATUSES 
} from '../models/Report.js';
import { findMissionById } from './missionController.js';

// In-memory reports fallback for test environments or demo mode
const inMemoryReports = new Map();

// Seed initial demo reports for Scenario 027
export const DEMO_REPORTS = [
  {
    reportId: "REP-027-1",
    missionId: "027",
    organizationId: "demo-org-default",
    locationName: "Sector 17 Underpass",
    latitude: 30.7398,
    longitude: 76.7827,
    type: "FLOODING",
    severity: "HIGH",
    description: "Culvert overflow backing up into primary commercial avenue. Water depth estimated at 0.6m and rising.",
    status: "REVIEWED",
    isDemo: true,
    submitterName: "Patrol Unit Alpha-2",
    submitterCallsign: "ECHO-2",
    submitterRole: "FIELD_OPERATOR",
    createdAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    reportId: "REP-027-2",
    missionId: "027",
    organizationId: "demo-org-default",
    locationName: "Road 17 Culvert Bridge",
    latitude: 30.7301,
    longitude: 76.7725,
    type: "ROAD_BLOCKED",
    severity: "CRITICAL",
    description: "Debris flow breached eastern embankment. Culvert compromised. Road completely impassable to civilian vehicles.",
    status: "NEW",
    isDemo: true,
    submitterName: "Civil Defense Scout 4",
    submitterCallsign: "SCOUT-4",
    submitterRole: "FIELD_OPERATOR",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
  },
  {
    reportId: "REP-027-3",
    missionId: "027",
    organizationId: "demo-org-default",
    locationName: "Zone E Communications Hub",
    latitude: 30.7215,
    longitude: 76.7890,
    type: "POWER_FAILURE",
    severity: "HIGH",
    description: "Backup generator submerged. Optical telemetry link severed. Sector in communication blackout.",
    status: "NEW",
    isDemo: true,
    submitterName: "Telecom Field Tech",
    submitterCallsign: "COMMS-7",
    submitterRole: "FIELD_OPERATOR",
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  }
];

// Initialize demo reports in memory
DEMO_REPORTS.forEach(rep => inMemoryReports.set(rep.reportId, { ...rep }));

/**
 * Helper to check organization access between user and mission
 */
function verifyOrgAccess(req, mission, isDemoMission = false) {
  if (isDemoMission) return true;
  if (!req.user || !req.user.organizationId) return false;
  if (!mission.organizationId) return true;
  return mission.organizationId.toString() === req.user.organizationId.toString();
}

/**
 * GET /api/missions/:id/reports
 * Retrieve field intelligence reports strictly for the operation and authenticated user's organization.
 */
export async function getMissionReports(req, res) {
  try {
    const targetMissionId = req.params.id;
    const isDemoMission = targetMissionId === '027';

    // Unauthenticated access restricted to demo mission preview
    if (!isDemoMission && !req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required to view operational field reports'
      });
    }

    // 1. Resolve mission
    let mission = await findMissionById(targetMissionId);
    if (!mission && isDemoMission) {
      mission = { missionId: '027', name: 'Flash Flood Cascade', organizationId: 'demo-org-default' };
    }

    if (!mission) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    // 2. Organization access verification
    if (!verifyOrgAccess(req, mission, isDemoMission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You do not have permission to view reports from another organization'
      });
    }

    const missionQueryId = mission.missionId || targetMissionId;

    // 3. Retrieve reports from DB or memory
    if (mongoose.connection.readyState === 1) {
      let reports = await Report.find({ missionId: missionQueryId }).sort({ createdAt: -1 }).lean();

      // If demo mission has no reports in DB yet, seed demo reports
      if (reports.length === 0 && isDemoMission) {
        reports = DEMO_REPORTS;
      }

      return res.status(200).json(reports);
    } else {
      const list = Array.from(inMemoryReports.values())
        .filter(r => r.missionId === missionQueryId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(list);
    }
  } catch (err) {
    console.error('[AEGIS-REPORT] Fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve field reports', details: err.message });
  }
}

/**
 * POST /api/missions/:id/reports
 * Submit a human operational observation / field intelligence report.
 */
export async function createMissionReport(req, res) {
  try {
    const targetMissionId = req.params.id;
    const isDemoMission = targetMissionId === '027';

    // 1. Resolve mission
    let mission = await findMissionById(targetMissionId);
    if (!mission && isDemoMission) {
      mission = {
        missionId: '027',
        name: 'Flash Flood Cascade',
        organizationId: req.user?.organizationId || 'demo-org-default',
        latitude: 30.7333,
        longitude: 76.7794,
        locationName: 'Chandigarh'
      };
    }

    if (!mission) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    // 2. Organization access verification
    if (!verifyOrgAccess(req, mission, isDemoMission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: Cannot submit reports to an operation belonging to another organization'
      });
    }

    // 3. Role authorization (VIEWER cannot create reports)
    if (req.user?.role === 'VIEWER') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Operator role VIEWER has read-only clearance. Field report submission requires OPERATOR or COMMANDER role.'
      });
    }

    // 4. Validate input fields
    const {
      locationName,
      latitude,
      longitude,
      type,
      severity = 'MEDIUM',
      description
    } = req.body || {};

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (description.trim().length > 2000) {
      return res.status(400).json({ error: 'Description exceeds maximum allowed length of 2000 characters' });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Report type is required' });
    }
    const normType = type.toUpperCase().trim();
    if (!VALID_REPORT_TYPES.includes(normType)) {
      return res.status(400).json({
        error: `Invalid report type: '${type}'. Allowed: ${VALID_REPORT_TYPES.join(', ')}`
      });
    }

    const normSeverity = (severity || 'MEDIUM').toUpperCase().trim();
    if (!VALID_REPORT_SEVERITIES.includes(normSeverity)) {
      return res.status(400).json({
        error: `Invalid severity: '${severity}'. Allowed: ${VALID_REPORT_SEVERITIES.join(', ')}`
      });
    }

    // Coordinates fallback to mission location if not explicitly provided
    let numLat = latitude !== undefined ? Number(latitude) : mission.latitude;
    let numLng = longitude !== undefined ? Number(longitude) : mission.longitude;

    if (isNaN(numLat) || numLat < -90 || numLat > 90) {
      return res.status(400).json({ error: 'Invalid latitude. Must be between -90 and 90' });
    }
    if (isNaN(numLng) || numLng < -180 || numLng > 180) {
      return res.status(400).json({ error: 'Invalid longitude. Must be between -180 and 180' });
    }

    const reportLocationName = (locationName && String(locationName).trim()) 
      ? String(locationName).trim() 
      : (mission.locationName || 'Theater Area');

    // 5. Derive trusted identity from authentication token (NEVER from body)
    const organizationId = req.user.organizationId;
    const submittedBy = req.user._id || req.user.id;
    const submitterName = req.user.name || 'Field Operator';
    const submitterCallsign = req.user.callsign || req.user.name || 'OPERATOR';
    const submitterRole = req.user.role || 'FIELD_OPERATOR';

    const reportId = `REP-${Date.now().toString().slice(-4)}`;

    const reportData = {
      reportId,
      organizationId,
      missionId: mission.missionId || targetMissionId,
      submittedBy,
      submitterName,
      submitterCallsign,
      submitterRole,
      locationName: reportLocationName,
      latitude: numLat,
      longitude: numLng,
      type: normType,
      severity: normSeverity,
      description: description.trim(),
      status: 'NEW',
      isDemo: isDemoMission
    };

    if (mongoose.connection.readyState === 1) {
      const newReport = await Report.create(reportData);
      return res.status(201).json({
        message: 'Field report transmitted successfully',
        report: newReport
      });
    } else {
      const mockReport = {
        _id: 'rep_' + Date.now().toString(36),
        ...reportData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryReports.set(reportId, mockReport);
      return res.status(201).json({
        message: 'Field report transmitted successfully (in-memory mode)',
        report: mockReport
      });
    }
  } catch (err) {
    console.error('[AEGIS-REPORT] Creation error:', err.message);
    return res.status(500).json({ error: 'Failed to create field report', details: err.message });
  }
}

/**
 * GET /api/missions/:id/reports/:reportId
 * Retrieve full intelligence detail for a single field report.
 */
export async function getMissionReportById(req, res) {
  try {
    const { id: targetMissionId, reportId } = req.params;
    const isDemoMission = targetMissionId === '027';

    // Unauthenticated access restricted to demo mission preview
    if (!isDemoMission && !req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required to view field report detail'
      });
    }

    // 1. Resolve mission
    let mission = await findMissionById(targetMissionId);
    if (!mission && isDemoMission) {
      mission = { missionId: '027', name: 'Flash Flood Cascade', organizationId: 'demo-org-default' };
    }

    if (!mission) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    // 2. Organization access verification
    if (!verifyOrgAccess(req, mission, isDemoMission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You do not have permission to view operations from another organization'
      });
    }

    // 3. Resolve report
    let report = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(reportId)) {
        report = await Report.findById(reportId).lean();
      }
      if (!report) {
        report = await Report.findOne({ reportId }).lean();
      }
    } else {
      report = inMemoryReports.get(reportId) || 
        Array.from(inMemoryReports.values()).find(r => r._id === reportId || r.reportId === reportId);
    }

    if (!report) {
      return res.status(404).json({ error: 'Field report not found' });
    }

    // Verify report belongs to requested mission
    if (report.missionId !== (mission.missionId || targetMissionId)) {
      return res.status(404).json({ error: 'Field report not found for this operation' });
    }

    // Verify report belongs to user organization
    if (!isDemoMission && req.user?.organizationId) {
      if (report.organizationId && report.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: You cannot view reports belonging to another organization'
        });
      }
    }

    return res.status(200).json(report);
  } catch (err) {
    console.error('[AEGIS-REPORT] Get detail error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve field report', details: err.message });
  }
}

/**
 * PATCH /api/missions/:id/reports/:reportId
 * Update report status (NEW -> REVIEWED -> RESOLVED / DISMISSED) or content.
 */
export async function updateMissionReport(req, res) {
  try {
    const { id: targetMissionId, reportId } = req.params;
    const isDemoMission = targetMissionId === '027';

    // 1. Resolve mission
    let mission = await findMissionById(targetMissionId);
    if (!mission && isDemoMission) {
      mission = { missionId: '027', name: 'Flash Flood Cascade', organizationId: 'demo-org-default' };
    }

    if (!mission) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    // 2. Organization access verification
    if (!verifyOrgAccess(req, mission, isDemoMission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You cannot modify operations from another organization'
      });
    }

    // 3. Resolve report
    let report = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(reportId)) {
        report = await Report.findById(reportId);
      }
      if (!report) {
        report = await Report.findOne({ reportId });
      }
    } else {
      report = inMemoryReports.get(reportId) || 
        Array.from(inMemoryReports.values()).find(r => r._id === reportId || r.reportId === reportId);
    }

    if (!report) {
      return res.status(404).json({ error: 'Field report not found' });
    }

    // 4. Role Authorization
    const userRole = req.user?.role || 'VIEWER';
    if (userRole === 'VIEWER') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Viewer role cannot modify field reports'
      });
    }

    // Field operators can only modify their own reports
    if (userRole === 'FIELD_OPERATOR') {
      const isOwner = report.submittedBy && (report.submittedBy.toString() === req.user._id.toString() || report.submittedBy.toString() === req.user.id.toString());
      if (!isOwner) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Field operators can only modify their own submitted reports'
        });
      }
    }

    // 5. Parse and validate updates
    const { status, description, severity, type } = req.body || {};
    const updates = {};

    if (status !== undefined) {
      const normStatus = String(status).toUpperCase().trim();
      if (!VALID_REPORT_STATUSES.includes(normStatus)) {
        return res.status(400).json({
          error: `Invalid status: '${status}'. Allowed: ${VALID_REPORT_STATUSES.join(', ')}`
        });
      }
      updates.status = normStatus;
      if (normStatus === 'REVIEWED' || normStatus === 'RESOLVED') {
        updates.reviewedBy = req.user._id || req.user.id;
        updates.reviewedAt = new Date();
      }
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ error: 'Description cannot be empty' });
      }
      if (description.trim().length > 2000) {
        return res.status(400).json({ error: 'Description exceeds maximum allowed length of 2000 characters' });
      }
      updates.description = description.trim();
    }

    if (severity !== undefined) {
      const normSev = String(severity).toUpperCase().trim();
      if (!VALID_REPORT_SEVERITIES.includes(normSev)) {
        return res.status(400).json({
          error: `Invalid severity: '${severity}'. Allowed: ${VALID_REPORT_SEVERITIES.join(', ')}`
        });
      }
      updates.severity = normSev;
    }

    if (type !== undefined) {
      const normType = String(type).toUpperCase().trim();
      if (!VALID_REPORT_TYPES.includes(normType)) {
        return res.status(400).json({
          error: `Invalid type: '${type}'. Allowed: ${VALID_REPORT_TYPES.join(', ')}`
        });
      }
      updates.type = normType;
    }

    // 6. Persist updates
    if (mongoose.connection.readyState === 1) {
      const updated = await Report.findByIdAndUpdate(
        report._id,
        { $set: updates },
        { new: true }
      ).lean();

      return res.status(200).json({
        message: 'Field report updated successfully',
        report: updated
      });
    } else {
      Object.assign(report, updates, { updatedAt: new Date().toISOString() });
      return res.status(200).json({
        message: 'Field report updated successfully (in-memory mode)',
        report
      });
    }
  } catch (err) {
    console.error('[AEGIS-REPORT] Update error:', err.message);
    return res.status(500).json({ error: 'Failed to update field report', details: err.message });
  }
}
