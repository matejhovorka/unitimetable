import { Download, Sparkles, Trash2, Plus, FileCode, Bookmark, HelpCircle, ShieldCheck } from 'lucide-react';
import type { SchedulePlan } from '../types/types';
import { downloadIcsFile } from '../utils/exportIcs';
import confetti from 'canvas-confetti';

interface HeaderProps {
  activePlan: SchedulePlan | null;
  totalPlansCount: number;
  totalRawSlotsCount: number;
  uniqueCoursesCount: number;
  savedDraftsCount: number;
  onOpenManualAdd: () => void;
  onOpenImport: () => void;
  onOpenDrafts: () => void;
  onOpenTutorial: () => void;
  onOpenLegal: () => void;
  onLoadSampleData: () => void;
  onClearAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePlan,
  totalPlansCount,
  totalRawSlotsCount,
  uniqueCoursesCount,
  savedDraftsCount,
  onOpenManualAdd,
  onOpenImport,
  onOpenDrafts,
  onOpenTutorial,
  onOpenLegal,
  onLoadSampleData,
  onClearAll,
}) => {
  const handleExportIcs = () => {
    if (!activePlan) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.2 },
    });
    downloadIcsFile(activePlan, `rozvrh-${activePlan.id}.ics`);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 shadow-sm">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Logo & Info */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="UniTimetable Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/25 border border-indigo-500/30 ring-1 ring-white/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                UniTimetable <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Optimizer</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
              <span>{uniqueCoursesCount} předmětů ({totalRawSlotsCount} termínů)</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{totalPlansCount} bezkolizních variant</span>
              <span>•</span>
              {/* Auto-save indicator */}
              <span className="text-emerald-400/90 font-medium flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Uchováno v paměti</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* HLAVNÍ AKCE: Ruční přidání předmětu & paralelek */}
          <button
            onClick={onOpenManualAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Přidat předmět a jeho cvičení/přednášky ručně"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Přidat předmět ručně</span>
          </button>

          {/* Koncepty & Uložení rozdělané varianty */}
          <button
            onClick={onOpenDrafts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:scale-[1.01]"
            title="Uložit nebo exportovat rozpracovanou variantu"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Koncepty & Export</span>
            {savedDraftsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {savedDraftsCount}
              </span>
            )}
          </button>

          {/* JSON & Záloha */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all hover:scale-[1.01]"
            title="Vložit rozvrh přes JSON nebo textovou tabulku"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>JSON & Import</span>
          </button>

          {/* Průvodce / Tutoriál */}
          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all hover:scale-[1.01]"
            title="Spustit průchozí tutoriál funkcí rozvrháře"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Průvodce</span>
          </button>

          {/* Právní informace & GDPR */}
          <button
            onClick={onOpenLegal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all hover:scale-[1.01]"
            title="Právní informace, ochrana soukromí (GDPR) a vyloučení odpovědnosti"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Soukromí</span>
          </button>

          {/* Ukázková data */}
          <button
            onClick={onLoadSampleData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all"
            title="Načíst ukázková univerzitní data s paralelkami"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Ukázková data</span>
          </button>

          {/* Export do .ICS */}
          {activePlan && (
            <button
              onClick={handleExportIcs}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Exportovat vybraný rozvrh do iCal (.ics) souboru"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .ICS</span>
            </button>
          )}

          {/* Vyčistit */}
          {totalRawSlotsCount > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-colors"
              title="Smazat všechna data a začít znovu"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vyčistit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
