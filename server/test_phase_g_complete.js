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
  console.log('=== AEGIS 2.0 PHASE G: DATA FUSION & WORLD STATE VERIFICATION ===\n');

  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`[TEST 1] GET /api/health -> Status: ${health.status}`);

  // 2. Demo Mission 027 Fused Intelligence Check (preview allowed)
  const m027Intel = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/missions/027/intelligence',
    method: 'GET'
  });
  console.log(`[TEST 2] GET /api/missions/027/intelligence -> Status: ${m027Intel.status}`);
  console.log(`        Overall Risk: ${m027Intel.data?.overallRisk?.score} (${m027Intel.data?.overallRisk?.level})`);
  console.log(`        Confidence: ${m027Intel.data?.confidence?.level} (${m027Intel.data?.confidence?.score}%)`);
  console.log(`        Information Gaps: ${m027Intel.data?.informationGap?.count} (${m027Intel.data?.informationGap?.level})`);
  console.log(`        Why Factors Count: ${m027Intel.data?.why?.length}`);
  console.log(`        Zones Intelligence Count: ${m027Intel.data?.zonesIntelligence?.length}`);
  console.log(`        Weather Source: ${m027Intel.data?.weather?.source || 'OFFLINE'}`);

  // 3. Register Commander Alpha (Org A) and Commander Bravo (Org B)
  const timestamp = Date.now();

  const regA = await makeRequest({
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
    organizationName: 'Alpha Unified Command'
  });
  const tokenA = regA.data?.token;
  const orgA = regA.data?.user?.organizationId;
  console.log(`[TEST 3a] Register Commander A -> Token: ${!!tokenA}, Org: ${orgA}`);

  const regB = await makeRequest({
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
    organizationName: 'Bravo Maritime Group'
  });
  const tokenB = regB.data?.token;
  const orgB = regB.data?.user?.organizationId;
  console.log(`[TEST 3b] Register Commander B -> Token: ${!!tokenB}, Org: ${orgB}`);

  // 4. Commander A creates mission in Chandigarh
  const opA = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/missions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, {
    name: 'Operation Trident Shield',
    description: 'Fused tactical flood containment',
    disasterType: 'FLOOD',
    locationName: 'Chandigarh',
    latitude: 30.7333,
    longitude: 76.7794,
    status: 'ACTIVE'
  });
  const missionId = opA.data?.mission?.missionId;
  console.log(`[TEST 4] Created Mission A -> ID: ${missionId}`);

  // 5. Authenticated user requests fused intelligence for their mission
  const intelA1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/intelligence`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`[TEST 5] Authenticated GET intelligence -> Status: ${intelA1.status} (Expected 200)`);
  console.log(`        Baseline Risk: ${intelA1.data?.overallRisk?.score} (${intelA1.data?.overallRisk?.level})`);
  console.log(`        Reports Count: ${intelA1.data?.reports?.total}`);
  console.log(`        Confidence: ${intelA1.data?.confidence?.level} (${intelA1.data?.confidence?.score}%)`);

  // 6. Security: Unauthenticated request to non-demo mission intelligence -> 401
  const unauthReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/intelligence`,
    method: 'GET'
  });
  console.log(`[TEST 6] Unauthenticated intelligence request -> Status: ${unauthReq.status} (Expected 401)`);

  // 7. Security: Commander B (Org B) requests Org A mission intelligence -> 403
  const crossOrgReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/intelligence`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  console.log(`[TEST 7] Cross-org intelligence request -> Status: ${crossOrgReq.status} (Expected 403)`);

  // 8. Deterministic Check: Requesting intelligence multiple times with same state returns same score
  const intelA2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/intelligence`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const sameScore = intelA1.data?.overallRisk?.score === intelA2.data?.overallRisk?.score;
  const sameLevel = intelA1.data?.overallRisk?.level === intelA2.data?.overallRisk?.level;
  console.log(`[TEST 8] Deterministic verification: Run 1 Score (${intelA1.data?.overallRisk?.score}) === Run 2 Score (${intelA2.data?.overallRisk?.score}) -> ${sameScore && sameLevel}`);

  // 9. Information Gap identification when no reports exist
  const hasNoReportsGap = intelA1.data?.informationGap?.gaps?.some(g => g.source === 'REPORTS');
  console.log(`[TEST 9] Information Gap flagged for 0 field reports -> ${hasNoReportsGap}`);

  // 10. Dynamic Fusion Shift: Submit a CRITICAL field report and re-query intelligence
  const newReport = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/reports`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, {
    locationName: 'Sector 17 Bridge Pylon',
    type: 'INFRASTRUCTURE_DAMAGE',
    severity: 'CRITICAL',
    description: 'Bridge support pylon fractured under high-velocity flood runoff.'
  });
  console.log(`[TEST 10a] Submitted CRITICAL field report -> Status: ${newReport.status} (ID: ${newReport.data?.report?.reportId})`);

  const intelA3 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/intelligence?refresh=true`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const scoreDelta = (intelA3.data?.overallRisk?.score || 0) - (intelA1.data?.overallRisk?.score || 0);
  console.log(`[TEST 10b] Re-queried intelligence after CRITICAL report:`);
  console.log(`         New Risk: ${intelA3.data?.overallRisk?.score} (${intelA3.data?.overallRisk?.level}), Delta: +${scoreDelta} pts`);
  console.log(`         Reports Active: ${intelA3.data?.reports?.total}, Critical: ${intelA3.data?.reports?.critical}`);
  console.log(`         Field Intelligence Contribution: ${intelA3.data?.breakdown?.reports}/30 pts`);

  // 11. WHY Explanation corresponds to actual data
  const whyFactors = intelA3.data?.why || [];
  const fieldWhy = whyFactors.find(w => w.factor === 'HUMAN FIELD INTELLIGENCE');
  console.log(`[TEST 11] Structured WHY Explanation factor:`);
  console.log(`         Factor: ${fieldWhy?.factor}, Impact: ${fieldWhy?.impact}, Contribution: ${fieldWhy?.contribution}`);
  console.log(`         Reason: "${fieldWhy?.reason}"`);

  // 12. Zone-level intelligence
  const zonesIntel = intelA3.data?.zonesIntelligence || [];
  console.log(`[TEST 12] Zones intelligence included -> Count: ${zonesIntel.length}, First Zone: ${zonesIntel[0]?.id} (${zonesIntel[0]?.level})`);

  // 13. Weather regression: Weather endpoint still functional
  const weatherReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionId}/data/weather`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`[TEST 13] Weather endpoint regression -> Status: ${weatherReq.status}, Source: ${weatherReq.data?.source}`);

  // 14. Simulation regression: Simulation endpoint still functional
  const simReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/simulate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, {
    action: 'EVACUATE_ZONE_D',
    timeHorizonMinutes: 60
  });
  console.log(`[TEST 14] Simulation endpoint regression -> Status: ${simReq.status}`);

  console.log('\n=== ALL PHASE G VERIFICATION TESTS COMPLETE ===');
}

run().catch(console.error);
