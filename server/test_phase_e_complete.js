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
  console.log('=== AEGIS 2.0 PHASE E VERIFICATION SUITE ===\n');

  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`[TEST 1] GET /api/health -> Status: ${health.status}`);

  // 2. Demo Mission 027 Weather Check (unauthenticated / preview allowed)
  const m027Weather = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/missions/027/data/weather',
    method: 'GET'
  });
  console.log(`[TEST 2] GET /api/missions/027/data/weather -> Status: ${m027Weather.status}`);
  console.log(`        Location: ${m027Weather.data?.locationName}, Temp: ${m027Weather.data?.current?.temperature}°C, Cond: ${m027Weather.data?.current?.condition}, Source: ${m027Weather.data?.source}`);
  console.log(`        Forecast Points: ${m027Weather.data?.forecast?.length}`);

  // 3. Setup Org A and Org B
  const timestamp = Date.now();
  // Commander A in Org A
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
    organizationName: 'Alpha Regional Command'
  });
  const tokenA = regA.data?.token;
  const orgA = regA.data?.user?.organizationId;
  console.log(`[TEST 3a] Register Commander A -> Token: ${!!tokenA}, Org A: ${orgA}`);

  // Commander B in Org B
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
    organizationName: 'Bravo Maritime Command'
  });
  const tokenB = regB.data?.token;
  const orgB = regB.data?.user?.organizationId;
  console.log(`[TEST 3b] Register Commander B -> Token: ${!!tokenB}, Org B: ${orgB}`);

  // 4. Commander A creates mission in Chandigarh (30.7333, 76.7794)
  const opChd = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/missions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, {
    name: 'Operation Northern Monsoon',
    description: 'River level monitoring',
    disasterType: 'FLOOD',
    locationName: 'Chandigarh',
    latitude: 30.7333,
    longitude: 76.7794,
    status: 'ACTIVE'
  });
  const missionChdId = opChd.data?.mission?.missionId;
  console.log(`[TEST 4] Commander A creates Chandigarh mission -> ID: ${missionChdId}`);

  // 5. Commander A retrieves weather for Chandigarh mission
  const weatherChd = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionChdId}/data/weather`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`[TEST 5] Weather for Chandigarh mission -> Status: ${weatherChd.status}`);
  console.log(`        Coordinates: [${weatherChd.data?.location?.latitude}, ${weatherChd.data?.location?.longitude}]`);
  console.log(`        Temp: ${weatherChd.data?.current?.temperature}°C, Humidity: ${weatherChd.data?.current?.humidity}%, Rain: ${weatherChd.data?.current?.rainfall}mm`);

  // 6. Commander A creates mission in London (51.5074, -0.1278)
  const opLdn = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/missions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, {
    name: 'Operation Thames Vanguard',
    description: 'Thames estuary tidal surge response',
    disasterType: 'FLOOD',
    locationName: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    status: 'ACTIVE'
  });
  const missionLdnId = opLdn.data?.mission?.missionId;
  console.log(`[TEST 6] Commander A creates London mission -> ID: ${missionLdnId}`);

  // 7. Commander A retrieves weather for London mission (verifying different coordinates)
  const weatherLdn = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionLdnId}/data/weather`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`[TEST 7] Weather for London mission -> Status: ${weatherLdn.status}`);
  console.log(`        Coordinates: [${weatherLdn.data?.location?.latitude}, ${weatherLdn.data?.location?.longitude}]`);
  console.log(`        Temp: ${weatherLdn.data?.current?.temperature}°C, Cond: ${weatherLdn.data?.current?.condition}`);
  const differentCoords = weatherChd.data?.location?.latitude !== weatherLdn.data?.location?.latitude;
  console.log(`        Different from Chandigarh coordinates: ${differentCoords}`);

  // 8. Unauthenticated request to non-demo mission -> 401
  const unauthReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionChdId}/data/weather`,
    method: 'GET'
  });
  console.log(`[TEST 8] Unauthenticated request to non-demo mission -> Status: ${unauthReq.status} (Expected 401)`);

  // 9. Unauthorized cross-organization request: Commander B requests Org A mission weather -> 403
  const crossOrgReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionChdId}/data/weather`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  console.log(`[TEST 9] Cross-org weather access (Commander B -> Org A) -> Status: ${crossOrgReq.status} (Expected 403)`);

  // 10. Non-existent mission -> 404
  const notFoundReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/missions/OPS-999999/data/weather',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`[TEST 10] Non-existent mission weather -> Status: ${notFoundReq.status} (Expected 404)`);

  // 11. Weather force refresh (?refresh=true)
  const refreshReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/missions/${missionChdId}/data/weather?refresh=true`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`[TEST 11] Weather refresh query -> Status: ${refreshReq.status}, Cached: ${refreshReq.data?.isCached}, FetchedAt: ${refreshReq.data?.fetchedAt}`);

  console.log('\n=== ALL PHASE E VERIFICATION TESTS COMPLETE ===');
}

run().catch(console.error);
