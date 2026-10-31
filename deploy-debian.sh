#!/bin/bash
# ==============================================================================
# Script de Deploy para Servidor Docker Remoto (Debian / Linux)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

REMOTE_USER="${1:-root}"
REMOTE_HOST="${2:-${REMOTE_HOST:-192.168.1.100}}"
REMOTE_DIR="travel-frame"

echo "=============================================================================="
echo "🚀 Atualizando TravelFrame no Docker do servidor ($REMOTE_HOST)"
echo "👤 Usuário SSH: $REMOTE_USER"
echo "=============================================================================="

echo "📦 1. Sincronizando arquivos com o servidor..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  ./ "$REMOTE_USER@$REMOTE_HOST:~/$REMOTE_DIR/"

echo ""
echo "🐳 2. Parando container antigo e subindo nova versão compilada..."
ssh -t "$REMOTE_USER@$REMOTE_HOST" "cd ~/$REMOTE_DIR && (docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true) && (docker compose up -d --build || docker-compose up -d --build)"

echo ""
echo "=============================================================================="
echo "✅ Atualização concluída com sucesso!"
echo "🌐 Acesse o TravelFrame atualizado em: http://$REMOTE_HOST:3070"
echo "📺 Modo Quadro / Telão: http://$REMOTE_HOST:3070/display?device=sala"
echo "=============================================================================="
