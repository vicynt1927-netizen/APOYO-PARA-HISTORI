import React, { useState, useEffect } from 'react';
import { ActivityItem } from '../../types';
import { GitCompare, CheckCircle, RefreshCw, Sparkles, Check } from 'lucide-react';
import { playCorrectSound, playGentleTryAgainSound } from '../../utils/soundEffects';

interface MatchingViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const pairs = data.pares || [];

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ [key: string]: string }>({}); // leftId -> rightId
  const [shuffledRight, setShuffledRight] = useState<{ id: string; text: string }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Shuffle right items to make matching an authentic game
    const rightItems = pairs.map((p: any) => ({ id: p.id, text: p.elementoB }));
    const shuffled = [...rightItems].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  }, [activity.id]);

  const handleSelectLeft = (id: string) => {
    if (matches[id]) return; // already paired
    setSelectedLeft(id);
    setFeedback(null);
  };

  const handleSelectRight = (rightId: string) => {
    if (!selectedLeft) return;

    // Check if this right item is already matched with another left
    const alreadyUsed = Object.values(matches).includes(rightId);
    if (alreadyUsed) return;

    // Verify if correct pair
    if (selectedLeft === rightId) {
      // Correct!
      playCorrectSound();
      const updated = { ...matches, [selectedLeft]: rightId };
      setMatches(updated);
      setSelectedLeft(null);

      const matchedPair = pairs.find((p: any) => p.id === selectedLeft);
      setFeedback(`¡Correcto! ${matchedPair?.explicacion || '¡Excelente relación histórica!'}`);

      if (Object.keys(updated).length === pairs.length) {
        onComplete(pairs.length, pairs.length);
      }
    } else {
      // Try again
      playGentleTryAgainSound();
      setFeedback('No corresponde a este elemento. ¡Intenta con otra opción!');
    }
  };

  const matchedCount = Object.keys(matches).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Instructions header */}
      <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-purple-950 font-heading">
              Relaciona las Dos Columnas
            </h3>
            <p className="text-xs text-purple-800">
              1. Toca un elemento de la columna izquierda. 2. Luego toca su significado en la derecha.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-purple-900 bg-white px-3 py-1.5 rounded-full border border-purple-300">
          Emparejados: {matchedCount} de {pairs.length}
        </div>
      </div>

      {/* Matching columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Column A (Left) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            Columna A: Personajes, Conceptos o Épocas
          </h4>
          {pairs.map((pair: any) => {
            const isMatched = !!matches[pair.id];
            const isSelected = selectedLeft === pair.id;

            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleSelectLeft(pair.id)}
                disabled={isMatched}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isMatched
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 opacity-90'
                    : isSelected
                    ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-300 scale-102 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-purple-300 text-stone-800 shadow-xs'
                }`}
              >
                <span className="text-sm sm:text-base font-bold font-heading">
                  {pair.elementoA}
                </span>
                {isMatched && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Column B (Right) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            Columna B: Acciones, Acontecimientos o Respuestas
          </h4>
          {shuffledRight.map((item) => {
            const isMatched = Object.values(matches).includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectRight(item.id)}
                disabled={isMatched || !selectedLeft}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isMatched
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 opacity-90'
                    : selectedLeft
                    ? 'border-stone-200 bg-white hover:border-purple-400 hover:bg-purple-50/40 text-stone-800 shadow-xs cursor-pointer'
                    : 'border-stone-200 bg-stone-50/60 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span className="text-xs sm:text-sm font-medium leading-relaxed">
                  {item.text}
                </span>
                {isMatched && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

      </div>

      {/* Feedback message */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Completion */}
      {matchedCount === pairs.length && (
        <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl shadow-xs">
            🎉
          </div>
          <h4 className="text-lg font-bold text-emerald-950 font-heading">
            ¡Felicitaciones! Has emparejado todos los elementos correctamente
          </h4>
          <p className="text-xs text-emerald-800">
            Demostraste una excelente memoria y comprensión de los conceptos.
          </p>
          <button
            type="button"
            onClick={() => onComplete(pairs.length, pairs.length)}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl"
          >
            Finalizar actividad y ganar estrellas
          </button>
        </div>
      )}

    </div>
  );
};
