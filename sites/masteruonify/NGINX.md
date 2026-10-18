# MasterUonify — enrutado en www.mastersaws.com

| URL | Estado esperado |
|-----|-----------------|
| https://d2easup7g60n7n.cloudfront.net/masteruonify/ | **200** — HTML en S3 (deploy OK) |
| https://www.mastersaws.com/masteruonify/ | **404** hasta configurar nginx |

`www.mastersaws.com` resuelve al servidor WordPress (nginx). Las landings del portafolio requieren **proxy_pass** a CloudFront, igual que `/mastererp/` y `/mastervpn/`.

## Aplicar en el servidor

```bash
sudo bash /ruta/al/repo/scripts/add-nginx-masteruonify.sh
```

O pegar manualmente en `/etc/nginx/sites-available/mastersaws.com` (junto al bloque MasterERP):

```nginx
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
```

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -I https://www.mastersaws.com/masteruonify/
```
