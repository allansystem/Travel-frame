import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3070;

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const DEVICES_FILE = path.join(DATA_DIR, 'devices.json');

// Garante que os diretórios necessários existem
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Estado inicial padrão
const DEFAULT_STATE = {
  albums: [
    {
      id: 'alb-1',
      name: 'Mochilão Chile & Deserto de Atacama',
      cover: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      description: 'Cordilheira dos Andes, Geysers e Céu Estrelado',
      orientation: 'horizontal',
      fitMode: 'contain-blur',
      slideSpeed: 7,
      showClockWidget: true,
      showWeatherWidget: true,
      showLocation: true,
      showTitle: true,
      showDescription: true,
      shuffleMedia: false,
      videoSound: false,
      sortBy: 'date',
      sortOrder: 'desc',
      sleepRules: []
    }
  ],
  mediaList: [
    {
      id: 'demo-1',
      albumId: 'alb-1',
      title: 'Deserto do Atacama',
      location: 'San Pedro de Atacama, Chile',
      date: '2026-03-15',
      camera: 'Sony A7 IV',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=85'
    },
    {
      id: 'demo-2',
      albumId: 'alb-1',
      title: 'Cordilheira dos Andes ao Pôr do Sol',
      location: 'Valle de la Luna, Chile',
      date: '2026-03-16',
      camera: 'iPhone 15 Pro',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85'
    },
    {
      id: 'demo-3',
      albumId: 'alb-1',
      title: 'Céu Noturno e Via Láctea',
      location: 'Observatório Alma, Atacama',
      date: '2026-03-17',
      camera: 'Canon EOS R5',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85'
    }
  ],
  schedules: [],
  googleClientId: '',
  settings: {
    transitionEffect: 'fade',
    scheduleEnabled: true,
    autoRotatePortrait: false,
    kenBurns: true,
    albumsSortBy: 'custom',
    albumsSortOrder: 'asc'
  }
};

function readJsonFile(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Erro ao ler ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Erro ao salvar ${filePath}:`, err);
  }
}

// Inicializa estado e dispositivos
let state = readJsonFile(STATE_FILE, DEFAULT_STATE);

// Auto-popula tamanho dos arquivos (size em bytes) para mídias existentes
if (state.mediaList && Array.isArray(state.mediaList)) {
  let updatedAny = false;
  state.mediaList.forEach(item => {
    if ((!item.size || item.size === 0) && item.url && item.url.startsWith('/uploads/')) {
      try {
        const filePath = path.join(UPLOADS_DIR, path.basename(item.url));
        if (fs.existsSync(filePath)) {
          item.size = fs.statSync(filePath).size;
          updatedAny = true;
        }
      } catch (e) {}
    }
  });
  if (updatedAny) {
    writeJsonFile(STATE_FILE, state);
  }
}
let registeredDevices = readJsonFile(DEVICES_FILE, {
  matriz: {
    deviceId: 'matriz',
    albumId: 'all',
    sleepMode: false,
    lastSeen: Date.now(),
    lastUpdated: Date.now()
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// 1. ESTADO GLOBAL
app.get('/api/state', (req, res) => {
  res.json(state);
});

app.post('/api/state', (req, res) => {
  const updates = req.body;
  state = {
    ...state,
    ...updates,
    settings: {
      ...(state.settings || {}),
      ...(updates.settings || {})
    }
  };
  writeJsonFile(STATE_FILE, state);
  res.json({ success: true, state });
});

// 2. DISPOSITIVOS / TELÕES
app.get('/api/devices', (req, res) => {
  res.json(registeredDevices);
});

app.get('/api/device/:id', (req, res) => {
  const devId = String(req.params.id).trim().toLowerCase();
  
  if (!registeredDevices[devId]) {
    registeredDevices[devId] = {
      deviceId: devId,
      albumId: 'all',
      sleepMode: false,
      lastSeen: Date.now(),
      lastUpdated: Date.now()
    };
  } else {
    // Atualiza heartbeat automaticamente na leitura do dispositivo
    registeredDevices[devId].lastSeen = Date.now();
  }
  
  writeJsonFile(DEVICES_FILE, registeredDevices);
  res.json(registeredDevices[devId]);
});

app.post('/api/devices/update', (req, res) => {
  const { deviceId, albumId, sleepMode, rotation } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId obrigatório' });
  
  const devId = String(deviceId).trim().toLowerCase();
  registeredDevices[devId] = {
    ...(registeredDevices[devId] || {}),
    deviceId: devId,
    albumId: albumId !== undefined ? albumId : (registeredDevices[devId]?.albumId || 'all'),
    sleepMode: sleepMode !== undefined ? Boolean(sleepMode) : (registeredDevices[devId]?.sleepMode || false),
    rotation: rotation !== undefined ? rotation : (registeredDevices[devId]?.rotation || 'auto'),
    lastUpdated: Date.now()
  };
  
  writeJsonFile(DEVICES_FILE, registeredDevices);
  res.json({ success: true, device: registeredDevices[devId] });
});

app.post('/api/devices/delete', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId obrigatório' });
  const devId = String(deviceId).trim().toLowerCase();
  delete registeredDevices[devId];
  writeJsonFile(DEVICES_FILE, registeredDevices);
  res.json({ success: true });
});

// 3. UPLOAD VIA STREAM (Com suporte a grandes arquivos sem travar memória)
app.post('/api/upload-stream', (req, res) => {
  try {
    const rawFilename = req.headers['x-filename'] ? decodeURIComponent(req.headers['x-filename']) : `media-${Date.now()}.jpg`;
    const albumId = req.headers['x-album-id'] || 'all';
    const title = req.headers['x-title'] ? decodeURIComponent(req.headers['x-title']) : path.basename(rawFilename, path.extname(rawFilename));
    const date = req.headers['x-date'] || new Date().toISOString().split('T')[0];
    const camera = req.headers['x-camera'] ? decodeURIComponent(req.headers['x-camera']) : 'Câmera';
    const location = req.headers['x-location'] ? decodeURIComponent(req.headers['x-location']) : '';

    const ext = path.extname(rawFilename) || '.jpg';
    const isVideo = ['.mp4', '.webm', '.mov', '.m4v'].includes(ext.toLowerCase());
    const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, safeFilename);

    const writeStream = fs.createWriteStream(destinationPath);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      let fileSize = 0;
      try {
        if (fs.existsSync(destinationPath)) {
          fileSize = fs.statSync(destinationPath).size;
        }
      } catch (e) {}

      const newItem = {
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        albumId: albumId,
        title: title,
        location: location,
        date: date,
        camera: camera,
        type: isVideo ? 'video' : 'image',
        size: fileSize,
        url: `/uploads/${safeFilename}`
      };

      state.mediaList = [newItem, ...(state.mediaList || [])];
      writeJsonFile(STATE_FILE, state);

      res.status(201).json({ success: true, item: newItem });
    });

    writeStream.on('error', (err) => {
      console.error('Erro de escrita no upload:', err);
      res.status(500).json({ error: 'Falha ao salvar arquivo no disco' });
    });
  } catch (err) {
    console.error('Erro no upload-stream:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETAR MÍDIA
app.delete('/api/media/:id', (req, res) => {
  const mediaId = req.params.id;
  const item = state.mediaList.find(m => m.id === mediaId);
  if (item && item.url && item.url.startsWith('/uploads/')) {
    const filename = path.basename(item.url);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }

  state.mediaList = state.mediaList.filter(m => m.id !== mediaId);
  writeJsonFile(STATE_FILE, state);
  res.json({ success: true });
});

// 5. SERVE STATIC BUILD (PRODUÇÃO)
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🖼️  TravelFrame Server rodando na porta ${PORT}`);
  console.log(`🌐 Acesso Local: http://localhost:${PORT}`);
  console.log(`📁 Armazenamento: ${UPLOADS_DIR}`);
  console.log(`===============================================`);
});
