import { useEffect, useMemo, useCallback, useState } from 'react';
import type { LessonSlot, UserPreferences, WeekParity, DayOfWeek, SavedDraft } from './types/types';
import { groupSlotsByRequirement } from './utils/scheduleParser';
import { solveSchedule } from './utils/solver';
import { SAMPLE_SLOTS } from './utils/sampleData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { PreferencesBar } from './components/PreferencesBar';
import { VariantsSidebar } from './components/VariantsSidebar';
import { TimetableGrid } from './components/TimetableGrid';
import { ImportModal } from './components/ImportModal';
import { SlotEditModal } from './components/SlotEditModal';
import { ManualAddModal } from './components/ManualAddModal';
import { DraftsModal } from './components/DraftsModal';
import { WelcomeOnboardingModal } from './components/WelcomeOnboardingModal';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';

const DEFAULT_PREFERENCES: UserPreferences = {
  preferFreeFriday: true,
  preferFreeMonday: false,
  earlyMorningPenalty: true,
  minimizeGapsWeight: 3,
  weekMode: 'standard',
};

export function App() {
  // Pro nového návštěvníka začínáme s čistým prázdným rozvrhem
  const [rawSlots, setRawSlots] = useLocalStorage<LessonSlot[]>('unitimetable_raw_slots', []);
  const [pinnedIdsList, setPinnedIdsList] = useLocalStorage<string[]>('unitimetable_pinned_ids', []);
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('unitimetable_prefs', DEFAULT_PREFERENCES);
  const [viewParity, setViewParity] = useLocalStorage<WeekParity>('unitimetable_view_parity', 'all');
  const [selectedPlanId, setSelectedPlanId] = useLocalStorage<string | null>('unitimetable_selected_plan_id', null);
  const [savedDrafts, setSavedDrafts] = useLocalStorage<SavedDraft[]>('unitimetable_saved_drafts', []);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage<boolean>('unitimetable_has_seen_onboarding', false);

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<LessonSlot | null>(null);
  const [defaultSlotDay, setDefaultSlotDay] = useState<DayOfWeek>('PO');
  const [defaultSlotTime, setDefaultSlotTime] = useState<string>('08:00');

  // První návštěva: automaticky otevřít průvodce uvítáním a nastavením
  useEffect(() => {
    if (!hasSeenOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, [hasSeenOnboarding]);

  // Set of pinned slot IDs for O(1) lookup
  const pinnedSlotIds = useMemo(() => new Set(pinnedIdsList), [pinnedIdsList]);

  // Group raw slots by requirement (courseCode + type)
  const courseGroups = useMemo(() => {
    return groupSlotsByRequirement(rawSlots);
  }, [rawSlots]);

  // Solve schedules using CSP solver with memoization
  const plans = useMemo(() => {
    return solveSchedule(courseGroups, pinnedSlotIds, preferences, 100);
  }, [courseGroups, pinnedSlotIds, preferences]);

  // Maintain selected plan
  useEffect(() => {
    if (plans.length > 0) {
      const exists = plans.some((p) => p.id === selectedPlanId);
      if (!exists) {
        setSelectedPlanId(plans[0].id);
      }
    } else {
      setSelectedPlanId(null);
    }
  }, [plans, selectedPlanId, setSelectedPlanId]);

  const activePlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || plans[0] || null;
  }, [plans, selectedPlanId]);

  // Pinning toggle
  const handleTogglePin = useCallback((slotId: string) => {
    setPinnedIdsList((prev) => {
      if (prev.includes(slotId)) {
        return prev.filter((id) => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  }, [setPinnedIdsList]);

  const handleClearPinned = useCallback(() => {
    setPinnedIdsList([]);
  }, [setPinnedIdsList]);

  // Fast navigation between plans
  const handlePrevPlan = useCallback(() => {
    if (plans.length === 0) return;
    const idx = plans.findIndex((p) => p.id === selectedPlanId);
    if (idx > 0) {
      setSelectedPlanId(plans[idx - 1].id);
    }
  }, [plans, selectedPlanId, setSelectedPlanId]);

  const handleNextPlan = useCallback(() => {
    if (plans.length === 0) return;
    const idx = plans.findIndex((p) => p.id === selectedPlanId);
    if (idx < plans.length - 1 && idx !== -1) {
      setSelectedPlanId(plans[idx + 1].id);
    }
  }, [plans, selectedPlanId, setSelectedPlanId]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevPlan();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextPlan();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPlan, handleNextPlan]);

  // Onboarding completion
  const handleFinishOnboarding = (newPrefs: UserPreferences, loadSample: boolean, startTutorial: boolean) => {
    setPreferences(newPrefs);
    setHasSeenOnboarding(true);

    if (loadSample) {
      setRawSlots(SAMPLE_SLOTS);
      setPinnedIdsList([]);
      setSelectedPlanId(null);
    } else {
      setRawSlots([]);
      setPinnedIdsList([]);
      setSelectedPlanId(null);
    }

    if (startTutorial) {
      setTutorialStep(0);
      setIsTutorialOpen(true);
    }
  };

  // Ruční přidání paralelek
  const handleAddMultipleSlots = (newSlots: LessonSlot[]) => {
    setRawSlots((prev) => [...prev, ...newSlots]);
  };

  // Import handler (JSON / TSV)
  const handleImportSlots = (newSlots: LessonSlot[], replaceExisting: boolean) => {
    if (replaceExisting) {
      setRawSlots(newSlots);
      setPinnedIdsList([]);
      setSelectedPlanId(null);
    } else {
      setRawSlots((prev) => [...prev, ...newSlots]);
    }
  };

  // Drafts management
  const handleSaveNewDraft = (draftName: string) => {
    const newDraft: SavedDraft = {
      id: 'draft_' + Date.now().toString(36),
      name: draftName,
      savedAt: new Date().toISOString(),
      rawSlots: [...rawSlots],
      pinnedSlotIds: [...pinnedIdsList],
      preferences: { ...preferences },
      selectedPlanId,
      activeSlots: activePlan ? [...activePlan.slots] : [],
      score: activePlan ? activePlan.score : 0,
    };
    setSavedDrafts((prev) => [newDraft, ...prev]);
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    setRawSlots(draft.rawSlots);
    setPinnedIdsList(draft.pinnedSlotIds);
    setPreferences(draft.preferences);
    if (draft.selectedPlanId) {
      setSelectedPlanId(draft.selectedPlanId);
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const handleImportDraftFromFile = (draft: SavedDraft) => {
    handleLoadDraft(draft);
    setSavedDrafts((prev) => [draft, ...prev.filter((d) => d.id !== draft.id)]);
  };

  // Sample data loader
  const handleLoadSampleData = () => {
    setRawSlots(SAMPLE_SLOTS);
    setPinnedIdsList([]);
    setPreferences(DEFAULT_PREFERENCES);
    setSelectedPlanId(null);
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('Opravdu chcete vymazat všechny předměty a rozvrhy?')) {
      setRawSlots([]);
      setPinnedIdsList([]);
      setSelectedPlanId(null);
    }
  };

  // Edit / Add Slot handlers
  const handleOpenAddSlot = (day: DayOfWeek = 'PO', startTime: string = '08:00') => {
    setEditingSlot(null);
    setDefaultSlotDay(day);
    setDefaultSlotTime(startTime);
    setIsEditModalOpen(true);
  };

  const handleOpenEditSlot = (slot: LessonSlot) => {
    setEditingSlot(slot);
    setIsEditModalOpen(true);
  };

  const handleSaveSlot = (slot: LessonSlot) => {
    setRawSlots((prev) => {
      const idx = prev.findIndex((s) => s.id === slot.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = slot;
        return copy;
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleDeleteSlot = (slotId: string) => {
    setRawSlots((prev) => prev.filter((s) => s.id !== slotId));
    setPinnedIdsList((prev) => prev.filter((id) => id !== slotId));
  };

  // Calculate unique course count & codes
  const uniqueCourseCodes = useMemo(() => {
    return Array.from(new Set(rawSlots.map((s) => s.courseCode)));
  }, [rawSlots]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Header with Primary Manual Add, Drafts, Tutorial & JSON */}
      <Header
        activePlan={activePlan}
        totalPlansCount={plans.length}
        totalRawSlotsCount={rawSlots.length}
        uniqueCoursesCount={uniqueCourseCodes.length}
        savedDraftsCount={savedDrafts.length}
        onOpenManualAdd={() => setIsManualAddModalOpen(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenDrafts={() => setIsDraftsModalOpen(true)}
        onOpenTutorial={() => {
          setTutorialStep(0);
          setIsTutorialOpen(true);
        }}
        onOpenLegal={() => setIsLegalModalOpen(true)}
        onLoadSampleData={handleLoadSampleData}
        onClearAll={handleClearAll}
      />

      {/* 2. Preferences & Controls Bar */}
      <PreferencesBar
        preferences={preferences}
        onPreferencesChange={setPreferences}
        viewParity={viewParity}
        onViewParityChange={setViewParity}
        pinnedCount={pinnedSlotIds.size}
        onClearPinned={handleClearPinned}
        onOpenWizard={() => setIsOnboardingOpen(true)}
      />

      {/* 3. Main Workspace: Variants Sidebar + Timetable Grid */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <VariantsSidebar
          plans={plans}
          selectedPlanId={selectedPlanId}
          onSelectPlan={setSelectedPlanId}
          onPrevPlan={handlePrevPlan}
          onNextPlan={handleNextPlan}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          {activePlan ? (
            <TimetableGrid
              slots={activePlan.slots}
              pinnedSlotIds={pinnedSlotIds}
              onTogglePin={handleTogglePin}
              onEditSlot={handleOpenEditSlot}
              onDeleteSlot={handleDeleteSlot}
              onAddSlotAtDayTime={handleOpenAddSlot}
              viewParity={viewParity}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="max-w-md p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📅</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  Váš rozvrh je zatím prázdný
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Začněte přidáním svého prvního předmětu a jeho paralelek, nebo si vyzkoušejte ukázkový semestr.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    onClick={() => setIsManualAddModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                  >
                    + Přidat první předmět
                  </button>
                  <button
                    onClick={() => {
                      setTutorialStep(0);
                      setIsTutorialOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:scale-[1.02]"
                  >
                    Spustit tutoriál
                  </button>
                  <button
                    onClick={handleLoadSampleData}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all"
                  >
                    Ukázková data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer s právními informacemi a soukromím */}
      <Footer onOpenLegal={() => setIsLegalModalOpen(true)} />

      {/* 4. Modals */}
      {/* 4.1. Welcome & Onboarding Wizard (první vstup) */}
      <WelcomeOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialPreferences={preferences}
        onFinishOnboarding={handleFinishOnboarding}
        isFirstVisit={!hasSeenOnboarding}
      />

      {/* 4.2. Průchozí interaktivní tutoriál */}
      <InteractiveTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onFinish={() => setIsTutorialOpen(false)}
        currentStep={tutorialStep}
        onStepChange={setTutorialStep}
      />

      {/* 4.3. Hlavní: Ruční přidání předmětu a paralelek */}
      <ManualAddModal
        isOpen={isManualAddModalOpen}
        onClose={() => setIsManualAddModalOpen(false)}
        onAddSlots={handleAddMultipleSlots}
        existingCourseCodes={uniqueCourseCodes}
        weekMode={preferences.weekMode}
      />

      {/* 4.4. Rozdělané varianty, koncepty a export na disk */}
      <DraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        currentRawSlots={rawSlots}
        currentPinnedIds={pinnedIdsList}
        currentPreferences={preferences}
        currentSelectedPlanId={selectedPlanId}
        currentActivePlan={activePlan}
        savedDrafts={savedDrafts}
        onSaveNewDraft={handleSaveNewDraft}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onImportDraftFromFile={handleImportDraftFromFile}
      />

      {/* 4.5. Import / Export přes JSON a TSV */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSlots={handleImportSlots}
        currentSlots={rawSlots}
      />

      {/* 4.6. Rychlá úprava / přidání jedné hodiny kliknutím do mřížky */}
      <SlotEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveSlot}
        initialSlot={editingSlot}
        defaultDay={defaultSlotDay}
        defaultStartTime={defaultSlotTime}
      />

      {/* 4.7. Právní informace, ochrana soukromí a vyloučení odpovědnosti */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}

export default App;
