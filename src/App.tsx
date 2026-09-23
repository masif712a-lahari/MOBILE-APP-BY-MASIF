import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TimerStatus,
  OverlaySettings,
  BackgroundConfig,
  TimerSession,
  OrientationMode,
  ThemeMode,
  CloudSyncConfig
} from './types';
import { PRESET_BACKGROUNDS } from './data/presetBackgrounds';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar } from './components/AndroidNavBar';
import { RoundTimer } from './components/RoundTimer';
import { PresetQuickPick } from './components/PresetQuickPick';
import { BackgroundPickerModal } from './components/BackgroundPickerModal';
import { FontAndStyleModal } from './components/FontAndStyleModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { CloudSyncModal } from './components/CloudSyncModal';
import { SessionCompleteDialog } from './components/SessionCompleteDialog';
import { RenameSessionModal } from './components/RenameSessionModal';
import {
  requestNotificationPermission,
  sendTimerCompleteNotification,
  announceToScreenReader
} from './utils/notifications';
import {
  getLocalSessions,
  saveLocalSessions,
  getCloudSyncConfig,
  saveCloudSyncConfig,
  syncSessionsWithCloud,
  setupBroadcastListener
} from './utils/cloudSync';
import { exportSessionsToCsv, formatDurationText } from './utils/exportCsv';
import {
  RotateCcw,
  Sparkles,
  Smartphone,
  Play,
  Pause,
  History,
  Cloud,
  Palette,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  FileSpreadsheet
} from 'lucide-react';

const STORAGE_SETTINGS = 'chronos_overlay_settings_v1';
const STORAGE_BG = 'chronos_bg_config_v1';
const STORAGE_ORIENTATION = 'chronos_orientation_v1';
const STORAGE_THEME = 'chronos_theme_v1';

export default function App() {
  // 1. Timer State
  const [targetSeconds, setTargetSeconds] = useState<number>(1500); // 25 mins default
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1500);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [sessionTitle, setSessionTitle] = useState<string>('Deep Work Focus');
  const [category, setCategory] = useState<string>('Focus');
  const timerEndTimestampRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 2. Custom Overlay & Font Settings (User customizable color & opacity)
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      fontFamily: 'inter',
      fontSize: 'normal',
      textColor: '#ffffff',
      ringColor: '#10b981',
      ringBackgroundColor: 'rgba(255, 255, 255, 0.15)',
      ringThickness: 10,
      overlayColor: '#000000',
      overlayOpacity: 0.55, // default 55% opacity allows ambient background to show through cleanly
      backdropBlur: 12,
      showMilliseconds: false,
      pulseAnimation: true,
      soundAlert: 'zen-bell',
      soundVolume: 0.8,
      vibrate: true,
      tickSound: false
    };
  });

  // 3. Background Image Configuration
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_BG);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      type: 'preset',
      value: PRESET_BACKGROUNDS[0].url,
      name: PRESET_BACKGROUNDS[0].name,
      blur: 2,
      brightness: 0.85,
      contrast: 1.05,
      overlayTint: 'rgba(0,0,0,0.3)'
    };
  });

  // 4. Orientation & Theme Modes
  const [orientation, setOrientation] = useState<OrientationMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ORIENTATION);
      if (stored) return stored as OrientationMode;
    } catch {
      // fallback
    }
    return 'portrait';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_THEME);
      if (stored) return stored as ThemeMode;
    } catch {
      // fallback
    }
    return 'dark';
  });

  // 5. UI navigation & modals
  const [activeTab, setActiveTab] = useState<'timer' | 'background' | 'style' | 'history' | 'cloud'>('timer');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [isSimulatedFrame, setIsSimulatedFrame] = useState(false);

  // 6. Cloud Sync & Sessions History
  const [sessions, setSessions] = useState<TimerSession[]>(() => getLocalSessions());
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>(() => getCloudSyncConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Save overlay settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(overlaySettings));
  }, [overlaySettings]);

  // Save bgConfig to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_BG, JSON.stringify(bgConfig));
  }, [bgConfig]);

  // Save orientation & theme
  useEffect(() => {
    localStorage.setItem(STORAGE_ORIENTATION, orientation);
  }, [orientation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_THEME, theme);
  }, [theme]);

  // Setup multi-device broadcast listener for instant cross-tab / cross-device updates
  useEffect(() => {
    const cleanup = setupBroadcastListener((updated) => {
      setSessions(updated);
      setIsCloudSynced(true);
    });
    return cleanup;
  }, []);

  // Sync with cloud on initial mount
  useEffect(() => {
    const doInitialSync = async () => {
      try {
        const res = await syncSessionsWithCloud(sessions, cloudConfig.syncKey);
        setSessions(res.mergedSessions);
        setIsCloudSynced(true);
        setCloudConfig((prev) => ({
          ...prev,
          lastSyncedAt: new Date().toISOString()
        }));
      } catch {
        // silent fallback
      }
    };
    doInitialSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request notification permissions gently on first click or timer start
  const ensureNotificationPermission = async () => {
    await requestNotificationPermission();
  };

  // Timer Tick Engine using timestamp difference for 100% accurate timekeeping
  useEffect(() => {
    if (status === 'running') {
      timerIntervalRef.current = setInterval(() => {
        if (!timerEndTimestampRef.current) return;

        const now = Date.now();
        const diffMs = timerEndTimestampRef.current - now;
        const diffSec = Math.max(0, Math.ceil(diffMs / 1000));

        setRemainingSeconds(diffSec);

        // When timer reaches zero
        if (diffSec <= 0) {
          handleTimerComplete();
        }
      }, 250);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Timer Completion Handler
  const handleTimerComplete = useCallback(async () => {
    setStatus('completed');
    setRemainingSeconds(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // 1. Audio tone, haptic vibration, and Local Web Notification
    sendTimerCompleteNotification(
      sessionTitle,
      formatDurationText(targetSeconds),
      overlaySettings.soundAlert,
      overlaySettings.soundVolume,
      overlaySettings.vibrate
    );

    // 2. Live screen reader announcement
    announceToScreenReader(
      `Timer alert: Countdown for ${sessionTitle} has reached zero! Session completed.`,
      'assertive'
    );

    // 3. Record session in history
    const newSession: TimerSession = {
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      title: sessionTitle,
      category: category,
      targetSeconds: targetSeconds,
      elapsedSeconds: targetSeconds,
      completed: true,
      deviceId: cloudConfig.deviceName
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    saveLocalSessions(updatedSessions);

    // 4. Auto-sync to cloud storage if enabled
    if (cloudConfig.autoSync) {
      setIsSyncing(true);
      try {
        const syncRes = await syncSessionsWithCloud(updatedSessions, cloudConfig.syncKey);
        setSessions(syncRes.mergedSessions);
        setIsCloudSynced(true);
        setCloudConfig((prev) => {
          const updated = { ...prev, lastSyncedAt: new Date().toISOString() };
          saveCloudSyncConfig(updated);
          return updated;
        });
      } catch {
        // logged locally
      } finally {
        setIsSyncing(false);
      }
    }

    // 5. Open complete celebration dialog
    setShowCompleteDialog(true);
  }, [sessionTitle, category, targetSeconds, overlaySettings, cloudConfig, sessions]);

  // Play / Pause Toggle
  const handleStartPause = () => {
    ensureNotificationPermission();

    if (status === 'running') {
      // Pause
      setStatus('paused');
      timerEndTimestampRef.current = null;
      announceToScreenReader(`Timer paused at ${remainingSeconds} seconds remaining`, 'polite');
    } else {
      // Start or Resume
      const secsToRun = remainingSeconds > 0 ? remainingSeconds : targetSeconds;
      timerEndTimestampRef.current = Date.now() + secsToRun * 1000;
      setRemainingSeconds(secsToRun);
      setStatus('running');
      announceToScreenReader(
        `Timer started for ${sessionTitle}, ${formatDurationText(secsToRun)} remaining`,
        'polite'
      );
    }
  };

  // Reset Timer
  const handleReset = () => {
    setStatus('idle');
    setRemainingSeconds(targetSeconds);
    timerEndTimestampRef.current = null;
    announceToScreenReader(`Timer reset to ${formatDurationText(targetSeconds)}`, 'polite');
  };

  // Adjust Seconds (+1m, +5m, -1m)
  const handleAdjustSeconds = (delta: number) => {
    const next = Math.max(10, remainingSeconds + delta);
    setRemainingSeconds(next);
    if (status === 'running') {
      timerEndTimestampRef.current = Date.now() + next * 1000;
    }
    announceToScreenReader(`Timer adjusted by ${delta > 0 ? '+' : ''}${delta} seconds`, 'polite');
  };

  // Select Preset Duration
  const handleSelectPresetSeconds = (secs: number, name?: string) => {
    setStatus('idle');
    setTargetSeconds(secs);
    setRemainingSeconds(secs);
    timerEndTimestampRef.current = null;
    if (name) {
      setSessionTitle(name);
    }
    announceToScreenReader(`Set timer to ${name || formatDurationText(secs)}`, 'polite');
  };

  // Save notes from celebration dialog
  const handleSaveSessionNotes = (notes: string) => {
    if (!notes) return;
    setSessions((prev) => {
      const updated = prev.map((s, idx) => (idx === 0 ? { ...s, notes } : s));
      saveLocalSessions(updated);
      if (cloudConfig.autoSync) {
        syncSessionsWithCloud(updated, cloudConfig.syncKey);
      }
      return updated;
    });
  };

  // Trigger Cloud Sync manually
  const handleTriggerCloudSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncSessionsWithCloud(sessions, cloudConfig.syncKey);
      setSessions(res.mergedSessions);
      setIsCloudSynced(true);
      const updatedConfig = {
        ...cloudConfig,
        lastSyncedAt: new Date().toISOString()
      };
      setCloudConfig(updatedConfig);
      saveCloudSyncConfig(updatedConfig);
      return { added: res.countAdded, remote: res.countRemote };
    } finally {
      setIsSyncing(false);
    }
  };

  // Update session note from history drawer
  const handleUpdateSessionNotes = (id: string, notes: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, notes } : s));
      saveLocalSessions(updated);
      if (cloudConfig.autoSync) {
        syncSessionsWithCloud(updated, cloudConfig.syncKey);
      }
      return updated;
    });
  };

  // Delete single session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveLocalSessions(updated);
      if (cloudConfig.autoSync) {
        syncSessionsWithCloud(updated, cloudConfig.syncKey);
      }
      return updated;
    });
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    setSessions([]);
    saveLocalSessions([]);
    if (cloudConfig.autoSync) {
      syncSessionsWithCloud([], cloudConfig.syncKey);
    }
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setOverlaySettings((prev) => ({
          ...prev,
          soundAlert: prev.soundAlert === 'none' ? 'zen-bell' : 'none'
        }));
      } else if (e.key === 'Escape') {
        setActiveTab('timer');
        setShowRenameModal(false);
        setShowCompleteDialog(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, remainingSeconds, targetSeconds]);

  // Determine computed background styles
  const getBackgroundInlineStyle = (): React.CSSProperties => {
    const isGradient = bgConfig.type === 'gradient' || bgConfig.value.includes('gradient');
    const isSolid = bgConfig.value.startsWith('#');

    if (isSolid) {
      return { backgroundColor: bgConfig.value };
    }
    if (isGradient) {
      return { background: bgConfig.value };
    }
    return {
      backgroundImage: `url("${bgConfig.value}")`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    };
  };

  // Orientation toggle
  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  // Theme toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Frame toggle
  const toggleFrame = () => {
    setIsSimulatedFrame((prev) => !prev);
  };

  const isLandscapeLayout = orientation === 'landscape';

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#06070a] text-white' : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* Invisible live screen reader announcement regions */}
      <div id="sr-announcer-polite" className="sr-only" aria-live="polite" aria-atomic="true" />
      <div id="sr-announcer-assertive" className="sr-only" aria-live="assertive" aria-atomic="true" />

      {/* Main Container: Full screen or Simulated Android Mobile Phone Frame */}
      <div
        className={`relative w-full overflow-hidden transition-all duration-300 flex flex-col ${
          isSimulatedFrame
            ? isLandscapeLayout
              ? 'max-w-4xl h-[480px] rounded-[44px] border-[10px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] my-6'
              : 'max-w-[420px] h-[850px] rounded-[48px] border-[12px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] my-6'
            : 'h-screen'
        }`}
      >
        {/* Dynamic Background Image Layer with custom blur, brightness, contrast */}
        <div
          className="absolute inset-0 z-0 transition-all duration-500"
          style={{
            ...getBackgroundInlineStyle(),
            filter: `blur(${bgConfig.blur}px) brightness(${bgConfig.brightness}) contrast(${bgConfig.contrast})`,
            transform: bgConfig.blur > 0 ? 'scale(1.06)' : 'none' // prevent edge blur leakage
          }}
          aria-hidden="true"
        />

        {/* Ambient Dark/Light Vignette Tint Overlay */}
        <div
          className="absolute inset-0 z-1 pointer-events-none transition-colors duration-500"
          style={{
            background:
              theme === 'dark'
                ? 'radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)'
                : 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.5) 100%)'
          }}
          aria-hidden="true"
        />

        {/* Content Container (Layer 2) */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Top: Android System Status Bar */}
          <AndroidStatusBar
            orientation={orientation}
            onToggleOrientation={toggleOrientation}
            theme={theme}
            onToggleTheme={toggleTheme}
            isSimulatedFrame={isSimulatedFrame}
            onToggleFrame={toggleFrame}
          />

          {/* Quick Header Bar for orientation & fast actions */}
          <div className="px-4 py-1 flex items-center justify-between z-20">
            <div className="flex items-center gap-1.5">
              <span className="font-outfit font-bold tracking-tight text-sm text-white drop-shadow-md">
                Chronos
              </span>
              <span
                className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-semibold"
                style={{ backgroundColor: `${overlaySettings.ringColor}33`, color: overlaySettings.ringColor }}
              >
                Round Timer
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick CSV Export Button on Main Screen */}
              <button
                onClick={() => exportSessionsToCsv(sessions)}
                title="Export session logs to CSV"
                aria-label="Export countdown session history to CSV file"
                className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() =>
                  setOverlaySettings((prev) => ({
                    ...prev,
                    soundAlert: prev.soundAlert === 'none' ? 'zen-bell' : 'none'
                  }))
                }
                title={overlaySettings.soundAlert === 'none' ? 'Unmute alert tone' : 'Mute alert tone'}
                aria-label={overlaySettings.soundAlert === 'none' ? 'Unmute sound alert' : 'Mute sound alert'}
                className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer"
              >
                {overlaySettings.soundAlert === 'none' ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>

              {/* Cloud Sync Quick Indicator */}
              <button
                onClick={() => setActiveTab('cloud')}
                title={`Cloud Vault: ${cloudConfig.syncKey} (${isCloudSynced ? 'Synced' : 'Ready'})`}
                aria-label="Open cloud sync settings"
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer text-xs"
              >
                <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : 'text-emerald-400'}`} />
                <span className="font-mono text-[10px] hidden sm:inline">{cloudConfig.syncKey}</span>
              </button>
            </div>
          </div>

          {/* MAIN VIEWPORT: Handles Portrait vs Landscape Ergonomically */}
          <main className="flex-1 flex items-center justify-center overflow-y-auto px-4 py-2 scrollbar-none z-10">
            {isLandscapeLayout ? (
              /* LANDSCAPE LAYOUT: Ergonomic split screen (Timer Left, Controls & Presets Right) */
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left Column: Big Round Countdown Timer Dial */}
                <div className="flex flex-col items-center justify-center">
                  <RoundTimer
                    remainingSeconds={remainingSeconds}
                    targetSeconds={targetSeconds}
                    status={status}
                    sessionTitle={sessionTitle}
                    category={category}
                    settings={overlaySettings}
                    orientation="landscape"
                    onStartPause={handleStartPause}
                    onReset={handleReset}
                    onAdjustSeconds={handleAdjustSeconds}
                    onOpenTitleEdit={() => setShowRenameModal(true)}
                  />
                </div>

                {/* Right Column: Landscape Controls, Presets & Quick Navigation */}
                <div className="flex flex-col gap-3 max-w-md mx-auto w-full bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Landscape Controls
                    </span>
                    <button
                      onClick={toggleOrientation}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Switch to Portrait</span>
                    </button>
                  </div>

                  {/* Primary Start / Pause / Reset button row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleStartPause}
                      className="py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      style={{
                        backgroundColor: overlaySettings.ringColor,
                        color: '#000000',
                        boxShadow: `0 4px 15px ${overlaySettings.ringColor}55`
                      }}
                    >
                      {status === 'running' ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>{status === 'paused' ? 'Resume' : 'Start'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleReset}
                      className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <PresetQuickPick
                    currentSeconds={targetSeconds}
                    onSelectSeconds={handleSelectPresetSeconds}
                    ringColor={overlaySettings.ringColor}
                  />

                  {/* Landscape Quick Navigation Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
                    <button
                      onClick={() => setActiveTab('background')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px]">Wallpaper</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('style')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px]">Styles</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <History className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px]">History</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('cloud')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <Cloud className="w-4 h-4 text-sky-400" />
                      <span className="text-[10px]">Cloud</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* PORTRAIT LAYOUT: Clean stacked mobile view with circular countdown timer */
              <div className="w-full max-w-md flex flex-col items-center justify-center space-y-2">
                <RoundTimer
                  remainingSeconds={remainingSeconds}
                  targetSeconds={targetSeconds}
                  status={status}
                  sessionTitle={sessionTitle}
                  category={category}
                  settings={overlaySettings}
                  orientation="portrait"
                  onStartPause={handleStartPause}
                  onReset={handleReset}
                  onAdjustSeconds={handleAdjustSeconds}
                  onOpenTitleEdit={() => setShowRenameModal(true)}
                />

                <PresetQuickPick
                  currentSeconds={targetSeconds}
                  onSelectSeconds={handleSelectPresetSeconds}
                  ringColor={overlaySettings.ringColor}
                />
              </div>
            )}
          </main>

          {/* Bottom: Android Navigation Bar (Only in Portrait or normal mode) */}
          <AndroidNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* MODAL 1: Background Images Picker (with preset wallpapers, custom upload & blur filters) */}
        <BackgroundPickerModal
          isOpen={activeTab === 'background'}
          onClose={() => setActiveTab('timer')}
          config={bgConfig}
          onChangeConfig={setBgConfig}
          onSelectPresetDefaults={(preset) => {
            if (preset.defaultOverlayColor || preset.defaultRingColor) {
              setOverlaySettings((prev) => ({
                ...prev,
                overlayColor: preset.defaultOverlayColor || prev.overlayColor,
                ringColor: preset.defaultRingColor || prev.ringColor,
                textColor: preset.defaultTextColor || prev.textColor
              }));
            }
          }}
        />

        {/* MODAL 2: Font Styles & Timer Overlay Customization (Color & Opacity sliders) */}
        <FontAndStyleModal
          isOpen={activeTab === 'style'}
          onClose={() => setActiveTab('timer')}
          settings={overlaySettings}
          onChangeSettings={setOverlaySettings}
        />

        {/* MODAL 3: Session History Log & CSV Export */}
        <HistoryDrawer
          isOpen={activeTab === 'history'}
          onClose={() => setActiveTab('timer')}
          sessions={sessions}
          onDeleteSession={handleDeleteSession}
          onClearAllSessions={handleClearAllSessions}
          onUpdateSessionNotes={handleUpdateSessionNotes}
          onOpenCloudSync={() => setActiveTab('cloud')}
          cloudSyncKey={cloudConfig.syncKey}
          isSynced={isCloudSynced}
        />

        {/* MODAL 4: Cloud Storage Multi-Device Sync */}
        <CloudSyncModal
          isOpen={activeTab === 'cloud'}
          onClose={() => setActiveTab('timer')}
          config={cloudConfig}
          onUpdateConfig={setCloudConfig}
          onTriggerSync={handleTriggerCloudSync}
          isSyncing={isSyncing}
          lastSyncedAt={cloudConfig.lastSyncedAt}
        />

        {/* MODAL 5: Rename Timer Session & Tag */}
        <RenameSessionModal
          isOpen={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          currentTitle={sessionTitle}
          currentCategory={category}
          onSave={(newTitle, newCat) => {
            setSessionTitle(newTitle);
            setCategory(newCat);
          }}
        />

        {/* MODAL 6: Session Complete Celebration Dialog */}
        <SessionCompleteDialog
          isOpen={showCompleteDialog}
          onClose={() => setShowCompleteDialog(false)}
          sessionTitle={sessionTitle}
          category={category}
          durationSeconds={targetSeconds}
          onSaveNotes={handleSaveSessionNotes}
          onRestartTimer={() => {
            handleReset();
            handleStartPause();
          }}
          ringColor={overlaySettings.ringColor}
        />
      </div>
    </div>
  );
}
