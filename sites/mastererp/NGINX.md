# MasterERP — enrutado en www.mastersaws.com

Tras el deploy a S3/CloudFront, añade en el vhost de `www.mastersaws.com` (junto a `webinar-automatizacion-ia`):

```nginx
location = /mastererp {
    return 301 /mastererp/;
}

location /mastererp/ {
    proxy_pass https://d2easup7g60n7n.cloudfront.net/mastererp/;
    proxy_http_version 1.1;
    proxy_set_header Host d2easup7g60n7n.cloudfront.net;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -I https://www.mastersaws.com/mastererp/
```
