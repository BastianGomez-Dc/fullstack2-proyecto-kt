# Guarda en Parameter Store (/syncpass/prod/*, SecureString) las 6 variables que lee el backend en la EC2.
# Los datos no secretos salen de $HOME\syncpass-local.env; la contrasena de Supabase, de
# $HOME\syncpass-db.cred (cifrada con DPAPI) o se pide de forma oculta.
# Uso: powershell -ExecutionPolicy Bypass -File scripts\backend-ec2\guardar-parametros.ps1
param(
  [string]$Region = "us-east-1",
  [string]$EnvFile = "$HOME\syncpass-local.env",
  [string]$CredFile = "$HOME\syncpass-db.cred"
)

$ErrorActionPreference = "Stop"

$valores = @{}
foreach ($linea in Get-Content $EnvFile) {
  if ($linea -match '^\s*([A-Z_]+)=(.*)$') { $valores[$Matches[1]] = $Matches[2].Trim() }
}
foreach ($nombre in "DB_URL", "DB_USER", "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID", "COGNITO_ISSUER") {
  if (-not $valores[$nombre] -or $valores[$nombre] -match '<') { throw "Falta $nombre en $EnvFile" }
}

if (Test-Path $CredFile) {
  $segura = Import-Clixml $CredFile
} else {
  $segura = Read-Host -AsSecureString "Contrasena de la base de datos de Supabase"
}
$valores["DB_PASSWORD"] = [System.Net.NetworkCredential]::new("", $segura).Password
if (-not $valores["DB_PASSWORD"]) { throw "La contrasena esta vacia" }

foreach ($nombre in "DB_URL", "DB_USER", "DB_PASSWORD", "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID", "COGNITO_ISSUER") {
  & aws ssm put-parameter --region $Region --name "/syncpass/prod/$nombre" --value $valores[$nombre] `
      --type SecureString --overwrite | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "No se pudo guardar /syncpass/prod/$nombre" }
  Write-Host "    /syncpass/prod/$nombre"
}
$valores["DB_PASSWORD"] = $null
Write-Host "Listo: 6 parametros guardados en $Region" -ForegroundColor Green
