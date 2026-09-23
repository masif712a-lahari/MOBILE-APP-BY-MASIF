import React, { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';

interface RenameSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentCategory: string;
  onSave: (title: string, category: string) => void;
}

const CATEGORIES = ['Focus', 'Productivity', 'Mindfulness', 'Study', 'Workout', 'Cooking', 'Reading', 'Coding'];

export const RenameSessionModal: React.FC<RenameSessionModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  currentCategory,
  onSave
}) => {
  const [title, setTitle] = useState(currentTitle);
  const [category, setCategory] = useState(currentCategory);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim(), category);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h3 id="rename-modal-title" className="text-base font-bold">
              Timer Session Name
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="session-name-input" className="block text-xs text-zinc-400 mb-1">
              Session Title
            </label>
            <input
              id="session-name-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Work Focus"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">Category Tag</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-emerald-500 text-black font-semibold'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
