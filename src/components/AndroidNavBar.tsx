import React from 'react';
import { Timer, Image as ImageIcon, Palette, History, Cloud } from 'lucide-react';

interface AndroidNavBarProps {
  activeTab: 'timer' | 'background' | 'style' | 'history' | 'cloud';
  setActiveTab: (tab: 'timer' | 'background' | 'style' | 'history' | 'cloud') => void;
  syncCount?: number;
  hasUnsavedNotes?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav
      role="navigation"
      aria-label="Android Bottom Navigation"
      className="w-full z-30 select-none pb-2 pt-1 transition-all"
    >
      <div className="mx-auto max-w-md px-4">
        {/* Android Material Pill Navigation Bar */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center justify-around shadow-2xl shadow-black/80">
          <button
            onClick={() => setActiveTab('timer')}
            aria-label="Countdown Timer View"
            aria-current={activeTab === 'timer' ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-white/15 text-white font-semibold shadow-inner'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            <Timer className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Timer</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            aria-label="Choose Background Images"
            aria-current={activeTab === 'background' ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'background'
                ? 'bg-white/15 text-white font-semibold shadow-inner'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Wallpapers</span>
          </button>

          <button
            onClick={() => setActiveTab('style')}
            aria-label="Customize Font, Overlay Color and Opacity"
            aria-current={activeTab === 'style' ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'style'
                ? 'bg-white/15 text-white font-semibold shadow-inner'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Style & Font</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            aria-label="Session History and CSV Export"
            aria-current={activeTab === 'history' ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white/15 text-white font-semibold shadow-inner'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">History</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            aria-label="Cloud Sync Across Devices"
            aria-current={activeTab === 'cloud' ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white/15 text-white font-semibold shadow-inner'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            <Cloud className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Cloud Sync</span>
          </button>
        </div>

        {/* Android Gesture Bar */}
        <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-2" aria-hidden="true" />
      </div>
    </nav>
  );
};
