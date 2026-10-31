#!/bin/bash

# =========================================================
# TravelFrame - Inicializador Automático
# =========================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "========================================================="
echo "🖼️   Iniciando o TravelFrame (Quadro Digital)"
echo "========================================================="

# 1. Verifica se o Node.js e o npm estão instalados
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não foi encontrado no sistema!"
    echo "👉 Instale com: sudo apt update && sudo apt install -y nodejs npm"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm não foi encontrado no sistema!"
    echo "👉 Instale com: sudo apt update && sudo apt install -y npm"
    exit 1
fi

NODE_VER=$(node -v)
echo "✅ Node.js detectado: $NODE_VER"

# 2. Instala dependências se a pasta node_modules não existir
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências pela primeira vez (isso pode demorar 1-2 minutos)..."
    npm install
else
    echo "✅ Dependências já instaladas."
fi

# 3. Compila o frontend caso ainda não tenha a pasta dist
if [ ! -d "dist" ]; then
    echo "🔨 Gerando build de produção do frontend..."
    npm run build
fi

# 4. Obtém o IP da rede local para exibir na tela
IP_LOCAL=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "SEU-IP")

echo ""
echo "========================================================="
echo "🚀 Servidor TravelFrame em Execução!"
echo ""
echo "📱 Painel de Controle (no seu celular ou computador):"
echo "   http://localhost:3070"
echo "   http://$IP_LOCAL:3070"
echo ""
echo "📺 Modo Quadro para o Telão / Monitor:"
echo "   http://localhost:3070/display?device=sala"
echo "   http://$IP_LOCAL:3070/display?device=sala"
echo ""
echo "Pressione [Ctrl + C] para encerrar a qualquer momento."
echo "========================================================="
echo ""

# 5. Inicia o servidor Express na porta 3070
exec npm start
