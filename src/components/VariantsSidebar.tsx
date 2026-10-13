import React from 'react';
import type { SchedulePlan } from '../types/types';
import { Trophy, ChevronLeft, ChevronRight, Clock, Coffee, Sparkles, AlertCircle } from 'lucide-react';

interface VariantsSidebarProps {
  plans: SchedulePlan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onPrevPlan: () => void;
  onNextPlan: () => void;
  isLoading?: boolean;
}

export const VariantsSidebar: React.FC<VariantsSidebarProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  onPrevPlan,
  onNextPlan,
  isLoading = false,
}) => {
  const currentIndex = plans.findIndex((p) => p.id === selectedPlanId);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-800 bg-slate-900/40 backdrop-blur-sm shrink-0 h-full max-h-[calc(100vh-105px)]">
      {/* Header and Fast Stepper */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>Nalezené varianty</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {plans.length}
              </span>
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {plans.length > 0
              ? `Vybrána #${currentIndex + 1} z ${plans.length}`
              : 'Žádné bezkolizní kombinace'}
          </p>
        </div>

        {/* Stepper buttons (prev / next) */}
        {plans.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={onPrevPlan}
              disabled={currentIndex <= 0}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Předchozí varianta (Šipka doleva)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-semibold px-1 text-slate-300 min-w-8 text-center">
              {currentIndex + 1}/{plans.length}
            </span>
            <button
              onClick={onNextPlan}
              disabled={currentIndex >= plans.length - 1}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Následující varianta (Šipka doprava)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* List of Plans */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoading && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Optimalizuji rozvrhy...</span>
          </div>
        )}

        {!isLoading && plans.length === 0 && (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400 text-xs">
            <AlertCircle className="w-8 h-8 text-amber-500/80 mx-auto mb-2" />
            <p className="font-semibold text-slate-300 mb-1">Nenalezena žádná kombinace</p>
            <p className="text-slate-400 leading-relaxed mb-3">
              Zadané paralelky mají nevyřešitelnou kolizi, nebo jsou zámky příliš omezující.
            </p>
            <p className="text-[11px] text-slate-500">
              Tip: Zkuste odemknout některé sloty nebo přidat více termínů cvičení.
            </p>
          </div>
        )}

        {!isLoading &&
          plans.map((plan, index) => {
            const isSelected = plan.id === selectedPlanId;
            const isTopScorer = index === 0;

            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`relative p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                {/* Top line: Variant Title & Score */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-indigo-200' : 'text-slate-200'
                      }`}
                    >
                      Varianta #{index + 1}
                    </span>
                    {isTopScorer && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Trophy className="w-2.5 h-2.5" />
                        <span>Nejlepší</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {plan.score} b
                    </span>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {plan.freeDays.map((fd) => (
                    <span
                      key={fd}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    >
                      Volný {fd === 'PO' ? 'pondělí' : fd === 'UT' ? 'úterý' : fd === 'ST' ? 'středa' : fd === 'CT' ? 'čtvrtek' : 'pátek'}
                    </span>
                  ))}

                  {plan.totalGapMinutes === 0 ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Bez oken!</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1">
                      <Coffee className="w-2.5 h-2.5 text-slate-400" />
                      <span>{formatMinutes(plan.totalGapMinutes)} oken</span>
                    </span>
                  )}

                  {plan.earlyStartsCount === 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      Bez ranních
                    </span>
                  )}
                </div>

                {/* Sub-info: slots count & total duration */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{plan.slots.length} hodin týdně</span>
                  </span>
                  <span>{formatMinutes(plan.totalStudyMinutes)} výuky</span>
                </div>
              </div>
            );
          })}
      </div>
    </aside>
  );
};
