import React from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  PlusCircle,
  Trophy,
  Lock,
  Download,
} from 'lucide-react';

export interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  tip?: string;
}

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
}

const STEPS: TutorialStep[] = [
  {
    title: '1. Zadejte své předměty a paralelky',
    description:
      'Začněte tlačítkem „+ Přidat předmět ručně“. Zadáte kód předmětu (např. BPC-MA1) a jednoduše naklikáte všechny volitelné paralelky cvičení a přednášek, které vám škola nabízí.',
    icon: <PlusCircle className="w-6 h-6 text-indigo-400" />,
    badge: 'Krok 1 ze 4 • Vstup dat',
    tip: 'Nemusíte hodiny skládat ručně – zadejte všechny možnosti a algoritmus udělá těžkou práci za vás.',
  },
  {
    title: '2. Procházejte bezkolizní varianty',
    description:
      'V levém panelu algoritmus okamžitě spočítá a seřadí všechny kombinace bez časových kolizí podle vašeho skóre. Mezi variantami můžete bleskově listovat šipkami na klávesnici (← / →)!',
    icon: <Trophy className="w-6 h-6 text-amber-400" />,
    badge: 'Krok 2 ze 4 • Výběr rozvrhu',
    tip: 'Každá varianta má přehledné odznaky: volný pátek, počet hodin i délku mezer.',
  },
  {
    title: '3. Uzamkněte si oblíbenou hodinu (Pinning)',
    description:
      'Líbí se vám konkrétní cvičení nebo skvělý vyučující? Klikněte v kalendáři na ikonu zámku 🔒. Hodina se uzamkne a všechny ostatní varianty se bleskově přefiltrují pouze na ty, které tuto hodinu obsahují!',
    icon: <Lock className="w-6 h-6 text-emerald-400" />,
    badge: 'Krok 3 ze 4 • Interaktivní zámky',
    tip: 'Zámků můžete mít libovolný počet. Kdykoli je můžete zase odemknout.',
  },
  {
    title: '4. Export do kalendáře & Automatické ukládání',
    description:
      'Jakmile máte vybráno, jedním kliknutím stáhnete soubor „Export .ICS“ přímo do Google Kalendáře nebo Apple Kalendáře. Veškerý stav se navíc neustále ukládá v paměti vašeho prohlížeče.',
    icon: <Download className="w-6 h-6 text-indigo-400" />,
    badge: 'Krok 4 ze 4 • Hotovo',
    tip: 'Svou rozdělanou práci si můžete kdykoli zálohovat i do formátu .JSON v sekci Koncepty.',
  },
];

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  isOpen,
  onClose,
  onFinish,
  currentStep,
  onStepChange,
}) => {
  if (!isOpen) return null;

  const step = STEPS[currentStep] || STEPS[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
        {/* Header with progress */}
        <div className="px-6 pt-5 pb-3 bg-slate-850 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {step.badge}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Přeskočit tutoriál"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700/80 shrink-0 shadow-md">
              {step.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                {step.title}
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs">
                {step.description}
              </p>
            </div>
          </div>

          {step.tip && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-[11px] leading-relaxed">
              <strong className="text-indigo-300 font-semibold">💡 Tip:</strong> {step.tip}
            </div>
          )}

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onStepChange(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-indigo-500'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Přejít na krok ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-medium"
          >
            Přeskočit průvodce
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Zpět</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>{isLast ? 'Rozumím, začít tvořit!' : 'Další krok'}</span>
              {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
