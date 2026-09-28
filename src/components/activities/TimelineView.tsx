import React, { useState, useEffect } from 'react';
import { ActivityItem } from '../../types';
import { Clock, ArrowUp, ArrowDown, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { playCorrectSound, playGentleTryAgainSound } from '../../utils/soundEffects';

interface TimelineViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const initialMilestones = data.hitos || [];

  const [items, setItems] = useState<any[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isAllCorrect, setIsAllCorrect] = useState(false);

  useEffect(() => {
    // Shuffle milestones on load so student has to order them
    const shuffled = [...initialMilestones].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setIsVerified(false);
    setIsAllCorrect(false);
  }, [activity.id]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
    setIsVerified(false);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
    setIsVerified(false);
  };

  const handleVerify = () => {
    let correctCount = 0;
    items.forEach((item, idx) => {
      if (item.orden_correcto === idx + 1) {
        correctCount++;
      }
    });

    setIsVerified(true);
    if (correctCount === items.length) {
      setIsAllCorrect(true);
      playCorrectSound();
      onComplete(items.length, items.length);
    } else {
      setIsAllCorrect(false);
      playGentleTryAgainSound();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Intro */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-950 font-heading">
              Línea del Tiempo Histórica
            </h3>
            <p className="text-xs text-rose-800">
              Usa las flechas para ordenar los acontecimientos del más antiguo (arriba) al más reciente (abajo).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-end sm:self-auto"
        >
          Comprobar orden
        </button>
      </div>

      {/* Timeline items list */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-7 before:w-1 before:bg-rose-200 before:pointer-events-none">
        {items.map((item, idx) => {
          const isCorrectPosition = isVerified && item.orden_correcto === idx + 1;
          const isIncorrectPosition = isVerified && item.orden_correcto !== idx + 1;

          return (
            <div
              key={idx}
              className={`relative z-10 p-4 sm:p-5 rounded-3xl border-2 transition-all flex items-start gap-4 ${
                isCorrectPosition
                  ? 'border-emerald-500 bg-emerald-50/70'
                  : isIncorrectPosition
                  ? 'border-rose-400 bg-rose-50/60'
                  : 'border-stone-200 bg-white hover:border-amber-300'
              }`}
            >
              {/* Order number badge */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                  isCorrectPosition
                    ? 'bg-emerald-600 text-white'
                    : isIncorrectPosition
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {idx + 1}°
              </div>

              {/* Text content */}
              <div className="flex-1">
                <div className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                  {item.fecha_o_momento}
                </div>
                <h4 className="text-base font-bold text-stone-900 font-heading mt-0.5">
                  {item.titulo}
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {item.descripcion}
                </p>
              </div>

              {/* Up / Down Reorder buttons */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 disabled:opacity-20 shadow-xs"
                  title="Mover arriba (acontecimiento anterior)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === items.length - 1}
                  className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 disabled:opacity-20 shadow-xs"
                  title="Mover abajo (acontecimiento posterior)"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification Feedback */}
      {isVerified && (
        <div
          className={`p-5 rounded-3xl border-2 text-center space-y-2 ${
            isAllCorrect
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="text-lg font-bold font-heading flex items-center justify-center gap-2">
            {isAllCorrect ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>¡Orden cronológico perfecto!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <span>Casi lo logras. Revisa las tarjetas marcadas en rojo y ajústalas.</span>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm">
            {isAllCorrect
              ? 'Has demostrado comprender el orden temporal en que sucedieron los hechos en México.'
              : 'Los sucesos más antiguos van al inicio (arriba), y los posteriores hacia abajo.'}
          </p>
        </div>
      )}

    </div>
  );
};
