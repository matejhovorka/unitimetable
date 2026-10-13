import React from 'react';
import type { LessonSlot } from '../types/types';
import { Lock, Unlock, Edit2, Trash2, MapPin, User } from 'lucide-react';
import { getCourseTheme } from '../utils/colors';

interface SlotCardProps {
  slot: LessonSlot;
  isPinned: boolean;
  onTogglePin: (slotId: string) => void;
  onEdit: (slot: LessonSlot) => void;
  onDelete: (slotId: string) => void;
  style?: React.CSSProperties;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  isPinned,
  onTogglePin,
  onEdit,
  onDelete,
  style,
}) => {
  const theme = getCourseTheme(slot.courseCode);

  const typeLabel =
    slot.type === 'lecture'
      ? 'P'
      : slot.type === 'exercise'
      ? 'C'
      : slot.type === 'seminar'
      ? 'S'
      : 'O';

  const typeFull =
    slot.type === 'lecture'
      ? 'Přednáška'
      : slot.type === 'exercise'
      ? 'Cvičení'
      : slot.type === 'seminar'
      ? 'Seminář'
      : 'Ostatní';

  return (
    <div
      style={style}
      className={`absolute inset-x-1 rounded-xl p-2.5 flex flex-col justify-between border shadow-md transition-all group overflow-hidden ${
        theme.bg
      } ${theme.border} ${isPinned ? 'ring-2 ring-amber-400/90 shadow-amber-500/20' : ''}`}
    >
      {/* Top Header: Code, Type, and Pin Button */}
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-xs tracking-tight text-white truncate font-mono">
              {slot.courseCode}
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${theme.badgeBg}`}
              title={typeFull}
            >
              {typeLabel}
            </span>
            {slot.parity !== 'all' && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800/80 text-slate-300 font-mono border border-slate-700/60">
                {slot.parity === 'even' ? 'Sudý' : 'Lichý'}
              </span>
            )}
          </div>
          {slot.courseName && slot.courseName !== slot.courseCode && (
            <p className="text-[11px] text-slate-200/90 font-medium truncate mt-0.5" title={slot.courseName}>
              {slot.courseName}
            </p>
          )}
        </div>

        {/* Pin toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(slot.id);
          }}
          className={`p-1 rounded-lg transition-all ${
            isPinned
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title={isPinned ? 'Odemknout tuto paralelku' : 'Uzamknout tuto paralelku (vynutit v solveru)'}
        >
          {isPinned ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />}
        </button>
      </div>

      {/* Middle: Details (Time, Room, Teacher) */}
      <div className="my-1 space-y-0.5 text-[10px] text-slate-300/90">
        <div className="font-mono font-semibold text-white/90">
          {slot.startTime} – {slot.endTime}
        </div>
        {slot.room && (
          <div className="flex items-center gap-1 text-slate-300 truncate">
            <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
            <span className="truncate">{slot.room}</span>
          </div>
        )}
        {slot.teacher && (
          <div className="flex items-center gap-1 text-slate-300/80 truncate">
            <User className="w-2.5 h-2.5 shrink-0 text-slate-400" />
            <span className="truncate">{slot.teacher}</span>
          </div>
        )}
      </div>

      {/* Bottom actions (on hover) */}
      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-700/40">
        <span className="text-[9px] text-slate-400 font-mono">
          {Math.round((slot.endMinutes - slot.startMinutes) / 60 * 10) / 10}h
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(slot);
            }}
            className="p-1 rounded hover:bg-slate-700/80 text-slate-300 hover:text-white"
            title="Upravit hodinu"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(slot.id);
            }}
            className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
            title="Smazat tuto hodinu"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
