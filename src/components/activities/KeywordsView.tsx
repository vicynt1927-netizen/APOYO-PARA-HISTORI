import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { Key, Volume2, Sparkles, CheckCircle2, Bookmark } from 'lucide-react';
import { speakText } from '../../utils/storage';

interface KeywordsViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const KeywordsView: React.FC<KeywordsViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const terms = data.terminos || [];
  const [learnedTerms, setLearnedTerms] = useState<string[]>([]);

  const toggleLearned = (termino: string) => {
    if (learnedTerms.includes(termino)) {
      setLearnedTerms(learnedTerms.filter((t) => t !== termino));
    } else {
      const updated = [...learnedTerms, termino];
      setLearnedTerms(updated);
      if (updated.length === terms.length) {
        onComplete(100, 100);
      }
    }
  };

  const handleSpeakTerm = (term: any) => {
    const text = `${term.termino}. ${term.definicion_infantil}. Ejemplo: ${term.ejemplo_cotidiano}`;
    speakText(text);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950 font-heading">
              Vocabulario Histórico Clave
            </h3>
            <p className="text-xs text-emerald-800">
              Marca las palabras que ya conozcas para sumar estrellas a tu perfil.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-full border border-emerald-300">
          Dominadas: {learnedTerms.length} de {terms.length}
        </div>
      </div>

      {/* Terms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map((term: any, idx: number) => {
          const isLearned = learnedTerms.includes(term.termino);
          return (
            <div
              key={idx}
              className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                isLearned
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-lg font-bold text-stone-900 font-heading flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{term.termino}</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => handleSpeakTerm(term)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                    title="Escuchar pronunciación y significado"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                  </button>
                </div>

                {/* Definition */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium mt-1">
                  {term.definicion_infantil}
                </p>

                {/* Everyday analogy */}
                {term.ejemplo_cotidiano && (
                  <div className="mt-3 p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-950">
                    <strong className="text-amber-800 flex items-center gap-1 mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Ejemplo para niños:
                    </strong>
                    {term.ejemplo_cotidiano}
                  </div>
                )}

                {/* Memory trick */}
                {term.como_recordarlo && (
                  <div className="mt-2 text-xs text-stone-500 italic">
                    💡 <strong>Para recordarlo:</strong> {term.como_recordarlo}
                  </div>
                )}
              </div>

              {/* Mark as learned toggle button */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleLearned(term.termino)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isLearned
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLearned ? '¡Palabra dominada!' : 'Marcar como aprendida'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion footer */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => onComplete(learnedTerms.length, terms.length)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-all"
        >
          Guardar progreso de vocabulario ({learnedTerms.length}/{terms.length})
        </button>
      </div>

    </div>
  );
};
