# get_metrics.py
import urllib.request
import base64
import json

token = "sqp_616a2fb351d1bfa61812ae30db9e0210e9bdf725"
auth_str = f"{token}:"
auth_b64 = base64.b64encode(auth_str.encode()).decode()

url = "http://localhost:9000/api/measures/component?component=TrafficViolationSystem&metricKeys=bugs,vulnerabilities,code_smells,security_hotspots,coverage,duplicated_lines_density"
req = urllib.request.Request(url)
req.add_header("Authorization", f"Basic {auth_b64}")

try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error fetching metrics: {e}")
