import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { FileEdit, CheckCircle2, RefreshCw, Sparkles, Check } from 'lucide-react';
import { playCorrectSound, playGentleTryAgainSound } from '../../utils/soundEffects';

interface FillInBlanksViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const FillInBlanksView: React.FC<FillInBlanksViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const rawText: string = data.texto_con_huecos || 'En México, el ___1___ fue el alimento central y la ___2___ permitió unir comunidades.';
  const correctAnswers: string[] = data.respuestas || ['maíz', 'agricultura'];
  const wordBank: string[] = data.banco_palabras || ['maíz', 'agricultura', 'acero', 'plástico'];

  // Current selected word in active hole: holeIndex -> word
  const [userHoles, setUserHoles] = useState<{ [key: number]: string }>({});
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [score, setScore] = useState(0);

  // Split text by blank tokens like ___1___, ___2___
  const parts = rawText.split(/___(\d+)___/g);

  const handlePlaceWordInHole = (holeIdx: number) => {
    if (isVerified) return;
    if (selectedWord) {
      setUserHoles({
        ...userHoles,
        [holeIdx]: selectedWord,
      });
      setSelectedWord(null);
    } else if (userHoles[holeIdx]) {
      // Remove word from hole
      const updated = { ...userHoles };
      delete updated[holeIdx];
      setUserHoles(updated);
    }
  };

  const handleVerify = () => {
    let matches = 0;
    correctAnswers.forEach((ans, idx) => {
      const userWord = userHoles[idx + 1] || '';
      if (userWord.toLowerCase().trim() === ans.toLowerCase().trim()) {
        matches++;
      }
    });

    setScore(matches);
    setIsVerified(true);

    if (matches === correctAnswers.length) {
      playCorrectSound();
      onComplete(matches, correctAnswers.length);
    } else {
      playGentleTryAgainSound();
    }
  };

  const handleReset = () => {
    setUserHoles({});
    setSelectedWord(null);
    setIsVerified(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-600 text-white flex items-center justify-center">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-yellow-950 font-heading">
              Completa los Espacios en Blanco
            </h3>
            <p className="text-xs text-yellow-800">
              1. Elige una palabra del banco de abajo. 2. Toca el espacio en blanco donde debe ir.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={Object.keys(userHoles).length === 0}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40"
        >
          Comprobar
        </button>
      </div>

      {/* Main interactive paragraph */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs leading-loose text-base sm:text-lg text-stone-800">
        {parts.map((part, i) => {
          // If odd index, it's a hole number (1, 2, 3...)
          if (i % 2 === 1) {
            const holeIdx = parseInt(part, 10);
            const filledWord = userHoles[holeIdx];
            const isCorrect =
              isVerified &&
              filledWord?.toLowerCase().trim() === correctAnswers[holeIdx - 1]?.toLowerCase().trim();
            const isIncorrect = isVerified && !isCorrect;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handlePlaceWordInHole(holeIdx)}
                className={`inline-flex items-center justify-center min-w-[100px] px-3 py-1 mx-1.5 rounded-xl border-2 font-bold text-sm transition-all align-middle ${
                  isCorrect
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                    : isIncorrect
                    ? 'bg-rose-100 border-rose-400 text-rose-900'
                    : filledWord
                    ? 'bg-amber-100 border-amber-400 text-amber-950'
                    : selectedWord
                    ? 'bg-amber-50 border-dashed border-amber-400 text-amber-600 animate-pulse'
                    : 'bg-stone-100 border-dashed border-stone-300 text-stone-400'
                }`}
              >
                {filledWord || `[Espacio ${holeIdx}]`}
              </button>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>

      {/* Word bank */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
          Banco de palabras disponibles:
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {wordBank.map((word, idx) => {
            const isSelected = selectedWord === word;
            const isUsed = Object.values(userHoles).includes(word);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedWord(isSelected ? null : word)}
                disabled={isVerified || isUsed}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isUsed
                    ? 'bg-stone-200 text-stone-400 line-through cursor-not-allowed'
                    : isSelected
                    ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 scale-105'
                    : 'bg-white text-stone-800 border border-stone-300 hover:border-amber-400 shadow-2xs'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>

        {selectedWord && (
          <p className="text-xs text-amber-800 font-medium">
            👉 Palabra seleccionada: <strong>{selectedWord}</strong>. Ahora toca el espacio en blanco arriba.
          </p>
        )}
      </div>

      {/* Verification summary */}
      {isVerified && (
        <div
          className={`p-5 rounded-3xl border-2 space-y-2 ${
            score === correctAnswers.length
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm font-heading">
            {score === correctAnswers.length ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>¡Perfecto! Completaste todos los espacios con éxito.</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Aciertos: {score} de {correctAnswers.length}. Puedes reintentarlo.</span>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-stone-700 text-white text-xs font-bold rounded-xl"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
