#!/bin/bash
# ==============================================================================
# Script de Deploy para Servidor Docker Remoto (Debian / Linux)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

REMOTE_USER="${1:-root}"
REMOTE_HOST="${2:-${REMOTE_HOST:-100.67.10.15}}"
REMOTE_DIR="travel-frame"
CTL_SOCK="/tmp/ssh-deploy-travel-$$"

cleanup() {
  ssh -S "$CTL_SOCK" -O exit "$REMOTE_USER@$REMOTE_HOST" 2>/dev/null || true
  rm -f "$CTL_SOCK"
}
trap cleanup EXIT

echo "=============================================================================="
echo "🚀 Atualizando TravelFrame no Docker do servidor ($REMOTE_HOST)"
echo "👤 Usuário SSH: $REMOTE_USER"
echo "=============================================================================="

echo "0. Abrindo conexão SSH..."
ssh -M -S "$CTL_SOCK" -o ControlPersist=60 -fN "$REMOTE_USER@$REMOTE_HOST"

echo "1. Enviando arquivos com tar via SSH (preservando banco de dados e uploads)..."
tar --no-acls --no-selinux --no-xattrs \
  --exclude='node_modules' \
  --exclude='data' \
  --exclude='uploads' \
  --exclude='server/data' \
  --exclude='server/uploads' \
  --exclude='.git' \
  -czf - . | ssh -S "$CTL_SOCK" "$REMOTE_USER@$REMOTE_HOST" \
  "mkdir -p ~/$REMOTE_DIR && tar -xzf - -C ~/$REMOTE_DIR"

echo ""
echo "2. Parando container antigo e subindo nova versão compilada..."
ssh -S "$CTL_SOCK" "$REMOTE_USER@$REMOTE_HOST" \
  "cd ~/$REMOTE_DIR && (docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true) && (docker compose up -d --build || docker-compose up -d --build)"

echo ""
echo "=============================================================================="
echo "✅ Atualização concluída com sucesso!"
echo "🌐 Acesse o TravelFrame atualizado em: http://$REMOTE_HOST:3070"
echo "📺 Modo Quadro / Telão: http://$REMOTE_HOST:3070/display?device=sala"
echo "=============================================================================="
