// Direct endpoint test - Run with: node test-endpoints.js

async function testEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('=== Testing AgentOps Endpoints ===\n');
  
  try {
    // 1. Get sessions list
    console.log('1. Testing GET /api/sessions...');
    const sessionsRes = await fetch(`${baseUrl}/api/sessions`);
    const sessions = await sessionsRes.json();
    console.log(`   ✅ Found ${sessions.length} sessions`);
    
    if (sessions.length === 0) {
      console.log('   ⚠️  No sessions found. Creating one...');
      
      // Create test data
      const formData = new FormData();
      const csvContent = `Month,Revenue,COGS,OpEx
Jan-2024,125000,45000,30000
Feb-2024,132000,47000,31000`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      formData.append('file', blob, 'test.csv');
      formData.append('modelOverride', 'deterministic');
      
      const createRes = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        body: formData
      });
      const created = await createRes.json();
      console.log(`   ✅ Created session: ${created.sessionId}`);
      sessions.push({ id: created.sessionId });
    }
    
    // 2. Test session detail endpoint
    const testId = sessions[0].id;
    console.log(`\n2. Testing GET /api/sessions/${testId.substring(0, 8)}...`);
    
    const detailRes = await fetch(`${baseUrl}/api/sessions/${testId}`);
    console.log(`   Status: ${detailRes.status}`);
    
    if (detailRes.ok) {
      const detail = await detailRes.json();
      console.log(`   ✅ Session details retrieved`);
      console.log(`   - Events: ${detail.events?.length || 0}`);
      console.log(`   - Model: ${detail.session?.model || 'N/A'}`);
      console.log(`   - Temperature: ${detail.session?.temperature || 'N/A'}`);
    } else {
      const errorText = await detailRes.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    // 3. Test replay endpoint
    console.log(`\n3. Testing POST /api/sessions/${testId.substring(0, 8)}/replay...`);
    
    const replayRes = await fetch(`${baseUrl}/api/sessions/${testId}/replay`, {
      method: 'POST'
    });
    console.log(`   Status: ${replayRes.status}`);
    
    if (replayRes.ok) {
      const replay = await replayRes.json();
      console.log(`   ✅ Replay created`);
      console.log(`   - New session: ${replay.replaySessionId}`);
      console.log(`   - Deterministic: ${replay.isDeterministic}`);
    } else {
      const errorText = await replayRes.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  
  console.log('\n=== Test Complete ===');
}

testEndpoints();