import React from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Bell, BellOff } from 'lucide-react';
import { OverlaySettings, TimerStatus } from '../types';

interface RoundTimerProps {
  remainingSeconds: number;
  targetSeconds: number;
  status: TimerStatus;
  sessionTitle: string;
  category: string;
  settings: OverlaySettings;
  orientation: 'portrait' | 'landscape' | 'responsive';
  onStartPause: () => void;
  onReset: () => void;
  onAdjustSeconds: (delta: number) => void;
  onOpenTitleEdit: () => void;
}

export const RoundTimer: React.FC<RoundTimerProps> = ({
  remainingSeconds,
  targetSeconds,
  status,
  sessionTitle,
  category,
  settings,
  orientation,
  onStartPause,
  onReset,
  onAdjustSeconds,
  onOpenTitleEdit
}) => {
  // Format HH:MM:SS
  const hrs = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;

  const formattedHours = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : '';
  const formattedMinutes = mins.toString().padStart(2, '0');
  const formattedSeconds = secs.toString().padStart(2, '0');

  // Calculate circular SVG progress (clockwise countdown or elapsed)
  // When timer begins, progress is 1.0 (100% full ring); as it ticks down, it depletes to 0
  const progressRatio = targetSeconds > 0 ? remainingSeconds / targetSeconds : 0;
  const clampedProgress = Math.max(0, Math.min(1, progressRatio));

  // Circular geometry
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  // Stroke offset: 0 is completely filled, circumference is completely empty
  const strokeDashoffset = circumference - clampedProgress * circumference;

  // Font family mapping
  const getFontClass = () => {
    switch (settings.fontFamily) {
      case 'outfit': return 'font-outfit';
      case 'mono': return 'font-mono-code';
      case 'cinzel': return 'font-cinzel';
      case 'orbitron': return 'font-orbitron';
      case 'oswald': return 'font-oswald';
      case 'inter':
      default: return 'font-inter';
    }
  };

  // Convert overlay color to rgba with opacity
  const getOverlayBackgroundStyle = () => {
    const hex = settings.overlayColor || '#000000';
    let r = 0, g = 0, b = 0;
    if (hex.startsWith('#')) {
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
      } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
      }
    }
    const alpha = settings.overlayOpacity;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const percentLeft = Math.round(clampedProgress * 100);

  return (
    <div
      className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
        orientation === 'landscape' ? 'py-2 scale-95 md:scale-100' : 'py-6'
      }`}
    >
      {/* Session Title & Tag Header (Clickable to edit) */}
      <button
        onClick={onOpenTitleEdit}
        aria-label={`Session name: ${sessionTitle}, category: ${category}. Click to rename.`}
        className="group mb-3 px-3.5 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer shadow-lg max-w-[280px]"
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.ringColor }} aria-hidden="true" />
        <span className="text-xs font-medium text-white/90 truncate group-hover:text-white transition-colors">
          {sessionTitle}
        </span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/70">
          {category}
        </span>
      </button>

      {/* Centerpiece Round Countdown Timer Dial */}
      <div
        role="timer"
        aria-label={`Countdown Timer: ${hrs > 0 ? `${hrs} hours ` : ''}${mins} minutes ${secs} seconds remaining. Status: ${status}.`}
        aria-live="polite"
        aria-valuenow={remainingSeconds}
        aria-valuemin={0}
        aria-valuemax={targetSeconds}
        className="relative flex items-center justify-center group"
      >
        {/* Ambient Ring Glow effect when running */}
        {status === 'running' && settings.pulseAnimation && (
          <div
            className="absolute rounded-full pointer-events-none transition-all duration-1000 animate-pulse"
            style={{
              width: 320,
              height: 320,
              background: `radial-gradient(circle, ${settings.ringColor}22 0%, transparent 70%)`,
              filter: 'blur(20px)'
            }}
            aria-hidden="true"
          />
        )}

        {/* Circular SVG Ring */}
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="transform -rotate-90 filter drop-shadow-xl select-none"
          aria-hidden="true"
        >
          {/* Subtle tick marks around the rim */}
          <circle
            cx="160"
            cy="160"
            r={radius + 8}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray="2, 6"
          />

          {/* Background circle track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke={settings.ringBackgroundColor || 'rgba(255, 255, 255, 0.12)'}
            strokeWidth={settings.ringThickness || 8}
          />

          {/* Foreground animated countdown ring */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke={settings.ringColor}
            strokeWidth={settings.ringThickness || 8}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            style={{
              filter: status === 'running' ? `drop-shadow(0 0 8px ${settings.ringColor}88)` : 'none'
            }}
          />

          {/* Circular Indicator pip at current head */}
          {remainingSeconds > 0 && (
            <circle
              cx={160 + radius * Math.cos(-2 * Math.PI * (1 - clampedProgress))}
              cy={160 + radius * Math.sin(-2 * Math.PI * (1 - clampedProgress))}
              r={(settings.ringThickness || 8) * 0.75}
              fill="#ffffff"
              filter="drop-shadow(0 0 4px rgba(255,255,255,0.8))"
            />
          )}
        </svg>

        {/* Customizable Overlay Dial with Opacity and Backdrop Blur */}
        <div
          onClick={onStartPause}
          title="Click to Play / Pause timer"
          className="absolute rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] select-none shadow-2xl border border-white/10"
          style={{
            width: 250,
            height: 250,
            backgroundColor: getOverlayBackgroundStyle(),
            backdropFilter: `blur(${settings.backdropBlur}px)`,
            WebkitBackdropFilter: `blur(${settings.backdropBlur}px)`,
          }}
        >
          {/* Status badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'running'
                  ? 'bg-emerald-400 animate-ping'
                  : status === 'paused'
                  ? 'bg-amber-400'
                  : status === 'completed'
                  ? 'bg-purple-400'
                  : 'bg-white/40'
              }`}
              aria-hidden="true"
            />
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/70">
              {status === 'running' ? 'Active' : status === 'paused' ? 'Paused' : status === 'completed' ? 'Done' : 'Ready'}
            </span>
            <span className="text-[10px] text-white/40">• {percentLeft}%</span>
          </div>

          {/* Big Formatted Round Countdown Time Display */}
          <div
            className={`flex items-baseline tracking-tight font-bold select-none ${getFontClass()}`}
            style={{
              color: settings.textColor,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              fontSize: hrs > 0 ? '2.4rem' : '3.3rem',
              lineHeight: 1
            }}
          >
            {formattedHours && <span>{formattedHours}</span>}
            <span>{formattedMinutes}</span>
            <span className="opacity-70 animate-pulse">:</span>
            <span>{formattedSeconds}</span>
          </div>

          {/* Sound & Notification Status Icon Indicator */}
          <div className="flex items-center gap-2 mt-2 text-white/60">
            {settings.soundAlert !== 'none' ? (
              <span className="flex items-center gap-1 text-[10px] text-white/70">
                <Bell className="w-3 h-3 text-emerald-400" />
                <span className="capitalize">{settings.soundAlert.replace('-', ' ')}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-white/40">
                <BellOff className="w-3 h-3" />
                <span>Muted</span>
              </span>
            )}
          </div>

          {/* Tap hint in center */}
          <span className="text-[10px] text-white/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {status === 'running' ? 'Tap to pause' : 'Tap to start'}
          </span>
        </div>
      </div>

      {/* Quick Time Adjusters (+1m, +5m, -1m, Reset) */}
      <div className="flex items-center gap-2 mt-4 z-20">
        <button
          onClick={() => onAdjustSeconds(-60)}
          disabled={remainingSeconds <= 60}
          aria-label="Subtract one minute from timer"
          className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 disabled:opacity-30 disabled:pointer-events-none border border-white/10 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md"
        >
          <Minus className="w-3 h-3" />
          <span>1m</span>
        </button>

        <button
          onClick={onStartPause}
          aria-label={status === 'running' ? 'Pause Countdown Timer' : 'Start Countdown Timer'}
          className="px-5 py-2 rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          style={{
            backgroundColor: settings.ringColor,
            color: '#000000',
            boxShadow: `0 4px 20px ${settings.ringColor}55`
          }}
        >
          {status === 'running' ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>{status === 'paused' ? 'Resume' : 'Start'}</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          aria-label="Reset Timer"
          className="p-2 rounded-2xl bg-black/40 hover:bg-black/60 active:scale-95 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          title="Reset timer to target duration"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => onAdjustSeconds(60)}
          aria-label="Add one minute to timer"
          className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 border border-white/10 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md"
        >
          <Plus className="w-3 h-3" />
          <span>1m</span>
        </button>

        <button
          onClick={() => onAdjustSeconds(300)}
          aria-label="Add five minutes to timer"
          className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 border border-white/10 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md"
        >
          <Plus className="w-3 h-3" />
          <span>5m</span>
        </button>
      </div>
    </div>
  );
};
