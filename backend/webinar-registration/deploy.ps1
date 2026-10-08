# Despliega el backend de registro del webinar (cuenta 903936255891, perfil lasante, us-east-1).
# Ejemplo con fecha confirmada:
#   .\deploy.ps1 -WebinarDate "jueves 22 de octubre de 2026" -WebinarTime "10:00" -WebinarTimezone "hora de Caracas, GMT-4" -WebinarJoinUrl "https://zoom.us/j/..."
param(
    [string]$AwsProfile = 'lasante',
    [string]$ExpectedAccount = '903936255891',
    [string]$WebinarDate = '',
    [string]$WebinarTime = '',
    [string]$WebinarTimezone = '',
    [string]$WebinarJoinUrl = ''
)
$ErrorActionPreference = 'Stop'
$env:AWS_PROFILE = $AwsProfile
$env:AWS_DEFAULT_REGION = 'us-east-1'
Set-Location $PSScriptRoot

$account = aws sts get-caller-identity --query Account --output text
if ($account -ne $ExpectedAccount) { throw "Cuenta incorrecta: $account (se esperaba $ExpectedAccount)" }

$bucket = "mastersaws-artifacts-$account"
$ErrorActionPreference = 'Continue'
aws s3api head-bucket --bucket $bucket 2>&1 | Out-Null
$bucketExists = $LASTEXITCODE -eq 0
$ErrorActionPreference = 'Stop'
if (-not $bucketExists) {
    aws s3api create-bucket --bucket $bucket | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "No se pudo crear el bucket $bucket" }
    aws s3api put-public-access-block --bucket $bucket --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
}

aws cloudformation package --template-file template.yaml --s3-bucket $bucket --s3-prefix webinar-registration --output-template-file packaged.yaml
if ($LASTEXITCODE -ne 0) { throw 'package falló' }

aws cloudformation deploy --template-file packaged.yaml --stack-name mastersaws-webinar-registration `
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --no-fail-on-empty-changeset `
    --parameter-overrides "WebinarDate=$WebinarDate" "WebinarTime=$WebinarTime" "WebinarTimezone=$WebinarTimezone" "WebinarJoinUrl=$WebinarJoinUrl"
if ($LASTEXITCODE -ne 0) { throw 'deploy falló' }

aws cloudformation describe-stacks --stack-name mastersaws-webinar-registration --query 'Stacks[0].Outputs' --output table
