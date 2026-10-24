# Compila el front y lo sube a la instancia EC2 (Nginx sirve /var/www/kt).
# Uso: powershell -ExecutionPolicy Bypass -File scripts\deploy-ec2.ps1
#      powershell -ExecutionPolicy Bypass -File scripts\deploy-ec2.ps1 -Servidor ubuntu@<IP> -Llave C:\ruta\llave.pem
param(
  [string]$Servidor = "ubuntu@34.239.68.146",
  [string]$Llave = "$HOME\.ssh\kt-ec2.pem",
  [string]$Destino = "/var/www/kt"
)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
# BatchMode hace que ssh/scp fallen con un error en vez de quedarse esperando una respuesta
$opcionesSsh = @("-i", $Llave, "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "-o", "StrictHostKeyChecking=accept-new")

if (-not (Test-Path $Llave)) {
  throw "No se encontro la llave en '$Llave'. Pasala con -Llave C:\ruta\llave.pem"
}

Write-Host "1/4 Compilando..." -ForegroundColor Cyan
Push-Location $raiz
try {
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Fallo el build." }
} finally {
  Pop-Location
}

Write-Host "2/4 Limpiando la version anterior en $Servidor..." -ForegroundColor Cyan
# -n: sin stdin, para que ssh termine apenas acabe el comando remoto
ssh -n @opcionesSsh $Servidor "rm -rf $Destino/*"
if ($LASTEXITCODE -ne 0) { throw "No se pudo conectar por SSH." }

Write-Host "3/4 Subiendo dist/..." -ForegroundColor Cyan
# PowerShell no expande dist/* para scp, asi que se listan los archivos a mano
Push-Location (Join-Path $raiz "dist")
try {
  scp @opcionesSsh -r (Get-ChildItem -Name) "${Servidor}:$Destino/"
  if ($LASTEXITCODE -ne 0) { throw "Fallo la subida con scp." }
} finally {
  Pop-Location
}

Write-Host "4/4 Ajustando permisos para Nginx..." -ForegroundColor Cyan
# scp desde Windows puede dejar archivos que Nginx no puede leer (403)
ssh -n @opcionesSsh $Servidor "chmod -R a+rX $Destino"
if ($LASTEXITCODE -ne 0) { throw "No se pudieron ajustar los permisos." }

$ip = $Servidor.Split("@")[-1]
Write-Host "Listo: http://$ip" -ForegroundColor Green
