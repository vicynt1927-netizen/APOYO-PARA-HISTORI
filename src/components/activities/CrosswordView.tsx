import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { Grid, CheckCircle2, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';
import { playCorrectSound, playGentleTryAgainSound } from '../../utils/soundEffects';

interface CrosswordViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const CrosswordView: React.FC<CrosswordViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const rawWords = data.palabras || [];

  // Default words if not present
  const wordsList = rawWords.length > 0 ? rawWords : [
    { palabra: 'MEXICO', pista: 'Nuestra patria soberana y diversa.', orientacion: 'horizontal', numero: 1 },
    { palabra: 'MAIZ', pista: 'Alimento sagrado y base de la milpa.', orientacion: 'vertical', numero: 2 },
    { palabra: 'ALDEA', pista: 'Comunidad sedentaria de los primeros agricultores.', orientacion: 'horizontal', numero: 3 },
  ];

  // User input answers stored as wordIndex -> userString
  const [userInputs, setUserInputs] = useState<{ [key: number]: string }>({});
  const [verifiedWords, setVerifiedWords] = useState<number[]>([]);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(0);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  const handleInputChange = (wordIdx: number, val: string) => {
    setUserInputs({
      ...userInputs,
      [wordIdx]: val.toUpperCase(),
    });
  };

  const handleCheckWord = (wordIdx: number) => {
    const targetWord = wordsList[wordIdx].palabra.toUpperCase().replace(/\s+/g, '');
    const userWord = (userInputs[wordIdx] || '').toUpperCase().replace(/\s+/g, '');

    if (userWord === targetWord) {
      playCorrectSound();
      if (!verifiedWords.includes(wordIdx)) {
        const updated = [...verifiedWords, wordIdx];
        setVerifiedWords(updated);
        if (updated.length === wordsList.length) {
          onComplete(wordsList.length, wordsList.length);
        }
      }
    } else {
      playGentleTryAgainSound();
    }
  };

  const handleRevealFirstLetter = (wordIdx: number) => {
    const targetWord = wordsList[wordIdx].palabra.toUpperCase().replace(/\s+/g, '');
    const firstLetter = targetWord[0];
    const current = userInputs[wordIdx] || '';
    setUserInputs({
      ...userInputs,
      [wordIdx]: firstLetter + current.slice(1),
    });
    setRevealedHints([...revealedHints, wordIdx]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Intro */}
      <div className="bg-orange-50 border border-orange-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-orange-950 font-heading">
              Crucigrama de Historia
            </h3>
            <p className="text-xs text-orange-800">
              Lee cada pista, escribe las letras en las casillas y comprueba tus palabras.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-orange-900 bg-white px-3 py-1.5 rounded-full border border-orange-300">
          Palabras correctas: {verifiedWords.length} de {wordsList.length}
        </div>
      </div>

      {/* Clues and Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wordsList.map((item: any, idx: number) => {
          const target = item.palabra.toUpperCase().replace(/\s+/g, '');
          const isCorrect = verifiedWords.includes(idx);
          const userVal = userInputs[idx] || '';

          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : activeWordIdx === idx
                  ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-200 shadow-xs'
                  : 'border-stone-200 bg-white'
              }`}
              onClick={() => setActiveWordIdx(idx)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    Pista #{idx + 1} • {item.orientacion === 'horizontal' ? 'Horizontal' : 'Vertical'} ({target.length} letras)
                  </span>
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </div>

                <p className="text-sm font-semibold text-stone-900 font-heading leading-snug">
                  {item.pista}
                </p>

                {/* Letter boxes display */}
                <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                  {target.split('').map((char: string, charIdx: number) => {
                    const inputChar = userVal[charIdx] || '';
                    return (
                      <div
                        key={charIdx}
                        className={`w-9 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-colors ${
                          isCorrect
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                            : inputChar
                            ? 'bg-amber-50 border-amber-400 text-stone-900'
                            : 'bg-stone-50 border-stone-200 text-stone-400'
                        }`}
                      >
                        {isCorrect ? char : inputChar || '_'}
                      </div>
                    );
                  })}
                </div>

                {/* TextInput */}
                {!isCorrect && (
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={target.length}
                      placeholder={`Escribe ${target.length} letras`}
                      value={userVal}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold uppercase tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-stone-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleCheckWord(idx)}
                      disabled={userVal.length === 0}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-colors"
                    >
                      Comprobar
                    </button>
                  </div>
                )}
              </div>

              {/* Hint button */}
              {!isCorrect && (
                <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRevealFirstLetter(idx)}
                    className="text-xs text-stone-500 hover:text-orange-700 flex items-center gap-1 font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Revelar primera letra</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion */}
      {verifiedWords.length === wordsList.length && (
        <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-3xl text-center space-y-3">
          <div className="text-3xl">🏆</div>
          <h4 className="text-lg font-bold text-emerald-950 font-heading">
            ¡Completaste todo el crucigrama!
          </h4>
          <p className="text-xs text-emerald-800">
            Excelente vocabulario y comprensión de los conceptos del libro.
          </p>
          <button
            type="button"
            onClick={() => onComplete(wordsList.length, wordsList.length)}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-xs"
          >
            Finalizar actividad
          </button>
        </div>
      )}

    </div>
  );
};
