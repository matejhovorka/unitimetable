import { useState } from 'react';
import type { LessonSlot, DayOfWeek, LessonType, WeekParity, SemesterWeekMode } from '../types/types';
import { X, Plus, Trash2, BookOpen, Clock, Calendar, Check } from 'lucide-react';
import { timeToMinutes } from '../utils/scheduleParser';
import { getCourseTheme } from '../utils/colors';

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSlots: (slots: LessonSlot[]) => void;
  existingCourseCodes?: string[];
  weekMode?: SemesterWeekMode;
}


interface ParallelOption {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  parity: WeekParity;
  room: string;
  teacher: string;
}

const COMMON_TIME_PRESETS = [
  { label: '08:00 – 09:50', start: '08:00', end: '09:50' },
  { label: '10:00 – 11:50', start: '10:00', end: '11:50' },
  { label: '12:00 – 13:50', start: '12:00', end: '13:50' },
  { label: '14:00 – 15:50', start: '14:00', end: '15:50' },
  { label: '16:00 – 17:50', start: '16:00', end: '17:50' },
  { label: '18:00 – 19:50', start: '18:00', end: '19:50' },
];

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  isOpen,
  onClose,
  onAddSlots,
  existingCourseCodes = [],
  weekMode = 'standard',
}) => {
  const [courseCode, setCourseCode] = useState('');

  const [courseName, setCourseName] = useState('');
  const [type, setType] = useState<LessonType>('exercise');

  // Seznam paralelek / termínů
  const [parallels, setParallels] = useState<ParallelOption[]>([
    {
      id: 'p_1',
      day: 'PO',
      startTime: '08:00',
      endTime: '09:50',
      parity: 'all',
      room: '',
      teacher: '',
    },
  ]);

  if (!isOpen) return null;

  const handleAddParallel = () => {
    const nextDays: DayOfWeek[] = ['PO', 'UT', 'ST', 'CT', 'PA'];
    const currentDay = parallels[parallels.length - 1]?.day || 'PO';
    const nextDayIdx = (nextDays.indexOf(currentDay) + 1) % nextDays.length;

    setParallels((prev) => [
      ...prev,
      {
        id: 'p_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        day: nextDays[nextDayIdx],
        startTime: prev[prev.length - 1]?.startTime || '10:00',
        endTime: prev[prev.length - 1]?.endTime || '11:50',
        parity: 'all',
        room: prev[prev.length - 1]?.room || '',
        teacher: prev[prev.length - 1]?.teacher || '',
      },
    ]);
  };

  const handleRemoveParallel = (id: string) => {
    if (parallels.length <= 1) return;
    setParallels((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateParallel = (id: string, updates: Partial<ParallelOption>) => {
    setParallels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = courseCode.trim().toUpperCase();
    if (!cleanCode) {
      alert('Zadejte kód předmětu (např. BPC-MA1)');
      return;
    }

    const theme = getCourseTheme(cleanCode);
    const newSlots: LessonSlot[] = parallels.map((p) => {
      const startMinutes = timeToMinutes(p.startTime);
      const endMinutes = timeToMinutes(p.endTime);

      return {
        id: 'slot_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
        courseCode: cleanCode,
        courseName: courseName.trim() || cleanCode,
        type,
        day: p.day,
        startTime: p.startTime,
        endTime: p.endTime,
        startMinutes,
        endMinutes,
        parity: p.parity,
        room: p.room.trim() || undefined,
        teacher: p.teacher.trim() || undefined,
        color: theme.rawHex,
      };
    });

    onAddSlots(newSlots);
    onClose();

    // Reset formuláře
    setCourseCode('');
    setCourseName('');
    setType('exercise');
    setParallels([
      {
        id: 'p_1',
        day: 'PO',
        startTime: '08:00',
        endTime: '09:50',
        parity: 'all',
        room: '',
        teacher: '',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ruční přidání předmětu a termínů</h2>
              <p className="text-xs text-slate-400">
                Zadejte předmět a jeho volitelné paralelky (solver z nich vybere bezkolizní kombinace)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* 1. Základní info o předmětu */}
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Informace o předmětu</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-slate-400 font-semibold mb-1">
                  Kód předmětu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="např. BPC-MA1"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono font-bold"
                />
                {existingCourseCodes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {existingCourseCodes.slice(0, 4).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCourseCode(c)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 font-mono"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="sm:col-span-1">
                <label className="block text-slate-400 font-semibold mb-1">
                  Typ výuky
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LessonType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="exercise">Cvičení / Laboratoř (C)</option>
                  <option value="lecture">Přednáška (P)</option>
                  <option value="seminar">Seminář (S)</option>
                  <option value="other">Ostatní</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-slate-400 font-semibold mb-1">
                  Celý název (volitelné)
                </label>
                <input
                  type="text"
                  placeholder="např. Matematická analýza"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Seznam paralelek / možností */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Termíny a paralelky ({parallels.length})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {type === 'lecture'
                    ? 'Pro přednášku obvykle stačí 1 pevný termín.'
                    : 'Zadejte všechny paralelky cvičení, které si můžete zapsat. Solver z nich automaticky vybere nejvhodnější.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddParallel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Přidat další paralelku</span>
              </button>
            </div>

            {/* List of parallel rows */}
            <div className="space-y-2.5">
              {parallels.map((parallel, index) => (
                <div
                  key={parallel.id}
                  className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <span>Paralelka #{index + 1}</span>
                    </span>

                    {parallels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParallel(parallel.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                        title="Odstranit tuto paralelku"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className={`grid grid-cols-2 ${weekMode === 'parity' ? 'sm:grid-cols-6' : 'sm:grid-cols-5'} gap-2.5`}>
                    {/* Den */}
                    <div className="col-span-1">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Den
                      </label>
                      <select
                        value={parallel.day}
                        onChange={(e) =>
                          handleUpdateParallel(parallel.id, {
                            day: e.target.value as DayOfWeek,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PO">Pondělí</option>
                        <option value="UT">Úterý</option>
                        <option value="ST">Středa</option>
                        <option value="CT">Čtvrtek</option>
                        <option value="PA">Pátek</option>
                      </select>
                    </div>

                    {/* Čas od */}
                    <div className="col-span-1">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Začátek
                      </label>
                      <input
                        type="time"
                        required
                        value={parallel.startTime}
                        onChange={(e) =>
                          handleUpdateParallel(parallel.id, {
                            startTime: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Čas do */}
                    <div className="col-span-1">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Konec
                      </label>
                      <input
                        type="time"
                        required
                        value={parallel.endTime}
                        onChange={(e) =>
                          handleUpdateParallel(parallel.id, {
                            endTime: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Místnost */}
                    <div className="col-span-1">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Místnost
                      </label>
                      <input
                        type="text"
                        placeholder="např. B204"
                        value={parallel.room}
                        onChange={(e) =>
                          handleUpdateParallel(parallel.id, {
                            room: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Vyučující */}
                    <div className="col-span-1">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Vyučující
                      </label>
                      <input
                        type="text"
                        placeholder="např. Novák"
                        value={parallel.teacher}
                        onChange={(e) =>
                          handleUpdateParallel(parallel.id, {
                            teacher: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Týden (pokud škola střídá sudý a lichý) */}
                    {weekMode === 'parity' && (
                      <div className="col-span-1">
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">
                          Týden
                        </label>
                        <select
                          value={parallel.parity}
                          onChange={(e) =>
                            handleUpdateParallel(parallel.id, {
                              parity: e.target.value as WeekParity,
                            })
                          }
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                        >
                          <option value="all">Každý</option>
                          <option value="even">Sudý</option>
                          <option value="odd">Lichý</option>
                        </select>
                      </div>
                    )}
                  </div>


                  {/* Rychlé předvolby času */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mr-1">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>Rychlý čas:</span>
                    </span>
                    {COMMON_TIME_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          handleUpdateParallel(parallel.id, {
                            startTime: preset.start,
                            endTime: preset.end,
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          parallel.startTime === preset.start && parallel.endTime === preset.end
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-semibold'
                            : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Vloží se celkem <strong className="text-white">{parallels.length}</strong> {parallels.length === 1 ? 'hodina' : parallels.length < 5 ? 'hodiny' : 'hodin'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                <span>Uložit {courseCode ? courseCode.toUpperCase() : 'předmět'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
