#!/usr/bin/env bash
set -euo pipefail
CFG=/etc/nginx/sites-available/mastersaws.com

if grep -q 'webinar-automatizacion-ia' "$CFG"; then
  echo "Already configured"
else
  cp "$CFG" "${CFG}.bak-webinar-$(date +%Y%m%d%H%M%S)"
  python3 << 'PY'
from pathlib import Path
cfg = Path("/etc/nginx/sites-available/mastersaws.com")
text = cfg.read_text()
marker = "\n\n# --- GOBERNANZA IA ---"
block = """

# --- WEBINAR AUTOMATIZACION IA ---
location = /webinar-automatizacion-ia {
    return 301 https://www.mastersaws.com/webinar-automatizacion-ia/;
}

location ^~ /webinar-automatizacion-ia/ {
    proxy_ssl_server_name on;
    proxy_ssl_name d2easup7g60n7n.cloudfront.net;
    proxy_ssl_protocols TLSv1.2 TLSv1.3;
    proxy_set_header Host d2easup7g60n7n.cloudfront.net;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass https://d2easup7g60n7n.cloudfront.net/webinar-automatizacion-ia/;
}
"""
if marker not in text:
    raise SystemExit("marker not found")
cfg.write_text(text.replace(marker, block + marker))
print("Inserted webinar block")
PY
fi

nginx -t
systemctl reload nginx
echo "nginx reloaded"
curl -sI https://www.mastersaws.com/webinar-automatizacion-ia/ | head -8
