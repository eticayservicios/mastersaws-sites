#!/usr/bin/env bash
# S3 REST no resuelve /ruta/ → ruta/index.html. Publica claves "slug/" y "slug"
# para que CloudFront sirva la landing con o sin barra final.
set -euo pipefail

BUCKET="${1:?Usage: publish-s3-directory-indexes.sh BUCKET_NAME}"
SITES_DIR="${2:-sites}"

publish_slug() {
  local slug="$1"
  local file="${SITES_DIR}/${slug}/index.html"

  if [ ! -f "${file}" ]; then
    return 0
  fi

  echo "  → ${slug}/"
  aws s3api put-object \
    --bucket "${BUCKET}" \
    --key "${slug}/" \
    --body "${file}" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=300"

  aws s3api put-object \
    --bucket "${BUCKET}" \
    --key "${slug}" \
    --body "${file}" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=300"
}

echo "Publicando índices de directorio en s3://${BUCKET}/"

while IFS= read -r -d '' index_file; do
  rel="${index_file#${SITES_DIR}/}"
  slug="${rel%/index.html}"
  [ -n "${slug}" ] || continue
  publish_slug "${slug}"
done < <(find "${SITES_DIR}" -mindepth 2 -name index.html -print0)

echo "Listo."
