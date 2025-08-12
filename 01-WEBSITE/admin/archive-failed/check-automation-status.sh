#!/bin/bash

echo "🔍 AUTOMATION STATUS CHECK"
echo "========================="

# Check if Python process is still running
if pgrep -f "python-directory-automation.py" > /dev/null; then
    echo "✅ Python automation is currently running..."
    echo "📊 Process details:"
    ps aux | grep python-directory-automation.py | grep -v grep
    echo ""
else
    echo "⏹️  Python automation has completed or stopped"
fi

# Check for reports
echo "📄 Checking for reports..."
if [ -d "reports" ]; then
    echo "Reports found:"
    ls -la reports/
    
    # Show latest report if available
    LATEST_REPORT=$(ls -t reports/automation_report_*.json 2>/dev/null | head -n1)
    if [ -n "$LATEST_REPORT" ]; then
        echo ""
        echo "📋 Latest report summary ($LATEST_REPORT):"
        if command -v python3 >/dev/null 2>&1; then
            python3 -c "
import json
try:
    with open('$LATEST_REPORT', 'r') as f:
        data = json.load(f)
    summary = data.get('summary', {})
    print(f\"✅ Successful: {summary.get('successful', 'N/A')}\")
    print(f\"📊 Total attempts: {summary.get('total_attempts', 'N/A')}\")
    print(f\"📈 Success rate: {summary.get('success_rate', 'N/A')}\")
    print(f\"🕒 Timestamp: {summary.get('timestamp', 'N/A')}\")
except Exception as e:
    print(f\"Error reading report: {e}\")
"
        else
            echo "Python3 not available to parse report"
        fi
    fi
else
    echo "No reports directory found"
fi

echo ""
echo "🔄 To manually check the automation, run:"
echo "   python3 python-directory-automation.py"
echo ""
echo "📧 Don't forget to check sikerr@gmail.com for verification emails!"