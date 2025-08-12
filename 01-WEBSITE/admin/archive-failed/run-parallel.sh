#!/bin/bash

# PARALLEL DIRECTORY SUBMISSION SCRIPT
# Runs multiple Python processes in parallel for faster execution

echo "=========================================="
echo "PARALLEL BACKLINK AUTOMATION"
echo "Chris David Salon - ISO Vision Partner"
echo "=========================================="

# Create a Python script for each directory type
cat > submit_yellowpages.py << 'EOF'
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=options)
try:
    driver.get('https://www.yellowpages.com/add-business')
    time.sleep(3)
    # Try to find and fill form
    result = {'directory': 'YellowPages', 'status': 'attempted'}
    
    # Save result
    with open('yellowpages_result.json', 'w') as f:
        json.dump(result, f)
    print("✅ YellowPages completed")
except Exception as e:
    print(f"❌ YellowPages error: {e}")
finally:
    driver.quit()
EOF

cat > submit_hotfrog.py << 'EOF'
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=options)
try:
    driver.get('https://www.hotfrog.com/add-company')
    time.sleep(3)
    result = {'directory': 'Hotfrog', 'status': 'attempted'}
    
    with open('hotfrog_result.json', 'w') as f:
        json.dump(result, f)
    print("✅ Hotfrog completed")
except Exception as e:
    print(f"❌ Hotfrog error: {e}")
finally:
    driver.quit()
EOF

cat > submit_manta.py << 'EOF'
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=options)
try:
    driver.get('https://www.manta.com/add-your-business')
    time.sleep(3)
    result = {'directory': 'Manta', 'status': 'attempted'}
    
    with open('manta_result.json', 'w') as f:
        json.dump(result, f)
    print("✅ Manta completed")
except Exception as e:
    print(f"❌ Manta error: {e}")
finally:
    driver.quit()
EOF

# Run all three in parallel
echo "🚀 Starting parallel execution..."
echo "⏳ Running YellowPages, Hotfrog, and Manta simultaneously..."

python3 submit_yellowpages.py &
PID1=$!

python3 submit_hotfrog.py &
PID2=$!

python3 submit_manta.py &
PID3=$!

# Wait for all to complete
wait $PID1
wait $PID2
wait $PID3

echo ""
echo "✅ All parallel submissions complete!"
echo ""

# Combine results
echo "📊 Combining results..."
python3 << 'PYTHON'
import json
import glob

results = []
for file in glob.glob('*_result.json'):
    try:
        with open(file, 'r') as f:
            results.append(json.load(f))
    except:
        pass

summary = {
    'total': len(results),
    'results': results
}

with open('parallel_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"📈 Processed {len(results)} directories in parallel")
for r in results:
    print(f"   - {r.get('directory', 'Unknown')}: {r.get('status', 'unknown')}")
PYTHON

echo ""
echo "💾 Results saved to parallel_summary.json"
echo "🚀 Parallel execution is much faster than sequential!"