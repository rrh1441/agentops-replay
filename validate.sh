#!/bin/bash
echo "=== AgentOps Replay Validation ==="

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Server is running"
else
  echo "❌ Server not running - run 'npm run dev' first"
  exit 1
fi

# Create test data if not exists
if [ ! -f test_data.csv ]; then
  cat > test_data.csv << 'EOF'
Month,Revenue,COGS,OpEx,Customers
Jan-2024,125000,45000,30000,1200
Feb-2024,132000,47000,31000,1250
Mar-2024,145000,52000,33000,1340
Apr-2024,155000,55000,35000,1420
May-2024,168000,58000,37000,1510
EOF
  echo "✅ Created test_data.csv"
fi

# Test analysis
echo "Testing analysis endpoint..."
RESPONSE=$(curl -X POST http://localhost:3000/api/analyze \
  -F "file=@test_data.csv" \
  -F "modelOverride=deterministic" \
  -s)

if echo "$RESPONSE" | grep -q "sessionId"; then
  echo "✅ Analysis endpoint working"
  SESSION_ID=$(echo "$RESPONSE" | python3 -c "import json, sys; print(json.load(sys.stdin)['sessionId'])")
  echo "   Created session: $SESSION_ID"
else
  echo "❌ Analysis endpoint failed"
  echo "   Response: $RESPONSE"
fi

# Check sessions
SESSION_COUNT=$(curl -s http://localhost:3000/api/sessions | python3 -c "import json, sys; print(len(json.load(sys.stdin)))")
echo "✅ Sessions in database: $SESSION_COUNT"

# Check latest session has proper fields
LATEST=$(curl -s http://localhost:3000/api/sessions | python3 -c "
import json, sys
sessions = json.load(sys.stdin)
if sessions:
    s = sessions[0]
    print(f'✅ Latest session:')
    print(f'   - Model: {s.get(\"model\", \"N/A\")}')
    print(f'   - Temperature: {s.get(\"temperature\", \"N/A\")}')
    print(f'   - EBITDA: \${s.get(\"kpis\", {}).get(\"ebitda\", 0):,}')
    print(f'   - Cost: \${s.get(\"cost\", 0):.4f}')
else:
    print('❌ No sessions found')
")
echo "$LATEST"

echo "=== Validation Complete ==="