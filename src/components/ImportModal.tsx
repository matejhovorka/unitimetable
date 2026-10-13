import React, { useState, useEffect, useRef } from 'react';
import type { LessonSlot, CourseGroup } from '../types/types';
import { parseRawInput, groupSlotsByRequirement } from '../utils/scheduleParser';
import {
  X,
  FileCode,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getCourseTheme } from '../utils/colors';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSlots: (slots: LessonSlot[], replaceExisting: boolean) => void;
  currentSlots: LessonSlot[];
}

const SAMPLE_RAW_TSV = `BPC-MA1\tMatematická analýza 1\tPřednáška\tPO\t10:00 - 12:50\tvše\tA112 Aula\tprof. Novotný
BPC-MA1\tMatematická analýza 1\tCvičení\tÚT\t08:00 - 09:50\tvše\tB204\tMgr. Králová
BPC-MA1\tMatematická analýza 1\tCvičení\tST\t10:00 - 11:50\tvše\tB205\tMgr. Králová
BPC-MA1\tMatematická analýza 1\tCvičení\tČT\t13:00 - 14:50\tvše\tB204\tRNDr. Dvořák
BPC-PRG\tProgramování v C++\tPřednáška\tÚT\t10:00 - 11:50\tvše\tE112 Posluchárna\tdoc. Vávra
BPC-PRG\tProgramování v C++\tCvičení\tPO\t14:00 - 16:50\tvše\tL302\tIng. Svoboda
BPC-PRG\tProgramování v C++\tCvičení\tČT\t10:00 - 12:50\tvše\tL302\tIng. Černý
BPC-ALG\tAlgoritmy a datové struktury\tPřednáška\tST\t08:00 - 09:50\tvše\tA112 Aula\tprof. Malý
BPC-ALG\tAlgoritmy a datové struktury\tCvičení\tÚT\t13:00 - 14:50\tvše\tL201\tIng. Horák
BPC-ALG\tAlgoritmy a datové struktury\tCvičení\tČT\t08:00 - 09:50\tvše\tL201\tIng. Horák
BPC-SOS\tOperační systémy\tPřednáška\tČT\t15:00 - 16:50\tvše\tE112\tdoc. Kučera
BPC-SOS\tOperační systémy\tCvičení\tST\t10:00 - 11:50\tvše\tC302 Linux Lab\tIng. Veselý
BPC-SOS\tOperační systémy\tCvičení\tPÁ\t08:00 - 09:50\tvše\tC302 Linux Lab\tIng. Veselý`;

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSlots,
  currentSlots,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'tsv'>('json');
  const [jsonText, setJsonText] = useState('');
  const [tsvText, setTsvText] = useState('');
  const [parsedSlots, setParsedSlots] = useState<LessonSlot[]>([]);
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsování při změně textu v aktivním tabu
  useEffect(() => {
    setErrorMsg(null);
    if (activeTab === 'json') {
      if (!jsonText.trim()) {
        setParsedSlots([]);
        setGroups([]);
        return;
      }
      try {
        const parsed = JSON.parse(jsonText);
        const slotsArray = Array.isArray(parsed) ? parsed : parsed.slots;
        if (!Array.isArray(slotsArray)) {
          throw new Error('JSON musí obsahovat pole slotů.');
        }

        // Validace slotů
        const validSlots: LessonSlot[] = slotsArray.map((s, idx) => ({
          id: s.id || `slot_imported_${idx}_${Date.now().toString(36)}`,
          courseCode: (s.courseCode || 'PREDMET').toUpperCase(),
          courseName: s.courseName || s.courseCode,
          type: s.type || 'exercise',
          day: s.day || 'PO',
          startTime: s.startTime || '08:00',
          endTime: s.endTime || '09:30',
          startMinutes: typeof s.startMinutes === 'number' ? s.startMinutes : 480,
          endMinutes: typeof s.endMinutes === 'number' ? s.endMinutes : 570,
          parity: s.parity || 'all',
          room: s.room,
          teacher: s.teacher,
          color: s.color || getCourseTheme(s.courseCode || '').rawHex,
        }));

        setParsedSlots(validSlots);
        setGroups(groupSlotsByRequirement(validSlots));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Neplatný JSON formát';
        setErrorMsg(`Chyba formátu JSON: ${msg}`);
        setParsedSlots([]);
        setGroups([]);
      }
    } else {
      // TSV / Text tab
      if (tsvText.trim()) {
        const slots = parseRawInput('', tsvText);
        setParsedSlots(slots);
        setGroups(groupSlotsByRequirement(slots));
      } else {
        setParsedSlots([]);
        setGroups([]);
      }
    }
  }, [activeTab, jsonText, tsvText]);

  // Globální zachycení Ctrl+V
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalPaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const plain = clipboardData.getData('text/plain');
      const html = clipboardData.getData('text/html');

      if (plain) {
        // Zkusíme, zda to náhodou není JSON
        if (plain.trim().startsWith('[') || plain.trim().startsWith('{')) {
          setActiveTab('json');
          setJsonText(plain);
        } else if (html || plain.includes('\t') || plain.includes(';')) {
          setActiveTab('tsv');
          setTsvText(plain);
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isOpen]);

  if (!isOpen) return null;

  // JSON soubor upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setActiveTab('json');
        setJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  // Stažení zálohy JSON
  const handleDownloadJsonBackup = () => {
    const dataToExport = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      slots: currentSlots,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rozvrh-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Zkopírování JSON aktuálního rozvrhu
  const handleCopyCurrentJson = () => {
    const data = JSON.stringify(currentSlots, null, 2);
    navigator.clipboard.writeText(data);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleConfirmImport = () => {
    if (parsedSlots.length === 0) return;
    onImportSlots(parsedSlots, replaceExisting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import a Export dat</h2>
              <p className="text-xs text-slate-400">
                Uložte si zálohu nebo vložte rozvrh přes JSON či textovou tabulku
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

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Tabs switcher */}
        <div className="flex items-center px-6 pt-4 border-b border-slate-800/80 bg-slate-900/50 gap-2">
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>JSON import & export</span>
          </button>

          <button
            onClick={() => setActiveTab('tsv')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'tsv'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Text / Tabulka ze schránky (TSV)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* TAB 1: JSON */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              {/* Quick JSON actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-200 transition-all hover:scale-[1.01]"
                >
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold">Nahrát .json soubor</span>
                </button>

                <button
                  type="button"
                  disabled={currentSlots.length === 0}
                  onClick={handleDownloadJsonBackup}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-200 disabled:opacity-40 transition-all hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Stáhnout zálohu JSON</span>
                </button>

                <button
                  type="button"
                  disabled={currentSlots.length === 0}
                  onClick={handleCopyCurrentJson}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-200 disabled:opacity-40 transition-all hover:scale-[1.01]"
                >
                  {copiedJson ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-indigo-400" />
                  )}
                  <span className="font-semibold">
                    {copiedJson ? 'Zkopírováno!' : 'Zkopírovat aktuální JSON'}
                  </span>
                </button>
              </div>

              {/* Textarea for JSON paste */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">
                    Vložte JSON kód rozvrhu:
                  </label>
                  {jsonText && (
                    <button
                      onClick={() => setJsonText('')}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Vymazat
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='Vložte JSON (např. [ { "courseCode": "BPC-MA1", "type": "exercise", "day": "UT", "startTime": "08:00", "endTime": "09:50" } ]) nebo přetáhněte .json soubor...'
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: TSV / Text */}
          {activeTab === 'tsv' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">
                  Textová tabulka z IS (řádky oddělené tabulátory):
                </label>
                <button
                  type="button"
                  onClick={() => setTsvText(SAMPLE_RAW_TSV)}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Vložit testovací data</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={tsvText}
                onChange={(e) => setTsvText(e.target.value)}
                placeholder="Zkopírujte tabulku z IS a vložte sem (Kód [tab] Název [tab] Typ [tab] Den [tab] Čas od-do)..."
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview */}
          {parsedSlots.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">
                  Připraveno k importu: {groups.length} předmětových skupin ({parsedSlots.length} termínů/paralelek)
                </span>
              </div>

              {/* Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {groups.map((group) => {
                  const theme = getCourseTheme(group.courseCode);
                  const typeLabel =
                    group.type === 'lecture'
                      ? 'Přednáška'
                      : group.type === 'exercise'
                      ? 'Cvičení'
                      : group.type === 'seminar'
                      ? 'Seminář'
                      : 'Ostatní';

                  return (
                    <div
                      key={group.groupId}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${theme.bg} ${theme.border}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold font-mono">
                          <span className="text-white">{group.courseCode}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${theme.badgeBg}`}>
                            {typeLabel}
                          </span>
                        </div>
                        {group.courseName && (
                          <p className="text-[11px] text-slate-300 truncate mt-0.5">
                            {group.courseName}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-semibold text-slate-200 px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/60">
                          {group.options.length} {group.options.length === 1 ? 'možnost' : group.options.length < 5 ? 'možnosti' : 'možností'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-850">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Nahradit stávající rozvrh (odškrtněte pro sloučení)</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Zrušit
            </button>
            <button
              type="button"
              disabled={parsedSlots.length === 0}
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Importovat {parsedSlots.length} termínů</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
