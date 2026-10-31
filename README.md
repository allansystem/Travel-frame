# 🖼️ TravelFrame - Quadro Digital de Fotos Inteligente

Projeto de quadro digital de fotos e vídeos moderno, projetado para transformar monitores, Smart TVs ou telas dedicadas (Raspberry Pi, Mini PC, Debian/Ubuntu) em molduras digitais elegantes, com controle centralizado e sincronização via navegador.

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
1. **Transição Suave (Crossfade Cinematográfico)**: Transição contínua de dupla camada sem piscadas nem tela preta; as fotos se dissolvem suavemente uma sobre a outra.
2. **Pré-carregamento Automático (Preload)**: Baixa as próximas fotos em segundo plano para exibição instantânea com zero delay.
3. **Rotação Completa de Canvas (Modo Vertical/Retrato)**: Ao virar o monitor na vertical (`90°` ou `-90°`), todo o quadro (foto, relógio, clima e legenda) gira conjuntamente para visualização correta na parede.
4. **Fundo Ambiente Desfocado (Ambient Backlight / Blur)**: Preenche as laterais com efeito blur dinâmico baseado nas cores da foto atual.
5. **Efeito Ken Burns**: Movimento panorâmico lento e sutil nas fotos estilo protetor de tela da Apple TV.
6. **Relógio, Data e Previsão do Tempo ao Vivo**: Exibe clima local em tempo real (Open-Meteo, sem necessidade de chave de API).
7. **Descrição Destacada**: Exibe a descrição do álbum no topo com fonte grande e elegante.
8. **Modo Noturno / Repouso Agendado**: Permite programar horários para a tela descansar com economia de energia e tela preta.
9. **Controle Remoto Centralizado**: Pelo celular ou PC, controle remotamente o que cada telão está exibindo em tempo real.
10. **Ocultação Automática do Cursor**: O cursor do mouse e controles somem após inatividade para uma experiência de quadro limpo.

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
