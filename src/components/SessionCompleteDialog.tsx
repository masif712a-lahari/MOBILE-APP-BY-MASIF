import React, { useState } from 'react';
import { Award, Check, RotateCcw, Plus, Cloud, X } from 'lucide-react';
import { formatDurationText } from '../utils/exportCsv';

interface SessionCompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
  category: string;
  durationSeconds: number;
  onSaveNotes: (notes: string) => void;
  onRestartTimer: () => void;
  ringColor: string;
}

export const SessionCompleteDialog: React.FC<SessionCompleteDialogProps> = ({
  isOpen,
  onClose,
  sessionTitle,
  category,
  durationSeconds,
  onSaveNotes,
  onRestartTimer,
  ringColor
}) => {
  const [reflection, setReflection] = useState('');

  if (!isOpen) return null;

  const handleFinish = () => {
    onSaveNotes(reflection.trim());
    onClose();
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-complete-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background */}
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: `${ringColor}33`, filter: 'blur(40px)' }}
          aria-hidden="true"
        />

        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Trophy Icon */}
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
          style={{ backgroundColor: `${ringColor}22`, border: `2px solid ${ringColor}` }}
        >
          <Award className="w-8 h-8" style={{ color: ringColor }} />
        </div>

        <h3 id="session-complete-title" className="text-xl font-bold mb-1">
          Timer Complete! 🎉
        </h3>
        <p className="text-xs text-zinc-400 mb-3">
          Completed <span className="text-white font-medium">{sessionTitle}</span> ({formatDurationText(durationSeconds)})
        </p>

        {/* Cloud Sync Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-xl py-1 px-3 mb-4">
          <Cloud className="w-3.5 h-3.5" />
          <span>Session saved to history & cloud vault</span>
        </div>

        {/* Reflection Note Input */}
        <div className="text-left mb-4">
          <label htmlFor="reflection-notes-input" className="block text-xs text-zinc-300 mb-1">
            Reflection / Accomplishment (Optional)
          </label>
          <textarea
            id="reflection-notes-input"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What did you get done or how was your session?"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-emerald-400 resize-none h-16"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleFinish}
            className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
            style={{ backgroundColor: ringColor, color: '#000000' }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save & Done</span>
          </button>

          <button
            onClick={() => {
              handleFinish();
              onRestartTimer();
            }}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Another Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
