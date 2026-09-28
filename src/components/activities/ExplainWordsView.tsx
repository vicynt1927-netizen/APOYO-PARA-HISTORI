import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { MessageSquare, Sparkles, Check, Lightbulb, HelpCircle, CheckCircle2 } from 'lucide-react';
import { playCorrectSound } from '../../utils/soundEffects';

interface ExplainWordsViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const ExplainWordsView: React.FC<ExplainWordsViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const challenges = data.retos || [
    {
      tipo: 'explica_con_tus_palabras',
      consigna: 'Explica con tus propias palabras qué aprendiste de este capítulo de Historia de México:',
      guia_ayuda: 'Puedes iniciar diciendo: "Lo que más me llamó la atención fue..."',
      sugerencia_respuesta: 'Expresar ideas clave con vocabulario propio sin copiar textualmente.',
    },
    {
      tipo: 'compara',
      consigna: 'Compara la forma de vida de esa época histórica con la vida de hoy en día:',
      guia_ayuda: 'Menciona una semejanza (algo que todavía hacemos) y una diferencia.',
      sugerencia_respuesta: 'Reconocer cambios y permanencias a través del tiempo.',
    },
    {
      tipo: 'causa_consecuencia',
      consigna: '¿Qué causa motivó este acontecimiento y qué consecuencia trajo para nuestro país?',
      guia_ayuda: 'Piensa en: "Sucedió porque..." y "Provocó que..."',
      sugerencia_respuesta: 'Identificar razones históricas y su impacto en la sociedad.',
    },
  ];

  const [studentAnswers, setStudentAnswers] = useState<{ [key: number]: string }>({});
  const [completedRetos, setCompletedRetos] = useState<number[]>([]);

  const handleTextChange = (idx: number, text: string) => {
    setStudentAnswers({
      ...studentAnswers,
      [idx]: text,
    });
  };

  const handleSaveReto = (idx: number) => {
    if (!completedRetos.includes(idx)) {
      playCorrectSound();
      const updated = [...completedRetos, idx];
      setCompletedRetos(updated);
      if (updated.length === challenges.length) {
        onComplete(challenges.length, challenges.length);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Intro */}
      <div className="bg-lime-50 border border-lime-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lime-600 text-white flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-lime-950 font-heading">
              Pensamiento Histórico: Explica con tus Palabras
            </h3>
            <p className="text-xs text-lime-800">
              Desarrolla tu propia voz, compara épocas y reflexiona sobre causas y consecuencias.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-lime-900 bg-white px-3 py-1.5 rounded-full border border-lime-300">
          Reflexiones: {completedRetos.length} de {challenges.length}
        </div>
      </div>

      {/* Challenges cards */}
      <div className="space-y-6">
        {challenges.map((reto: any, idx: number) => {
          const isDone = completedRetos.includes(idx);
          const answerText = studentAnswers[idx] || '';

          const typeLabel =
            reto.tipo === 'compara'
              ? 'Comparar ideas y épocas'
              : reto.tipo === 'causa_consecuencia'
              ? 'Causa y consecuencia'
              : 'Explica con tus palabras';

          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
                isDone
                  ? 'border-emerald-400 bg-emerald-50/40 shadow-xs'
                  : 'border-stone-200 bg-white shadow-xs hover:border-lime-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-lime-100 text-lime-800">
                  Reto #{idx + 1} • {typeLabel}
                </span>
                {isDone && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ¡Completado!
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-stone-900 font-heading leading-snug">
                {reto.consigna}
              </h4>

              {/* Scaffolding helper tip */}
              {reto.guia_ayuda && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pista para comenzar:</strong> {reto.guia_ayuda}
                  </span>
                </div>
              )}

              {/* Textarea */}
              <textarea
                rows={3}
                placeholder="Escribe tu reflexión aquí..."
                value={answerText}
                onChange={(e) => handleTextChange(idx, e.target.value)}
                className="w-full p-4 border border-stone-300 rounded-2xl text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-400">
                  {answerText.trim().split(/\s+/).filter(Boolean).length} palabras escritas
                </span>

                <button
                  type="button"
                  onClick={() => handleSaveReto(idx)}
                  disabled={answerText.trim().length < 5}
                  className="px-4 py-2 bg-lime-700 hover:bg-lime-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar esta reflexión</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Done summary */}
      {completedRetos.length === challenges.length && (
        <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-3xl text-center space-y-3">
          <div className="text-3xl">🌟</div>
          <h4 className="text-lg font-bold text-emerald-950 font-heading">
            ¡Gran trabajo de pensamiento histórico!
          </h4>
          <p className="text-xs text-emerald-800">
            Explicar con tus propias palabras es la mejor forma de comprender y recordar la historia.
          </p>
          <button
            type="button"
            onClick={() => onComplete(challenges.length, challenges.length)}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl"
          >
            Finalizar y registrar avance
          </button>
        </div>
      )}

    </div>
  );
};
