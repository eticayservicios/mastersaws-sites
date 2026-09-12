# MasterVPN — enrutado en www.mastersaws.com

## Estado

| URL | Estado |
|-----|--------|
| https://d2easup7g60n7n.cloudfront.net/mastervpn/ | OK (200) — origen S3 del portafolio |
| https://www.mastersaws.com/mastervpn/ | 404 — nginx/WordPress no tiene location |
| https://www.mastersaws.com/tarjetas-nfc/ | OK — mismo patrón que debemos replicar |

`www.mastersaws.com` apunta al servidor WordPress (`107.23.195.227`). Las landings estáticas se exponen con `location` en nginx que hacen proxy a CloudFront. `/tarjetas-nfc/` ya está mapeado; `/mastervpn/` aún no.

## Qué agregar en nginx (servidor WordPress)

Copia el bloque de `/tarjetas-nfc/` y adapta paths. Ejemplo:

```nginx
# MasterVPN — proxy a CloudFront portafolio
location = /mastervpn {
    return 301 /mastervpn/;
}

location /mastervpn/ {
    proxy_pass https://d2easup7g60n7n.cloudfront.net/mastervpn/;
    proxy_http_version 1.1;
    proxy_set_header Host d2easup7g60n7n.cloudfront.net;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
}
```

Luego:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Si el bloque de `tarjetas-nfc` usa otro `proxy_pass` (p. ej. distribución propia), usa exactamente el mismo patrón cambiando solo la ruta a `mastervpn`.

## Contenido ya desplegado

- Bucket portafolio: `mastersaws-sites-941751053509-prod/mastervpn/`
- También sincronizado en: `mastersaws-landing/mastervpn/` (por si el proxy apunta ahí)
