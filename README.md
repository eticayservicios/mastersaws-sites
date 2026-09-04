# Masters AWS — Portafolio unificado

Un repositorio, un bucket S3, una CloudFront. Infraestructura creada por CloudFormation.

## Variables en GitHub (solo 2)

**Settings → Secrets and variables → Actions → Variables**

| Variable | Obligatoria |
|---|---|
| `AWS_ACCESS_KEY_ID` | Sí |
| `AWS_SECRET_ACCESS_KEY` | Sí |

No necesitas configurar nombres de bucket ni IDs de CloudFront.

## Desplegar

**Actions → Deploy → Run workflow**

O push a la rama `prod`.

El workflow:
1. Crea bucket S3 + CloudFront (IaC)
2. Sube los 8 sitios desde `sites/`
3. Invalida caché de CloudFront

## Estructura

```
sites/
  index.html           ← portada
  cloudadoption/
  data-analytics/
  devops/
  finops/
  infraestructuras/
  inteligenciaartificial/
  seguridadenlanube/
  tarjetas-nfc/
infrastructure/
  template.yaml        ← plantilla CloudFormation
```

## URLs

Tras el despliegue, la URL aparece en los logs del workflow (output `SiteUrl`).

Rutas: `/devops/`, `/cloudadoption/`, `/finops/`, etc.

## Región AWS

`us-east-1`
