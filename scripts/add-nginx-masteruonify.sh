#!/usr/bin/env bash
set -euo pipefail
CFG=/etc/nginx/sites-available/mastersaws.com

if grep -q 'location ^~ /masteruonify/' "$CFG" || grep -q 'location /masteruonify/' "$CFG"; then
  echo "Already configured"
else
  cp "$CFG" "${CFG}.bak-masteruonify-$(date +%Y%m%d%H%M%S)"
  python3 << 'PY'
from pathlib import Path
cfg = Path("/etc/nginx/sites-available/mastersaws.com")
text = cfg.read_text()
block = """

# --- MASTERUONIFY ---
location = /masteruonify {
    return 301 https://www.mastersaws.com/masteruonify/;
}

location ^~ /masteruonify/ {
    proxy_ssl_server_name on;
    proxy_ssl_name d2easup7g60n7n.cloudfront.net;
    proxy_ssl_protocols TLSv1.2 TLSv1.3;
    proxy_set_header Host d2easup7g60n7n.cloudfront.net;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass https://d2easup7g60n7n.cloudfront.net/masteruonify/;
}
"""
marker = "# --- MASTERERP ---"
if marker not in text:
    marker2 = "\n\n# --- WEBINAR AUTOMATIZACION IA ---"
    if marker2 not in text:
        raise SystemExit("marker not found (mastererp or webinar)")
    text = text.replace(marker2, block + marker2)
else:
    end = text.find(marker)
    insert_at = text.find("\n\n# ---", end + 1)
    if insert_at == -1:
        text = text + block
    else:
        text = text[:insert_at] + block + text[insert_at:]
cfg.write_text(text)
print("Inserted masteruonify block")
PY
fi

nginx -t
systemctl reload nginx
echo "nginx reloaded"
curl -sI https://www.mastersaws.com/masteruonify/ | head -8
