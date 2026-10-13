import React, { useState, useEffect } from 'react';
import type { LessonSlot, DayOfWeek, LessonType, WeekParity } from '../types/types';
import { X, Save, Plus } from 'lucide-react';
import { timeToMinutes } from '../utils/scheduleParser';
import { getCourseTheme } from '../utils/colors';

interface SlotEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: LessonSlot) => void;
  initialSlot: LessonSlot | null;
  defaultDay?: DayOfWeek;
  defaultStartTime?: string;
}

export const SlotEditModal: React.FC<SlotEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSlot,
  defaultDay = 'PO',
  defaultStartTime = '08:00',
}) => {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [type, setType] = useState<LessonType>('exercise');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState('09:30');
  const [parity, setParity] = useState<WeekParity>('all');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');

  useEffect(() => {
    if (initialSlot) {
      setCourseCode(initialSlot.courseCode);
      setCourseName(initialSlot.courseName || '');
      setType(initialSlot.type);
      setDay(initialSlot.day);
      setStartTime(initialSlot.startTime);
      setEndTime(initialSlot.endTime);
      setParity(initialSlot.parity);
      setRoom(initialSlot.room || '');
      setTeacher(initialSlot.teacher || '');
    } else {
      setCourseCode('');
      setCourseName('');
      setType('exercise');
      setDay(defaultDay);
      setStartTime(defaultStartTime);
      const [h] = defaultStartTime.split(':').map(Number);
      setEndTime(`${String(Math.min(20, (h || 8) + 1)).padStart(2, '0')}:30`);
      setParity('all');
      setRoom('');
      setTeacher('');
    }
  }, [initialSlot, isOpen, defaultDay, defaultStartTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim()) return;

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      alert('Čas konce musí být později než čas začátku!');
      return;
    }

    const theme = getCourseTheme(courseCode.trim().toUpperCase());

    const savedSlot: LessonSlot = {
      id: initialSlot ? initialSlot.id : 'manual_' + Date.now().toString(36),
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim() || courseCode.trim().toUpperCase(),
      type,
      day,
      startTime,
      endTime,
      startMinutes,
      endMinutes,
      parity,
      room: room.trim() || undefined,
      teacher: teacher.trim() || undefined,
      color: theme.rawHex,
    };

    onSave(savedSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            {initialSlot ? <Save className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-400" />}
            <span>{initialSlot ? 'Upravit hodinu' : 'Přidat novou hodinu'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Course Code & Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Kód předmětu *
              </label>
              <input
                type="text"
                required
                placeholder="např. BPC-MA1"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Typ výuky
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LessonType)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="lecture">Přednáška (P)</option>
                <option value="exercise">Cvičení (C)</option>
                <option value="seminar">Seminář (S)</option>
                <option value="other">Ostatní</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Celý název předmětu (volitelné)
            </label>
            <input
              type="text"
              placeholder="např. Matematická analýza 1"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Day & Parity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Den v týdnu
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="PO">Pondělí</option>
                <option value="UT">Úterý</option>
                <option value="ST">Středa</option>
                <option value="CT">Čtvrtek</option>
                <option value="PA">Pátek</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Týden (Parita)
              </label>
              <select
                value={parity}
                onChange={(e) => setParity(e.target.value as WeekParity)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">Každý týden</option>
                <option value="even">Pouze sudý týden</option>
                <option value="odd">Pouze lichý týden</option>
              </select>
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Začátek
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Konec
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Room & Teacher */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Místnost
              </label>
              <input
                type="text"
                placeholder="např. A112 Aula"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Vyučující
              </label>
              <input
                type="text"
                placeholder="např. prof. Novotný"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Uložit hodinu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
