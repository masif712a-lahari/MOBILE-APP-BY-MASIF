import React, { useState } from 'react';
import { Clock, Sliders, Check } from 'lucide-react';
import { DEFAULT_PRESETS } from '../data/presetBackgrounds';

interface PresetQuickPickProps {
  currentSeconds: number;
  onSelectSeconds: (secs: number, name?: string) => void;
  ringColor: string;
}

export const PresetQuickPick: React.FC<PresetQuickPickProps> = ({
  currentSeconds,
  onSelectSeconds,
  ringColor
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customHrs, setCustomHrs] = useState(0);
  const [customMins, setCustomMins] = useState(15);
  const [customSecs, setCustomSecs] = useState(0);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const total = customHrs * 3600 + customMins * 60 + customSecs;
    if (total > 0) {
      onSelectSeconds(total, 'Custom Timer');
      setShowCustomModal(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" style={{ color: ringColor }} />
          <span>Quick Presets</span>
        </span>

        <button
          onClick={() => setShowCustomModal(true)}
          aria-label="Set custom timer duration"
          className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-all cursor-pointer backdrop-blur-sm"
        >
          <Sliders className="w-3 h-3" />
          <span>Custom</span>
        </button>
      </div>

      {/* Preset Scrollable Chips */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin"
        role="group"
        aria-label="Timer presets list"
      >
        {DEFAULT_PRESETS.map(preset => {
          const isSelected = currentSeconds === preset.seconds;
          const displayMin = Math.round(preset.seconds / 60);

          return (
            <button
              key={preset.id}
              onClick={() => onSelectSeconds(preset.seconds, preset.name)}
              aria-label={`${preset.name}, ${displayMin} minutes`}
              aria-pressed={isSelected}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                isSelected
                  ? 'text-black font-semibold shadow-lg scale-105'
                  : 'bg-black/40 hover:bg-black/60 text-white/80 border border-white/10'
              }`}
              style={
                isSelected
                  ? { backgroundColor: ringColor, boxShadow: `0 2px 10px ${ringColor}66` }
                  : {}
              }
            >
              <span>{displayMin}m</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Duration Modal */}
      {showCustomModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-timer-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-white">
            <h3 id="custom-timer-title" className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Set Custom Duration
            </h3>

            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <label htmlFor="custom-hrs" className="block text-xs text-zinc-400 mb-1">Hours</label>
                  <input
                    id="custom-hrs"
                    type="number"
                    min="0"
                    max="23"
                    value={customHrs}
                    onChange={e => setCustomHrs(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 text-center text-lg font-mono focus:outline-hidden focus:border-emerald-400 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="custom-mins" className="block text-xs text-zinc-400 mb-1">Minutes</label>
                  <input
                    id="custom-mins"
                    type="number"
                    min="0"
                    max="59"
                    value={customMins}
                    onChange={e => setCustomMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 text-center text-lg font-mono focus:outline-hidden focus:border-emerald-400 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="custom-secs" className="block text-xs text-zinc-400 mb-1">Seconds</label>
                  <input
                    id="custom-secs"
                    type="number"
                    min="0"
                    max="59"
                    value={customSecs}
                    onChange={e => setCustomSecs(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 text-center text-lg font-mono focus:outline-hidden focus:border-emerald-400 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" />
                  Set Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
