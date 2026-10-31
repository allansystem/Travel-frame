# 🖼️ TravelFrame - Quadro Digital de Fotos e Vídeos Inteligente

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Video Support](https://img.shields.io/badge/Vídeos-MP4%20%7C%20WebM%20%7C%20MOV%20%7C%20M4V-8A2BE2)](https://github.com/allansystem/Travel-frame)
[![Self-Hosted](https://img.shields.io/badge/Self--Hosted-100%25-orange)](https://github.com/allansystem/Travel-frame)

Quadro digital moderno para fotos e vídeos, projetado para transformar monitores, Smart TVs ou telas dedicadas (Raspberry Pi, Mini PC, Debian/Ubuntu) em molduras digitais elegantes, com suporte a vídeos em alta definição, temporização inteligente, controle de som por álbum, transições cinematográficas e sincronização via navegador.

---

## 🐳 Executando com Docker e Docker Compose (Recomendado)

A maneira mais rápida, isolada e recomendada de rodar o TravelFrame em qualquer servidor Linux, Proxmox, Debian ou homelab é utilizando **Docker**.

### 1. Clonar o repositório
```bash
git clone https://github.com/allansystem/Travel-frame.git
cd Travel-frame
```

### 2. Subir o container
```bash
docker compose up -d --build
```

O serviço estará disponível em:
- **Painel de Controle**: `http://SEU_IP:3070`
- **Modo Tela / Telão (Kiosk)**: `http://SEU_IP:3070/display?device=sala`

### 💾 Persistência de Dados e Fotos (Volumes)
O container utiliza volumes mapeados na pasta do projeto:
- `./uploads`: Guarda todas as fotos e vídeos enviados.
- `./data`: Guarda as configurações, álbuns, regras de agendamento e dispositivos.

> **Segurança**: Se você atualizar o container ou reconstruir a imagem, suas fotos e configurações **permanecem 100% salvas e intactas** no disco do servidor.

### 🔄 Como atualizar o Container
Quando houver novas atualizações no repositório:
```bash
git pull
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 📺 Como Usar no Telão / Monitor / Smart TV (Modo Kiosk)

No navegador do monitor ou Smart TV, basta acessar a URL com o identificador da tela:
```
http://IP_DO_SERVIDOR:3070/display?device=sala
```
*(Você pode criar quantos telões quiser: `?device=quarto`, `?device=recepcao`, `?device=matriz`, etc.)*

### ✨ Principais Recursos do Modo Quadro:
1. **🎬 Suporte Nativo a Vídeos**: Reprodução automática e fluida de clipes de vídeo nos formatos `.mp4`, `.webm`, `.mov` e `.m4v`.
2. **⏱️ Temporização Inteligente (Duração Real)**: O quadro detecta vídeos automaticamente e aguarda o término completo da mídia (`onEnded`) antes de avançar para a próxima foto ou vídeo, sem cortes abruptos. Se houver apenas 1 vídeo no álbum, ele roda em repetição contínua (loop).
3. **🔊 Controle de Áudio por Álbum**: Chave independente em cada álbum para habilitar ou silenciar o som dos vídeos (`videoSound`), perfeito para manter silêncio em quartos ou salas de reunião.
4. **🚀 Upload em Stream para Arquivos Grandes**: Suporte a envio de fotos pesadas e vídeos grandes do celular ou computador via upload segmentado em stream.
5. **Transição Suave (Crossfade Cinematográfico)**: Transição contínua de dupla camada sem piscadas nem tela preta; fotos e vídeos se dissolvem suavemente um sobre o outro.
6. **Pré-carregamento Automático (Preload)**: Baixa as próximas fotos em segundo plano para exibição instantânea com zero delay.
7. **Rotação Completa de Canvas (Modo Vertical/Retrato)**: Ao virar o monitor na vertical (`90°` ou `-90°`), todo o quadro (foto, vídeo, relógio, clima e legenda) gira conjuntamente para visualização correta na parede.
8. **Fundo Ambiente Desfocado (Ambient Backlight / Blur)**: Preenche as laterais com efeito blur dinâmico baseado nas cores da foto ou vídeo atual.
9. **Efeito Ken Burns**: Movimento panorâmico lento e sutil nas fotos estilo protetor de tela da Apple TV.
10. **Relógio, Data e Previsão do Tempo ao Vivo**: Exibe clima local em tempo real (Open-Meteo, sem necessidade de chave de API).
11. **Descrição Destacada**: Exibe a descrição do álbum no topo com fonte grande e elegante.
12. **Modo Noturno / Repouso Agendado**: Permite programar horários para a tela descansar com economia de energia e tela preta.
13. **Controle Remoto Centralizado**: Pelo celular ou PC, controle remotamente o que cada telão está exibindo em tempo real.
14. **Ocultação Automática do Cursor**: O cursor do mouse e controles somem após inatividade para uma experiência de quadro limpo.

---

## 📹 Formatos de Vídeo Compatíveis e Otimização (H.264 vs HEVC/H.265)

Os navegadores web e telas de Smart TV / Raspberry Pi utilizam o padrão mundial **H.264 (AVC) com áudio AAC** dentro de contêiner **MP4**.

### ⚠️ Por que vídeos de GoPro ou iPhone (HEVC / H.265) dão erro no navegador?
Câmeras de ação como **GoPro** (ex: `GX011819.MP4`) e iPhones frequentemente gravam em **HEVC (H.265)** em resoluções ultra-pesadas como 4K ou 5.3K (5312x2988 a 60 Mbps). Navegadores web (Firefox, Chrome no Linux, TVs) não decodificam HEVC nativamente por restrições de licenças de patentes do consórcio MPEG.

### ⚡ Como converter seus vídeos facilmente com o script incluso:
O TravelFrame inclui um script automático para converter qualquer vídeo ou pasta inteira de vídeos para o padrão web:

```bash
# Converte todos os vídeos de uma pasta para H.264 Full HD otimizado:
./converter-videos.sh "/caminho/para/seus/videos"
```
Os arquivos convertidos serão salvos na subpasta `convertidos_para_o_quadro/` prontos para upload com 100% de compatibilidade e reprodução instantânea!

---

## 📸 Integração com o Google Fotos (Google Photos Picker API)

O TravelFrame possui integração nativa com a nova **Google Photos Picker API**. Isso permite abrir a sua biblioteca do Google Fotos diretamente no navegador, selecionar suas fotos favoritas e transferi-las automaticamente para o armazenamento local do seu servidor (com extração automática de data, câmera e localização via EXIF).

> 💡 **Privacidade e Modo Offline**: Ao importar fotos do Google, os arquivos são salvos localmente na pasta `./uploads`. Isso significa que o seu quadro digital continuará funcionando e exibindo as fotos mesmo se a internet cair.

### ⚙️ Como configurar o Google Client ID (Gratuito):

1. **Acessar o Google Cloud Console**:
   - Entre em [console.cloud.google.com](https://console.cloud.google.com/) e crie um novo projeto (ex: `TravelFrame`).

2. **Ativar a API do Google Photos Picker**:
   - No menu lateral, acesse **APIs e Serviços** > **Biblioteca**.
   - Pesquise por **Google Photos Picker API** e clique em **Ativar** (Enable).

3. **Configurar a Tela de Consentimento OAuth**:
   - Acesse **APIs e Serviços** > **Tela de consentimento OAuth**.
   - Escolha o tipo de usuário **Externo** e clique em Criar.
   - Preencha o Nome do aplicativo (`TravelFrame`) e seu e-mail de contato.
   - Na etapa de **Usuários de teste**, adicione o seu e-mail do Google (para permitir login enquanto o app estiver em modo de teste).

4. **Criar Credenciais OAuth 2.0**:
   - Acesse **APIs e Serviços** > **Credenciais** > **Criar credenciais** > **ID do cliente OAuth**.
   - Em *Tipo de aplicativo*, selecione **Aplicativo da Web**.
   - Em *Origens JavaScript autorizadas*, adicione os endereços onde você acessa o TravelFrame (ex: `http://localhost:3070` e `http://IP_DO_SERVIDOR:3070`).
   - Clique em Criar e copie o **ID do cliente** gerado (termina com `.apps.googleusercontent.com`).

5. **Conectar e Importar no TravelFrame**:
   - No painel do TravelFrame, acesse a aba **Ajustes** ou clique em **Importar do Google Fotos**.
   - Cole o seu Client ID no campo **Google Client ID** e clique em **Conectar Conta Google**.
   - Selecione o álbum de destino e clique em **Importar Fotos**. A janela oficial do Google abrirá para você marcar as fotos desejadas e transferi-las com 1 clique!

---

## 🛠️ Instalação Direta com Node.js (Sem Docker)

Se preferir rodar diretamente no sistema sem container:

### 1. Pré-requisitos
Node.js 18+ e npm instalados:
```bash
sudo apt update && sudo apt install -y nodejs npm
```

### 2. Instalação e Execução
```bash
npm install
npm run build
npm start
```
Acesse em: `http://localhost:3070`

---

## 🖥️ Inicializar o Chromium em Tela Cheia no Monitor (Raspberry Pi / Debian)

Para iniciar automaticamente em modo Kiosk em mini PCs ou Raspberry Pi conectados via HDMI:
```bash
chromium-browser --noerrdialogs --disable-infobars --kiosk "http://localhost:3070/display?device=sala"
```
