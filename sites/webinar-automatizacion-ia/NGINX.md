# Webinar automatización e IA — enrutado en www.mastersaws.com

## Diagnóstico

| URL | Estado |
|-----|--------|
| https://d2easup7g60n7n.cloudfront.net/webinar-automatizacion-ia/ | **200** — HTML en S3 (deploy OK) |
| https://www.mastersaws.com/webinar-automatizacion-ia/ | **404** — falta `location` en nginx |

`www.mastersaws.com` resuelve al servidor WordPress (nginx). Las landings estáticas del portafolio no las sirve WordPress: nginx debe hacer **proxy_pass** a CloudFront, igual que `/tarjetas-nfc/`.

## Qué hacer en el servidor (SSH)

1. Editar el vhost de `www.mastersaws.com` (donde ya está el bloque de `tarjetas-nfc`).
2. Pegar el bloque siguiente **junto al de tarjetas-nfc** (mismo `proxy_pass` base).
3. Validar y recargar:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

4. Probar:

```bash
curl -I https://www.mastersaws.com/webinar-automatizacion-ia/
# Debe ser HTTP/2 200 (no 404)
```

## Bloque nginx (copiar)

Si `tarjetas-nfc` usa otra distribución CloudFront, **copia exactamente** su bloque y solo cambia la ruta a `webinar-automatizacion-ia`.

```nginx
# Webinar automatización e IA — proxy a CloudFront portafolio
location = /webinar-automatizacion-ia {
    return 301 /webinar-automatizacion-ia/;
}

location /webinar-automatizacion-ia/ {
    proxy_pass https://d2easup7g60n7n.cloudfront.net/webinar-automatizacion-ia/;
    proxy_http_version 1.1;
    proxy_set_header Host d2easup7g60n7n.cloudfront.net;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
}
```

## Contenido en AWS

- Prefijo S3: `webinar-automatizacion-ia/` en el bucket del portafolio (`mastersaws-sites-941751053509-prod` vía workflow).
- Repo: `sites/webinar-automatizacion-ia/index.html`

## Nota

No hace falta tocar WordPress ni crear página WP para esta URL.
