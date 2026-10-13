import React, { useState } from 'react';
import type { UserPreferences, SemesterWeekMode } from '../types/types';
import {
  Calendar,
  Sun,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Smile,
  Layers,
  CalendarCheck,
} from 'lucide-react';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPreferences: UserPreferences;
  onFinishOnboarding: (prefs: UserPreferences, loadSample: boolean, startTutorial: boolean) => void;
  isFirstVisit?: boolean;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  initialPreferences,
  onFinishOnboarding,
  isFirstVisit = true,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [weekMode, setWeekMode] = useState<SemesterWeekMode>(initialPreferences.weekMode || 'standard');
  const [preferFriday, setPreferFriday] = useState(initialPreferences.preferFreeFriday);
  const [preferMonday, setPreferMonday] = useState(initialPreferences.preferFreeMonday);
  const [earlyPenalty, setEarlyPenalty] = useState(initialPreferences.earlyMorningPenalty);
  const [gapWeight, setGapWeight] = useState(initialPreferences.minimizeGapsWeight);

  if (!isOpen) return null;

  const handleComplete = (loadSample: boolean) => {
    onFinishOnboarding(
      {
        weekMode,
        preferFreeFriday: preferFriday,
        preferFreeMonday: preferMonday,
        earlyMorningPenalty: earlyPenalty,
        minimizeGapsWeight: gapWeight,
      },
      loadSample,
      !loadSample // spustit tutoriál, pokud začíná s prázdným rozvrhem
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
        {/* Step Indicator Header */}
        <div className="px-6 pt-5 pb-3 bg-slate-850/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Krok {currentStep + 1} ze 3 • {currentStep === 0 ? 'Vítejte' : currentStep === 1 ? 'Režim týdnů' : 'Vaše preference'}
            </span>
          </div>

          {!isFirstVisit && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              Zavřít
            </button>
          )}
        </div>

        {/* Top Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body: Steps */}
        <div className="p-6 overflow-y-auto max-h-[62vh] space-y-4 text-xs">
          {/* STEP 1: WELCOME */}
          {currentStep === 0 && (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <img
                  src="/logo.png"
                  alt="UniTimetable Logo"
                  className="w-20 h-20 rounded-3xl object-cover shadow-2xl shadow-indigo-500/30 border border-indigo-500/40 p-1 bg-slate-850"
                />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Vítejte v UniTimetable <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Optimizeru</span>
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Chytrý modelář a generátor studentských rozvrhů. Vyřeší nekonečné skládání paralelek na papíře a okamžitě najde všechny bezkolizní kombinace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-left">
                <div className="p-3 rounded-2xl bg-slate-850/60 border border-slate-800">
                  <div className="text-indigo-400 font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>0 kolizí</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Algoritmus hlídá všechny časové překryvy za vás.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-850/60 border border-slate-800">
                  <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Volné dny</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Upřednostní rozvrhy s volným pátkem nebo pondělím.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-850/60 border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Minimum oken</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Kompaktní bloky výuky bez zbytečného čekání ve škole.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SEMESTER WEEK MODE (SUDÝ / LICHÝ / KAŽDÝ TÝDEN) */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Jak probíhá výuka na vaší škole?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zvolte, zda máte výuku každý týden stejně, nebo zda střídáte sudé a liché týdny.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {/* Možnost 1: Jen týdenní */}
                <div
                  onClick={() => setWeekMode('standard')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    weekMode === 'standard'
                      ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl mt-0.5 ${weekMode === 'standard' ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                      <CalendarCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        <span>Každotýdenní výuka (Standard)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Běžné
                        </span>
                      </p>
                      <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                        Všechny přednášky i cvičení se opakují každý týden stejně. Jednoduchý, přehledný rozvrh bez střídání sudého a lichého týdne.
                      </p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border mt-1 ${
                    weekMode === 'standard' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-800'
                  }`}>
                    {weekMode === 'standard' && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Možnost 2: Sudý a lichý týden */}
                <div
                  onClick={() => setWeekMode('parity')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    weekMode === 'parity'
                      ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl mt-0.5 ${weekMode === 'parity' ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        <span>Střídání sudého a lichého týdne</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ČVUT / VUT / MUNI
                        </span>
                      </p>
                      <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                        Některá cvičení nebo laboratoře máte jen 1× za 14 dní (např. sudý týden výuka, lichý týden volno). Algoritmus pohlídá, že sudá hodina nekoliduje s lichou.
                      </p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border mt-1 ${
                    weekMode === 'parity' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-800'
                  }`}>
                    {weekMode === 'parity' && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Nastavte si priority týdne
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Algoritmus podle těchto preferencí seřadí kombinace od nejlepší k méně vhodným.
                </p>
              </div>

              {/* Volný pátek */}
              <div
                onClick={() => setPreferFriday(!preferFriday)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  preferFriday
                    ? 'bg-indigo-950/60 border-indigo-500/70 shadow-sm'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${preferFriday ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <span>Chci volný pátek</span>
                      <span>🎉</span>
                    </p>
                    <p className="text-[11px] text-slate-400">Upřednostnit 3denní víkend bez výuky v pátek</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                  preferFriday ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-800'
                }`}>
                  {preferFriday && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Volné pondělí */}
              <div
                onClick={() => setPreferMonday(!preferMonday)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  preferMonday
                    ? 'bg-indigo-950/60 border-indigo-500/70 shadow-sm'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${preferMonday ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                    <Smile className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <span>Chci volné pondělí</span>
                      <span>🚀</span>
                    </p>
                    <p className="text-[11px] text-slate-400">Začít týden volnem a směřovat hodiny na út–pá</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                  preferMonday ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-800'
                }`}>
                  {preferMonday && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Žádné vstávání před 9:00 */}
              <div
                onClick={() => setEarlyPenalty(!earlyPenalty)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  earlyPenalty
                    ? 'bg-amber-950/50 border-amber-500/60 shadow-sm'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${earlyPenalty ? 'bg-amber-600/30 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <span>Nechci hodiny v 8:00 ráno</span>
                      <span>🌅</span>
                    </p>
                    <p className="text-[11px] text-slate-400">Penalizovat ranní termíny v 7:30 a 8:00</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                  earlyPenalty ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold' : 'border-slate-700 bg-slate-800'
                }`}>
                  {earlyPenalty && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Styl oken */}
              <div className="p-3.5 rounded-2xl bg-slate-850/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pauzy a okna mezi hodinami:</span>
                  </span>
                  <span className="font-mono text-indigo-300 text-[11px]">
                    {gapWeight === 5 ? 'Minimum oken' : gapWeight >= 3 ? 'Běžné pauzy' : 'Volné'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Volné', desc: 'Pauzy nevadí', weight: 1 },
                    { label: 'Vyvážené', desc: 'Pauza na oběd', weight: 3 },
                    { label: 'Kompaktní', desc: 'Bez mezer', weight: 5 },
                  ].map((opt) => (
                    <button
                      key={opt.weight}
                      type="button"
                      onClick={() => setGapWeight(opt.weight)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        gapWeight === opt.weight
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-800 border-slate-700/70 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-[10px] text-slate-400">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Zpět</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Pokračovat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleComplete(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                  title="Načíst předpřipravená ukázková data s paralelkami"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vyzkoušet na ukázkových datech</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleComplete(false)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>Začít s prázdným rozvrhem</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
