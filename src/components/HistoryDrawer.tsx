import React, { useState } from 'react';
import { History, Download, Trash2, Cloud, Search, CheckCircle2, Clock, FileSpreadsheet, X, Edit3, Save } from 'lucide-react';
import { TimerSession } from '../types';
import { exportSessionsToCsv, exportSessionsToJson, formatDurationText } from '../utils/exportCsv';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TimerSession[];
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  onUpdateSessionNotes: (id: string, notes: string) => void;
  onOpenCloudSync: () => void;
  cloudSyncKey: string;
  isSynced: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onDeleteSession,
  onClearAllSessions,
  onUpdateSessionNotes,
  onOpenCloudSync,
  cloudSyncKey,
  isSynced
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  if (!isOpen) return null;

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === 'all'
        ? true
        : filterCategory === 'completed'
        ? s.completed
        : s.category.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate summary metrics
  const totalSecondsCompleted = sessions
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.elapsedSeconds, 0);

  const completedCount = sessions.filter((s) => s.completed).length;

  const handleStartEditNote = (session: TimerSession) => {
    setEditingId(session.id);
    setEditNoteText(session.notes || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateSessionNotes(id, editNoteText.trim());
    setEditingId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 id="history-modal-title" className="text-base font-bold">
                Countdown History & Sessions
              </h2>
              <p className="text-xs text-zinc-400">Track focus sessions across paired devices</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cloud Sync Status Button */}
            <button
              onClick={onOpenCloudSync}
              title={`Cloud Storage Key: ${cloudSyncKey}`}
              aria-label={`Open cloud sync modal, key is ${cloudSyncKey}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-emerald-400 border border-zinc-700 transition-colors cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync Key:</span>
              <span className="font-mono">{cloudSyncKey}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close history modal"
              className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Analytics Summary Banner */}
        <div className="px-6 py-3 bg-zinc-800/40 border-b border-zinc-800 grid grid-cols-3 gap-2 text-center select-none">
          <div className="bg-zinc-800/80 p-2.5 rounded-2xl border border-zinc-700/60">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Total Focus</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {formatDurationText(totalSecondsCompleted)}
            </span>
          </div>

          <div className="bg-zinc-800/80 p-2.5 rounded-2xl border border-zinc-700/60">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Completed</span>
            <span className="text-sm font-bold text-white font-mono">
              {completedCount} <span className="text-xs font-normal text-zinc-400">/ {sessions.length}</span>
            </span>
          </div>

          <div className="bg-zinc-800/80 p-2.5 rounded-2xl border border-zinc-700/60">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Cloud Sync</span>
            <span className="text-xs font-semibold text-sky-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isSynced ? 'Live Synced' : 'Ready'}</span>
            </span>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Export CSV Button */}
        <div className="px-6 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search sessions or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-blue-400"
              aria-label="Filter countdown sessions"
            />
          </div>

          {/* Export to CSV Action (Explicit user requirement) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSessionsToCsv(sessions)}
              title="Download RFC-4180 CSV spreadsheet for external analysis"
              aria-label="Export history data to CSV format"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => exportSessionsToJson(sessions)}
              title="Export complete JSON backup"
              aria-label="Export complete JSON backup"
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {sessions.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all session history?')) {
                    onClearAllSessions();
                  }
                }}
                title="Clear all session history"
                aria-label="Clear all session history"
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 scrollbar-thin">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No countdown sessions found</p>
              <p className="text-xs text-zinc-600 mt-1">
                Completed timers and countdown logs will appear here and sync across paired devices.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const date = new Date(session.createdAt);
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-700/70 hover:border-zinc-600 transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{session.title}</span>
                        <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full bg-zinc-700/80 text-zinc-300">
                          {session.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at{' '}
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          session.completed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {session.completed ? '100% Done' : 'Interrupted'}
                      </span>

                      <button
                        onClick={() => onDeleteSession(session.id)}
                        aria-label={`Delete session ${session.title}`}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Duration stats */}
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-300 bg-zinc-900/60 p-2 rounded-xl mb-2">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Target</span>
                      <span>{formatDurationText(session.targetSeconds)}</span>
                    </div>
                    <div className="h-6 w-px bg-zinc-700" />
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Elapsed</span>
                      <span className={session.completed ? 'text-emerald-400 font-bold' : ''}>
                        {formatDurationText(session.elapsedSeconds)}
                      </span>
                    </div>
                    {session.deviceId && (
                      <>
                        <div className="h-6 w-px bg-zinc-700" />
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Device</span>
                          <span className="text-zinc-400 truncate max-w-[100px] block">{session.deviceId}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notes / Reflection Section */}
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        placeholder="Add notes, tasks accomplished, or reflections..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-400 resize-none h-18"
                        aria-label="Edit session notes"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNote(session.id)}
                          className="px-3 py-1 rounded-lg text-xs bg-emerald-500 text-black font-semibold flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-start justify-between gap-2 text-xs text-zinc-400 bg-zinc-900/30 p-2 rounded-xl">
                      <p className="italic flex-1 truncate">
                        {session.notes ? `"${session.notes}"` : 'No reflection notes added.'}
                      </p>
                      <button
                        onClick={() => handleStartEditNote(session)}
                        className="text-zinc-500 hover:text-emerald-400 p-0.5 cursor-pointer"
                        title="Edit note"
                        aria-label="Edit session note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-xs text-zinc-400">
          <span>{filteredSessions.length} sessions logged</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
