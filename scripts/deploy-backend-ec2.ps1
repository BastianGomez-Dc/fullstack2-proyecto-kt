# Compila el backend SyncPass (monolito_backend_syncpass) y lo publica en la EC2 del front,
# detras del mismo Nginx en /api/. La primera vez usar -Instalar (Java, AWS CLI, servicio y Nginx).
# Uso: powershell -ExecutionPolicy Bypass -File scripts\deploy-backend-ec2.ps1 -Instalar
#      powershell -ExecutionPolicy Bypass -File scripts\deploy-backend-ec2.ps1
param(
  [string]$Servidor = "ubuntu@34.239.68.146",
  [string]$Llave = "$HOME\.ssh\kt-ec2.pem",
  [string]$Backend = "$HOME\Desktop\projects-duoc\monolito_backend_syncpass-main",
  [string]$Region = "us-east-1",
  [switch]$Instalar,
  [switch]$SinPruebas
)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
# BatchMode hace que ssh/scp fallen con un error en vez de quedarse esperando una respuesta
$opcionesSsh = @("-i", $Llave, "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "-o", "StrictHostKeyChecking=accept-new")

function Invoke-Remoto([string]$comando) {
  ssh -n @opcionesSsh $Servidor $comando
  if ($LASTEXITCODE -ne 0) { throw "Fallo en el servidor: $comando" }
}

if (-not (Test-Path $Llave)) { throw "No se encontro la llave en '$Llave'. Pasala con -Llave C:\ruta\llave.pem" }
if (-not (Test-Path "$Backend\mvnw.cmd")) { throw "No se encontro el backend en '$Backend'. Pasalo con -Backend C:\ruta" }

Write-Host "1/4 Compilando el backend..." -ForegroundColor Cyan
if (-not $env:JAVA_HOME) { $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr" }
Push-Location $Backend
try {
  $metas = @("-q", "clean", "package")
  if ($SinPruebas) { $metas += "-DskipTests" }
  & .\mvnw.cmd @metas
  if ($LASTEXITCODE -ne 0) { throw "Fallo el build del backend." }
} finally {
  Pop-Location
}
$jar = Get-ChildItem "$Backend\target\syncpass-api-*.jar" | Where-Object { $_.Name -notlike "*plain*" } | Select-Object -First 1
if (-not $jar) { throw "No se encontro el JAR en $Backend\target\" }
Write-Host "    JAR: $($jar.Name)"

if ($Instalar) {
  Write-Host "2/4 Preparando el servidor..." -ForegroundColor Cyan
  Invoke-Remoto "rm -rf /tmp/syncpass-setup && mkdir -p /tmp/syncpass-setup"
  Push-Location (Join-Path $raiz "scripts\backend-ec2")
  try {
    scp @opcionesSsh setup-backend.sh start.sh syncpass.service syncpass-api.conf "${Servidor}:/tmp/syncpass-setup/"
    if ($LASTEXITCODE -ne 0) { throw "Fallo la subida de los scripts." }
  } finally {
    Pop-Location
  }
  Invoke-Remoto "sudo bash /tmp/syncpass-setup/setup-backend.sh $Region"
} else {
  Write-Host "2/4 Sin -Instalar: se reutiliza la configuracion del servidor" -ForegroundColor Cyan
}

Write-Host "3/4 Subiendo el JAR y reiniciando el servicio..." -ForegroundColor Cyan
scp @opcionesSsh $jar.FullName "${Servidor}:/tmp/syncpass-app.jar"
if ($LASTEXITCODE -ne 0) { throw "Fallo la subida del JAR." }
# Se guarda la version anterior como app-previous.jar para poder volver atras
Invoke-Remoto 'set -e; if [ -f /opt/syncpass/app.jar ]; then sudo cp /opt/syncpass/app.jar /opt/syncpass/app-previous.jar; fi; sudo mv /tmp/syncpass-app.jar /opt/syncpass/app.jar; sudo chown syncpass:syncpass /opt/syncpass/app.jar; sudo systemctl restart syncpass'

Write-Host "4/4 Esperando a que la API responda..." -ForegroundColor Cyan
Invoke-Remoto 'for i in $(seq 1 60); do if curl -fs http://127.0.0.1:8080/api/health; then echo; exit 0; fi; sleep 3; done; echo La API no respondio. Ultimas lineas del log:; sudo journalctl -u syncpass -n 80 --no-pager; exit 1'

$ip = $Servidor.Split("@")[-1]
Write-Host "Listo: http://$ip/api/health" -ForegroundColor Green
