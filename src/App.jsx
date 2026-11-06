import React, { useState, useEffect, useRef, useMemo } from 'react';
import exifr from 'exifr';
import { 
  Play, Pause, SkipForward, SkipBack, Maximize, Minimize, Settings, 
  Upload, Image as ImageIcon, Video, Clock, MapPin, Cloud, 
  Moon, Sun, Trash2, Shuffle, Layers, Sparkles, ArrowLeft, Plus, 
  Camera, Key, CheckCircle2, AlertCircle, Folder, Monitor, Volume2, VolumeX, Eye, Edit3, Star, Calendar, Check, MoveRight, RotateCcw, RotateCw, Tv, RefreshCw, Film, Copy, Clock3, CalendarDays, Type, AlignLeft, AlertTriangle, CloudSun, SunMedium,
  ChevronLeft, ChevronRight, X, HardDrive, ArrowUpDown, SlidersHorizontal, Download, ChevronUp, ChevronDown, GripVertical
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 0, label: 'Dom', full: 'Domingo' },
  { id: 1, label: 'Seg', full: 'Segunda' },
  { id: 2, label: 'Ter', full: 'Terça' },
  { id: 3, label: 'Qua', full: 'Quarta' },
  { id: 4, label: 'Qui', full: 'Quinta' },
  { id: 5, label: 'Sex', full: 'Sexta' },
  { id: 6, label: 'Sáb', full: 'Sábado' }
];

const DEFAULT_ALBUMS = [
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
];

export default function TravelFrameApp() {
  const searchParams = new URLSearchParams(window.location.search);
  const currentDeviceParam = searchParams.get('device') || (window.location.pathname.includes('/display') ? 'matriz' : null);
  const isKioskDisplayMode = Boolean(currentDeviceParam);
  
  const [activeTab, setActiveTab] = useState(isKioskDisplayMode ? 'slideshow' : 'devices');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Álbuns e Mídia
  const [albums, setAlbums] = useState(DEFAULT_ALBUMS);
  const [albumSortBy, setAlbumSortBy] = useState('custom');
  const [albumSortOrder, setAlbumSortOrder] = useState('asc');
  const [draggedAlbumIndex, setDraggedAlbumIndex] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('all');
  const [viewingAlbumId, setViewingAlbumId] = useState(null);
  
  // Visualizador de Foto (Lightbox)
  const [previewMediaItem, setPreviewMediaItem] = useState(null);
  const [videoModalError, setVideoModalError] = useState(false);
  const [videoPlaybackError, setVideoPlaybackError] = useState(false);

  useEffect(() => {
    setVideoModalError(false);
  }, [previewMediaItem]);
  
  // Formulário Criar Álbum
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumOrientation, setNewAlbumOrientation] = useState('horizontal');
  const [newAlbumFitMode, setNewAlbumFitMode] = useState('contain-blur');
  const [newAlbumSlideSpeed, setNewAlbumSlideSpeed] = useState(7);
  const [newAlbumShowClock, setNewAlbumShowClock] = useState(true);
  const [newAlbumShowWeather, setNewAlbumShowWeather] = useState(true);
  const [newAlbumShowLocation, setNewAlbumShowLocation] = useState(true);
  const [newAlbumShowTitle, setNewAlbumShowTitle] = useState(true);
  const [newAlbumShowDesc, setNewAlbumShowDesc] = useState(true);
  const [newAlbumShuffle, setNewAlbumShuffle] = useState(false);
  const [newAlbumVideoSound, setNewAlbumVideoSound] = useState(false);
  const [newAlbumSortBy, setNewAlbumSortBy] = useState('date');
  const [newAlbumSortOrder, setNewAlbumSortOrder] = useState('desc');
  
  // Formulário Editar Álbum
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editAlbumDesc, setEditAlbumDesc] = useState('');
  const [editAlbumOrientation, setEditAlbumOrientation] = useState('horizontal');
  const [editAlbumFitMode, setEditAlbumFitMode] = useState('contain-blur');
  const [editAlbumSlideSpeed, setEditAlbumSlideSpeed] = useState(7);
  const [editAlbumShowClock, setEditAlbumShowClock] = useState(true);
  const [editAlbumShowWeather, setEditAlbumShowWeather] = useState(true);
  const [editAlbumShowLocation, setEditAlbumShowLocation] = useState(true);
  const [editAlbumShowTitle, setEditAlbumShowTitle] = useState(true);
  const [editAlbumShowDesc, setEditAlbumShowDesc] = useState(true);
  const [editAlbumShuffle, setEditAlbumShuffle] = useState(false);
  const [editAlbumVideoSound, setEditAlbumVideoSound] = useState(false);
  const [editAlbumSortBy, setEditAlbumSortBy] = useState('date');
  const [editAlbumSortOrder, setEditAlbumSortOrder] = useState('desc');
  
  // Upload Manual
  const manualFileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  
  // Google Fotos
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleAccessToken, setGoogleAccessToken] = useState(() => localStorage.getItem('tf_google_token') || null);
  const [googleUserEmail, setGoogleUserEmail] = useState(() => localStorage.getItem('tf_google_email') || '');
  const [isImportingGoogle, setIsImportingGoogle] = useState(false);
  const [targetGoogleAlbum, setTargetGoogleAlbum] = useState('');
  const [importStatusText, setImportStatusText] = useState('');
  
  // Rotação de Monitor e Visualização Vertical Unificada (Tela Inteira + Sobreposições)
  const [screenRotationMode, setScreenRotationMode] = useState('auto');
  const [autoRotateDirection, setAutoRotateDirection] = useState(-90);
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [kenBurnsEffect, setKenBurnsEffect] = useState(true);
  
  // Slideshow
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Clima ao Vivo (Open-Meteo)
  const [weatherData, setWeatherData] = useState(null);
  
  // Auto-ocultar cursor e controles no modo Quadro Digital
  const [controlsVisible, setControlsVisible] = useState(true);
  const idleTimeoutRef = useRef(null);
  
  // Estado do Repouso / Dormir
  const [isCurrentlySleeping, setIsCurrentlySleeping] = useState(false);
  const [activeSleepReason, setActiveSleepReason] = useState('');
  
  // Agendador de Álbuns (Inicializado com 'SLEEP' para evitar bugs de dropdown vazio)
  const [albumSchedules, setAlbumSchedules] = useState([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [newSchedAlbumId, setNewSchedAlbumId] = useState('SLEEP');
  const [newSchedDeviceId, setNewSchedDeviceId] = useState('all');
  const [newSchedDays, setNewSchedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [newSchedStart, setNewSchedStart] = useState('22:00');
  const [newSchedEnd, setNewSchedEnd] = useState('07:00');
  const [draggedScheduleIndex, setDraggedScheduleIndex] = useState(null);
  
  // Dispositivos Remotos
  const [registeredDevices, setRegisteredDevices] = useState({});
  const [newDeviceName, setNewDeviceName] = useState('');
  const [remoteCommandStatus, setRemoteCommandStatus] = useState('');
  const [copiedDevId, setCopiedDevId] = useState(null);
  
  // Controle de Modo Aleatório (Shuffle) e Histórico de Navegação
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [shuffleToast, setShuffleToast] = useState('');
  const slideHistoryRef = useRef([]);
  
  const videoRef = useRef(null);
  const slideshowContainerRef = useRef(null);
  const activeRuleIdRef = useRef(null);
  const wakeLockRef = useRef(null);
  const lastStateRawRef = useRef('');
  const lastSlideChangeTimeRef = useRef(Date.now());
  const lastAppliedCommandTimeRef = useRef(0);
  
  const selectedAlbumIdRef = useRef(selectedAlbumId);
  selectedAlbumIdRef.current = selectedAlbumId;
  const isCurrentlySleepingRef = useRef(isCurrentlySleeping);
  isCurrentlySleepingRef.current = isCurrentlySleeping;
  const screenRotationModeRef = useRef(screenRotationMode);
  screenRotationModeRef.current = screenRotationMode;
  
  // Formatação amigável de tamanho de arquivo
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes <= 0) return 'Tam. n/d';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Funções matemáticas de tempo e intervalos
  const toMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  
  const isTimeInInterval = (curMinutes, startStr, endStr) => {
    const s = toMinutes(startStr);
    const e = toMinutes(endStr);
    if (s <= e) {
      return curMinutes >= s && curMinutes < e;
    } else {
      // Cruzamento de meia-noite (ex: 22:00 até 07:00)
      return curMinutes >= s || curMinutes < e;
    }
  };

  const getIntervalSegments = (startStr, endStr) => {
    const s = toMinutes(startStr);
    const e = toMinutes(endStr);
    if (s === e) return [];
    if (s < e) return [{ start: s, end: e }];
    return [
      { start: s, end: 1440 },
      { start: 0, end: e }
    ];
  };

  const checkIntervalOverlap = (s1, e1, s2, e2) => {
    const segs1 = getIntervalSegments(s1, e1);
    const segs2 = getIntervalSegments(s2, e2);
    for (const a of segs1) {
      for (const b of segs2) {
        if (a.start < b.end && b.start < a.end) return true;
      }
    }
    return false;
  };
  
  const cleanDeviceId = (id) => {
    if (!id) return 'all';
    return String(id)
      .replace(/^Telão:\s*\[?/i, '')
      .replace(/\]$/, '')
      .trim()
      .toLowerCase();
  };
  
  // 1. CARREGAR ESTADO DO BACKEND
  const fetchServerState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const rawText = await res.text();
        lastStateRawRef.current = rawText;
        const data = JSON.parse(rawText);
        if (data.albums && data.albums.length > 0) {
          setAlbums(data.albums);
        }
        if (data.mediaList) setMediaList(data.mediaList);
        if (Array.isArray(data.schedules)) setAlbumSchedules(data.schedules);
        if (data.googleClientId) setGoogleClientId(data.googleClientId);
        
        if (data.settings) {
          if (data.settings.transitionEffect) setTransitionEffect(data.settings.transitionEffect);
          if (data.settings.scheduleEnabled !== undefined) setScheduleEnabled(data.settings.scheduleEnabled);
          if (data.settings.screenRotationMode) setScreenRotationMode(data.settings.screenRotationMode);
          if (data.settings.autoRotateDirection !== undefined) setAutoRotateDirection(data.settings.autoRotateDirection);
          if (data.settings.kenBurns !== undefined) setKenBurnsEffect(data.settings.kenBurns);
          if (data.settings.albumsSortBy) setAlbumSortBy(data.settings.albumsSortBy);
          if (data.settings.albumsSortOrder) setAlbumSortOrder(data.settings.albumsSortOrder);
        }
      }
    } catch (e) {
      console.warn('Backend offline ou inacessível no momento:', e);
    } finally {
      setIsLoaded(true);
    }
  };
  
  useEffect(() => {
    fetchServerState();
  }, []);
  
  const syncWithServer = async (partialUpdate) => {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialUpdate)
      });
    } catch (err) {
      console.error('Falha ao sincronizar com backend:', err);
    }
  };
  
  // 2. POLLING DO KIOSK (Respeita Agendamentos Ativos e Comandos Remotos)
  useEffect(() => {
    if (!currentDeviceParam) return;
    const myCleanId = cleanDeviceId(currentDeviceParam);
    
    const devicePoller = setInterval(async () => {
      try {
        const resDev = await fetch(`/api/device/${encodeURIComponent(myCleanId)}`);
        if (resDev.ok) {
          const deviceConfig = await resDev.json();
          const remoteCommandTime = deviceConfig.lastUpdated || 1;

          // Aplica comandos remotos na inicialização ou quando um comando novo for explicitamente enviado pelo painel
          if (remoteCommandTime > lastAppliedCommandTimeRef.current) {
            lastAppliedCommandTimeRef.current = remoteCommandTime;

            // Só obedece comandos manuais se NÃO houver agendamento em andamento
            if (!activeRuleIdRef.current) {
              if (deviceConfig.sleepMode !== undefined && deviceConfig.sleepMode !== isCurrentlySleepingRef.current) {
                setIsCurrentlySleeping(deviceConfig.sleepMode);
                if (deviceConfig.sleepMode) setActiveSleepReason('Comando Remoto');
              }
              if (deviceConfig.albumId && deviceConfig.albumId !== selectedAlbumIdRef.current) {
                setSelectedAlbumId(deviceConfig.albumId);
                setCurrentIndex(0);
                lastSlideChangeTimeRef.current = Date.now();
              }
            }
            if (deviceConfig.rotation && deviceConfig.rotation !== screenRotationModeRef.current) {
              setScreenRotationMode(deviceConfig.rotation);
            }
          }
        }
        
        const resState = await fetch('/api/state');
        if (resState.ok) {
          const rawText = await resState.text();
          // Só atualiza os estados se os dados no servidor tiverem sido realmente alterados
          if (rawText !== lastStateRawRef.current) {
            lastStateRawRef.current = rawText;
            const data = JSON.parse(rawText);
            if (data.albums) setAlbums(data.albums);
            if (data.mediaList) setMediaList(data.mediaList);
            if (Array.isArray(data.schedules)) setAlbumSchedules(data.schedules);
          }
        }
      } catch (e) {}
    }, 2500);
    
    return () => clearInterval(devicePoller);
  }, [currentDeviceParam]);
  
  // 3. POLLING DO PAINEL GESTOR
  const fetchRegisteredDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      if (res.ok) {
        const data = await res.json();
        setRegisteredDevices(data);
      }
    } catch (e) {}
  };
  
  useEffect(() => {
    if (activeTab === 'devices' || activeTab === 'schedules' || !isKioskDisplayMode) {
      fetchRegisteredDevices();
      const interval = setInterval(fetchRegisteredDevices, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isKioskDisplayMode]);

  // 4. PREVENIR DESLIGAMENTO DA TELA (WakeLock API)
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && activeTab === 'slideshow' && !isCurrentlySleeping) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {}
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [activeTab, isCurrentlySleeping]);

  // 5. OCULTAR CURSOR E CONTROLES APÓS INATIVIDADE (Modo Quadro Limpo)
  useEffect(() => {
    if (activeTab !== 'slideshow') {
      document.body.classList.remove('cursor-hidden');
      setControlsVisible(true);
      return;
    }

    const resetIdle = () => {
      setControlsVisible(true);
      document.body.classList.remove('cursor-hidden');
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
        document.body.classList.add('cursor-hidden');
      }, 3500);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      document.body.classList.remove('cursor-hidden');
    };
  }, [activeTab]);

  // 6. METEOROLOGIA AO VIVO (Open-Meteo)
  useEffect(() => {
    const fetchWeather = async (lat = -23.55, lon = -46.63) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
        if (res.ok) {
          const data = await res.json();
          if (data.current) {
            setWeatherData({
              temp: Math.round(data.current.temperature_2m),
              code: data.current.weather_code
            });
          }
        }
      } catch (err) {}
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather()
      );
    } else {
      fetchWeather();
    }

    const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, []);
  
  // 7. FUNÇÃO COPIAR UNIVERSAL
  const handleCopyUrl = (text, devId) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedDevId(devId);
      setTimeout(() => setCopiedDevId(null), 2500);
    } catch (e) {
      prompt('Copie o link manualmente:', text);
    }
  };
  
  // 8. ATUALIZAR E REMOVER TELÕES
  const handleSendDeviceCommand = async (deviceId, targetAlbId, sleep = false, rotation = undefined) => {
    const cleanId = cleanDeviceId(deviceId);
    const targetRotation = rotation !== undefined ? rotation : (registeredDevices[cleanId]?.rotation || 'auto');
    
    setRegisteredDevices(prev => ({
      ...prev,
      [cleanId]: {
        ...(prev[cleanId] || {}),
        deviceId: cleanId,
        albumId: targetAlbId,
        sleepMode: sleep,
        rotation: targetRotation,
        lastUpdated: Date.now()
      }
    }));
    
    setRemoteCommandStatus(`Atualizando [${cleanId}]...`);
    try {
      const res = await fetch('/api/devices/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: cleanId,
          albumId: targetAlbId,
          sleepMode: sleep,
          rotation: targetRotation,
          commandTimestamp: Date.now()
        })
      });
      if (res.ok) {
        setRemoteCommandStatus(`[${cleanId}] atualizado com sucesso!`);
        fetchRegisteredDevices();
        setTimeout(() => setRemoteCommandStatus(''), 2500);
      }
    } catch (err) {
      setRemoteCommandStatus('Erro ao enviar comando');
    }
  };
  
  const handleRegisterNewDevice = () => {
    if (!newDeviceName.trim()) return;
    const cleanId = cleanDeviceId(newDeviceName);
    handleSendDeviceCommand(cleanId, 'all', false, 'auto');
    setNewDeviceName('');
  };
  
  const handleDeleteDevice = async (deviceId) => {
    const cleanId = cleanDeviceId(deviceId);
    if (!window.confirm(`Tem certeza que deseja remover o telão [${cleanId}]?`)) return;
    try {
      await fetch('/api/devices/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: cleanId })
      });
      fetchRegisteredDevices();
    } catch (err) {}
  };
  
  // 9. MOTOR DE AGENDAMENTO (Execução Robusta e Confiável com Suporte a Meia-Noite)
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const currentDay = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      if (scheduleEnabled && Array.isArray(albumSchedules) && albumSchedules.length > 0) {
        const targetDevId = isKioskDisplayMode ? cleanDeviceId(currentDeviceParam) : 'all';
        
        const matchingSchedule = albumSchedules.find(s => {
          const ruleDev = cleanDeviceId(s.deviceId);
          const matchDevice = ruleDev === 'all' || ruleDev === targetDevId;
          if (!matchDevice) return false;

          const daysArray = Array.isArray(s.days) ? s.days : [0, 1, 2, 3, 4, 5, 6];
          const sMin = toMinutes(s.start);
          const eMin = toMinutes(s.end);

          // Se o agendamento cruzar a meia-noite (ex: 22:00 até 07:00):
          if (sMin > eMin && currentMinutes < eMin) {
            // Horário da madrugada pertence ao agendamento iniciado ontem
            const yesterday = (currentDay + 6) % 7;
            if (!daysArray.includes(yesterday)) return false;
          } else {
            // Horário padrão do mesmo dia
            if (!daysArray.includes(currentDay)) return false;
          }
          
          return isTimeInInterval(currentMinutes, s.start, s.end);
        });
        
        if (matchingSchedule) {
          if (activeRuleIdRef.current !== matchingSchedule.id) {
            activeRuleIdRef.current = matchingSchedule.id;
            
            if (matchingSchedule.albumId === 'SLEEP') {
              setIsCurrentlySleeping(true);
              setActiveSleepReason(matchingSchedule.ruleName || 'Modo Repouso Agendado');
            } else {
              if (isCurrentlySleeping) {
                setIsCurrentlySleeping(false);
              }
              setSelectedAlbumId(matchingSchedule.albumId);
              setCurrentIndex(0);
            }
          }
        } else {
          // Nenhuma regra ativa no momento
          if (activeRuleIdRef.current !== null) {
            activeRuleIdRef.current = null;
            if (isCurrentlySleeping && activeSleepReason.includes('Repouso')) {
              setIsCurrentlySleeping(false);
              setActiveSleepReason('');
            }
          }
        }
      }
    }, 1000);
    
    return () => clearInterval(clockTimer);
  }, [scheduleEnabled, albumSchedules, currentDeviceParam, isKioskDisplayMode, isCurrentlySleeping, activeSleepReason]);
  
  const handleToggleDayForAlbum = (dayId) => {
    setNewSchedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort()
    );
  };
  
  // ADICIONAR AGENDAMENTO COM VALIDAÇÃO DE DUPLICATAS E CONFLITOS DE HORÁRIO
  const handleAddAlbumSchedule = () => {
    const targetAlbum = newSchedAlbumId || 'SLEEP';
    if (newSchedDays.length === 0) {
      alert('⚠️ Selecione pelo menos um dia da semana para o agendamento.');
      return;
    }
    if (newSchedStart === newSchedEnd) {
      alert('⚠️ O horário de início e fim não podem ser iguais.');
      return;
    }
    
    const cleanTargetDev = cleanDeviceId(newSchedDeviceId);
    const isSleepAction = targetAlbum === 'SLEEP';
    const albumName = isSleepAction ? 'Modo Dormir' : (albums.find(a => a.id === targetAlbum)?.name || 'Álbum');

    // 1. BLOQUEIO DE AGENDAMENTO EXATAMENTE IGUAL (DUPLICADO)
    const isExactDuplicate = albumSchedules.some(s => {
      const devMatch = cleanDeviceId(s.deviceId) === cleanTargetDev;
      const albMatch = s.albumId === targetAlbum;
      const startMatch = s.start === newSchedStart;
      const endMatch = s.end === newSchedEnd;
      const sDays = Array.isArray(s.days) ? [...s.days].sort().join(',') : '';
      const nDays = [...newSchedDays].sort().join(',');
      return devMatch && albMatch && startMatch && endMatch && sDays === nDays;
    });

    if (isExactDuplicate) {
      alert('⚠️ Este agendamento já existe exatamente igual cadastrado na lista!');
      return;
    }

    // 2. BLOQUEIO DE CONFLITO DE HORÁRIO NO MESMO DISPOSITIVO
    const conflictingSchedule = albumSchedules.find(s => {
      const sDev = cleanDeviceId(s.deviceId);
      const devConflict = sDev === cleanTargetDev || sDev === 'all' || cleanTargetDev === 'all';
      if (!devConflict) return false;

      const sDays = Array.isArray(s.days) ? s.days : [0, 1, 2, 3, 4, 5, 6];
      const dayConflict = sDays.some(d => newSchedDays.includes(d));
      if (!dayConflict) return false;

      return checkIntervalOverlap(s.start, s.end, newSchedStart, newSchedEnd);
    });

    if (conflictingSchedule) {
      const conflictDevName = getDeviceDisplayName(conflictingSchedule.deviceId);
      alert(
        `⚠️ Conflito de Horário Detectado!\n\nJá existe a regra "${conflictingSchedule.ruleName}" no ${conflictDevName} (${conflictingSchedule.start} às ${conflictingSchedule.end}) para os mesmos dias.\n\nAltere o horário ou exclua o agendamento conflitante.`
      );
      return;
    }
    
    const newRule = {
      id: `sched-alb-${Date.now()}`,
      albumId: targetAlbum,
      ruleName: albumName,
      deviceId: cleanTargetDev,
      days: [...newSchedDays].sort(),
      start: newSchedStart,
      end: newSchedEnd
    };
    
    const updated = [...albumSchedules, newRule];
    setAlbumSchedules(updated);
    syncWithServer({ schedules: updated });
  };
  
  const handleDeleteAlbumSchedule = (ruleId) => {
    const updated = albumSchedules.filter(s => s.id !== ruleId);
    setAlbumSchedules(updated);
    syncWithServer({ schedules: updated });
  };

  // Mover agendamento para cima ou para baixo na lista
  const handleMoveSchedule = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= albumSchedules.length) return;
    const updated = [...albumSchedules];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setAlbumSchedules(updated);
    syncWithServer({ schedules: updated });
  };

  // Ordenar agendamentos cronologicamente pelo horário de início
  const handleSortSchedulesChronologically = () => {
    if (!albumSchedules || albumSchedules.length <= 1) return;
    const updated = [...albumSchedules].sort((a, b) => {
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      return a.end.localeCompare(b.end);
    });
    setAlbumSchedules(updated);
    syncWithServer({ schedules: updated });
  };

  // Drag and Drop de agendamentos
  const handleDragStartSchedule = (index) => {
    setDraggedScheduleIndex(index);
  };

  const handleDropSchedule = (targetIndex) => {
    if (draggedScheduleIndex === null || draggedScheduleIndex === targetIndex) return;
    const updated = [...albumSchedules];
    const [moved] = updated.splice(draggedScheduleIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setAlbumSchedules(updated);
    syncWithServer({ schedules: updated });
    setDraggedScheduleIndex(null);
  };
  
  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) return;
    const newAlb = {
      id: `alb-${Date.now()}`,
      name: newAlbumName.trim(),
      description: newAlbumDesc.trim() || '',
      cover: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      orientation: newAlbumOrientation,
      fitMode: newAlbumFitMode,
      slideSpeed: newAlbumSlideSpeed,
      showClockWidget: newAlbumShowClock,
      showWeatherWidget: newAlbumShowWeather,
      showLocation: newAlbumShowLocation,
      showTitle: newAlbumShowTitle,
      showDescription: newAlbumShowDesc,
      shuffleMedia: newAlbumShuffle,
      videoSound: newAlbumVideoSound,
      sortBy: newAlbumSortBy || 'date',
      sortOrder: newAlbumSortOrder || 'desc'
    };
    const updated = [...albums, newAlb];
    setAlbums(updated);
    syncWithServer({ albums: updated });
    setNewAlbumName('');
    setNewAlbumDesc('');
    setIsCreatingAlbum(false);
  };
  
  const handleSaveEditAlbum = () => {
    if (!editAlbumName.trim()) return;
    const updated = albums.map(a => a.id === editingAlbumId ? {
      ...a,
      name: editAlbumName.trim(),
      description: editAlbumDesc.trim(),
      orientation: editAlbumOrientation,
      fitMode: editAlbumFitMode,
      slideSpeed: editAlbumSlideSpeed,
      showClockWidget: editAlbumShowClock,
      showWeatherWidget: editAlbumShowWeather,
      showLocation: editAlbumShowLocation,
      showTitle: editAlbumShowTitle,
      showDescription: editAlbumShowDesc,
      shuffleMedia: editAlbumShuffle,
      videoSound: editAlbumVideoSound,
      sortBy: editAlbumSortBy || a.sortBy || 'date',
      sortOrder: editAlbumSortOrder || a.sortOrder || 'desc'
    } : a);
    setAlbums(updated);
    syncWithServer({ albums: updated });
    setEditingAlbumId(null);
  };
  
  const handleDeleteAlbum = (albumId, albumName) => {
    if (!window.confirm(`Excluir álbum "${albumName}"?`)) return;
    const updatedAlbums = albums.filter(a => a.id !== albumId);
    const updatedMedia = mediaList.filter(m => m.albumId !== albumId);
    const updatedSched = albumSchedules.filter(s => s.albumId !== albumId);
    
    setAlbums(updatedAlbums);
    setMediaList(updatedMedia);
    setAlbumSchedules(updatedSched);
    
    syncWithServer({
      albums: updatedAlbums,
      mediaList: updatedMedia,
      schedules: updatedSched
    });
    
    if (viewingAlbumId === albumId) setViewingAlbumId(null);
    if (selectedAlbumId === albumId) setSelectedAlbumId('all');
  };
    
  const handleSetAsCover = (albumId, photoUrl) => {
    const updated = albums.map(a => a.id === albumId ? { ...a, cover: photoUrl } : a);
    setAlbums(updated);
    syncWithServer({ albums: updated });
  };
  
  const handleDeleteMedia = async (itemId) => {
    if (!window.confirm('Excluir esta mídia definitivamente?')) return;
    try {
      await fetch(`/api/media/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
    } catch (e) {}
    const updated = mediaList.filter(m => m.id !== itemId);
    setMediaList(updated);
    syncWithServer({ mediaList: updated });
  };

  // Upload por Stream
  const uploadSingleFileStream = (file, targetAlbum, albumName, index, total) => {
    return new Promise(async (resolve, reject) => {
      let metaDate = new Date().toISOString().split('T')[0];
      let metaCamera = 'Câmera';
      let metaLocation = albumName;
      
      try {
        if (!file.type.startsWith('video/')) {
          const exifData = await exifr.parse(file, { gps: true, xmp: true });
          if (exifData?.DateTimeOriginal) {
            metaDate = new Date(exifData.DateTimeOriginal).toISOString().split('T')[0];
          }
          if (exifData?.Model) metaCamera = exifData.Model;
          if (exifData?.latitude && exifData?.longitude) {
            metaLocation = `${exifData.latitude.toFixed(3)}°, ${exifData.longitude.toFixed(3)}°`;
          }
        }
      } catch (err) {}
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload-stream', true);
      xhr.setRequestHeader('X-Filename', encodeURIComponent(file.name));
      xhr.setRequestHeader('X-Album-Id', targetAlbum);
      xhr.setRequestHeader('X-Title', encodeURIComponent(file.name.replace(/\.[^/.]+$/, "")));
      xhr.setRequestHeader('X-Date', metaDate);
      xhr.setRequestHeader('X-Camera', encodeURIComponent(metaCamera));
      xhr.setRequestHeader('X-Location', encodeURIComponent(metaLocation));
      xhr.setRequestHeader('X-Size', String(file.size || 0));
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress({ filename: file.name, percent, current: index + 1, total });
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const item = { ...data.item, size: file.size || data.item?.size || 0 };
            resolve(item);
          } catch (e) { reject(e); }
        } else { reject(new Error(`HTTP ${xhr.status}`)); }
      };
      
      xhr.onerror = () => reject(new Error('Erro de conexão ao enviar'));
      xhr.send(file);
    });
  };
  
  const handleManualUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const targetAlbum = viewingAlbumId || selectedAlbumId || albums[0]?.id;
    const albumObj = albums.find(a => a.id === targetAlbum);
    const albumName = albumObj?.name || 'Local';
    
    setUploadProgress({ filename: 'Iniciando upload...', percent: 0, current: 0, total: files.length });
    
    for (let i = 0; i < files.length; i++) {
      try {
        const newItem = await uploadSingleFileStream(files[i], targetAlbum, albumName, i, files.length);
        setMediaList(prev => [newItem, ...prev]);
        if (albumObj && (!albumObj.cover || albumObj.cover.includes('unsplash'))) {
          handleSetAsCover(targetAlbum, newItem.url);
        }
      } catch (err) {
        alert(`Erro ao subir ${files[i].name}: ${err.message}`);
      }
    }
    
    setUploadProgress(null);
    if (manualFileInputRef.current) manualFileInputRef.current.value = '';
  };
    
  // Google Fotos OAuth
  const handleConnectGoogle = () => {
    if (!googleClientId.trim()) {
      alert('Introduza o seu Google Client ID primeiro.');
      return;
    }
    syncWithServer({ googleClientId: googleClientId.trim() });
    
    if (!window.google?.accounts?.oauth2) {
      alert('Biblioteca Google a carregar. Aguarde 3 segundos.');
      return;
    }
    
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId.trim(),
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
      callback: async (response) => {
        if (response.access_token) {
          setGoogleAccessToken(response.access_token);
          localStorage.setItem('tf_google_token', response.access_token);
          
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });
            if (userRes.ok) {
              const uData = await userRes.json();
              setGoogleUserEmail(uData.email || 'Conectado');
              localStorage.setItem('tf_google_email', uData.email || 'Conectado');
            } else {
              setGoogleUserEmail('Conectado');
            }
          } catch (e) {
            setGoogleUserEmail('Conectado');
          }
        }
      }
    });
    
    tokenClient.requestAccessToken({ prompt: 'consent' });
  };
  
  const handleDisconnectGoogle = () => {
    setGoogleAccessToken(null);
    setGoogleUserEmail('');
    localStorage.removeItem('tf_google_token');
    localStorage.removeItem('tf_google_email');
  };
  
  const handleImportGooglePhotos = async () => {
    if (!googleAccessToken) {
      handleConnectGoogle();
      return;
    }
    const destinationAlbumId = targetGoogleAlbum || albums[0]?.id;
    setIsImportingGoogle(true);
    setImportStatusText('Criando sessão do Google Picker...');
    
    try {
      const sessionRes = await fetch('https://photospicker.googleapis.com/v1/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (!sessionRes.ok) {
        handleConnectGoogle();
        throw new Error('Sessão expirada. Autentique novamente.');
      }
      const session = await sessionRes.json();
      
      const pickerWindow = window.open(session.pickerUri, '_blank', 'width=880,height=700');
      setImportStatusText('Selecione as fotos na janela e clique em Concluído...');
      
      let count = 0;
      const pollTimer = setInterval(async () => {
        count++;
        try {
          const sRes = await fetch(`https://photospicker.googleapis.com/v1/sessions/${encodeURIComponent(session.id)}`, {
            headers: { 'Authorization': `Bearer ${googleAccessToken}` }
          });
          if (sRes.ok) {
            const sData = await sRes.json();
            if (sData.mediaItemsSet) {
              clearInterval(pollTimer);
              setImportStatusText('Transferindo fotos para o servidor local...');
              try { if (pickerWindow) pickerWindow.close(); } catch(e){}
              
              const itemsRes = await fetch(`https://photospicker.googleapis.com/v1/mediaItems?sessionId=${encodeURIComponent(session.id)}&pageSize=100`, {
                headers: { 'Authorization': `Bearer ${googleAccessToken}` }
              });
              const itemsData = await itemsRes.json();
              const pickedList = itemsData.mediaItems || [];
              const albumObj = albums.find(a => a.id === destinationAlbumId);
              
              for (let i = 0; i < pickedList.length; i++) {
                const item = pickedList[i];
                const base = item.mediaFile?.baseUrl || item.baseUrl;
                if (base) {
                  const bRes = await fetch(`${base}=w1920-h1080`, { headers: { Authorization: `Bearer ${googleAccessToken}` } });
                  if (bRes.ok) {
                    const blob = await bRes.blob();
                    const file = new File([blob], `gphoto-${Date.now()}-${i}.jpg`, { type: blob.type });
                    const newItem = await uploadSingleFileStream(file, destinationAlbumId, albumObj?.name || 'Fotos', i, pickedList.length);
                    setMediaList(prev => [newItem, ...prev]);
                  }
                }
              }
              
              alert('Fotos importadas com sucesso!');
              setIsImportingGoogle(false);
              setImportStatusText('');
            }
          }
        } catch(e){}
        
        if (count > 120) {
          clearInterval(pollTimer);
          setIsImportingGoogle(false);
          setImportStatusText('');
        }
      }, 1500);
      
    } catch (e) {
      alert(e.message);
      setIsImportingGoogle(false);
      setImportStatusText('');
    }
  };
  
  // Helper para obter a data mais recente de fotos ou criação do álbum
  const getAlbumLatestDate = (alb, list) => {
    const albumMedia = list.filter(m => m.albumId === alb.id);
    if (albumMedia.length === 0) {
      const match = alb.id.match(/\d+/);
      return match ? Number(match[0]) : 0;
    }
    let latest = '';
    for (const m of albumMedia) {
      const d = m.date || '';
      if (d > latest) latest = d;
    }
    return latest || 0;
  };

  // Ordenador de Álbuns por Nome, Data Recente ou Quantidade de Fotos
  const sortAlbumsList = (albList, sortBy, sortOrder, list) => {
    if (sortBy === 'custom') return albList;
    return [...albList].sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        comp = nameA.localeCompare(nameB, 'pt-BR', { numeric: true, sensitivity: 'base' });
      } else if (sortBy === 'count') {
        const countA = list.filter(m => m.albumId === a.id).length;
        const countB = list.filter(m => m.albumId === b.id).length;
        comp = countA - countB;
      } else if (sortBy === 'date') {
        const dateA = getAlbumLatestDate(a, list);
        const dateB = getAlbumLatestDate(b, list);
        if (typeof dateA === 'string' && typeof dateB === 'string') {
          comp = dateA.localeCompare(dateB);
        } else {
          comp = Number(dateA) - Number(dateB);
        }
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  };

  // Ordenador de Mídias por Nome, Data ou Tamanho
  const sortMediaList = (list, sortBy, sortOrder) => {
    return [...list].sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') {
        const titleA = (a.title || '').trim();
        const titleB = (b.title || '').trim();
        comp = titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortBy === 'size') {
        const sizeA = Number(a.size) || 0;
        const sizeB = Number(b.size) || 0;
        comp = sizeA - sizeB;
      } else {
        // 'date' (padrão)
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        comp = dateA - dateB;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  };

  // Mídia ativa do Slideshow (respeita estritamente a ordenação salva no álbum sendo apresentado)
  const activeMediaList = useMemo(() => {
    if (!mediaList || mediaList.length === 0) return [];
    
    if (selectedAlbumId && selectedAlbumId !== 'all') {
      const targetAlbum = albums.find(a => a.id === selectedAlbumId);
      const filtered = mediaList.filter(m => m.albumId === selectedAlbumId);
      const list = filtered.length > 0 ? filtered : mediaList;
      const sortBy = targetAlbum?.sortBy || 'date';
      const sortOrder = targetAlbum?.sortOrder || 'desc';
      return sortMediaList(list, sortBy, sortOrder);
    }
    
    // Apresentação geral ('all'): usa a ordenação do primeiro álbum ou por data mais recente
    const defaultSortBy = albums[0]?.sortBy || 'date';
    const defaultSortOrder = albums[0]?.sortOrder || 'desc';
    return sortMediaList(mediaList, defaultSortBy, defaultSortOrder);
  }, [mediaList, selectedAlbumId, albums]);
  
  const currentMedia = activeMediaList[currentIndex] || activeMediaList[0] || null;
  const playingAlbum = (selectedAlbumId && selectedAlbumId !== 'all' && albums.find(a => a.id === selectedAlbumId))
    || (currentMedia && albums.find(a => a.id === currentMedia.albumId))
    || albums[0]
    || null;
  const currentMediaAlbum = playingAlbum;
  
  // GERENCIAMENTO DE TRANSIÇÃO SUAVE (CROSSFADE DE DUPLA CAMADA SEM TELA PRETA OU PISCAR)
  const [currentSlideMedia, setCurrentSlideMedia] = useState(null);
  const [previousSlideMedia, setPreviousSlideMedia] = useState(null);
  const [isCrossFading, setIsCrossFading] = useState(true);

  useEffect(() => {
    if (!currentMedia) return;

    if (!currentSlideMedia) {
      setCurrentSlideMedia(currentMedia);
      setIsCrossFading(true);
      return;
    }

    if (currentSlideMedia.id === currentMedia.id) return;

    // Coloca a foto anterior na camada de fundo e a nova foto na camada superior com opacidade zero
    setPreviousSlideMedia(currentSlideMedia);
    setCurrentSlideMedia(currentMedia);
    setIsCrossFading(false);

    // Ativa a transição suave de opacidade (fade-in) no próximo frame
    const animFrame = requestAnimationFrame(() => {
      setIsCrossFading(true);
    });

    const fallbackTimer = setTimeout(() => {
      setIsCrossFading(true);
    }, 60);

    // Ao término da transição suave (1200ms), limpa a camada anterior para economizar memória
    const cleanupTimer = setTimeout(() => {
      setPreviousSlideMedia(null);
      setIsCrossFading(false);
    }, 1200);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(fallbackTimer);
      clearTimeout(cleanupTimer);
    };
  }, [currentMedia?.id]);

  // PRÉ-CARREGAMENTO (PRELOAD) DAS PRÓXIMAS FOTOS NA MEMÓRIA DO NAVEGADOR
  // Elimina completamente qualquer atraso (delay) ou tela preta ao avançar de foto
  useEffect(() => {
    if (!activeMediaList || activeMediaList.length <= 1) return;
    
    // Próxima foto na sequência
    const nextIdx = (currentIndex + 1) % activeMediaList.length;
    const nextItem = activeMediaList[nextIdx];
    if (nextItem && nextItem.type !== 'video' && nextItem.url) {
      const img1 = new Image();
      img1.src = nextItem.url;
    }
    
    // Segunda próxima foto
    if (activeMediaList.length > 2) {
      const nextNextIdx = (currentIndex + 2) % activeMediaList.length;
      const nextNextItem = activeMediaList[nextNextIdx];
      if (nextNextItem && nextNextItem.type !== 'video' && nextNextItem.url) {
        const img2 = new Image();
        img2.src = nextNextItem.url;
      }
    }
  }, [currentIndex, activeMediaList]);

  // Detecção de foto vertical por proporção de aspecto
  const [isVerticalPhoto, setIsVerticalPhoto] = useState(false);
  useEffect(() => {
    const target = currentSlideMedia || currentMedia;
    if (!target || target.type === 'video') {
      setIsVerticalPhoto(false);
      return;
    }
    const img = new Image();
    img.src = target.url;
    img.onload = () => {
      setIsVerticalPhoto(img.naturalHeight > img.naturalWidth);
    };
  }, [currentSlideMedia?.id, currentMedia?.id]);

  // CÁLCULO DA ROTAÇÃO EFETIVA DO CANVAS (Foto + Relógio + Clima + Legenda + Controles)
  const effectiveRotation = useMemo(() => {
    const isNativePortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
    if (isNativePortrait) return 0;

    if (screenRotationMode === 'fixed--90') return -90;
    if (screenRotationMode === 'fixed-90') return 90;
    if (screenRotationMode === '0') return 0;

    // Modo 'auto': se a foto for vertical, gira a tela inteira com as sobreposições para preencher em pé!
    if (screenRotationMode === 'auto' && isVerticalPhoto) {
      return autoRotateDirection === 90 ? 90 : -90;
    }

    return 0;
  }, [screenRotationMode, isVerticalPhoto, autoRotateDirection]);

  const cycleRotationMode = () => {
    setScreenRotationMode(prev => {
      let next = 'auto';
      if (prev === 'auto') next = 'fixed--90';
      else if (prev === 'fixed--90') next = 'fixed-90';
      else if (prev === 'fixed-90') next = '0';
      else next = 'auto';

      syncWithServer({ settings: { screenRotationMode: next } });
      return next;
    });
  };
  
  const activeFitMode = playingAlbum?.fitMode || 'contain-blur';
  const activeSlideSpeed = Math.max(3, Number(playingAlbum?.slideSpeed) || 7);
  const activeShowClock = playingAlbum?.showClockWidget !== undefined ? playingAlbum.showClockWidget : true;
  const activeShowWeather = playingAlbum?.showWeatherWidget !== undefined ? playingAlbum.showWeatherWidget : true;
  const activeShowLocation = playingAlbum?.showLocation !== undefined ? playingAlbum.showLocation : true;
  const activeShowTitle = playingAlbum?.showTitle !== undefined ? playingAlbum.showTitle : true;
  const activeShowDescription = playingAlbum?.showDescription !== undefined ? playingAlbum.showDescription : true;
  const activeVideoSound = playingAlbum?.videoSound !== undefined ? playingAlbum.videoSound : false;
  
  // Referências sincronizadas em cada render para acesso atômico e imune a fechamentos defasados
  const activeMediaListRef = useRef(activeMediaList);
  activeMediaListRef.current = activeMediaList;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  isCurrentlySleepingRef.current = isCurrentlySleeping;
  const activeSlideSpeedRef = useRef(activeSlideSpeed);
  activeSlideSpeedRef.current = activeSlideSpeed;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const isShuffleOnRef = useRef(isShuffleOn);
  isShuffleOnRef.current = isShuffleOn;
  const currentMediaRef = useRef(currentMedia);
  currentMediaRef.current = currentMedia;

  // Sincroniza o modo aleatório inicial quando seleciona outro álbum
  useEffect(() => {
    if (playingAlbum?.shuffleMedia !== undefined) {
      setIsShuffleOn(Boolean(playingAlbum.shuffleMedia));
    }
  }, [selectedAlbumId]);

  // Alterna o modo aleatório (Shuffle) com feedback visual
  const toggleShuffle = () => {
    setIsShuffleOn(prev => {
      const nextVal = !prev;
      setShuffleToast(nextVal ? '🔀 Modo Aleatório: ATIVADO' : '▶️ Ordem Sequencial: ATIVADA');
      setTimeout(() => setShuffleToast(''), 2200);

      // Persiste a preferência no álbum atual
      if (playingAlbum && playingAlbum.id && playingAlbum.id !== 'all') {
        const updatedAlbums = albums.map(a => a.id === playingAlbum.id ? { ...a, shuffleMedia: nextVal } : a);
        setAlbums(updatedAlbums);
        syncWithServer({ albums: updatedAlbums });
      }
      return nextVal;
    });
  };

  const handleNextSlide = () => {
    setVideoPlaybackError(false);
    const list = activeMediaListRef.current || [];
    if (list.length <= 1) {
      if (currentMediaRef.current?.type === 'video' && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      return;
    }
    
    lastSlideChangeTimeRef.current = Date.now();

    setCurrentIndex(prev => {
      // Guarda no histórico de reprodução para poder voltar com segurança
      slideHistoryRef.current.push(prev);
      if (slideHistoryRef.current.length > 50) slideHistoryRef.current.shift();

      if (isShuffleOnRef.current) {
        let nextIdx;
        let attempts = 0;
        // Evita sortear exatamente a mesma foto consecutiva se houver mais de uma foto
        do {
          nextIdx = Math.floor(Math.random() * list.length);
          attempts++;
        } while (nextIdx === prev && list.length > 1 && attempts < 15);
        return nextIdx;
      }
      return (prev + 1) % list.length;
    });
  };
  
  const handlePrevSlide = () => {
    const list = activeMediaListRef.current || [];
    if (list.length <= 1) return;

    lastSlideChangeTimeRef.current = Date.now();

    // Se estiver no histórico (modo aleatório ou manual), retorna à foto anterior real
    if (slideHistoryRef.current.length > 0) {
      const lastIdx = slideHistoryRef.current.pop();
      if (lastIdx !== undefined && lastIdx >= 0 && lastIdx < list.length) {
        setCurrentIndex(lastIdx);
        return;
      }
    }
    setCurrentIndex(prev => (prev - 1 + list.length) % list.length);
  };
  
  // Referência estável para a função de avançar slide
  const handleNextSlideRef = useRef(handleNextSlide);
  useEffect(() => {
    handleNextSlideRef.current = handleNextSlide;
  });

  const isVideo = currentMedia?.type === 'video';
  const currentMediaId = currentMedia?.id || null;

  // Reinicia o cronômetro sempre que o slide atual mudar (manualmente, por clique ou agendamento)
  useEffect(() => {
    lastSlideChangeTimeRef.current = Date.now();
  }, [currentIndex, currentMediaId]);

  // MOTOR CONTÍNUO DO SLIDESHOW: Baseado em tempo decorrido real (Date.now())
  // 100% Imune a re-renderizações, poller ou atualização do relógio
  useEffect(() => {
    const slideEngine = setInterval(() => {
      if (!isPlayingRef.current || isCurrentlySleepingRef.current || activeTabRef.current !== 'slideshow') {
        lastSlideChangeTimeRef.current = Date.now();
        return;
      }

      const list = activeMediaListRef.current || [];
      if (list.length <= 1) return;

      const currentIdx = currentIndexRef.current;
      const current = list[currentIdx] || list[0];
      if (current?.type === 'video') return; // Vídeo gerencia seu fim via handleVideoEnded

      const durationMs = Math.max(3, Number(activeSlideSpeedRef.current) || 7) * 1000;
      const elapsed = Date.now() - lastSlideChangeTimeRef.current;

      if (elapsed >= durationMs) {
        lastSlideChangeTimeRef.current = Date.now();
        handleNextSlideRef.current?.();
      }
    }, 400);

    return () => clearInterval(slideEngine);
  }, []);

  // Atalhos de teclado no modo Slideshow (Espaço = Play/Pause, Setas = Avançar/Voltar, S = Aleatório, F = Tela Cheia)
  useEffect(() => {
    if (activeTab !== 'slideshow') return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.code === 'KeyS' || e.code === 'KeyR') {
        e.preventDefault();
        toggleShuffle();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isShuffleOn, activeMediaList.length]);
  
  const handleVideoEnded = () => {
    if (activeMediaList.length <= 1) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      handleNextSlide();
    }
  };

  const handleVideoError = (e) => {
    console.warn("Erro ao reproduzir vídeo (codec ou formato não suportado pelo navegador):", e);
    setVideoPlaybackError(true);
    setIsCrossFading(true);
    setTimeout(() => {
      setVideoPlaybackError(false);
      const list = activeMediaListRef.current || [];
      if (list.length > 1) {
        handleNextSlide();
      }
    }, 4000);
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      slideshowContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };
  
  const activeViewingAlbum = albums.find(a => a.id === viewingAlbumId);
  const viewingAlbumMedia = useMemo(() => {
    if (!viewingAlbumId) return [];
    const list = mediaList.filter(m => m.albumId === viewingAlbumId);
    const sortBy = activeViewingAlbum?.sortBy || 'date';
    const sortOrder = activeViewingAlbum?.sortOrder || 'desc';
    return sortMediaList(list, sortBy, sortOrder);
  }, [mediaList, viewingAlbumId, activeViewingAlbum?.sortBy, activeViewingAlbum?.sortOrder]);

  // Altera e PERSISTE a ordenação permanentemente no álbum
  const handleSortChange = (criteria) => {
    if (!viewingAlbumId) return;
    const album = albums.find(a => a.id === viewingAlbumId);
    if (!album) return;

    let newSortBy = criteria;
    let newSortOrder = album.sortOrder || 'desc';

    if ((album.sortBy || 'date') === criteria) {
      newSortOrder = (album.sortOrder || 'desc') === 'asc' ? 'desc' : 'asc';
    } else {
      newSortBy = criteria;
      newSortOrder = criteria === 'name' ? 'asc' : 'desc';
    }

    const updatedAlbums = albums.map(a => a.id === viewingAlbumId ? {
      ...a,
      sortBy: newSortBy,
      sortOrder: newSortOrder
    } : a);

    setAlbums(updatedAlbums);
    syncWithServer({ albums: updatedAlbums });
  };

  // Inverte e PERSISTE a direção (Crescente / Decrescente) no álbum
  const handleToggleSortOrder = () => {
    if (!viewingAlbumId) return;
    const album = albums.find(a => a.id === viewingAlbumId);
    if (!album) return;

    const currentOrder = album.sortOrder || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

    const updatedAlbums = albums.map(a => a.id === viewingAlbumId ? {
      ...a,
      sortOrder: newOrder
    } : a);

    setAlbums(updatedAlbums);
    syncWithServer({ albums: updatedAlbums });
  };

  // Altera e PERSISTE a ordenação dos ÁLBUNS
  const handleAlbumSortChange = (criteria) => {
    let newSortBy = criteria;
    let newSortOrder = albumSortOrder;

    if (albumSortBy === criteria) {
      newSortOrder = albumSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      newSortBy = criteria;
      if (criteria === 'name') newSortOrder = 'asc';
      else if (criteria === 'date' || criteria === 'count') newSortOrder = 'desc';
      else newSortOrder = 'asc';
    }

    setAlbumSortBy(newSortBy);
    setAlbumSortOrder(newSortOrder);

    if (newSortBy !== 'custom') {
      const sorted = sortAlbumsList(albums, newSortBy, newSortOrder, mediaList);
      setAlbums(sorted);
      syncWithServer({ 
        albums: sorted,
        settings: { albumsSortBy: newSortBy, albumsSortOrder: newSortOrder }
      });
    } else {
      syncWithServer({ 
        settings: { albumsSortBy: 'custom', albumsSortOrder: newSortOrder }
      });
    }
  };

  // Inverte e PERSISTE a direção de ordenação dos álbuns
  const handleToggleAlbumSortOrder = () => {
    const newOrder = albumSortOrder === 'asc' ? 'desc' : 'asc';
    setAlbumSortOrder(newOrder);
    if (albumSortBy !== 'custom') {
      const sorted = sortAlbumsList(albums, albumSortBy, newOrder, mediaList);
      setAlbums(sorted);
      syncWithServer({ 
        albums: sorted,
        settings: { albumsSortBy: albumSortBy, albumsSortOrder: newOrder }
      });
    } else {
      // Inverte a ordem manual da lista de álbuns
      const reversed = [...albums].reverse();
      setAlbums(reversed);
      syncWithServer({ 
        albums: reversed,
        settings: { albumsSortBy: 'custom', albumsSortOrder: newOrder }
      });
    }
  };

  // Mover álbum manualmente (Esquerda / Direita ou Cima / Baixo)
  const handleMoveAlbum = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= albums.length) return;
    const updated = [...albums];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setAlbums(updated);
    setAlbumSortBy('custom');
    syncWithServer({ 
      albums: updated,
      settings: { albumsSortBy: 'custom', albumsSortOrder: albumSortOrder }
    });
  };

  const handleDragStartAlbum = (index) => {
    setDraggedAlbumIndex(index);
  };

  const handleDropAlbum = (targetIndex) => {
    if (draggedAlbumIndex === null || draggedAlbumIndex === targetIndex) return;
    const updated = [...albums];
    const [moved] = updated.splice(draggedAlbumIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setAlbums(updated);
    setAlbumSortBy('custom');
    syncWithServer({ 
      albums: updated,
      settings: { albumsSortBy: 'custom', albumsSortOrder: albumSortOrder }
    });
    setDraggedAlbumIndex(null);
  };

  const handlePreviewNext = () => {
    if (viewingAlbumMedia.length <= 1 || !previewMediaItem) return;
    const currentIdx = viewingAlbumMedia.findIndex(m => m.id === previewMediaItem.id);
    if (currentIdx === -1) return;
    const nextIdx = (currentIdx + 1) % viewingAlbumMedia.length;
    setPreviewMediaItem(viewingAlbumMedia[nextIdx]);
  };

  const handlePreviewPrev = () => {
    if (viewingAlbumMedia.length <= 1 || !previewMediaItem) return;
    const currentIdx = viewingAlbumMedia.findIndex(m => m.id === previewMediaItem.id);
    if (currentIdx === -1) return;
    const prevIdx = (currentIdx - 1 + viewingAlbumMedia.length) % viewingAlbumMedia.length;
    setPreviewMediaItem(viewingAlbumMedia[prevIdx]);
  };

  // Atalhos de teclado no visualizador de foto (ESC fecha, Setas navegam)
  useEffect(() => {
    if (!previewMediaItem) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setPreviewMediaItem(null);
      else if (e.key === 'ArrowRight') handlePreviewNext();
      else if (e.key === 'ArrowLeft') handlePreviewPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [previewMediaItem, viewingAlbumMedia]);
  
  const formatDaysText = (days) => {
    if (!Array.isArray(days) || days.length === 0) return 'Nenhum dia';
    if (days.length === 7) return 'Todos os dias';
    if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) return 'Seg a Sex';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Fins de semana';
    return days.map(d => DAYS_OF_WEEK.find(day => day.id === d)?.label).join(', ');
  };
  
  const getDeviceDisplayName = (devId) => {
    const cId = cleanDeviceId(devId);
    if (!cId || cId === 'all') return 'Todos os Telões';
    return registeredDevices[cId]?.deviceId || cId;
  };
  
  const formatSecondsToReadable = (sec) => {
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    const rest = sec % 60;
    return rest > 0 ? `${min}m ${rest}s` : `${min}m`;
  };
  
  const isGoogleConnected = Boolean(googleAccessToken || googleUserEmail);
  const isCanvasRotated = effectiveRotation !== 0;
  
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-neutral-950 text-neutral-100 font-sans overflow-hidden select-none">
      
      {/* 1. BARRA LATERAL DESKTOP (Gestor) */}
      {!isFullscreen && !isKioskDisplayMode && (
        <aside className="hidden md:flex w-64 bg-neutral-900 border-r border-neutral-800 flex-col justify-between shrink-0 z-30">
          <div>
            <div className="p-5 border-b border-neutral-800/80 flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="TravelFrame Logo" 
                className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => { setActiveTab('slideshow'); setViewingAlbumId(null); }}
              />
              <div>
                <h1 className="font-bold text-base leading-tight tracking-tight text-white">TravelFrame</h1>
                <p className="text-xs text-neutral-400">Quadro Digital Centralizado</p>
              </div>
            </div>
            
            <nav className="p-3 space-y-1">
              <button
                onClick={() => { setActiveTab('slideshow'); setViewingAlbumId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'slideshow' ? 'bg-sky-600 text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>Apresentação (Slides)</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('albums'); setViewingAlbumId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'albums' ? 'bg-sky-600 text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Álbuns & Galeria</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('devices'); setViewingAlbumId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'devices' ? 'bg-sky-600 text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
              >
                <Tv className="w-4 h-4 text-emerald-400" />
                <span>Telões & Dispositivos</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('schedules'); setViewingAlbumId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'schedules' ? 'bg-sky-600 text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>Agendamentos</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('google'); setViewingAlbumId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'google' ? 'bg-sky-600 text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
              >
                <Cloud className="w-4 h-4 text-amber-400" />
                <span>Google Fotos</span>
                {isGoogleConnected && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500"></span>}
              </button>
              
              <button
                onClick={() => { setActiveTab('settings'); setViewingAlbumId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'settings' ? 'bg-sky-600 text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Ajustes Globais</span>
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>Porta: 3070</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ativo
            </span>
          </div>
        </aside>
      )}
      
      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-16 md:pb-0">
        
        {/* CABEÇALHO MOBILE COM O LOGO */}
        {!isFullscreen && !isKioskDisplayMode && activeTab !== 'slideshow' && (
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0 z-30">
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => { setActiveTab('slideshow'); setViewingAlbumId(null); }}
            >
              <img 
                src="/logo.png" 
                alt="TravelFrame Logo" 
                className="h-8 w-8 rounded-lg object-contain shadow-md shadow-indigo-500/10" 
              />
              <div>
                <h1 className="font-bold text-sm leading-tight text-white">TravelFrame</h1>
                <p className="text-[10px] text-neutral-400">Quadro Digital Centralizado</p>
              </div>
            </div>
          </header>
        )}
        
        {/* NOTIFICAÇÃO UPLOAD FLUTUANTE */}
        {uploadProgress && (
          <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-neutral-900 border border-sky-500/40 rounded-2xl p-4 shadow-2xl w-72 md:w-80 space-y-2 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white truncate">{uploadProgress.filename}</span>
              <span className="text-sky-400 font-mono">{uploadProgress.percent}%</span>
            </div>
            <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full transition-all duration-150" style={{ width: `${uploadProgress.percent}%` }} />
            </div>
            <span className="text-[10px] text-neutral-400 block font-mono">
              Enviando {uploadProgress.current} de {uploadProgress.total}...
            </span>
          </div>
        )}
        
        {/* 1. SLIDESHOW - MODO QUADRO DE FOTOS (COM ROTAÇÃO INTEGRAL DE CANVAS) */}
        {activeTab === 'slideshow' && (
          <div 
            ref={slideshowContainerRef}
            className="relative flex-1 bg-black flex items-center justify-center overflow-hidden w-full h-full select-none"
          >
            {/* TELA DE REPOUSO / DORMIR */}
            {isCurrentlySleeping && (
              <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-6 select-none cursor-pointer">
                <Moon className="w-12 h-12 text-indigo-400 animate-pulse mb-3" />
                <h3 className="text-xl font-medium text-neutral-400">Quadro em Repouso</h3>
                <p className="text-xs text-neutral-600 mt-1 font-mono">{activeSleepReason || 'Horário de sono programado'}</p>
                <div className="text-3xl font-mono text-neutral-700 mt-4 font-light">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {!isKioskDisplayMode && (
                  <button 
                    onClick={() => {
                      setIsCurrentlySleeping(false);
                      setActiveSleepReason('');
                    }}
                    className="mt-6 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded-lg text-sm"
                  >
                    Acordar Tela
                  </button>
                )}
              </div>
            )}
            
            {currentMedia ? (
              /* CANVAS PRINCIPAL: QUANDO ROTACIONADO, O CONTAINER INTEIRO (FOTO + SOBREPOSIÇÕES) GIRA JUNTO */
              <div 
                className={`overflow-hidden bg-black flex items-center justify-center transition-all duration-500 origin-center ${
                  isCanvasRotated
                    ? `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vh] h-[100vw] ${
                        effectiveRotation === -90 ? '-rotate-90' : 'rotate-90'
                      }`
                    : 'relative w-full h-full'
                }`}
              >
                {/* BARRA DE PROGRESSO DO TEMPO DA FOTO (Indicador Visual do Tempo Estabelecido) */}
                {!isCurrentlySleeping && isPlaying && !isVideo && activeMediaList.length > 1 && (
                  <div className="absolute top-0 inset-x-0 z-40 h-1 bg-white/10 pointer-events-none">
                    <div 
                      key={`${currentIndex}-${currentMedia?.id}-${activeSlideSpeed}`}
                      className="h-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.9)]"
                      style={{
                        animation: `slideProgress ${activeSlideSpeed}s linear forwards`,
                        animationPlayState: isPlaying ? 'running' : 'paused'
                      }}
                    />
                  </div>
                )}

                {/* FUNDO AMBIENTE DESFOCADO (Ambient Backlight / Blur) COM TRANSIÇÃO SUAVE */}
                {activeFitMode === 'contain-blur' && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Fundo do slide anterior (mantém as cores enquanto o novo entra) */}
                    {previousSlideMedia && previousSlideMedia.type === 'image' && (
                      <div 
                        key={`ambient-prev-${previousSlideMedia.id}`}
                        className="absolute inset-0 bg-cover bg-center filter blur-3xl scale-125 opacity-40 transition-opacity duration-1000 ease-in-out pointer-events-none"
                        style={{ backgroundImage: `url('${previousSlideMedia.url}')` }}
                      />
                    )}
                    {/* Fundo do slide atual (dissolve suavemente com opacidade) */}
                    {(currentSlideMedia || currentMedia) && (currentSlideMedia || currentMedia).type === 'image' && (
                      <div 
                        key={`ambient-curr-${(currentSlideMedia || currentMedia).id}`}
                        className={`absolute inset-0 bg-cover bg-center filter blur-3xl scale-125 transition-opacity duration-1000 ease-in-out pointer-events-none ${
                          isCrossFading || !previousSlideMedia ? 'opacity-40' : 'opacity-0'
                        }`}
                        style={{ backgroundImage: `url('${(currentSlideMedia || currentMedia).url}')` }}
                      />
                    )}
                  </div>
                )}
                
                {/* RENDERIZADOR DE MÍDIA COM CROSSFADE SUAVE DE DUPLA CAMADA (SEM TELA PRETA OU PISCAR) */}
                <div className="relative z-20 w-full h-full flex items-center justify-center overflow-hidden">
                  {/* CAMADA INFERIOR: Foto anterior fica 100% visível por baixo enquanto a nova carrega e faz o fade */}
                  {previousSlideMedia && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 pointer-events-none">
                      {previousSlideMedia.type === 'video' ? (
                        <video
                          key={`prev-vid-${previousSlideMedia.id}`}
                          src={previousSlideMedia.url}
                          muted
                          playsInline
                          className={`w-full h-full ${activeFitMode === 'cover' ? 'object-cover' : 'object-contain'} drop-shadow-2xl`}
                        />
                      ) : (
                        <img
                          key={`prev-img-${previousSlideMedia.id}`}
                          src={previousSlideMedia.url}
                          alt={previousSlideMedia.title}
                          className={`w-full h-full ${activeFitMode === 'cover' ? 'object-cover' : 'object-contain'} drop-shadow-2xl`}
                        />
                      )}
                    </div>
                  )}

                  {/* CAMADA SUPERIOR: Foto nova surge dissolvendo suavemente (fade-in) por cima da anterior */}
                  {(currentSlideMedia || currentMedia) && (
                    <div 
                      key={`layer-curr-${(currentSlideMedia || currentMedia).id}`}
                      className={`absolute inset-0 w-full h-full flex items-center justify-center z-20 transition-opacity duration-1000 ease-in-out ${
                        isCrossFading || !previousSlideMedia ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {(currentSlideMedia || currentMedia).type === 'video' ? (
                        <video
                          ref={videoRef}
                          key={`curr-vid-${(currentSlideMedia || currentMedia).id}`}
                          src={(currentSlideMedia || currentMedia).url}
                          autoPlay
                          muted={!activeVideoSound}
                          playsInline
                          onEnded={handleVideoEnded}
                          onError={handleVideoError}
                          onCanPlay={() => setIsCrossFading(true)}
                          className={`w-full h-full ${activeFitMode === 'cover' ? 'object-cover' : 'object-contain'} drop-shadow-2xl`}
                        />
                      ) : (
                        <img
                          key={`curr-img-${(currentSlideMedia || currentMedia).id}`}
                          src={(currentSlideMedia || currentMedia).url}
                          alt={(currentSlideMedia || currentMedia).title}
                          onLoad={() => setIsCrossFading(true)}
                          className={`w-full h-full ${
                            activeFitMode === 'cover' ? 'object-cover' : 'object-contain'
                          } ${kenBurnsEffect ? 'animate-ken-burns' : ''} drop-shadow-2xl`}
                        />
                      )}
                    </div>
                  )}
                </div>
                
                {/* WIDGET SUPERIOR ESQUERDO: RELÓGIO + CLIMA AO VIVO + DESCRIÇÃO DO ÁLBUM (GIRA JUNTO COM A TELA) */}
                <div className={`absolute top-4 md:top-6 left-4 md:left-6 z-30 flex flex-col items-start gap-2.5 max-w-xl md:max-w-2xl transition-opacity duration-500 ${
                  controlsVisible ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                }`}>
                  {/* LINHA SUPERIOR: RELÓGIO + CLIMA */}
                  {(activeShowClock || activeShowWeather) && (
                    <div className="flex items-center gap-3 md:gap-4 bg-black/45 backdrop-blur-md px-3.5 md:px-4 py-2 rounded-2xl border border-white/10 text-white shadow-lg">
                      {activeShowClock && (
                        <div className="flex items-center gap-3">
                          <div className="text-xl md:text-2xl font-semibold tracking-tight font-mono">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="h-5 w-px bg-white/20"></div>
                          <div className="text-[11px] md:text-xs text-neutral-300 flex flex-col">
                            <span className="font-medium capitalize">
                              {currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeShowWeather && weatherData && (
                        <>
                          <div className="h-5 w-px bg-white/20"></div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                            {weatherData.temp > 22 ? <SunMedium className="w-4 h-4 text-amber-400" /> : <CloudSun className="w-4 h-4 text-sky-400" />}
                            <span>{weatherData.temp}°C</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* DESCRIÇÃO LOGO ABAIXO DO RELÓGIO COM MESMO TAMANHO DE FONTE (TEXT-XL MD:TEXT-2XL) */}
                  {activeShowDescription && (currentSlideMedia?.description || currentMedia?.description || currentMediaAlbum?.description) && (
                    <div className="bg-black/45 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-white shadow-xl">
                      <p className="text-xl md:text-2xl font-semibold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-snug">
                        {currentSlideMedia?.description || currentMedia?.description || currentMediaAlbum?.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* LEGENDA DA FOTO (LOCALIZAÇÃO E TÍTULO - GIRA JUNTO COM A TELA) */}
                {(activeShowLocation || activeShowTitle) && (
                  <div className={`absolute bottom-20 md:bottom-24 inset-x-0 z-30 pointer-events-none flex flex-col items-center justify-center text-center px-4 transition-opacity duration-700 ${
                    controlsVisible ? 'opacity-100' : 'opacity-85'
                  }`}>
                    <div className="max-w-3xl flex flex-col items-center justify-center space-y-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                      {activeShowLocation && (currentSlideMedia || currentMedia)?.location && (
                        <div className="flex items-center gap-1.5 text-xs md:text-sm font-semibold uppercase tracking-wider text-sky-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{(currentSlideMedia || currentMedia).location}</span>
                        </div>
                      )}
                      
                      {activeShowTitle && (currentSlideMedia || currentMedia)?.title && (
                        <h2 className="text-xl md:text-3xl font-extrabold text-white capitalize leading-tight">
                          {(currentSlideMedia || currentMedia).title}
                        </h2>
                      )}
                    </div>
                  </div>
                )}
                
                {/* AVISO TEMPORÁRIO DE MODO ALEATÓRIO / SEQUENCIAL */}
                {shuffleToast && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-white rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 pointer-events-none transition-all animate-bounce">
                    <Shuffle className="w-4 h-4 text-sky-400" />
                    <span>{shuffleToast}</span>
                  </div>
                )}

                {/* AVISO TEMPORÁRIO DE CODEC DE VÍDEO INCOMPATÍVEL */}
                {videoPlaybackError && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-neutral-950/95 backdrop-blur-md border border-amber-500/70 text-amber-300 rounded-2xl text-xs md:text-sm font-semibold shadow-2xl flex items-center gap-2.5 pointer-events-none animate-bounce">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Vídeo em codec incompatível (HEVC/H.265). Pulando para o próximo slide...</span>
                  </div>
                )}
                
                {/* CONTADOR DE SLIDES (GIRA JUNTO COM A TELA) */}
                <div className={`absolute bottom-6 right-6 z-30 pointer-events-none bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-neutral-300 transition-opacity duration-500 flex items-center gap-2 ${
                  controlsVisible ? 'opacity-100' : 'opacity-0'
                }`}>
                  {isShuffleOn && (
                    <span className="text-sky-400 flex items-center gap-1 font-sans text-[11px] font-semibold">
                      <Shuffle className="w-3 h-3" />
                      <span>Aleatório</span>
                    </span>
                  )}
                  <span>{currentIndex + 1} / {activeMediaList.length}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({activeSlideSpeed}s)</span>
                </div>
                
                {/* BARRA DE CONTROLES INFERIOR (GIRA JUNTO COM A TELA) */}
                <div className={`absolute inset-x-0 bottom-5 z-40 flex items-center justify-center transition-all duration-500 ${
                  controlsVisible ? 'opacity-90 hover:opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-3'
                }`}>
                  <div className="flex items-center gap-1.5 md:gap-2 bg-neutral-900/85 backdrop-blur-lg px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-neutral-700 shadow-2xl">
                    {/* BOTÃO MODO ALEATÓRIO (SHUFFLE) */}
                    <button 
                      onClick={toggleShuffle} 
                      className={`p-2 rounded-full transition relative flex items-center justify-center ${
                        isShuffleOn 
                          ? 'text-sky-400 bg-sky-500/20 hover:bg-sky-500/30 ring-1 ring-sky-500/50 shadow-inner' 
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`} 
                      title={isShuffleOn ? "Modo Aleatório: ATIVADO (Clique para alternar para Sequencial)" : "Modo Aleatório: DESATIVADO (Clique para ativar)"}
                    >
                      <Shuffle className="w-5 h-5" />
                      {isShuffleOn && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sky-400 rounded-full" />
                      )}
                    </button>

                    {/* FOTO ANTERIOR */}
                    <button onClick={handlePrevSlide} className="p-2 hover:bg-neutral-800 text-white rounded-full transition" title="Foto Anterior (Seta Esquerda)">
                      <SkipBack className="w-5 h-5" />
                    </button>

                    {/* PLAY / PAUSE */}
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg transition" title={isPlaying ? "Pausar (Espaço)" : "Reproduzir (Espaço)"}>
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    {/* PRÓXIMA FOTO */}
                    <button onClick={handleNextSlide} className="p-2 hover:bg-neutral-800 text-white rounded-full transition" title="Próxima Foto (Seta Direita)">
                      <SkipForward className="w-5 h-5" />
                    </button>
                    
                    {/* DIVISOR SUTIL */}
                    <div className="w-px h-5 bg-neutral-700/80 mx-1" />

                    {/* BOTÃO ROTAÇÃO RÁPIDA DE TELA */}
                    <button 
                      onClick={cycleRotationMode} 
                      className={`p-2 hover:bg-neutral-800 rounded-full transition flex items-center gap-1 ${
                        isCanvasRotated ? 'text-sky-400 bg-sky-500/20' : 'text-neutral-300'
                      }`} 
                      title={`Rotação de Tela (Atual: ${effectiveRotation !== 0 ? `${effectiveRotation}°` : 'Normal'})`}
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="text-[10px] font-mono font-bold pr-0.5">
                        {effectiveRotation !== 0 ? `${effectiveRotation}°` : 'AUTO'}
                      </span>
                    </button>
                    
                    {/* ECRÃ INTEIRO */}
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-neutral-800 text-white rounded-full transition" title="Ecrã Inteiro (F)">
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-3">
                <ImageIcon className="w-12 h-12 text-neutral-600" />
                <p className="text-sm">Nenhuma foto encontrada no servidor.</p>
                <button
                  onClick={() => setActiveTab('albums')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-xl"
                >
                  Ir para Álbuns e Adicionar Fotos
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* 2. ABA AGENDAMENTOS (Com Validação de Duplicatas e Indicador de Ativo Agora) */}
        {activeTab === 'schedules' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-5xl mx-auto w-full bg-neutral-950 space-y-6">
            <div className="border-b border-neutral-800 pb-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                Painel de Agendamentos Automáticos
              </h2>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    Ativar Rotinas de Exibição & Modo Repouso
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Ligue e desligue o monitor ou mude de álbum em horários específicos.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={scheduleEnabled} 
                  onChange={(e) => {
                    setScheduleEnabled(e.target.checked);
                    syncWithServer({ settings: { scheduleEnabled: e.target.checked } });
                  }} 
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>
              
              {scheduleEnabled && (
                <div className="space-y-4 pt-2 border-t border-neutral-800">
                  <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">Modo de Exibição / Ação:</label>
                        <select 
                          value={newSchedAlbumId} 
                          onChange={(e) => setNewSchedAlbumId(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="SLEEP">🌙 Modo Dormir (Apagar Tela e Economizar Energia)</option>
                          {albums.map((alb) => (
                            <option key={alb.id} value={alb.id}>🖼️ Exibir Álbum: {alb.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">Telão Alvo:</label>
                        <select 
                          value={newSchedDeviceId} 
                          onChange={(e) => setNewSchedDeviceId(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="all">Todos os Telões</option>
                          {Object.keys(registeredDevices).map((devId) => (
                            <option key={devId} value={devId}>Telão: [{devId}]</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] text-neutral-400 font-semibold">Dias da Semana:</label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewSchedDays([0, 1, 2, 3, 4, 5, 6])}
                            className="text-[10px] text-sky-400 hover:underline"
                          >
                            Todos
                          </button>
                          <span className="text-neutral-600">|</span>
                          <button
                            type="button"
                            onClick={() => setNewSchedDays([1, 2, 3, 4, 5])}
                            className="text-[10px] text-sky-400 hover:underline"
                          >
                            Seg-Sex
                          </button>
                          <span className="text-neutral-600">|</span>
                          <button
                            type="button"
                            onClick={() => setNewSchedDays([0, 6])}
                            className="text-[10px] text-sky-400 hover:underline"
                          >
                            Fins de semana
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS_OF_WEEK.map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleToggleDayForAlbum(d.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              newSchedDays.includes(d.id) 
                                ? 'bg-sky-600 text-white shadow' 
                                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">Horário de Início:</label>
                        <input 
                          type="time" 
                          value={newSchedStart} 
                          onChange={(e) => setNewSchedStart(e.target.value)} 
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">Horário de Fim:</label>
                        <input 
                          type="time" 
                          value={newSchedEnd} 
                          onChange={(e) => setNewSchedEnd(e.target.value)} 
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500" 
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-400">
                      <span>Presets rápidos:</span>
                      <button
                        type="button"
                        onClick={() => { setNewSchedStart('22:00'); setNewSchedEnd('07:00'); setNewSchedAlbumId('SLEEP'); }}
                        className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 hover:border-sky-500 rounded text-neutral-300 text-[10px]"
                      >
                        🌙 Noite (22:00 - 07:00)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setNewSchedStart('08:00'); setNewSchedEnd('18:00'); }}
                        className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 hover:border-sky-500 rounded text-neutral-300 text-[10px]"
                      >
                        ☀️ Comercial (08:00 - 18:00)
                      </button>
                    </div>
                    
                    <button onClick={handleAddAlbumSchedule} className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition">
                      Adicionar Agendamento
                    </button>
                  </div>
                  
                  {/* CABEÇALHO DA LISTA DE AGENDAMENTOS COM BOTÃO DE ORDENAR */}
                  {albumSchedules.length > 0 && (
                    <div className="flex items-center justify-between pt-3 pb-1 border-t border-neutral-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-300">
                          Agendamentos Cadastrados ({albumSchedules.length})
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
                          (Use as setas ou arraste para ordenar)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSortSchedulesChronologically}
                        className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 hover:border-sky-500 hover:text-sky-400 text-neutral-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-sm active:scale-95"
                        title="Reorganizar automaticamente todos os agendamentos pelo horário de início (do mais cedo para o mais tarde)"
                      >
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>Ordenar por Horário</span>
                      </button>
                    </div>
                  )}

                  {albumSchedules.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500">
                      Nenhum agendamento ativo no momento.
                    </div>
                  ) : (
                    albumSchedules.map((sched, idx) => {
                      const isSleep = sched.albumId === 'SLEEP';
                      const albumObj = albums.find(a => a.id === sched.albumId);
                      const isCurrentlyActiveRule = activeRuleIdRef.current === sched.id;
                      const isFirst = idx === 0;
                      const isLast = idx === albumSchedules.length - 1;
                      const isDraggingThis = draggedScheduleIndex === idx;

                      return (
                        <div 
                          key={sched.id} 
                          draggable
                          onDragStart={() => handleDragStartSchedule(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropSchedule(idx)}
                          className={`p-3.5 border rounded-xl flex items-center justify-between transition-all group ${
                            isDraggingThis ? 'opacity-40 border-dashed border-sky-400' : ''
                          } ${
                            isCurrentlyActiveRule 
                              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg' 
                              : isSleep 
                                ? 'bg-indigo-950/25 border-indigo-500/30 hover:border-indigo-500/50' 
                                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Alça de Arrastar (Drag Handle) */}
                            <div 
                              className="cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-300 transition p-0.5" 
                              title="Clique e arraste para reordenar"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Número da Posição */}
                            <span className="text-[11px] font-mono text-neutral-500 w-4 text-center select-none font-bold">
                              {idx + 1}
                            </span>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {isSleep ? '🌙 Modo Dormir' : (albumObj?.name || sched.ruleName || 'Álbum')}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSleep ? 'bg-indigo-500/20 text-indigo-300' : 'bg-sky-500/20 text-sky-400'}`}>
                                  {getDeviceDisplayName(sched.deviceId)}
                                </span>
                                {isCurrentlyActiveRule && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                                    ● ATIVO AGORA
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-400 font-mono block">
                                {formatDaysText(sched.days)} • {sched.start} até às {sched.end}
                              </span>
                            </div>
                          </div>

                          {/* AÇÕES: BOTÕES SUBIR / DESCER E EXCLUIR */}
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleMoveSchedule(idx, -1)} 
                              disabled={isFirst}
                              className={`p-1.5 rounded-lg transition ${
                                isFirst 
                                  ? 'text-neutral-700 cursor-not-allowed' 
                                  : 'text-neutral-400 hover:text-sky-400 hover:bg-neutral-900 active:scale-95'
                              }`} 
                              title="Mover para cima (Subir)"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>

                            <button 
                              onClick={() => handleMoveSchedule(idx, 1)} 
                              disabled={isLast}
                              className={`p-1.5 rounded-lg transition ${
                                isLast 
                                  ? 'text-neutral-700 cursor-not-allowed' 
                                  : 'text-neutral-400 hover:text-sky-400 hover:bg-neutral-900 active:scale-95'
                              }`} 
                              title="Mover para baixo (Descer)"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>

                            <div className="w-px h-4 bg-neutral-800 mx-1" />

                            <button 
                              onClick={() => handleDeleteAlbumSchedule(sched.id)} 
                              className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-900 transition active:scale-95" 
                              title="Excluir agendamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 3. ABA TELÕES & DISPOSITIVOS */}
        {activeTab === 'devices' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-5xl mx-auto w-full bg-neutral-950 space-y-6">
            <div className="border-b border-neutral-800 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 md:gap-3">
                <div className="p-2 md:p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <Tv className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Controle Central de Telões</h2>
                  <p className="text-xs md:text-sm text-neutral-400">Configure orientação, rotação e álbuns para cada monitor ou TV.</p>
                </div>
              </div>
              
              <button onClick={fetchRegisteredDevices} className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs text-neutral-300 rounded-xl flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atualizar</span>
              </button>
            </div>
            
            {remoteCommandStatus && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{remoteCommandStatus}</span>
              </div>
            )}
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4">
              <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                Cadastrar Novo Telão / Monitor
              </h3>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Nome do dispositivo (ex: sala, quarto, matriz)"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button onClick={handleRegisterNewDevice} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold">
                  Cadastrar Telão
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-sm md:text-base text-white">Dispositivos Registrados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(registeredDevices).map(([devId, devData]) => {
                  const isOnline = devData.lastSeen && (Date.now() - devData.lastSeen < 15000);
                  const kioskUrl = `${window.location.origin}/display?device=${encodeURIComponent(devId)}`;
                  
                  return (
                    <div key={devId} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-5 space-y-4 shadow-lg flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`}></span>
                            <h4 className="font-bold text-sm text-white uppercase tracking-wider">{devId}</h4>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                              {isOnline ? 'ONLINE' : 'AGUARDANDO'}
                            </span>
                            <button
                              onClick={() => handleDeleteDevice(devId)}
                              title="Remover Dispositivo"
                              className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* URL para Telão */}
                        <div className="p-2.5 md:p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1.5 mt-3">
                          <span className="text-[10px] text-neutral-400 block font-semibold">URL para abrir no Monitor/TV:</span>
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              readOnly
                              value={kioskUrl}
                              onClick={(e) => e.target.select()}
                              className="bg-transparent text-[11px] text-sky-400 font-mono w-full focus:outline-none select-all"
                            />
                            <button 
                              onClick={() => handleCopyUrl(kioskUrl, devId)} 
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                                copiedDevId === devId ? 'bg-emerald-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                              }`}
                            >
                              {copiedDevId === devId ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                        
                        {/* SELETOR DE ÁLBUM, ORIENTAÇÃO E CONTROLE DE REPOUSO */}
                        <div className="space-y-3 mt-3">
                          <div>
                            <label className="text-xs text-neutral-400 block font-medium mb-1">Álbum em Exibição:</label>
                            <select
                              value={devData.albumId || 'all'}
                              onChange={(e) => handleSendDeviceCommand(devId, e.target.value, devData.sleepMode, devData.rotation)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                            >
                              <option value="all">Apresentar Todos ({mediaList.length} fotos)</option>
                              {albums.map((alb) => (
                                <option key={alb.id} value={alb.id}>
                                  {alb.name} ({alb.orientation === 'vertical' ? 'Vertical 9:16' : 'Horizontal 16:9'})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-neutral-400 block font-medium mb-1">Orientação Física do Telão:</label>
                            <select
                              value={devData.rotation || 'auto'}
                              onChange={(e) => handleSendDeviceCommand(devId, devData.albumId || 'all', devData.sleepMode, e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                            >
                              <option value="auto">🔄 Automático (Girar fotos verticais + sobreposições)</option>
                              <option value="fixed--90">📱 Fixo Retrato (-90° Anti-horário)</option>
                              <option value="fixed-90">📱 Fixo Retrato (+90° Horário)</option>
                              <option value="0">🖥️ Fixo Paisagem (Horizontal 0°)</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleSendDeviceCommand(devId, devData.albumId || 'all', !devData.sleepMode, devData.rotation)}
                              className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                                devData.sleepMode 
                                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md' 
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              }`}
                            >
                              <Moon className="w-3.5 h-3.5" />
                              {devData.sleepMode ? 'Acordar Tela' : 'Dormir Agora'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* 4. ABA ÁLBUNS & GALERIA */}
        {activeTab === 'albums' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-950">
            <input ref={manualFileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleManualUpload} className="hidden" />
            
            {!viewingAlbumId ? (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Coleção de Álbuns</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">{mediaList.length} fotos e vídeos salvos no servidor.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsCreatingAlbum(true)} className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800">
                      Novo Álbum
                    </button>
                    <button onClick={() => { setSelectedAlbumId('all'); setCurrentIndex(0); setActiveTab('slideshow'); }} className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl">
                      Apresentar Todos
                    </button>
                  </div>
                </div>
                
                {/* Modal Criar Álbum */}
                {isCreatingAlbum && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 max-w-2xl shadow-2xl">
                    <h3 className="font-bold text-base text-white">Criar Novo Álbum</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Nome do Álbum" value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" />
                      <textarea placeholder="Descrição / Legenda (Ex: Férias em Família)" value={newAlbumDesc} onChange={(e) => setNewAlbumDesc(e.target.value)} rows={2} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white resize-none" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Orientação:</label>
                        <select value={newAlbumOrientation} onChange={(e) => setNewAlbumOrientation(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white">
                          <option value="horizontal">Horizontal (16:9)</option>
                          <option value="vertical">Vertical (9:16)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Enquadramento no Monitor:</label>
                        <select value={newAlbumFitMode} onChange={(e) => setNewAlbumFitMode(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white">
                          <option value="contain-blur">Fundo Desfocado (Blur)</option>
                          <option value="contain">Bordas Pretas Limpas</option>
                          <option value="cover">Preencher Tela Toda</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">Tempo por Foto:</span>
                        <span className="font-mono text-sky-400 font-bold">{formatSecondsToReadable(newAlbumSlideSpeed)}</span>
                      </div>
                      <input type="range" min="3" max="300" value={newAlbumSlideSpeed} onChange={(e) => setNewAlbumSlideSpeed(Number(e.target.value))} className="w-full accent-sky-500 bg-neutral-900 h-2 rounded-lg cursor-pointer" />
                    </div>
                    
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-white mb-1">Informações em Tela:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newAlbumShowTitle} onChange={(e) => setNewAlbumShowTitle(e.target.checked)} className="accent-sky-500 rounded" /><span>Título da Foto</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newAlbumShowDesc} onChange={(e) => setNewAlbumShowDesc(e.target.checked)} className="accent-sky-500 rounded" /><span>Descrição</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newAlbumShowLocation} onChange={(e) => setNewAlbumShowLocation(e.target.checked)} className="accent-sky-500 rounded" /><span>Localização EXIF</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newAlbumShowClock} onChange={(e) => setNewAlbumShowClock(e.target.checked)} className="accent-sky-500 rounded" /><span>Relógio & Data</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newAlbumShowWeather} onChange={(e) => setNewAlbumShowWeather(e.target.checked)} className="accent-sky-500 rounded" /><span>Clima ao Vivo</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newAlbumShuffle} onChange={(e) => setNewAlbumShuffle(e.target.checked)} className="accent-sky-500 rounded" /><span>Ordem Aleatória</span></label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                      <button onClick={() => setIsCreatingAlbum(false)} className="px-3.5 py-1.5 text-xs text-neutral-400">Cancelar</button>
                      <button onClick={handleCreateAlbum} className="px-4 py-2 bg-sky-600 text-white text-xs rounded-xl font-semibold">Criar Álbum</button>
                    </div>
                  </div>
                )}
                
                {/* Modal Editar Álbum */}
                {editingAlbumId && (
                  <div className="bg-neutral-900 border border-sky-500/40 rounded-2xl p-5 space-y-4 max-w-2xl shadow-2xl">
                    <h3 className="font-bold text-base text-white">Editar Opções do Álbum</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Nome do Álbum" value={editAlbumName} onChange={(e) => setEditAlbumName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" />
                      <textarea placeholder="Descrição" value={editAlbumDesc} onChange={(e) => setEditAlbumDesc(e.target.value)} rows={2} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white resize-none" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Orientação:</label>
                        <select value={editAlbumOrientation} onChange={(e) => setEditAlbumOrientation(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white">
                          <option value="horizontal">Horizontal (16:9)</option>
                          <option value="vertical">Vertical (9:16)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Enquadramento no Monitor:</label>
                        <select value={editAlbumFitMode} onChange={(e) => setEditAlbumFitMode(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white">
                          <option value="contain-blur">Fundo Desfocado (Blur)</option>
                          <option value="contain">Bordas Pretas Limpas</option>
                          <option value="cover">Preencher Tela Toda</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">Tempo por Foto:</span>
                        <span className="font-mono text-sky-400 font-bold">{formatSecondsToReadable(editAlbumSlideSpeed)}</span>
                      </div>
                      <input type="range" min="3" max="300" value={editAlbumSlideSpeed} onChange={(e) => setEditAlbumSlideSpeed(Number(e.target.value))} className="w-full accent-sky-500 bg-neutral-900 h-2 rounded-lg cursor-pointer" />
                    </div>
                    
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-white mb-1">Informações em Tela:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editAlbumShowTitle} onChange={(e) => setEditAlbumShowTitle(e.target.checked)} className="accent-sky-500 rounded" /><span>Título da Foto</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editAlbumShowDesc} onChange={(e) => setEditAlbumShowDesc(e.target.checked)} className="accent-sky-500 rounded" /><span>Descrição</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editAlbumShowLocation} onChange={(e) => setEditAlbumShowLocation(e.target.checked)} className="accent-sky-500 rounded" /><span>Localização EXIF</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editAlbumShowClock} onChange={(e) => setEditAlbumShowClock(e.target.checked)} className="accent-sky-500 rounded" /><span>Relógio & Data</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editAlbumShowWeather} onChange={(e) => setEditAlbumShowWeather(e.target.checked)} className="accent-sky-500 rounded" /><span>Clima ao Vivo</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editAlbumShuffle} onChange={(e) => setEditAlbumShuffle(e.target.checked)} className="accent-sky-500 rounded" /><span>Ordem Aleatória</span></label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                      <button onClick={() => handleDeleteAlbum(editingAlbumId, editAlbumName)} className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg">
                        Excluir Álbum
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingAlbumId(null)} className="px-3.5 py-1.5 text-xs text-neutral-400">Cancelar</button>
                        <button onClick={handleSaveEditAlbum} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded-xl font-semibold">Salvar</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* BARRA DE ORDENAÇÃO DE ÁLBUNS COM SALVAMENTO DEFINITIVO */}
                {albums.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 shadow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5 mr-1">
                        <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
                        Ordem dos Álbuns:
                      </span>
                      
                      <div className="flex flex-wrap items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 gap-1">
                        <button
                          type="button"
                          onClick={() => handleAlbumSortChange('name')}
                          className={`px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1.5 ${
                            albumSortBy === 'name' 
                              ? 'bg-sky-600 text-white font-semibold shadow' 
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                          }`}
                          title="Ordenar alfabeticamente por nome"
                        >
                          <Type className="w-3.5 h-3.5" />
                          <span>Nome {albumSortBy === 'name' ? (albumSortOrder === 'asc' ? '(A-Z)' : '(Z-A)') : ''}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAlbumSortChange('date')}
                          className={`px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1.5 ${
                            albumSortBy === 'date' 
                              ? 'bg-sky-600 text-white font-semibold shadow' 
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                          }`}
                          title="Ordenar por data mais recente das fotos"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Data {albumSortBy === 'date' ? (albumSortOrder === 'desc' ? '(Recentes)' : '(Antigos)') : ''}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAlbumSortChange('count')}
                          className={`px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1.5 ${
                            albumSortBy === 'count' 
                              ? 'bg-sky-600 text-white font-semibold shadow' 
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                          }`}
                          title="Ordenar por quantidade de fotos e vídeos"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Qtd Fotos {albumSortBy === 'count' ? (albumSortOrder === 'desc' ? '(Mais fotos)' : '(Menos fotos)') : ''}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAlbumSortChange('custom')}
                          className={`px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1.5 ${
                            albumSortBy === 'custom' 
                              ? 'bg-sky-600 text-white font-semibold shadow' 
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                          }`}
                          title="Ordem personalizada / manual (usando as setas ou arrastando)"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Personalizada</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {albumSortBy !== 'custom' && (
                        <button
                          type="button"
                          onClick={handleToggleAlbumSortOrder}
                          className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-xs text-neutral-300 rounded-xl flex items-center gap-1.5 font-medium transition"
                          title="Inverter direção da ordenação"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
                          <span>{albumSortOrder === 'desc' ? 'Decrescente' : 'Crescente'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Grade de Álbuns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {albums.map((alb, idx) => (
                    <div 
                      key={alb.id} 
                      draggable
                      onDragStart={() => handleDragStartAlbum(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropAlbum(idx)}
                      className={`bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition group ${
                        draggedAlbumIndex === idx ? 'opacity-40 border-dashed border-sky-400' : ''
                      }`}
                    >
                      <div onClick={() => setViewingAlbumId(alb.id)} className="h-44 bg-black cursor-pointer overflow-hidden relative group">
                        <img src={alb.cover} alt={alb.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        
                        {/* Selo da Ordem / Posição do Álbum com Alça de Arrastar */}
                        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-white font-mono text-xs shadow-lg">
                          <GripVertical className="w-3.5 h-3.5 text-neutral-400 cursor-grab active:cursor-grabbing" title="Arraste para reordenar" />
                          <span className="font-bold">#{idx + 1}</span>
                        </div>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="px-3 py-1.5 bg-black/70 backdrop-blur text-white text-xs rounded-xl font-medium">Abrir Fotos</span>
                        </div>
                      </div>
                      
                      <div className="p-4 flex items-center justify-between border-t border-neutral-800/80 gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-white truncate" title={alb.name}>{alb.name}</h3>
                          <span className="text-[11px] text-neutral-400">{mediaList.filter(m => m.albumId === alb.id).length} fotos/vídeos</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Botões Mover Álbum (Subir / Descer de posição) */}
                          <div className="flex items-center bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleMoveAlbum(idx, -1); }} 
                              disabled={idx === 0} 
                              className={`p-1.5 rounded-md transition ${
                                idx === 0 
                                  ? 'text-neutral-700 cursor-not-allowed' 
                                  : 'text-neutral-400 hover:text-sky-400 hover:bg-neutral-900 active:scale-95'
                              }`} 
                              title="Mover Álbum para Trás (Esquerda)"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleMoveAlbum(idx, 1); }} 
                              disabled={idx === albums.length - 1} 
                              className={`p-1.5 rounded-md transition ${
                                idx === albums.length - 1 
                                  ? 'text-neutral-700 cursor-not-allowed' 
                                  : 'text-neutral-400 hover:text-sky-400 hover:bg-neutral-900 active:scale-95'
                              }`} 
                              title="Mover Álbum para Frente (Direita)"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button onClick={() => {
                            setEditingAlbumId(alb.id);
                            setEditAlbumName(alb.name);
                            setEditAlbumDesc(alb.description || '');
                            setEditAlbumOrientation(alb.orientation || 'horizontal');
                            setEditAlbumFitMode(alb.fitMode || 'contain-blur');
                            setEditAlbumSlideSpeed(alb.slideSpeed || 7);
                            setEditAlbumShowClock(alb.showClockWidget !== false);
                            setEditAlbumShowWeather(alb.showWeatherWidget !== false);
                            setEditAlbumShowLocation(alb.showLocation !== false);
                            setEditAlbumShowTitle(alb.showTitle !== false);
                            setEditAlbumShowDesc(alb.showDescription !== false);
                            setEditAlbumShuffle(Boolean(alb.shuffleMedia));
                            setEditAlbumVideoSound(Boolean(alb.videoSound));
                            setEditAlbumSortBy(alb.sortBy || 'date');
                            setEditAlbumSortOrder(alb.sortOrder || 'desc');
                          }} className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800" title="Editar Álbum">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button onClick={() => { 
                            setSelectedAlbumId(alb.id); 
                            setCurrentIndex(0); 
                            setIsShuffleOn(Boolean(alb.shuffleMedia));
                            setActiveTab('slideshow'); 
                          }} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded-lg font-medium shadow transition">
                            Apresentar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Visualização Interna do Álbum Selecionado */
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setViewingAlbumId(null)} className="p-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-white">{activeViewingAlbum?.name}</h2>
                      <p className="text-xs text-neutral-400">{viewingAlbumMedia.length} mídias cadastradas</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => manualFileInputRef.current?.click()} className="px-3 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white text-xs rounded-xl flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-sky-400" />
                      <span>Adicionar Fotos</span>
                    </button>
                    <button 
                      onClick={() => { 
                        setSelectedAlbumId(viewingAlbumId); 
                        setCurrentIndex(0); 
                        setIsShuffleOn(Boolean(activeViewingAlbum?.shuffleMedia));
                        setActiveTab('slideshow'); 
                      }} 
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded-xl font-semibold shadow transition"
                    >
                      Apresentar Álbum
                    </button>
                  </div>
                </div>
                
                {/* BARRA DE ORDENAÇÃO DE FOTOS COM SALVAMENTO DEFINITIVO */}
                {viewingAlbumMedia.length > 0 && (() => {
                  const currentSortBy = activeViewingAlbum?.sortBy || 'date';
                  const currentSortOrder = activeViewingAlbum?.sortOrder || 'desc';
                  
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 shadow">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5 mr-1">
                          <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
                          Ordem do Álbum:
                        </span>
                        
                        <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 gap-1">
                          <button
                            type="button"
                            onClick={() => handleSortChange('date')}
                            className={`px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1.5 ${
                              currentSortBy === 'date' 
                                ? 'bg-sky-600 text-white font-semibold shadow' 
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                            }`}
                            title="Ordenar por data"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Data {currentSortBy === 'date' ? (currentSortOrder === 'desc' ? '(Recentes)' : '(Antigas)') : ''}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSortChange('name')}
                            className={`px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1.5 ${
                              currentSortBy === 'name' 
                                ? 'bg-sky-600 text-white font-semibold shadow' 
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                            }`}
                            title="Ordenar alfabeticamente por nome"
                          >
                            <Type className="w-3.5 h-3.5" />
                            <span>Nome {currentSortBy === 'name' ? (currentSortOrder === 'asc' ? '(A-Z)' : '(Z-A)') : ''}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSortChange('size')}
                            className={`px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1.5 ${
                              currentSortBy === 'size' 
                                ? 'bg-sky-600 text-white font-semibold shadow' 
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                            }`}
                            title="Ordenar pelo tamanho do arquivo"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Tamanho {currentSortBy === 'size' ? (currentSortOrder === 'desc' ? '(Maior)' : '(Menor)') : ''}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleToggleSortOrder}
                          className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-300 hover:text-white transition flex items-center gap-1 font-mono"
                          title="Inverter direção de exibição"
                        >
                          <span>{currentSortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-lg flex items-center gap-1 font-sans">
                          <Check className="w-3 h-3" />
                          <span>Salvo no Álbum</span>
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">
                          {viewingAlbumMedia.length} {viewingAlbumMedia.length === 1 ? 'item' : 'itens'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                
                {viewingAlbumMedia.length === 0 ? (
                  <div className="p-12 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl space-y-3">
                    <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto" />
                    <p className="text-neutral-300 text-sm">Este álbum ainda não possui fotos.</p>
                    <button onClick={() => manualFileInputRef.current?.click()} className="px-4 py-2 bg-sky-600 text-white text-xs rounded-xl font-medium">
                      Subir fotos agora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {viewingAlbumMedia.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setPreviewMediaItem(item)}
                        className="aspect-square bg-neutral-900 rounded-xl overflow-hidden relative group cursor-pointer border border-neutral-800/80 hover:border-sky-500/70 transition-all shadow hover:shadow-2xl hover:scale-[1.02]"
                        title="Clique para visualizar a foto em tamanho grande"
                      >
                        {item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        )}
                        
                        {/* Selos superiores (vídeo e tamanho de arquivo) */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
                          {item.type === 'video' && (
                            <span className="p-1 bg-black/60 backdrop-blur-md rounded-md text-sky-400">
                              <Film className="w-3 h-3" />
                            </span>
                          )}
                          {item.size ? (
                            <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[9px] font-mono text-neutral-200">
                              {formatFileSize(item.size)}
                            </span>
                          ) : null}
                        </div>

                        {/* Overlay hover com botão central de Visualizar */}
                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2.5 transition-opacity">
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[11px] text-white truncate font-medium drop-shadow">{item.title}</span>
                            <span className="text-[9px] font-mono text-neutral-300 drop-shadow shrink-0">{item.date}</span>
                          </div>
                          
                          {/* Botão de Visualização Central */}
                          <div className="self-center flex flex-col items-center gap-1 text-white">
                            <div className="p-2.5 bg-sky-600 hover:bg-sky-500 rounded-full shadow-xl transform group-hover:scale-110 transition">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider text-sky-300 uppercase">Visualizar</span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleSetAsCover(viewingAlbumId, item.url); }} 
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 rounded text-black text-[10px] font-bold flex items-center gap-1 transition shadow"
                              title="Definir esta foto como capa do álbum"
                            >
                              <Star className="w-3 h-3 fill-black" />
                              <span>Capa</span>
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item.id); }} 
                              className="p-1.5 bg-rose-600/80 hover:bg-rose-500 rounded text-white text-[10px] transition"
                              title="Excluir Foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* 5. ABA GOOGLE FOTOS */}
        {activeTab === 'google' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-4xl mx-auto w-full bg-neutral-950 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Cloud className="w-6 h-6 text-amber-400" />
              Sincronização Google Fotos
            </h2>
            
            <div className="bg-neutral-900 p-5 rounded-2xl space-y-4 border border-neutral-800">
              <div>
                <h3 className="font-bold text-sm text-white">Google OAuth Client ID</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Permite puxar fotos da sua conta Google diretamente para o quadro.</p>
              </div>
              <input 
                type="text" 
                placeholder="Ex: 850934533017-xxx.apps.googleusercontent.com" 
                value={googleClientId} 
                onChange={(e) => setGoogleClientId(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white rounded-xl focus:outline-none focus:border-sky-500" 
              />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-neutral-300">
                  Status: {isGoogleConnected ? (
                    <span className="text-emerald-400 font-semibold">● {googleUserEmail || 'Conectado'}</span>
                  ) : (
                    <span className="text-neutral-500">○ Desconectado</span>
                  )}
                </span>
                
                <div className="flex gap-2">
                  {isGoogleConnected ? (
                    <button onClick={handleDisconnectGoogle} className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs">
                      Desconectar
                    </button>
                  ) : (
                    <button onClick={handleConnectGoogle} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold">
                      Conectar ao Google Fotos
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {isGoogleConnected && (
              <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 space-y-4 shadow-xl">
                <div>
                  <h3 className="font-bold text-sm text-white">Importar para um Álbum Local</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">As fotos selecionadas serão transferidas fisicamente para o seu servidor Debian.</p>
                </div>
                
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Selecione o Álbum de Destino:</label>
                  <select 
                    value={targetGoogleAlbum} 
                    onChange={(e) => setTargetGoogleAlbum(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>{alb.name}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={handleImportGooglePhotos} 
                  disabled={isImportingGoogle}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Cloud className="w-4 h-4" />
                  {isImportingGoogle ? 'Transferindo...' : 'Abrir Google Fotos e Selecionar Imagens'}
                </button>
                
                {importStatusText && (
                  <p className="text-xs text-sky-400 bg-sky-950/40 p-2.5 rounded-lg border border-sky-800/40 animate-pulse font-mono">
                    {importStatusText}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* 6. ABA AJUSTES GLOBAIS */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-4xl mx-auto w-full bg-neutral-950 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-purple-400" />
              Ajustes Gerais do Quadro
            </h2>
            
            <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 space-y-5">
              <h3 className="font-bold text-sm text-white border-b border-neutral-800 pb-2">Orientação e Rotação da Tela</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white font-medium block mb-1">Modo de Rotação Padrão:</label>
                  <select
                    value={screenRotationMode}
                    onChange={(e) => {
                      setScreenRotationMode(e.target.value);
                      syncWithServer({ settings: { screenRotationMode: e.target.value } });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="auto">🔄 Automático (Girar fotos verticais + relógio + legendas)</option>
                    <option value="fixed--90">📱 Fixo Retrato (-90° Anti-horário - Monitor em pé)</option>
                    <option value="fixed-90">📱 Fixo Retrato (+90° Horário - Monitor em pé)</option>
                    <option value="0">🖥️ Desativado (Monitor sempre em modo paisagem horizontal)</option>
                  </select>
                </div>

                {screenRotationMode === 'auto' && (
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Direção ao girar fotos verticais:</label>
                    <select
                      value={autoRotateDirection}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setAutoRotateDirection(val);
                        syncWithServer({ settings: { autoRotateDirection: val } });
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="-90">Girar -90° (Anti-horário)</option>
                      <option value="90">Girar +90° (Horário)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white font-medium block">Efeito Ken Burns (Zoom Lento Panorâmico)</span>
                    <span className="text-[11px] text-neutral-400">Dá movimento cinematográfico suave às fotos estáticas.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={kenBurnsEffect} 
                    onChange={(e) => {
                      setKenBurnsEffect(e.target.checked);
                      syncWithServer({ settings: { kenBurns: e.target.checked } });
                    }} 
                    className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 space-y-2 text-xs text-neutral-400">
              <h4 className="font-bold text-white text-sm mb-1">Informações do Servidor</h4>
              <p>• Servidor Express em operação na porta <strong>3070</strong>.</p>
              <p>• Rotação Integrada: Toda a interface (foto, relógio, clima, legenda e botões) é alinhada em um canvas de aspecto 9:16 quando rotacionada.</p>
              <p>• Armazenamento: <code className="text-sky-400 font-mono">server/uploads/</code> e <code className="text-sky-400 font-mono">server/data/state.json</code>.</p>
            </div>
          </div>
        )}
        
      </main>
      
      {/* 3. BARRA DE NAVEGAÇÃO MOBILE */}
      {!isFullscreen && !isKioskDisplayMode && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 z-40 flex items-center justify-around px-2 py-2">
          <button onClick={() => { setActiveTab('slideshow'); setViewingAlbumId(null); }} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === 'slideshow' ? 'text-sky-400' : 'text-neutral-400'}`}>
            <Play className="w-4 h-4" />
            <span>Slides</span>
          </button>
          <button onClick={() => { setActiveTab('albums'); setViewingAlbumId(null); }} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === 'albums' ? 'text-sky-400' : 'text-neutral-400'}`}>
            <Layers className="w-4 h-4" />
            <span>Álbuns</span>
          </button>
          <button onClick={() => { setActiveTab('devices'); setViewingAlbumId(null); }} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === 'devices' ? 'text-emerald-400' : 'text-neutral-400'}`}>
            <Tv className="w-4 h-4" />
            <span>Telões</span>
          </button>
          <button onClick={() => { setActiveTab('schedules'); setViewingAlbumId(null); }} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === 'schedules' ? 'text-amber-400' : 'text-neutral-400'}`}>
            <CalendarDays className="w-4 h-4" />
            <span>Agenda</span>
          </button>
          <button onClick={() => { setActiveTab('settings'); setViewingAlbumId(null); }} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === 'settings' ? 'text-purple-400' : 'text-neutral-400'}`}>
            <Settings className="w-4 h-4" />
            <span>Ajustes</span>
          </button>
        </nav>
      )}
      
      {/* 4. MODAL VISUALIZADOR DE FOTO / VÍDEO (LIGHTBOX) */}
      {previewMediaItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 md:p-6 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewMediaItem(null);
          }}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-1 bg-neutral-900 rounded-lg text-sky-400 border border-neutral-800">
                {viewingAlbumMedia.findIndex(m => m.id === previewMediaItem.id) + 1} / {viewingAlbumMedia.length}
              </span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white truncate max-w-xs md:max-w-xl">
                  {previewMediaItem.title || 'Sem título'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {activeViewingAlbum?.name || 'Álbum'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setPreviewMediaItem(null)} 
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition"
              title="Fechar Visualizador (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área Central da Mídia com Botões de Navegação */}
          <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden">
            {/* Botão Foto Anterior */}
            {viewingAlbumMedia.length > 1 && (
              <button 
                onClick={handlePreviewPrev}
                className="absolute left-2 md:left-6 z-20 p-2 md:p-3 bg-neutral-900/80 hover:bg-sky-600 text-white rounded-full backdrop-blur-md border border-neutral-700 shadow-2xl transition hover:scale-110"
                title="Foto Anterior (Seta Esquerda)"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            )}

            {/* Imagem / Vídeo */}
            <div className="max-w-full max-h-full flex items-center justify-center p-2">
              {previewMediaItem.type === 'video' ? (
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <video 
                    key={`modal-vid-${previewMediaItem.id}`}
                    src={previewMediaItem.url} 
                    controls 
                    autoPlay 
                    onError={() => setVideoModalError(true)}
                    onPlay={() => setVideoModalError(false)}
                    className="max-h-[70vh] max-w-[88vw] object-contain rounded-2xl shadow-2xl border border-neutral-800"
                  />
                  {videoModalError && (
                    <div className="absolute inset-0 bg-neutral-950/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-neutral-200 backdrop-blur-md border border-amber-500/40 shadow-2xl">
                      <AlertTriangle className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                      <h3 className="text-lg font-bold text-white mb-1">Codec não suportado pelo navegador</h3>
                      <p className="text-sm text-neutral-300 max-w-md mb-4 leading-relaxed">
                        Este vídeo utiliza codificação <strong>HEVC / H.265</strong> (padrão de câmeras GoPro e iPhones 4K/5.3K), que a maioria dos navegadores web não decodifica nativamente.
                      </p>
                      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-xs text-neutral-300 text-left max-w-md space-y-2">
                        <p className="font-semibold text-sky-400">💡 Como resolver:</p>
                        <p>Converta o vídeo para o formato universal <strong>H.264 (MP4)</strong> antes de enviar usando o conversor do projeto:</p>
                        <div className="bg-neutral-950 p-2 rounded-lg font-mono text-emerald-400 text-[11px] select-all border border-neutral-800">
                          ./converter-videos.sh "/pasta/dos/videos"
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <img 
                  src={previewMediaItem.url} 
                  alt={previewMediaItem.title} 
                  className="max-h-[70vh] max-w-[88vw] object-contain rounded-2xl shadow-2xl border border-neutral-800 transition-all duration-300"
                />
              )}
            </div>

            {/* Botão Próxima Foto */}
            {viewingAlbumMedia.length > 1 && (
              <button 
                onClick={handlePreviewNext}
                className="absolute right-2 md:right-6 z-20 p-2 md:p-3 bg-neutral-900/80 hover:bg-sky-600 text-white rounded-full backdrop-blur-md border border-neutral-700 shadow-2xl transition hover:scale-110"
                title="Próxima Foto (Seta Direita)"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            )}
          </div>

          {/* Rodapé com Informações EXIF / Metadados e Ações Rápidas */}
          <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 z-10">
            {/* Metadados da foto */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-neutral-300">
              {previewMediaItem.date && (
                <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{previewMediaItem.date}</span>
                </span>
              )}
              {previewMediaItem.size ? (
                <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 font-mono">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{formatFileSize(previewMediaItem.size)}</span>
                </span>
              ) : null}
              {previewMediaItem.camera && previewMediaItem.camera !== 'Câmera' && (
                <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>{previewMediaItem.camera}</span>
                </span>
              )}
              {previewMediaItem.location && previewMediaItem.location !== activeViewingAlbum?.name && (
                <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{previewMediaItem.location}</span>
                </span>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button 
                type="button"
                onClick={() => {
                  handleSetAsCover(viewingAlbumId, previewMediaItem.url);
                }}
                className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Definir como Capa</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  setSelectedAlbumId(viewingAlbumId);
                  const targetIdx = activeMediaList.findIndex(m => m.id === previewMediaItem.id);
                  setCurrentIndex(targetIdx >= 0 ? targetIdx : 0);
                  setActiveTab('slideshow');
                  setPreviewMediaItem(null);
                }}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Apresentar no Telão</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  handleDeleteMedia(previewMediaItem.id);
                  setPreviewMediaItem(null);
                }}
                className="p-2 bg-rose-950/40 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white rounded-xl text-xs transition"
                title="Excluir Foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
