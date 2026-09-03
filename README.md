# Masters AWS — Portafolio unificado

Un solo repositorio, **un bucket S3** y **una distribución CloudFront** por entorno (`dev` / `prod`).

Los 8 sitios viven como carpetas bajo `sites/`:

```
sites/
  index.html              → portada del portafolio
  cloudadoption/
  data-analytics/
  devops/
  finops/
  infraestructuras/
  inteligenciaartificial/
  seguridadenlanube/
  tarjetas-nfc/
```

## URLs (misma CloudFront)

| Sitio | Ruta |
|---|---|
| Portada | `/` |
| Cloud Adoption | `/cloudadoption/` |
| Data Analytics | `/data-analytics/` |
| DevOps | `/devops/` |
| FinOps | `/finops/` |
| Infraestructuras | `/infraestructuras/` |
| Inteligencia Artificial | `/inteligenciaartificial/` |
| Seguridad en la Nube | `/seguridadenlanube/` |
| Tarjetas NFC | `/tarjetas-nfc/` |

Ejemplo: `https://d111111.cloudfront.net/devops/`

## Infraestructura como código

Plantilla SAM/CloudFormation en `infrastructure/template.yaml` crea:

- Bucket S3 privado (con OAC)
- CloudFront con función de enrutamiento
- Política de bucket
- (Opcional) Route 53 + certificado ACM

### Desplegar infraestructura (una vez por entorno)

GitHub Actions → **Deploy infrastructure** → elige `dev` o `prod`.

O localmente:

```bash
sam validate --lint -t infrastructure/template.yaml
sam deploy --config-env prod
```

### Desplegar contenido

Push a `dev` o `prod` (cambios en `sites/**`) o manualmente:

GitHub Actions → **Deploy content**

## Secrets en GitHub

| Secret | Uso |
|---|---|
| `AWS_ACCESS_KEY_ID` | Obligatorio |
| `AWS_SECRET_ACCESS_KEY` | Obligatorio |

Opcional (si no quieres leer del stack):

| Variable | Ejemplo |
|---|---|
| `S3_BUCKET` | `mastersaws-portfolio-prod` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E123...` |
| `AWS_DEFAULT_REGION` | `us-east-1` |

Si no configuras `S3_BUCKET` ni `CLOUDFRONT_DISTRIBUTION_ID`, el workflow los lee del stack CloudFormation.

## ¿Por qué 1 S3 + 1 CloudFront?

| Ventaja | Detalle |
|---|---|
| Menor costo | Una distribución en lugar de 8 |
| Un solo despliegue | `aws s3 sync sites/` sube todo |
| IaC centralizado | Un stack crea toda la infra |
| Mantenimiento simple | Un repo, un pipeline |

## Migración desde los 8 repos

Los repos individuales en `mastersaws-ve` pueden archivarse cuando este monorepo esté en producción. Cada sitio sigue siendo una carpeta independiente dentro de `sites/`.

## Dominio propio (opcional)

Pasa parámetros al stack SAM:

- `DomainName=mastersaws.com`
- `HostedZoneId=Z0123456789`

O despliega sin dominio y usa la URL `*.cloudfront.net` que devuelve el output `SiteUrl`.
