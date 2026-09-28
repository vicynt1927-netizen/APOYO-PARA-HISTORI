import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { Network, CheckCircle, ChevronDown, ChevronRight, BookOpen, Check } from 'lucide-react';

interface ConceptMapViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const ConceptMapView: React.FC<ConceptMapViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const centralNode = data.nodo_central || activity.title;
  const branches = data.ramas || [
    { categoria: 'Ideas clave', conceptos: ['Concepto fundamental 1', 'Concepto fundamental 2'] },
    { categoria: 'Consecuencias', conceptos: ['Impacto histórico 1', 'Impacto histórico 2'] },
  ];

  const [expandedBranches, setExpandedBranches] = useState<number[]>(
    branches.map((_: any, i: number) => i) // expanded by default
  );

  const toggleBranch = (idx: number) => {
    if (expandedBranches.includes(idx)) {
      setExpandedBranches(expandedBranches.filter((i) => i !== idx));
    } else {
      setExpandedBranches([...expandedBranches, idx]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-950 font-heading">
              Esquema y Mapa Conceptual
            </h3>
            <p className="text-xs text-blue-800">
              Observa cómo se conectan las ideas a partir del tema central.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onComplete(100, 100)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Registrar comprensión del esquema</span>
        </button>
      </div>

      {/* Concept Map Visual Hierarchy */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col items-center">
        
        {/* Central Root Node */}
        <div className="w-full max-w-md bg-gradient-to-r from-amber-600 to-orange-600 text-white p-5 rounded-3xl shadow-md text-center border-4 border-amber-200">
          <span className="text-[10px] uppercase font-black tracking-widest bg-black/20 px-2 py-0.5 rounded-full inline-block mb-1">
            Tema Central
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-heading">
            {centralNode}
          </h2>
        </div>

        {/* Connecting Vertical Trunk */}
        <div className="w-1 h-8 bg-amber-300"></div>

        {/* Horizontal Connector Bar */}
        <div className="w-4/5 h-1 bg-amber-300 hidden md:block"></div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-4 md:mt-0">
          {branches.map((branch: any, idx: number) => {
            const isExpanded = expandedBranches.includes(idx);

            // Palette per branch
            const colors = [
              { border: 'border-emerald-300', bg: 'bg-emerald-50', header: 'bg-emerald-600', pill: 'bg-emerald-100 text-emerald-950' },
              { border: 'border-indigo-300', bg: 'bg-indigo-50', header: 'bg-indigo-600', pill: 'bg-indigo-100 text-indigo-950' },
              { border: 'border-amber-300', bg: 'bg-amber-50', header: 'bg-amber-600', pill: 'bg-amber-100 text-amber-950' },
            ][idx % 3];

            return (
              <div
                key={idx}
                className={`rounded-3xl border-2 transition-all overflow-hidden ${colors.border} ${colors.bg}`}
              >
                {/* Branch Header */}
                <button
                  type="button"
                  onClick={() => toggleBranch(idx)}
                  className={`w-full p-4 text-white text-left font-bold text-sm sm:text-base flex items-center justify-between ${colors.header}`}
                >
                  <span className="font-heading">{branch.categoria}</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Sub-concepts */}
                {isExpanded && (
                  <div className="p-4 space-y-2.5">
                    {branch.conceptos?.map((sub: string, subIdx: number) => (
                      <div
                        key={subIdx}
                        className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold border border-white/60 shadow-2xs ${colors.pill}`}
                      >
                        • {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
