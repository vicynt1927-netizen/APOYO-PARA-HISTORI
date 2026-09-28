import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { RotateCw, CheckCircle, RefreshCw, Volume2, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { playCorrectSound, playGentleTryAgainSound } from '../../utils/soundEffects';
import { speakText } from '../../utils/storage';

interface FlashcardsViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const cards = data.tarjetas || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);
  const [reviewCards, setReviewCards] = useState<number[]>([]);

  if (cards.length === 0) {
    return (
      <div className="p-8 text-center text-stone-500 bg-white rounded-3xl border border-stone-200">
        No hay tarjetas generadas para este tema.
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkMastered = () => {
    playCorrectSound();
    if (!masteredCards.includes(currentIndex)) {
      setMasteredCards([...masteredCards, currentIndex]);
      setReviewCards(reviewCards.filter((c) => c !== currentIndex));
    }
    nextCard();
  };

  const handleMarkReview = () => {
    playGentleTryAgainSound();
    if (!reviewCards.includes(currentIndex)) {
      setReviewCards([...reviewCards, currentIndex]);
      setMasteredCards(masteredCards.filter((c) => c !== currentIndex));
    }
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all cards
      const totalScore = Math.max(1, masteredCards.length);
      onComplete(totalScore, cards.length);
    }
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleVoice = (text: string) => {
    speakText(text);
  };

  const progressPercentage = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Progress & Counter */}
      <div className="flex items-center justify-between text-xs font-bold text-stone-600 bg-stone-100 p-3 rounded-2xl">
        <span>Tarjeta {currentIndex + 1} de {cards.length}</span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700">✓ Sabidas: {masteredCards.length}</span>
          <span className="text-amber-700">↺ Por repasar: {reviewCards.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-amber-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="cursor-pointer min-h-[300px] sm:min-h-[340px] perspective-1000 select-none"
      >
        <div
          className={`relative w-full h-full min-h-[300px] sm:min-h-[340px] rounded-3xl p-6 sm:p-8 transition-transform duration-500 shadow-md border-2 flex flex-col justify-between ${
            isFlipped
              ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-emerald-400'
              : 'bg-gradient-to-br from-amber-50 via-white to-amber-100/40 border-amber-300 hover:border-amber-400'
          }`}
        >
          {/* Card Top Label */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                isFlipped ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {isFlipped ? '💡 Respuesta / Significado' : '❓ Pregunta / Reto'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleVoice(isFlipped ? currentCard.reverso : currentCard.anverso);
              }}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-stone-600 shadow-xs"
              title="Escuchar texto"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
            </button>
          </div>

          {/* Main Card Content */}
          <div className="my-auto py-4 text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-stone-900 leading-snug">
              {isFlipped ? currentCard.reverso : currentCard.anverso}
            </div>

            {/* Hint if on question side */}
            {!isFlipped && currentCard.pista_amistosa && (
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-100/60 px-3 py-1 rounded-full">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Pista: {currentCard.pista_amistosa}</span>
              </div>
            )}
          </div>

          {/* Card Footer prompt */}
          <div className="text-center text-xs text-stone-400 font-medium flex items-center justify-center gap-1.5 pt-2 border-t border-stone-200/50">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Toca o haz clic en la tarjeta para voltearla</span>
          </div>
        </div>
      </div>

      {/* Card Evaluation Buttons (Show after flipped or always available) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="p-3 rounded-2xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
            title="Tarjeta anterior"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleFlip}
            className="px-4 py-3 rounded-2xl border border-stone-300 bg-white text-stone-700 font-bold text-xs hover:bg-stone-50 shadow-xs flex items-center gap-1.5"
          >
            <RotateCw className="w-4 h-4" />
            <span>Voltear</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleMarkReview}
            className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Repasar luego</span>
          </button>
          <button
            type="button"
            onClick={handleMarkMastered}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>¡Ya me la sé!</span>
          </button>
        </div>
      </div>

      {/* Done summary indicator */}
      {currentIndex === cards.length - 1 && isFlipped && (
        <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <p className="text-sm font-bold text-emerald-900">
            ¡Llegaste a la última tarjeta!
          </p>
          <button
            type="button"
            onClick={() => onComplete(masteredCards.length, cards.length)}
            className="mt-2 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            Finalizar y registrar avance
          </button>
        </div>
      )}

    </div>
  );
};
