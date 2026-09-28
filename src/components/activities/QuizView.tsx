import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { playCorrectSound, playGentleTryAgainSound } from '../../utils/soundEffects';

interface QuizViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const questions = data.preguntas || [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [openAnswerText, setOpenAnswerText] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-stone-500 bg-white rounded-3xl border border-stone-200">
        No se encontraron preguntas en esta actividad.
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
  };

  const handleVerify = () => {
    if (isAnswered) return;

    if (currentQ.tipo === 'abierta') {
      if (!openAnswerText.trim()) return;
      setIsAnswered(true);
      setIsCorrect(true);
      setShowExplanation(true);
      setScore(score + 1);
      playCorrectSound();
      return;
    }

    if (!selectedOption) return;

    const correct =
      selectedOption.trim().toLowerCase() === currentQ.respuesta_correcta?.trim().toLowerCase();

    setIsAnswered(true);
    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      setScore(score + 1);
      playCorrectSound();
    } else {
      playGentleTryAgainSound();
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setOpenAnswerText('');
    setShowExplanation(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Completed quiz!
      const finalScore = isCorrect ? score : score; // score already updated
      onComplete(finalScore, questions.length);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs font-bold text-stone-600 bg-stone-100 p-3 rounded-2xl">
        <span>Pregunta {currentIdx + 1} de {questions.length}</span>
        <span className="text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
          ⭐ Aciertos: {score}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-sky-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.round(((currentIdx + 1) / questions.length) * 100)}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-sky-100 text-sky-800">
            {currentQ.tipo === 'opcion_multiple'
              ? 'Opción múltiple'
              : currentQ.tipo === 'verdadero_falso'
              ? 'Verdadero o Falso'
              : 'Pregunta abierta'}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-heading leading-snug">
          {currentQ.pregunta}
        </h3>

        {/* Options (Multiple choice or True/False) */}
        {currentQ.tipo !== 'abierta' && (
          <div className="space-y-3 pt-2">
            {(currentQ.opciones || ['Verdadero', 'Falso']).map((opt: string, idx: number) => {
              const isSelected = selectedOption === opt;
              let optionStyle = 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 text-stone-800';

              if (isAnswered) {
                const isThisTheCorrectAnswer =
                  opt.trim().toLowerCase() === currentQ.respuesta_correcta?.trim().toLowerCase();
                if (isThisTheCorrectAnswer) {
                  optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-300';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                } else {
                  optionStyle = 'opacity-50 border-stone-200 bg-stone-50 text-stone-500';
                }
              } else if (isSelected) {
                optionStyle = 'border-sky-500 bg-sky-50 text-sky-950 font-semibold ring-2 ring-sky-300';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                >
                  <span className="text-sm sm:text-base leading-relaxed">{opt}</span>
                  {isAnswered && opt.trim().toLowerCase() === currentQ.respuesta_correcta?.trim().toLowerCase() && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Open Question Answer Field */}
        {currentQ.tipo === 'abierta' && (
          <div className="space-y-3 pt-2">
            <textarea
              rows={4}
              disabled={isAnswered}
              placeholder="Escribe tu reflexión o explicación con tus propias palabras..."
              value={openAnswerText}
              onChange={(e) => setOpenAnswerText(e.target.value)}
              className="w-full p-4 border border-stone-300 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {/* Action button (Check or Next) */}
        <div className="pt-3 flex justify-end">
          {!isAnswered ? (
            <button
              type="button"
              onClick={handleVerify}
              disabled={currentQ.tipo === 'abierta' ? !openAnswerText.trim() : !selectedOption}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-xs ${
                (currentQ.tipo === 'abierta' ? openAnswerText.trim() : selectedOption)
                  ? 'bg-sky-600 hover:bg-sky-700 text-white active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              Comprobar mi respuesta
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-2xl transition-all shadow-xs flex items-center gap-2 active:scale-95"
            >
              <span>{currentIdx < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultado final'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Pedagogical Feedback Drawer */}
      {showExplanation && (
        <div
          className={`p-5 rounded-3xl border-2 transition-all space-y-2 ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm font-heading">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>¡Excelente respuesta! Bien razonado.</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>¡Buen intento! Cada respuesta nos ayuda a aprender.</span>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm leading-relaxed">
            {currentQ.explicacion_educativa ||
              `La respuesta correcta basada en el texto es: ${currentQ.respuesta_correcta}`}
          </p>
        </div>
      )}

    </div>
  );
};
