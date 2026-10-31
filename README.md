# 🖼️ TravelFrame - Quadro Digital de Fotos Inteligente

Projeto completo de painel/quadro digital de fotos para exibição contínua em monitores, Smart TVs ou telas dedicadas (Raspberry Pi / Debian / Mini PC), com controle centralizado via navegador.

---

## 🚀 Como Rodar no Servidor (Debian / Linux)

### 1. Pré-requisitos
Certifique-se de ter o **Node.js (v18 ou superior)** e **npm** instalados:
```bash
# No Debian / Ubuntu:
sudo apt update && sudo apt install -y nodejs npm
```

### 2. Instalação das Dependências
Na pasta do projeto:
```bash
npm install
```

### 3. Modo Desenvolvimento (com Hot-Reload)
Abra dois terminais (ou use o modo produção abaixo):
```bash
# Terminal 1 - Inicia o servidor backend na porta 3070:
npm run server

# Terminal 2 - Inicia o Vite frontend na porta 5173:
npm run dev
```

### 4. Modo Produção com Node.js
Gera o build estático do frontend e roda tudo de forma unificada no Express na porta `3070`:
```bash
npm run build
npm start
```

### 5. Modo Produção com Docker (Recomendado)
Para rodar de forma isolada em qualquer servidor Linux/Debian com persistência de volumes:
```bash
docker compose up -d --build
```
Acesse no seu navegador: `http://localhost:3070` ou pelo IP da sua rede (ex: `http://192.168.1.100:3070`).

---

## 📺 Como colocar o Monitor em Modo Quadro (Kiosk)

No monitor ou Smart TV, basta abrir a URL com o parâmetro do dispositivo:
```
http://IP_DO_SERVIDOR:3070/display?device=sala
```

### Recursos Automáticos no Modo Quadro:
1. **Rotação Completa de Canvas (Modo Monitor Retrato/Vertical)**: Toda a tela — foto, relógio, clima, legenda de título/localização e controles — gira conjuntamente (em `-90°` ou `+90°`). Quando você gira o monitor fisicamente na parede ou suporte, tudo fica perfeitamente horizontal e legível aos seus olhos, sem elementos deitados de lado!
2. **Ocultação do Cursor e Menus**: Após 3 segundos sem mexer o mouse, todos os botões e o cursor desaparecem para parecer uma moldura limpa de quadro.
3. **Wake Lock API**: Impede o monitor ou sistema de desligar ou entrar em suspensão enquanto o slideshow está ativo.
4. **Fundo Desfocado (Ambient Backlight / Blur)**: Em fotos com proporções diferentes, preenche as laterais com efeito blur suave da própria foto.
5. **Efeito Ken Burns**: Movimento panorâmico lento e sutil nas fotos estilo Apple TV screensaver.
6. **Widget de Clima e Relógio**: Mostra hora, dia da semana e temperatura local em tempo real (Open-Meteo, sem necessidade de chave de API).
7. **Controle Remoto e Modo Repouso**: Através de outro celular ou computador na mesma rede, você pode colocar o monitor em repouso (tela preta com economia de energia) ou trocar o álbum na hora.

---

## 🛠️ Executar Automaticamente no Boot do Debian (Systemd)

Crie o arquivo de serviço do systemd:
```bash
sudo nano /etc/systemd/system/travel-frame.service
```

Cole a configuração:
```ini
[Unit]
Description=TravelFrame Photo Server
After=network.target

[Service]
Type=simple
User=seu_usuario
WorkingDirectory=/home/seu_usuario/travel-frame
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=PORT=3070
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Ative e inicie:
```bash
sudo systemctl daemon-reload
sudo systemctl enable travel-frame
sudo systemctl start travel-frame
```

---

## 🖥️ Inicializar o Chromium em Tela Cheia no Monitor (Kiosk)

Se estiver usando um Raspberry Pi ou Debian Desktop conectado ao monitor via HDMI:
```bash
chromium-browser --noerrdialogs --disable-infobars --kiosk "http://localhost:3070/display?device=sala"
```
