import http from 'http';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(body); } catch(e) { parsed = body; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('=== AEGIS 2.0 PHASE F: FIELD REPORTS VERIFICATION SUITE ===\n');

  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`[TEST 1] GET /api/health -> Status: ${health.status}`);

  // 2. Demo Mission 027 Field Reports Check (preview allowed)
  const m027Reports = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/missions/027/reports',
    method: 'GET'
  });
  console.log(`[TEST 2] GET /api/missions/027/reports -> Status: ${m027Reports.status}`);
  console.log(`        Demo Reports Count: ${m027Reports.data?.length}, First report: ${m027Reports.data?.[0]?.locationName} (${m027Reports.data?.[0]?.type})`);

  // 3. Register Commander Alpha (Org A), Field Operator Alpha (Org A), and Commander Bravo (Org B)
  const timestamp = Date.now();

  // Commander A in Org A
  const regCmdA = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Commander Alpha',
    callsign: `CMD-A-${timestamp}`,
    email: `cmdr.a.${timestamp}@aegis.mil`,
    password: 'Password123!',
    role: 'COMMANDER',
    organizationName: 'Alpha Regional Command'
  });
  const tokenCmdA = regCmdA.data?.token;
  const orgA = regCmdA.data?.user?.organizationId;
  console.log(`[TEST 3a] Register Commander A -> Token: ${!!tokenCmdA}, Org: ${orgA}`);

  // Field Operator A in Org A
  const regOpA = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Operator Scout Alpha',
    callsign: `SCOUT-A-${timestamp}`,
    email: `scout.a.${timestamp}@aegis.mil`,
    password: 'Password123!',
    role: 'FIELD_OPERATOR',
    organizationName: 'Alpha Regional Command'
  });
  const tokenOpA = regOpA.data?.token;
  console.log(`[TEST 3b] Register Operator A -> Token: ${!!tokenOpA}`);

  // Commander B in Org B
  const regCmdB = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Commander Bravo',
    callsign: `CMD-B-${timestamp}`,
    email: `cmdr.b.${timestamp}@aegis.mil`,
    password: 'Password123!',
    role: 'COMMANDER',
    organizationName: 'Bravo Maritime Command'
  });
  const tokenCmdB = regCmdB.data?.token;
  const orgB = regCmdB.data?.user?.organizationId;
  console.log(`[TEST 3c] Register Commander B -> Token: ${!!tokenCmdB}, Org: ${orgB}`);

  // 4. Commander A creates mission in Chandigarh
  const opChd = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/missions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCmdA}`
    }
  }, {
    name: 'Operation Northern Sentinel',
    description: 'Urban flood observation and mitigation',
    disasterType: 'FLOOD',
    locationName: 'Chandigarh Sector 17',
    latitude: 30.7333,
    longitude: 76.7794,
    status: 'ACTIVE'
  });
  const missionId = opChd.data?.mission?.missionId;
  console.log(`[TEST 4] Created Mission -> ID: ${missionId}`);

  // 5. Operator A creates field report with fake organizationId and fake submittedBy in body
  const createRep = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenOpA}`
    }
  }, {
    locationName: 'Sector 17 Plaza Culvert',
    latitude: 30.7398,
    longitude: 76.7827,
    type: 'FLOODING',
    severity: 'HIGH',
    description: 'Water level rising rapidly past primary drainage mark. Underpass submerged by 0.7m.',
    // Attack payloads that MUST be ignored/overridden:
    organizationId: 'FAKE_INJECTED_ORG_9999',
    submittedBy: 'FAKE_USER_INJECTED'
  });
  console.log(`[TEST 5] Operator A creates field report -> Status: ${createRep.status} (Expected 201)`);
  const reportId = createRep.data?.report?.reportId;
  console.log(`        Report ID: ${reportId}, Location: ${createRep.data?.report?.locationName}`);
  console.log(`        Assigned Org: ${createRep.data?.report?.organizationId} (Matches Org A: ${createRep.data?.report?.organizationId?.toString() === orgA?.toString()})`);
  console.log(`        Assigned Submitter: ${createRep.data?.report?.submitterCallsign}`);

  // 6. Retrieve reports feed for mission
  const feed = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenCmdA}` }
  });
  console.log(`[TEST 6] GET reports feed -> Status: ${feed.status}, Count: ${feed.data?.length}`);

  // 7. Get single report detail
  const detail = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports/${reportId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenCmdA}` }
  });
  console.log(`[TEST 7] GET single report detail -> Status: ${detail.status}, ID: ${detail.data?.reportId}, Status: ${detail.data?.status}`);

  // 8. Commander A updates report status: NEW -> REVIEWED
  const updateReview = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports/${reportId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCmdA}`
    }
  }, {
    status: 'REVIEWED'
  });
  console.log(`[TEST 8] Commander A updates status to REVIEWED -> Status: ${updateReview.status}, New Status: ${updateReview.data?.report?.status}`);

  // 9. Commander A resolves report: REVIEWED -> RESOLVED
  const updateResolve = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports/${reportId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCmdA}`
    }
  }, {
    status: 'RESOLVED'
  });
  console.log(`[TEST 9] Commander A updates status to RESOLVED -> Status: ${updateResolve.status}, New Status: ${updateResolve.data?.report?.status}`);

  // 10. Validation rejection: Invalid severity -> 400
  const invalidSev = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenOpA}`
    }
  }, {
    type: 'FLOODING',
    severity: 'SUPER_EXTREME_DOOM',
    description: 'Testing invalid severity rejection'
  });
  console.log(`[TEST 10] Reject invalid severity -> Status: ${invalidSev.status} (Expected 400)`);

  // 11. Validation rejection: Invalid type -> 400
  const invalidType = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenOpA}`
    }
  }, {
    type: 'ALIEN_INVASION',
    severity: 'HIGH',
    description: 'Testing invalid type rejection'
  });
  console.log(`[TEST 11] Reject invalid type -> Status: ${invalidType.status} (Expected 400)`);

  // 12. Security: Unauthenticated request to non-demo reports -> 401
  const unauthReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports`,
    method: 'GET'
  });
  console.log(`[TEST 12] Unauthenticated access to non-demo reports -> Status: ${unauthReq.status} (Expected 401)`);

  // 13. Security: Commander B (Org B) attempts to access Org A reports -> 403
  const crossOrgFeed = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenCmdB}` }
  });
  console.log(`[TEST 13] Cross-org reports access (Commander B -> Org A mission) -> Status: ${crossOrgFeed.status} (Expected 403)`);

  // 14. Security: Commander B attempts to submit report to Org A mission -> 403
  const crossOrgSubmit = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCmdB}`
    }
  }, {
    type: 'FIRE',
    severity: 'MEDIUM',
    description: 'Unauthorized cross-org report attempt'
  });
  console.log(`[TEST 14] Cross-org report submission (Commander B -> Org A mission) -> Status: ${crossOrgSubmit.status} (Expected 403)`);

  // 15. Regression: Weather telemetry still functioning for this mission
  const weatherRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/data/weather`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenCmdA}` }
  });
  console.log(`[TEST 15] Weather regression -> Status: ${weatherRes.status}, Source: ${weatherRes.data?.source}, Temp: ${weatherRes.data?.current?.temperature}°C`);

  console.log('\n=== ALL PHASE F VERIFICATION TESTS COMPLETE ===');
}

run().catch(console.error);
