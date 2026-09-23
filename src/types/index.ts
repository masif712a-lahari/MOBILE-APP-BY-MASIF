export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type FontFamily = 'inter' | 'outfit' | 'mono' | 'cinzel' | 'orbitron' | 'oswald';

export type SoundAlert = 'zen-bell' | 'digital-chime' | 'gentle-marimba' | 'cosmic-gong' | 'none';

export type BackgroundType = 'preset' | 'custom-url' | 'upload' | 'gradient' | 'solid';

export type OrientationMode = 'portrait' | 'landscape' | 'responsive';

export type ThemeMode = 'dark' | 'light' | 'auto';

export interface TimerSession {
  id: string;
  createdAt: string;
  completedAt?: string;
  title: string;
  category: string;
  targetSeconds: number;
  elapsedSeconds: number;
  completed: boolean;
  notes?: string;
  deviceId?: string;
}

export interface OverlaySettings {
  fontFamily: FontFamily;
  fontSize: 'compact' | 'normal' | 'large' | 'huge';
  textColor: string;
  ringColor: string;
  ringBackgroundColor: string;
  ringThickness: number;
  overlayColor: string; // Background behind the round timer
  overlayOpacity: number; // 0 to 1
  backdropBlur: number; // 0 to 24px
  showMilliseconds: boolean;
  pulseAnimation: boolean;
  soundAlert: SoundAlert;
  soundVolume: number;
  vibrate: boolean;
  tickSound: boolean;
}

export interface BackgroundConfig {
  type: BackgroundType;
  value: string;
  name: string;
  blur: number; // 0 to 20px
  brightness: number; // 0.2 to 1.5
  contrast: number; // 0.5 to 1.5
  overlayTint: string; // e.g. 'rgba(0,0,0,0.4)'
}

export interface CloudSyncConfig {
  syncKey: string;
  lastSyncedAt: string | null;
  autoSync: boolean;
  deviceName: string;
}

export interface TimerPreset {
  id: string;
  name: string;
  seconds: number;
  category: string;
  icon?: string;
}
