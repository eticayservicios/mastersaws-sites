# Despliega el backend de registro del webinar (cuenta 941751053509, us-east-1).
# Ejemplo con fecha confirmada:
#   .\deploy.ps1 -WebinarDate "jueves 22 de octubre de 2026" -WebinarTime "10:00" -WebinarTimezone "hora de Caracas, GMT-4" -WebinarJoinUrl "https://zoom.us/j/..."
param(
    [string]$AwsProfile = 'tumandaito-dev',
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
if ($account -ne '941751053509') { throw "Cuenta incorrecta: $account (se esperaba 941751053509)" }

aws cloudformation package --template-file template.yaml --s3-bucket mastersaws-artifacts-941751053509 --s3-prefix webinar-registration --output-template-file packaged.yaml
if ($LASTEXITCODE -ne 0) { throw 'package falló' }

aws cloudformation deploy --template-file packaged.yaml --stack-name mastersaws-webinar-registration `
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --no-fail-on-empty-changeset `
    --parameter-overrides "WebinarDate=$WebinarDate" "WebinarTime=$WebinarTime" "WebinarTimezone=$WebinarTimezone" "WebinarJoinUrl=$WebinarJoinUrl"
if ($LASTEXITCODE -ne 0) { throw 'deploy falló' }

aws cloudformation describe-stacks --stack-name mastersaws-webinar-registration --query 'Stacks[0].Outputs' --output table
