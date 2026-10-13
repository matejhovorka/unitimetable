import React from 'react';
import type { DayOfWeek, LessonSlot, WeekParity } from '../types/types';
import { SlotCard } from './SlotCard';
import { Clock } from 'lucide-react';

interface TimetableGridProps {
  slots: LessonSlot[];
  pinnedSlotIds: Set<string>;
  onTogglePin: (slotId: string) => void;
  onEditSlot: (slot: LessonSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onAddSlotAtDayTime?: (day: DayOfWeek, startTime: string) => void;
  viewParity: WeekParity;
}

const DAYS: { key: DayOfWeek; label: string; fullLabel: string }[] = [
  { key: 'PO', label: 'Pondělí', fullLabel: 'Pondělí' },
  { key: 'UT', label: 'Úterý', fullLabel: 'Úterý' },
  { key: 'ST', label: 'Středa', fullLabel: 'Středa' },
  { key: 'CT', label: 'Čtvrtek', fullLabel: 'Čtvrtek' },
  { key: 'PA', label: 'Pátek', fullLabel: 'Pátek' },
];

const START_HOUR = 7;
const END_HOUR = 20;
const START_MINUTES = START_HOUR * 60; // 420 min
const HOUR_HEIGHT = 64; // px za 1 hodinu (60 minut)
const MINUTE_PIXELS = HOUR_HEIGHT / 60; // ~1.0667 px za minutu

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  slots,
  pinnedSlotIds,
  onTogglePin,
  onEditSlot,
  onDeleteSlot,
  onAddSlotAtDayTime,
  viewParity,
}) => {
  // Filtrování slotů podle vybrané parity
  const visibleSlots = slots.filter((slot) => {
    if (viewParity === 'all') return true;
    if (slot.parity === 'all') return true;
    return slot.parity === viewParity;
  });

  // Generování hodinových značek (7:00, 8:00, ..., 20:00)
  const hours: number[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    hours.push(h);
  }

  const handleCellClick = (day: DayOfWeek, hour: number) => {
    if (onAddSlotAtDayTime) {
      const timeStr = `${String(hour).padStart(2, '0')}:00`;
      onAddSlotAtDayTime(day, timeStr);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto bg-slate-950 p-4 lg:p-6 select-none min-h-[600px]">
      <div className="min-w-[850px] max-w-[1500px] mx-auto bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        {/* Header: Days of the week */}
        <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
          <div className="p-3 text-center text-xs font-semibold text-slate-400 border-r border-slate-800/80 flex items-center justify-center">
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          {DAYS.map((day) => {
            const daySlots = visibleSlots.filter((s) => s.day === day.key);
            const isFreeDay = daySlots.length === 0;

            return (
              <div
                key={day.key}
                className="p-3 text-center border-r border-slate-800/80 last:border-r-0"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-bold text-sm text-slate-200">{day.label}</span>
                  {isFreeDay ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Volno 🎉
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {daySlots.length} {daySlots.length === 1 ? 'hod' : daySlots.length < 5 ? 'hod' : 'hod'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timetable Body: Time axis on the left + 5 Day columns */}
        <div
          className="relative grid grid-cols-[70px_repeat(5,1fr)]"
          style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
        >
          {/* Time axis labels */}
          <div className="relative border-r border-slate-800/80 bg-slate-900/30">
            {hours.slice(0, -1).map((h, i) => (
              <div
                key={h}
                className="absolute inset-x-0 border-b border-slate-800/50 flex items-start justify-center pt-1"
                style={{
                  top: `${i * HOUR_HEIGHT}px`,
                  height: `${HOUR_HEIGHT}px`,
                }}
              >
                <span className="text-[11px] font-mono text-slate-400 font-medium">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* 5 Day Columns */}
          {DAYS.map((day) => {
            const daySlots = visibleSlots.filter((s) => s.day === day.key);

            return (
              <div
                key={day.key}
                className="relative border-r border-slate-800/60 last:border-r-0 hover:bg-slate-900/20 transition-colors"
              >
                {/* Background hour grid lines */}
                {hours.slice(0, -1).map((h, i) => (
                  <div
                    key={h}
                    onClick={() => handleCellClick(day.key, h)}
                    className="absolute inset-x-0 border-b border-slate-800/40 hover:bg-indigo-500/[0.03] cursor-pointer transition-colors"
                    style={{
                      top: `${i * HOUR_HEIGHT}px`,
                      height: `${HOUR_HEIGHT}px`,
                    }}
                    title={`Kliknutím přidat hodinu v ${day.label} v ${h}:00`}
                  />
                ))}

                {/* Free day watermark badge */}
                {daySlots.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-widest bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
                      Žádná výuka
                    </span>
                  </div>
                )}

                {/* Render Slot Cards in this day */}
                {daySlots.map((slot) => {
                  const topOffset = (slot.startMinutes - START_MINUTES) * MINUTE_PIXELS;
                  const slotHeight = Math.max(
                    (slot.endMinutes - slot.startMinutes) * MINUTE_PIXELS - 4,
                    36
                  );

                  return (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      isPinned={pinnedSlotIds.has(slot.id)}
                      onTogglePin={onTogglePin}
                      onEdit={onEditSlot}
                      onDelete={onDeleteSlot}
                      style={{
                        top: `${Math.max(0, topOffset)}px`,
                        height: `${slotHeight}px`,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
