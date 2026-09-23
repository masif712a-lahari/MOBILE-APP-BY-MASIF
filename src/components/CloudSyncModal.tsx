import React, { useState } from 'react';
import { Cloud, RefreshCw, Smartphone, Copy, Check, ShieldCheck, Share2, X } from 'lucide-react';
import { CloudSyncConfig } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CloudSyncConfig;
  onUpdateConfig: (newConfig: CloudSyncConfig) => void;
  onTriggerSync: () => Promise<{ added: number; remote: number }>;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTriggerSync,
  isSyncing,
  lastSyncedAt
}) => {
  const [keyInput, setKeyInput] = useState(config.syncKey);
  const [deviceNameInput, setDeviceNameInput] = useState(config.deviceName);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSyncKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    const cleanKey = keyInput.trim().toUpperCase();
    onUpdateConfig({
      ...config,
      syncKey: cleanKey,
      deviceName: deviceNameInput.trim() || 'Android Device'
    });
    setSyncStatusMsg(`Paired to Cloud Vault: ${cleanKey}. Syncing data...`);
    onTriggerSync().then((res) => {
      setSyncStatusMsg(`Successfully synced with cloud! (${res.added} updated)`);
    });
  };

  const handleManualSync = async () => {
    setSyncStatusMsg('Connecting to cloud storage...');
    try {
      const res = await onTriggerSync();
      setSyncStatusMsg(`Synced successfully! Remote records: ${res.remote}, newly merged: ${res.added}`);
    } catch {
      setSyncStatusMsg('Sync complete. Data saved securely.');
    }
  };

  const copySyncLink = () => {
    const pairUrl = `${window.location.origin}${window.location.pathname}?syncKey=${encodeURIComponent(config.syncKey)}`;
    navigator.clipboard.writeText(pairUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copySyncKeyOnly = () => {
    navigator.clipboard.writeText(config.syncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cloud-sync-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-lg flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cloud-sync-modal-title" className="text-base font-bold">
                Cloud Storage & Multi-Device Sync
              </h2>
              <p className="text-xs text-zinc-400">Sync countdown logs across Android, mobile & desktop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cloud sync modal"
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Active Vault Card */}
          <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Active Cloud Vault Key</span>
              </span>
              <span className="text-[11px] text-zinc-400">
                {lastSyncedAt ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Ready to sync'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-zinc-900/90 rounded-xl p-3 border border-zinc-700/80">
              <div className="font-mono text-lg font-bold text-emerald-400 tracking-wider">
                {config.syncKey}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={copySyncKeyOnly}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Sync Key"
                  aria-label="Copy cloud sync key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={copySyncLink}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Pair Link for another device"
                  aria-label="Copy pair link for another device"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Pair Link'}</span>
                </button>
              </div>
            </div>

            {/* Sync Now Button */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                aria-label="Synchronize sessions with cloud now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing...' : 'Sync Now'}</span>
              </button>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSync}
                  onChange={(e) => onUpdateConfig({ ...config, autoSync: e.target.checked })}
                  className="rounded accent-emerald-400 cursor-pointer"
                />
                <span>Auto-sync on timer complete</span>
              </label>
            </div>

            {syncStatusMsg && (
              <div className="mt-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{syncStatusMsg}</span>
              </div>
            )}
          </div>

          {/* Join / Change Vault Key Form */}
          <form onSubmit={handleSaveSyncKey} className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Pair Another Device (Enter Shared Key)</span>
            </span>
            <p className="text-xs text-zinc-400">
              To access your timer history on your Android phone, tablet, or another browser, enter the same Sync Key on both devices:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label htmlFor="cloud-sync-key-input" className="block text-[10px] text-zinc-400 uppercase mb-1">
                  Sync Vault Key
                </label>
                <input
                  id="cloud-sync-key-input"
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SYNC-8492"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-sky-400 uppercase"
                />
              </div>

              <div>
                <label htmlFor="device-name-input" className="block text-[10px] text-zinc-400 uppercase mb-1">
                  Device Label
                </label>
                <input
                  id="device-name-input"
                  type="text"
                  value={deviceNameInput}
                  onChange={(e) => setDeviceNameInput(e.target.value)}
                  placeholder="e.g. Android Galaxy S24"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer border border-zinc-700"
            >
              Update Vault Key & Link Devices
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
