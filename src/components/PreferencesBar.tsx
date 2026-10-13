import React from 'react';
import type { UserPreferences, WeekParity } from '../types/types';
import { Sun, CalendarDays, Lock, Unlock, Zap, SlidersHorizontal } from 'lucide-react';

interface PreferencesBarProps {
  preferences: UserPreferences;
  onPreferencesChange: (newPrefs: UserPreferences) => void;
  viewParity: WeekParity;
  onViewParityChange: (parity: WeekParity) => void;
  pinnedCount: number;
  onClearPinned: () => void;
  onOpenWizard: () => void;
}

export const PreferencesBar: React.FC<PreferencesBarProps> = ({
  preferences,
  onPreferencesChange,
  viewParity,
  onViewParityChange,
  pinnedCount,
  onClearPinned,
  onOpenWizard,
}) => {
  const toggle = (key: keyof Omit<UserPreferences, 'minimizeGapsWeight'>) => {
    onPreferencesChange({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleGapWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPreferencesChange({
      ...preferences,
      minimizeGapsWeight: parseInt(e.target.value, 10),
    });
  };

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 lg:px-8 py-2.5 text-xs text-slate-300">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Preference Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Průvodce preferencemi button */}
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-semibold transition-all hover:scale-[1.02] mr-1"
            title="Otevřít interaktivního průvodce preferencemi"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Průvodce</span>
          </button>

          {/* Volný pátek */}
          <button
            onClick={() => toggle('preferFreeFriday')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              preferences.preferFreeFriday
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-medium shadow-sm shadow-indigo-500/10'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${preferences.preferFreeFriday ? 'bg-indigo-400' : 'bg-slate-600'}`} />
            <span>Volný pátek</span>
            {preferences.preferFreeFriday && <span className="text-[10px] text-indigo-400">🎉</span>}
          </button>

          {/* Volné pondělí */}
          <button
            onClick={() => toggle('preferFreeMonday')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              preferences.preferFreeMonday
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-medium shadow-sm shadow-indigo-500/10'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${preferences.preferFreeMonday ? 'bg-indigo-400' : 'bg-slate-600'}`} />
            <span>Volné pondělí</span>
            {preferences.preferFreeMonday && <span className="text-[10px] text-indigo-400">🚀</span>}
          </button>

          {/* Nechci hodiny v 8:00 */}
          <button
            onClick={() => toggle('earlyMorningPenalty')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              preferences.earlyMorningPenalty
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 font-medium shadow-sm shadow-amber-500/10'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${preferences.earlyMorningPenalty ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Žádné vstávání před 9:00</span>
          </button>

          {/* Váha oken Slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Minimalizovat okna:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={preferences.minimizeGapsWeight}
              onChange={handleGapWeightChange}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono text-indigo-300 font-semibold px-1">
              {preferences.minimizeGapsWeight}/5
            </span>
          </div>
        </div>

        {/* Parity & Pinning info */}
        <div className="flex items-center gap-3">
          {/* Parity filter toggle - zobrazeno pokud škola jede na sudé/liché týdny */}
          {preferences.weekMode === 'parity' && (
            <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60 text-xs">
              <span className="text-slate-400 px-2 py-1 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Zobrazit:</span>
              </span>
              <button
                onClick={() => onViewParityChange('all')}
                className={`px-2 py-1 rounded-md transition-all ${
                  viewParity === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Vše
              </button>
              <button
                onClick={() => onViewParityChange('even')}
                className={`px-2 py-1 rounded-md transition-all ${
                  viewParity === 'even' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sudý
              </button>
              <button
                onClick={() => onViewParityChange('odd')}
                className={`px-2 py-1 rounded-md transition-all ${
                  viewParity === 'odd' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lichý
              </button>
            </div>
          )}


          {/* Pinned counter & clear button */}
          {pinnedCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">{pinnedCount} zamknuto</span>
              <button
                onClick={onClearPinned}
                className="ml-1 text-slate-400 hover:text-amber-200 transition-colors p-0.5"
                title="Odemknout všechny zamknuté hodiny"
              >
                <Unlock className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
