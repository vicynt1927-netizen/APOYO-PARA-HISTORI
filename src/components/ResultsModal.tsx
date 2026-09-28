import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, Sparkles, CheckCircle2, RotateCcw, ArrowRight, BookOpen } from 'lucide-react';
import { playCelebrationSound } from '../utils/soundEffects';

interface ResultsModalProps {
  isOpen: boolean;
  score: number;
  total: number;
  activityTitle: string;
  topicTitle: string;
  onReplay: () => void;
  onClose: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  score,
  total,
  activityTitle,
  topicTitle,
  onReplay,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      playCelebrationSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#f97316'],
        });
      } catch (e) {
        // Confetti gracefully ignored if unsupported
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const percentage = Math.round((score / Math.max(1, total)) * 100);
  const starsEarned = percentage >= 80 ? 3 : percentage >= 50 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Celebration Trophy */}
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 rounded-full flex items-center justify-center mx-auto text-4xl shadow-md border-4 border-white ring-4 ring-amber-200">
          🏆
        </div>

        <div>
          <div className="text-xs uppercase font-extrabold tracking-widest text-amber-600 mb-1">
            ¡Misión Histórica Cumplida!
          </div>
          <h2 className="text-2xl font-black text-stone-900 font-heading">
            ¡Gran esfuerzo, explorador(a)!
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {activityTitle}
          </p>
        </div>

        {/* Stars Display */}
        <div className="flex items-center justify-center gap-2 py-1">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform ${
                starIdx <= starsEarned
                  ? 'bg-amber-100 text-amber-500 scale-110 shadow-xs'
                  : 'bg-stone-100 text-stone-300'
              }`}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Score Card */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1">
          <div className="text-xs text-stone-600 font-medium">Puntuación alcanzada:</div>
          <div className="text-2xl font-black text-amber-800">
            {score} de {total} ({percentage}%)
          </div>
        </div>

        {/* Positive Review Recommendation */}
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 text-left space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tema explorado: {topicTitle}</span>
          </div>
          <p className="text-stone-600">
            {percentage >= 80
              ? '¡Excelente dominio del tema! Estás listo para nuevos desafíos históricos.'
              : '¡Vas muy bien! Puedes volver a repasar el texto para reforzar fechas y detalles.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onReplay}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir reto</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Ver más actividades</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
