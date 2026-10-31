#!/bin/bash
# ==============================================================================
# TravelFrame - Conversor de Vídeos para Web (H.264 / AAC)
# Converte vídeos gravados em HEVC/H.265 (GoPro, iPhones, Drones) para o formato
# universal H.264, compatível com 100% dos navegadores web, Smart TVs e displays.
# ==============================================================================

set -e

DIR_ORIGEM="${1:-.}"
DIR_DESTINO="${2:-$DIR_ORIGEM/convertidos_para_o_quadro}"

if ! command -v ffmpeg &> /dev/null || ! command -v ffprobe &> /dev/null; then
    echo "❌ Erro: ffmpeg e ffprobe precisam estar instalados."
    echo "👉 No Fedora: sudo dnf install -y ffmpeg"
    echo "👉 No Ubuntu/Debian: sudo apt install -y ffmpeg"
    exit 1
fi

echo "🎬 ====================================================="
echo "🖼️  TravelFrame - Otimizador e Conversor de Vídeos"
echo "📂 Pasta de Origem : $DIR_ORIGEM"
echo "📁 Pasta de Destino: $DIR_DESTINO"
echo "======================================================="

mkdir -p "$DIR_DESTINO"

TOTAL=0
CONVERTIDOS=0
IGNORADOS=0

# Coleta todos os arquivos de vídeo sem usar pipe com stdin
mapfile -t ARQUIVOS < <(find "$DIR_ORIGEM" -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.m4v" -o -iname "*.mkv" -o -iname "*.webm" \) | sort)

for arquivo in "${ARQUIVOS[@]}"; do
    [ -f "$arquivo" ] || continue

    NOME_BASE=$(basename "$arquivo")
    NOME_SEM_EXT="${NOME_BASE%.*}"
    EXT="${NOME_BASE##*.}"
    SAIDA="$DIR_DESTINO/${NOME_SEM_EXT}_web.mp4"

    # Não processa arquivos que já estão no destino ou com sufixo _web
    if [[ "$NOME_BASE" == *"_web.mp4"* ]]; then
        continue
    fi

    # Não processa se já existir arquivo convertido no destino
    if [ -f "$SAIDA" ]; then
        echo "⏩ Já convertido anteriormente: $(basename "$SAIDA") (pulando)"
        continue
    fi

    TOTAL=$((TOTAL + 1))
    
    # Detecta o codec de vídeo atual
    CODEC=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$arquivo" 2>/dev/null || echo "desconhecido")
    RES=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$arquivo" 2>/dev/null || echo "")

    echo ""
    echo "▶️ Analisando: $NOME_BASE"
    echo "   Formato atual: $CODEC (${RES:-desconhecida})"

    # Se já for H264 e resolução razoável (<= 1920x1080), só copia com faststart se necessário
    if [ "$CODEC" = "h264" ]; then
        LARGURA=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$arquivo" 2>/dev/null || echo "0")
        if [ "$LARGURA" -le 1920 ] 2>/dev/null; then
            echo "   ✅ Este vídeo já está em H.264 compatível! Copiando para destino com +faststart..."
            ffmpeg -nostdin -y -i "$arquivo" -c copy -movflags +faststart "$SAIDA" 2>/dev/null || cp "$arquivo" "$SAIDA"
            continue
        fi
    fi

    echo "   ⚡ Convertendo para H.264 1080p universal..."
    
    ffmpeg -nostdin -y -i "$arquivo" \
        -c:v libx264 \
        -preset veryfast \
        -crf 22 \
        -pix_fmt yuv420p \
        -vf "scale='min(1920,iw)':-2" \
        -c:a aac \
        -b:a 192k \
        -movflags +faststart \
        "$SAIDA"

    echo "   ✨ Concluído: $SAIDA"
done

echo ""
echo "🎉 Processamento finalizado! Os vídeos convertidos estão na pasta:"
echo "👉 $DIR_DESTINO"
echo "Agora você pode enviá-los diretamente pelo painel do TravelFrame!"
