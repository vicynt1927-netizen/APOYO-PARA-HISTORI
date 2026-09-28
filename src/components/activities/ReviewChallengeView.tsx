import React, { useState, useEffect } from 'react';
import { ActivityItem } from '../../types';
import { Trophy, Star, Zap, Clock, CheckCircle2, XCircle, Sparkles, ArrowRight } from 'lucide-react';
import { playCorrectSound, playGentleTryAgainSound } from '../../utils/soundEffects';

interface ReviewChallengeViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const ReviewChallengeView: React.FC<ReviewChallengeViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const questions = data.preguntas || [
    {
      pregunta: '¿Cuál es el valor más grande de conocer la historia de México?',
      opciones: ['Comprender quiénes somos y valorar nuestras raíces', 'Memorizar fechas sin sentido', 'Aprender a manejar autos'],
      correcta: 0,
      puntos: 100,
      sabias_que: '¡El libro México, grandeza y diversidad nos enseña el respeto a todos los pueblos!',
    },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (!timerEnabled || isAnswered) return;
    if (timeLeft <= 0) {
      handleAnswer(-1); // time out
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timerEnabled, timeLeft, isAnswered]);

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx === currentQ.correcta;
    if (isCorrect) {
      playCorrectSound();
      setScore((s) => s + (currentQ.puntos || 100) + streak * 20);
      setStreak((st) => st + 1);
    } else {
      playGentleTryAgainSound();
      setStreak(0);
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setTimeLeft(30);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Finished challenge!
      const totalPossible = questions.length * 100;
      onComplete(score, totalPossible);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Game Dashboard Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
            🏆
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Reto del Explorador de 4° Grado
            </div>
            <div className="text-xl font-black font-heading">
              {score} Puntos
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-3 py-1 bg-black/20 rounded-2xl backdrop-blur-xs">
            <div className="text-[10px] uppercase text-amber-200 font-bold">Racha</div>
            <div className="text-sm font-extrabold flex items-center justify-center gap-1">
              🔥 {streak}
            </div>
          </div>

          <div className="text-center px-3 py-1 bg-black/20 rounded-2xl backdrop-blur-xs">
            <div className="text-[10px] uppercase text-amber-200 font-bold">Pregunta</div>
            <div className="text-sm font-extrabold">
              {currentIdx + 1} / {questions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Timer control */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTimerEnabled(!timerEnabled)}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              timerEnabled ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-100 text-stone-600'
            }`}
          >
            ⏱️ Cronómetro: {timerEnabled ? `${timeLeft}s` : 'Desactivado (sin prisas)'}
          </button>
        </div>
        <span>Gana puntos y racha por responder con precisión</span>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
        <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-heading leading-snug">
          {currentQ.pregunta}
        </h3>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {currentQ.opciones.map((opt: string, idx: number) => {
            const isSelected = selectedOption === idx;
            let btnStyle = 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800';

            if (isAnswered) {
              if (idx === currentQ.correcta) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-300';
              } else if (isSelected) {
                btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
              } else {
                btnStyle = 'opacity-40 border-stone-200 bg-stone-50 text-stone-400';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed">{opt}</span>
                </div>
                {isAnswered && idx === currentQ.correcta && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && idx !== currentQ.correcta && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        {isAnswered && (
          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-2xl transition-all shadow-xs flex items-center gap-2"
            >
              <span>{currentIdx < questions.length - 1 ? 'Siguiente reto' : 'Ver trofeo final'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Did you know extra box */}
      {isAnswered && currentQ.sabias_que && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Dato curioso de México:</strong> {currentQ.sabias_que}
          </div>
        </div>
      )}

    </div>
  );
};
