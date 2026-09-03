#!/usr/bin/env bash
# Despliegue local usando SOLO AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY.
# No usa ~/.aws/credentials ni AWS_PROFILE.
set -euo pipefail

EXPECTED_ACCOUNT="${EXPECTED_AWS_ACCOUNT:-941751053509}"
AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-mastersaws-portfolio-prod}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Ignorar credenciales del perfil local
unset AWS_PROFILE AWS_DEFAULT_PROFILE AWS_SESSION_TOKEN

if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
  echo "ERROR: Debes exportar las variables antes de ejecutar:"
  echo "  export AWS_ACCESS_KEY_ID='tu-access-key'"
  echo "  export AWS_SECRET_ACCESS_KEY='tu-secret-key'"
  echo "  ./scripts/deploy-aws.sh"
  exit 1
fi

export AWS_DEFAULT_REGION="$AWS_REGION"

echo "=== Verificando cuenta AWS ==="
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo "Cuenta detectada: $ACCOUNT"

if [ "$ACCOUNT" != "$EXPECTED_ACCOUNT" ]; then
  echo "ERROR: Cuenta incorrecta ($ACCOUNT). Se esperaba $EXPECTED_ACCOUNT."
  echo "No se usará devops-duran ni ningún perfil local."
  exit 1
fi

echo ""
echo "=== 1/3 Desplegando infraestructura (S3 + CloudFront) ==="
aws cloudformation deploy \
  --template-file "$REPO_ROOT/infrastructure/template.yaml" \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
    "ProjectName=mastersaws-portfolio" \
    "Environment=prod" \
    "BucketName=mastersaws-portfolio-prod" \
    "PriceClass=PriceClass_100"

BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
  --output text)

CF_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

SITE_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`SiteUrl`].OutputValue' \
  --output text)

echo ""
echo "=== 2/3 Subiendo sitios a S3 ==="
aws s3 sync "$REPO_ROOT/sites/" "s3://${BUCKET}/" --delete --region "$AWS_REGION"

echo ""
echo "=== 3/3 Invalidando CloudFront ==="
aws cloudfront create-invalidation \
  --distribution-id "$CF_ID" \
  --paths "/*" \
  --query 'Invalidation.{Id:Id,Status:Status}' \
  --output table

echo ""
echo "=== Despliegue completado ==="
echo "Cuenta:    $ACCOUNT"
echo "Bucket:    $BUCKET"
echo "CloudFront: $CF_ID"
echo "URL:       $SITE_URL"
