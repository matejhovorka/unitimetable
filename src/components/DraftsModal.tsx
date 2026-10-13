import React, { useState, useRef } from 'react';
import type { LessonSlot, SavedDraft, UserPreferences, SchedulePlan } from '../types/types';
import {
  X,
  Bookmark,
  Download,
  Upload,
  Trash2,
  Check,
  RotateCcw,
  Clock,
  ShieldCheck,
} from 'lucide-react';


interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRawSlots: LessonSlot[];
  currentPinnedIds: string[];
  currentPreferences: UserPreferences;
  currentSelectedPlanId: string | null;
  currentActivePlan: SchedulePlan | null;
  savedDrafts: SavedDraft[];
  onSaveNewDraft: (draftName: string) => void;
  onLoadDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  onImportDraftFromFile: (draft: SavedDraft) => void;
}

export const DraftsModal: React.FC<DraftsModalProps> = ({
  isOpen,
  onClose,
  currentRawSlots,
  currentPinnedIds,
  currentPreferences,
  currentSelectedPlanId,
  currentActivePlan,
  savedDrafts,
  onSaveNewDraft,
  onLoadDraft,
  onDeleteDraft,
  onImportDraftFromFile,
}) => {
  const [draftNameInput, setDraftNameInput] = useState('');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Stažení aktuální rozpracované varianty jako .json soubor
  const handleExportCurrentStateJson = () => {
    const draftData: SavedDraft = {
      id: 'draft_' + Date.now().toString(36),
      name: draftNameInput.trim() || `Rozpracovaná varianta (${currentActivePlan?.id || 'Aktivní'})`,
      savedAt: new Date().toISOString(),
      rawSlots: currentRawSlots,
      pinnedSlotIds: currentPinnedIds,
      preferences: currentPreferences,
      selectedPlanId: currentSelectedPlanId,
      activeSlots: currentActivePlan ? currentActivePlan.slots : [],
      score: currentActivePlan ? currentActivePlan.score : 0,
    };

    const blob = new Blob([JSON.stringify(draftData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (draftNameInput || 'rozdelany-rozvrh')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '-');
    a.download = `${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToBrowser = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = draftNameInput.trim() || `Koncept #${savedDrafts.length + 1} (${new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })})`;
    onSaveNewDraft(finalName);
    setDraftNameInput('');
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  // Nahrání .json souboru s rozpracovanou variantou
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.rawSlots || Array.isArray(parsed))) {
          const draft: SavedDraft = {
            id: parsed.id || 'draft_' + Date.now().toString(36),
            name: parsed.name || file.name.replace('.json', ''),
            savedAt: parsed.savedAt || new Date().toISOString(),
            rawSlots: Array.isArray(parsed) ? parsed : (parsed.rawSlots || []),
            pinnedSlotIds: parsed.pinnedSlotIds || [],
            preferences: parsed.preferences || currentPreferences,
            selectedPlanId: parsed.selectedPlanId || null,
            activeSlots: parsed.activeSlots || [],
            score: parsed.score || 0,
          };
          onImportDraftFromFile(draft);
          onClose();
        } else {
          alert('Soubor neobsahuje platná data rozvrhu.');
        }
      } catch (err) {
        alert('Chyba při čtení JSON souboru: ' + (err instanceof Error ? err.message : ''));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Rozpracované varianty a zálohování</h2>
              <p className="text-xs text-slate-400">
                Uložte si rozdělaný rozvrh, stáhněte soubor, nebo načtěte dřívější koncept
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* 1. Auto-save notice banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-emerald-300">
                Automatické ukládání je aktivní
              </p>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed mt-0.5">
                Všechny vaše předměty, nastavení, zamknuté hodiny i právě zvolená varianta se <strong>průběžně ukládají do paměti prohlížeče</strong>. Když okno zavřete nebo restartujete počítač, najdete vše přesně tak, jak jste to opustili.
              </p>
            </div>
          </div>

          {/* 2. Export / Save Current In-Progress Variant */}
          <div className="p-4 rounded-xl bg-slate-850/70 border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Uložit nebo exportovat aktuální rozdělanou variantu</span>
              {currentActivePlan && (
                <span className="text-indigo-300 font-mono text-[10px]">
                  Skóre: {currentActivePlan.score} b • {currentActivePlan.slots.length} hodin
                </span>
              )}
            </h3>

            <form onSubmit={handleSaveToBrowser} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Pojmenování této varianty (volitelné):
                </label>
                <input
                  type="text"
                  placeholder="např. Plán A – volný pátek, cvičení odpoledne"
                  value={draftNameInput}
                  onChange={(e) => setDraftNameInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  {isSavedFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Uloženo do konceptů!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Uložit do konceptů prohlížeče</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportCurrentStateJson}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:scale-[1.02]"
                  title="Stáhnout tuto rozdělanou variantu jako .json soubor na disk"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stáhnout soubor .JSON na disk</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all"
                  title="Načíst uloženou rozpracovanou variantu ze souboru .json"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nahrát variantu ze souboru</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. List of Saved Drafts */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Uložené koncepty v prohlížeči ({savedDrafts.length})</span>
            </h3>

            {savedDrafts.length === 0 ? (
              <div className="p-4 text-center rounded-xl border border-dashed border-slate-800 bg-slate-850/30 text-slate-400">
                <Bookmark className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                <p>Zatím nemáte žádné pojmenované koncepty.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Můžete si uložit aktuální stav nahoře, abyste se k němu mohli kdykoli vrátit.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto p-0.5">
                {savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs truncate">
                          {draft.name}
                        </span>
                        {draft.score > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {draft.score} b
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {new Date(draft.savedAt).toLocaleDateString('cs-CZ')} v{' '}
                            {new Date(draft.savedAt).toLocaleTimeString('cs-CZ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          {draft.rawSlots?.length || 0} paralelek
                        </span>
                        {draft.pinnedSlotIds && draft.pinnedSlotIds.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400">
                              🔒 {draft.pinnedSlotIds.length} zámků
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadDraft(draft);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition-colors"
                        title="Aktivovat tento koncept"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Aktivovat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Smazat koncept"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-850">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Stav je 100% zabezpečen a uchován pro další návštěvu</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
