import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Moon, Sun, Smartphone, RotateCcw } from 'lucide-react';
import { OrientationMode, ThemeMode } from '../types';

interface AndroidStatusBarProps {
  orientation: OrientationMode;
  onToggleOrientation: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  isSimulatedFrame: boolean;
  onToggleFrame: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  orientation,
  onToggleOrientation,
  theme,
  onToggleTheme,
  isSimulatedFrame,
  onToggleFrame
}) => {
  const [timeStr, setTimeStr] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      role="banner"
      className="w-full h-8 px-4 flex items-center justify-between text-xs font-medium z-30 select-none backdrop-blur-xs transition-colors duration-300"
      style={{
        color: 'rgba(255, 255, 255, 0.85)',
        textShadow: '0 1px 2px rgba(0,0,0,0.6)'
      }}
      aria-label="Android System Status Bar"
    >
      {/* Left: Clock & Camera Cutout indicator */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-tight">{timeStr}</span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
          title="Chronos Active"
          aria-hidden="true"
        />
      </div>

      {/* Center: Device framing & Orientation Switch controls */}
      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
        <button
          onClick={onToggleOrientation}
          title={`Switch Orientation (Current: ${orientation})`}
          aria-label={`Toggle screen orientation, currently ${orientation}`}
          className="flex items-center gap-1 text-[10px] text-white/90 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="capitalize hidden sm:inline">{orientation}</span>
        </button>

        <span className="text-white/30" aria-hidden="true">|</span>

        <button
          onClick={onToggleTheme}
          title={`Switch theme (Current: ${theme})`}
          aria-label={`Switch dark/light theme, currently ${theme}`}
          className="text-white/90 hover:text-white transition-colors p-0.5 cursor-pointer"
        >
          {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
        </button>

        <span className="text-white/30" aria-hidden="true">|</span>

        <button
          onClick={onToggleFrame}
          title={isSimulatedFrame ? 'Switch to Fullscreen' : 'View in Android Phone Frame'}
          aria-label="Toggle Android phone frame simulation"
          className={`flex items-center gap-1 text-[10px] transition-colors cursor-pointer ${
            isSimulatedFrame ? 'text-emerald-400' : 'text-white/70 hover:text-white'
          }`}
        >
          <Smartphone className="w-3 h-3" />
          <span className="hidden md:inline">{isSimulatedFrame ? 'Frame' : 'Full'}</span>
        </button>
      </div>

      {/* Right: Android System Icons */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono tracking-wider opacity-80">5G</span>
        <Wifi className="w-3.5 h-3.5 opacity-90" aria-hidden="true" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] opacity-80">98%</span>
          <BatteryMedium className="w-4 h-4 opacity-90" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
};
