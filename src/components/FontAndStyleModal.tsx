import React from 'react';
import { Type, Palette, Volume2, Sparkles, X, Play } from 'lucide-react';
import { OverlaySettings, FontFamily, SoundAlert } from '../types';
import { playTimerAlert } from '../utils/audioAlerts';

interface FontAndStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OverlaySettings;
  onChangeSettings: (newSettings: OverlaySettings) => void;
}

const FONT_OPTIONS: { id: FontFamily; name: string; previewClass: string; desc: string }[] = [
  { id: 'inter', name: 'Inter (Modern Sans)', previewClass: 'font-inter', desc: 'Clean, balanced, contemporary' },
  { id: 'outfit', name: 'Outfit (Geometric)', previewClass: 'font-outfit', desc: 'Friendly, rounded geometry' },
  { id: 'mono', name: 'JetBrains Mono', previewClass: 'font-mono-code', desc: 'Technical, crisp monospace digits' },
  { id: 'cinzel', name: 'Cinzel (Serif)', previewClass: 'font-cinzel', desc: 'Timeless, elegant classical serif' },
  { id: 'orbitron', name: 'Orbitron (Digital Sci-Fi)', previewClass: 'font-orbitron', desc: 'Futuristic digital clock display' },
  { id: 'oswald', name: 'Oswald (Bold Condensed)', previewClass: 'font-oswald', desc: 'Strong, impactful industrial numbers' },
];

const OVERLAY_COLORS = [
  { name: 'Pure AMOLED Black', hex: '#000000' },
  { name: 'Deep Midnight Slate', hex: '#0f172a' },
  { name: 'Velvet Plum', hex: '#1e112a' },
  { name: 'Obsidian Emerald', hex: '#061a14' },
  { name: 'Dark Indigo', hex: '#0b0f2a' },
  { name: 'Charcoal Grey', hex: '#1c1917' },
  { name: 'Frosted Glass White', hex: '#ffffff' },
];

const ACCENT_COLORS = [
  { name: 'Emerald Mint', hex: '#10b981' },
  { name: 'Sky Cyan', hex: '#38bdf8' },
  { name: 'Electric Violet', hex: '#a855f7' },
  { name: 'Sunset Amber', hex: '#f97316' },
  { name: 'Rose Red', hex: '#f43f5e' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Cyber Neon Lime', hex: '#a3e635' },
];

const SOUND_OPTIONS: { id: SoundAlert; name: string; desc: string }[] = [
  { id: 'zen-bell', name: 'Zen Singing Bowl', desc: 'Peaceful harmonic Tibetan meditation chime' },
  { id: 'digital-chime', name: 'Android Digital Chime', desc: 'Crisp 4-note ascending digital notification' },
  { id: 'gentle-marimba', name: 'Gentle Marimba', desc: 'Warm acoustic wooden mallet chord' },
  { id: 'cosmic-gong', name: 'Cosmic Bass Gong', desc: 'Deep atmospheric resonance' },
  { id: 'none', name: 'Mute (Silent Alert)', desc: 'Only screen notifications and vibration' },
];

export const FontAndStyleModal: React.FC<FontAndStyleModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings
}) => {
  if (!isOpen) return null;

  const handleTestSound = (sound: SoundAlert) => {
    playTimerAlert(sound, settings.soundVolume);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="style-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="style-modal-title" className="text-base font-bold">
                Font, Overlay & Styling
              </h2>
              <p className="text-xs text-zinc-400">Customize the round timer dial appearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close styling modal"
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
          {/* SECTION 1: FONT STYLES */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-3">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              <span>Customizable Font Styles</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FONT_OPTIONS.map((font) => {
                const isSelected = settings.fontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() => onChangeSettings({ ...settings, fontFamily: font.id })}
                    aria-label={`Select ${font.name}`}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-400 ring-2 ring-purple-400/30'
                        : 'bg-zinc-800/40 border-zinc-700/80 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-zinc-200">{font.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                    </div>
                    <div className={`text-2xl font-bold tracking-tight text-white mb-0.5 ${font.previewClass}`}>
                      12:45
                    </div>
                    <p className="text-[10px] text-zinc-400">{font.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: TIMER OVERLAY COLOR & OPACITY (CRITICAL USER REQUEST) */}
          <div className="bg-zinc-800/40 border border-zinc-700/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Timer Overlay Dial Customization</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {Math.round(settings.overlayOpacity * 100)}% Opacity
              </span>
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                <span>Overlay Dial Opacity (Background transparency)</span>
                <span className="text-zinc-400">{settings.overlayOpacity <= 0.1 ? 'Transparent' : settings.overlayOpacity >= 0.9 ? 'Solid' : 'Translucent'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.overlayOpacity}
                onChange={(e) => onChangeSettings({ ...settings, overlayOpacity: Number(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
                aria-label="Adjust timer overlay opacity"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>0% (See-through)</span>
                <span>50% (Ambient Glass)</span>
                <span>100% (Solid Color)</span>
              </div>
            </div>

            {/* Backdrop Blur Slider */}
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                <span>Dial Glassmorphism Blur</span>
                <span className="font-mono text-zinc-400">{settings.backdropBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="2"
                value={settings.backdropBlur}
                onChange={(e) => onChangeSettings({ ...settings, backdropBlur: Number(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer"
                aria-label="Adjust timer dial backdrop blur"
              />
            </div>

            {/* Overlay Dial Background Color Swatches */}
            <div>
              <span className="block text-xs text-zinc-300 mb-2">Overlay Dial Color</span>
              <div className="flex flex-wrap gap-2 items-center">
                {OVERLAY_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => onChangeSettings({ ...settings, overlayColor: col.hex })}
                    title={col.name}
                    aria-label={`Overlay color ${col.name}`}
                    className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                      settings.overlayColor.toLowerCase() === col.hex.toLowerCase()
                        ? 'border-emerald-400 scale-110 shadow-lg'
                        : 'border-zinc-600 hover:border-zinc-400'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
                {/* Custom Hex Input */}
                <input
                  type="color"
                  value={settings.overlayColor}
                  onChange={(e) => onChangeSettings({ ...settings, overlayColor: e.target.value })}
                  title="Choose custom overlay color"
                  aria-label="Choose custom overlay color"
                  className="w-8 h-8 rounded-full border-2 border-zinc-600 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: RING ACCENT COLOR & TEXT COLOR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ring Color */}
            <div className="bg-zinc-800/40 border border-zinc-700/80 rounded-2xl p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                Countdown Ring Color
              </span>
              <div className="flex flex-wrap gap-2 items-center mb-2">
                {ACCENT_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => onChangeSettings({ ...settings, ringColor: col.hex })}
                    title={col.name}
                    aria-label={`Ring color ${col.name}`}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                      settings.ringColor.toLowerCase() === col.hex.toLowerCase()
                        ? 'border-white scale-110 shadow-lg ring-2 ring-white/30'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.ringColor}
                  onChange={(e) => onChangeSettings({ ...settings, ringColor: e.target.value })}
                  title="Choose custom ring color"
                  aria-label="Choose custom ring color"
                  className="w-7 h-7 rounded-full border border-zinc-600 cursor-pointer bg-transparent"
                />
              </div>
            </div>

            {/* Time Digits Color */}
            <div className="bg-zinc-800/40 border border-zinc-700/80 rounded-2xl p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                Time Digits Color
              </span>
              <div className="flex flex-wrap gap-2 items-center mb-2">
                {['#ffffff', '#f8fafc', '#fef08a', '#86efac', '#7dd3fc', '#fbcfe8', '#cbd5e1'].map((hex) => (
                  <button
                    key={hex}
                    onClick={() => onChangeSettings({ ...settings, textColor: hex })}
                    aria-label={`Text color ${hex}`}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                      settings.textColor.toLowerCase() === hex.toLowerCase()
                        ? 'border-purple-400 scale-110 shadow-lg'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => onChangeSettings({ ...settings, textColor: e.target.value })}
                  title="Choose custom text color"
                  aria-label="Choose custom text color"
                  className="w-7 h-7 rounded-full border border-zinc-600 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: SOUND ALERT & VOLUME */}
          <div className="bg-zinc-800/40 border border-zinc-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Timer Zero Sound Alerts</span>
              </span>
              <span className="text-xs text-zinc-400 capitalize">{settings.soundAlert.replace('-', ' ')}</span>
            </div>

            <div className="space-y-2">
              {SOUND_OPTIONS.map((snd) => {
                const isSelected = settings.soundAlert === snd.id;
                return (
                  <div
                    key={snd.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/80 ring-1 ring-amber-400/20'
                        : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                    }`}
                  >
                    <button
                      onClick={() => onChangeSettings({ ...settings, soundAlert: snd.id })}
                      className="flex-1 text-left cursor-pointer"
                      aria-label={`Select ${snd.name}`}
                    >
                      <span className="text-xs font-medium text-white block">{snd.name}</span>
                      <span className="text-[10px] text-zinc-400 block">{snd.desc}</span>
                    </button>

                    {snd.id !== 'none' && (
                      <button
                        onClick={() => handleTestSound(snd.id)}
                        title="Preview sound"
                        aria-label={`Preview ${snd.name}`}
                        className="px-2.5 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-xs font-medium text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Test</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Volume slider */}
            {settings.soundAlert !== 'none' && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Sound Volume</span>
                  <span className="font-mono text-zinc-400">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => onChangeSettings({ ...settings, soundVolume: Number(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                  aria-label="Adjust sound volume"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-semibold text-sm transition-colors cursor-pointer shadow-lg shadow-purple-500/20"
          >
            Apply Styling
          </button>
        </div>
      </div>
    </div>
  );
};
