import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Link, Check, RefreshCw, X } from 'lucide-react';
import { BackgroundConfig } from '../types';
import { PRESET_BACKGROUNDS, PresetBackground } from '../data/presetBackgrounds';

interface BackgroundPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackgroundConfig;
  onChangeConfig: (newConfig: BackgroundConfig) => void;
  onSelectPresetDefaults?: (bg: PresetBackground) => void;
}

export const BackgroundPickerModal: React.FC<BackgroundPickerModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onSelectPresetDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url' | 'filters'>('presets');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: PresetBackground) => {
    onChangeConfig({
      ...config,
      type: 'preset',
      value: preset.url,
      name: preset.name
    });
    if (onSelectPresetDefaults) {
      onSelectPresetDefaults(preset);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChangeConfig({
          ...config,
          type: 'upload',
          value: dataUrl,
          name: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    // basic verification
    try {
      new URL(urlInput);
      onChangeConfig({
        ...config,
        type: 'custom-url',
        value: urlInput.trim(),
        name: 'Custom Web Image'
      });
      setUrlError('');
      setActiveTab('presets');
    } catch {
      setUrlError('Please enter a valid URL');
    }
  };

  const handleResetFilters = () => {
    onChangeConfig({
      ...config,
      blur: 0,
      brightness: 1,
      contrast: 1
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="background-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="background-modal-title" className="text-base font-bold">
                Background Wallpaper
              </h2>
              <p className="text-xs text-zinc-400">Choose images of your choice for the ambient timer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close background picker"
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-zinc-800 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-800/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Curated Presets ({PRESET_BACKGROUNDS.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-800/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Upload Device Image
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-800/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Web URL
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'filters'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-800/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Adjust Blur & Dim
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_BACKGROUNDS.map((preset) => {
                const isSelected = config.value === preset.url;
                const isGradient = preset.category === 'gradient';
                const isSolid = preset.url.startsWith('#');

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    aria-label={`Select ${preset.name}`}
                    className={`relative group rounded-2xl overflow-hidden aspect-video border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-[1.02]'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {isSolid ? (
                      <div className="w-full h-full" style={{ backgroundColor: preset.url }} />
                    ) : isGradient ? (
                      <div className="w-full h-full" style={{ background: preset.url }} />
                    ) : (
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                      <span className="text-xs font-semibold text-white drop-shadow-md truncate">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-zinc-300 capitalize">{preset.category}</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-black shadow-lg">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: UPLOAD FROM DEVICE */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-3xl p-8 text-center bg-zinc-800/30">
              <div className="p-4 rounded-2xl bg-zinc-800 text-emerald-400 mb-4 shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Upload Your Custom Wallpaper</h3>
              <p className="text-xs text-zinc-400 mb-6 max-w-xs">
                Select any photo from your phone or computer. It will be stored securely on your device.
              </p>

              <label className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Browse Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload background image file"
                />
              </label>

              {config.type === 'upload' && (
                <div className="mt-6 flex items-center gap-3 p-3 bg-zinc-800/80 rounded-2xl border border-zinc-700 text-left w-full max-w-sm">
                  <img
                    src={config.value}
                    alt="Uploaded thumbnail"
                    className="w-12 h-12 object-cover rounded-xl border border-zinc-600"
                  />
                  <div className="flex-1 truncate">
                    <span className="text-xs font-medium text-emerald-400 block">Current Background</span>
                    <span className="text-xs text-zinc-300 truncate block">{config.name}</span>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-4">
              <div>
                <label htmlFor="bg-url-input" className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Image URL (Direct link to JPEG, PNG, or WebP)</span>
                </label>
                <input
                  id="bg-url-input"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-emerald-400 transition-colors"
                />
                {urlError && <p className="text-xs text-rose-400 mt-1">{urlError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Apply Image URL
              </button>
            </form>
          )}

          {/* TAB 4: ADJUST BLUR & DIM */}
          {activeTab === 'filters' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-2">
                  <span>Background Blur</span>
                  <span className="font-mono text-emerald-400">{config.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={config.blur}
                  onChange={(e) => onChangeConfig({ ...config, blur: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                  aria-label="Adjust background blur"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-2">
                  <span>Brightness / Dim</span>
                  <span className="font-mono text-emerald-400">{Math.round(config.brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.05"
                  value={config.brightness}
                  onChange={(e) => onChangeConfig({ ...config, brightness: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                  aria-label="Adjust background brightness"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-2">
                  <span>Contrast</span>
                  <span className="font-mono text-emerald-400">{Math.round(config.contrast * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={config.contrast}
                  onChange={(e) => onChangeConfig({ ...config, contrast: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                  aria-label="Adjust background contrast"
                />
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Image Adjustments to Default
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Active: {config.name}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
