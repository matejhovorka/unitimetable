import React from 'react';
import { X, ShieldCheck, AlertTriangle, Lock, FileText, CheckCircle2, Heart } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Právní informace a ochrana soukromí</h2>
              <p className="text-xs text-slate-400">Podmínky použití, GDPR prohlášení a vyloučení odpovědnosti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* 1. Vyloučení odpovědnosti */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2.5 text-amber-300 font-semibold mb-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Vyloučení odpovědnosti (Disclaimer)</span>
            </div>
            <p className="text-xs text-amber-200/90 space-y-1">
              <strong>UniTimetable Optimizer</strong> je nezávislá studentská pomůcka a <em>není</em> oficiální aplikací žádné vysoké školy (ČVUT, VUT, MUNI, UK ani jiných univerzit).
              Generované kombinace rozvrhů mají <strong>výhradně doporučující a informativní charakter</strong>. Autor nenese žádnou odpovědnost za případné nepřesnosti, kolize, změny termínů ze strany fakulty ani za zmeškanou výuku. 
              <strong>Závazným a jediným oficiálním zdrojem zůstává vždy oficiální informační systém vaší školy (STAG, SIS, KOS, IS apod.).</strong>
            </p>
          </div>

          {/* 2. Ochrana soukromí & GDPR */}
          <div>
            <div className="flex items-center gap-2 text-slate-100 font-semibold mb-2.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>100% soukromí a zpracování dat (GDPR)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Žádný server ani databáze:</strong> Aplikace běží na 100 % v prohlížeči. Vaše zapsané předměty, časy ani jména pedagogů se nikdy neodesílají na žádný vzdálený server.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Žádné sledovací cookies:</strong> Web neukládá žádné marketingové, analytické ani reklamní cookies třetích stran (žádný Google Analytics, Meta Pixel ani reklamní sítě).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Lokální paměť (localStorage):</strong> Rozvrh a preference se ukládají výhradně v mezipaměti vašeho vlastního zařízení a můžete je kdykoliv smazat tlačítkem „Vyčistit rozvrh“ nebo vymazáním dat prohlížeče.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Nulová telemetrie a nulové externí fonty:</strong> Žádná síťová komunikace na cizí servery.</span>
              </li>
            </ul>
          </div>

          {/* 3. Autorská práva a školní systémy */}
          <div>
            <div className="flex items-center gap-2 text-slate-100 font-semibold mb-2.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Autorská práva & Informační systémy škol</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Aplikace neprovádí žádné automatizované stahování dat (scraping) ze serverů škol. Data vkládá student ze svého oprávněného přístupu prostřednictvím schránky pro své vlastní osobní studijní účely v souladu se zákonnou licencí.
            </p>
            <p className="text-xs text-slate-400">
              Tento projekt je open-source pod svobodnou licencí <strong>MIT License</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Vytvořeno pro studenty s</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors"
          >
            Rozumím a souhlasím
          </button>
        </div>
      </div>
    </div>
  );
};
