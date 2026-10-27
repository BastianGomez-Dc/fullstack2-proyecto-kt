#!/bin/bash
# Prepara la EC2 Ubuntu del front para correr también el backend SyncPass.
# Lo llama deploy-backend-ec2.ps1 -Instalar. Se puede ejecutar de nuevo sin romper nada.
# Uso: sudo bash setup-backend.sh [region]
set -euo pipefail

REGION="${1:-us-east-1}"
DIR="$(cd "$(dirname "$0")" && pwd)"
SNIPPET=/etc/nginx/snippets/syncpass-api.conf

if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecute con sudo" >&2
  exit 1
fi

# Los archivos pueden llegar con fin de línea de Windows
sed -i 's/\r$//' "$DIR"/*.sh "$DIR"/*.conf "$DIR"/*.service

echo "==> Java 21, curl y unzip"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q curl unzip
apt-get install -y -q openjdk-21-jre-headless || apt-get install -y -q openjdk-25-jre-headless
java -version

echo "==> AWS CLI v2"
if ! command -v aws &>/dev/null; then
  tmp="$(mktemp -d)"
  curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o "$tmp/awscli.zip"
  unzip -q "$tmp/awscli.zip" -d "$tmp"
  "$tmp/aws/install"
  rm -rf "$tmp"
fi
aws --version

echo "==> Rol IAM de la instancia"
if ! aws sts get-caller-identity --region "$REGION" --query Arn --output text; then
  echo "La instancia no tiene rol IAM. Asocie LabInstanceProfile (EC2 -> Acciones -> Seguridad -> Modificar rol de IAM)" >&2
  exit 1
fi

echo "==> Usuario de servicio 'syncpass' (sin shell ni privilegios)"
id syncpass &>/dev/null || useradd --system --home /opt/syncpass --shell /usr/sbin/nologin syncpass
install -d -o syncpass -g syncpass -m 750 /opt/syncpass

echo "==> Swap de 1 GB"
if ! swapon --show | grep -q /swapfile; then
  [ -f /swapfile ] || dd if=/dev/zero of=/swapfile bs=1M count=1024
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
fi
grep -q '^/swapfile' /etc/fstab || echo '/swapfile swap swap defaults 0 0' >> /etc/fstab

echo "==> Script de arranque y servicio systemd"
sed "s/__REGION__/${REGION}/g" "$DIR/start.sh" > /opt/syncpass/start.sh
chown syncpass:syncpass /opt/syncpass/start.sh
chmod 750 /opt/syncpass/start.sh
install -m 644 "$DIR/syncpass.service" /etc/systemd/system/syncpass.service
systemctl daemon-reload
systemctl enable syncpass

echo "==> Nginx: /api/ hacia el backend, dentro del sitio del front"
install -m 644 "$DIR/syncpass-api.conf" "$SNIPPET"
# -R sigue enlaces simbólicos: en Ubuntu sites-enabled/* apunta a sites-available/*
sitio="$(grep -REl 'root\s+/var/www/kt' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -1 || true)"
if [ -z "$sitio" ]; then
  echo "No encontré el sitio de Nginx que sirve /var/www/kt" >&2
  exit 1
fi
sitio="$(readlink -f "$sitio")"
if ! grep -q 'snippets/syncpass-api.conf' "$sitio"; then
  respaldo="/root/nginx-$(basename "$sitio")-$(date +%Y%m%d%H%M%S).bak"
  cp "$sitio" "$respaldo"
  sed -E -i '/^\s*root\s+\/var\/www\/kt/a \    include snippets/syncpass-api.conf;' "$sitio"
  if ! nginx -t; then
    cp "$respaldo" "$sitio"
    echo "La configuración de Nginx no pasó la prueba; se restauró $respaldo" >&2
    exit 1
  fi
  echo "Sitio actualizado: $sitio (respaldo en $respaldo)"
fi
nginx -t
systemctl reload nginx

echo "==> Parameter Store"
cantidad=$(aws ssm get-parameters-by-path --path /syncpass/prod --region "$REGION" \
  --query 'length(Parameters)' --output text)
echo "Parámetros en /syncpass/prod: ${cantidad} (se esperan 6)"
if [ "${cantidad}" -lt 6 ]; then
  echo "AVISO: faltan parámetros; ejecute scripts/backend-ec2/guardar-parametros.ps1" >&2
fi

echo "==> Listo"
