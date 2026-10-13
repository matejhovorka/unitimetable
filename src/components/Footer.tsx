import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenLegal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-sm py-4 px-4 lg:px-8 text-xs text-slate-400">
      <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="font-semibold text-slate-300">UniTimetable Optimizer</span>
          <span>•</span>
          <span>100% lokální zpracování v prohlížeči</span>
          <span>•</span>
          <span className="text-slate-500">Nezávislá studentská pomůcka</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenLegal}
            className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors font-medium hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Právní informace & Soukromí</span>
          </button>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-500 flex items-center gap-1">
            MIT Licence
          </span>
        </div>
      </div>
    </footer>
  );
};
