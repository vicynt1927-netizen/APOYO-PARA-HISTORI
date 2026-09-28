import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { Volume2, VolumeX, Copy, Check, BookOpen, Lightbulb, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/storage';

interface SummaryViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ activity, onComplete }) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readSections, setReadSections] = useState<number[]>([]);

  const data = activity.data || {};
  const ideas = data.ideas_principales || [];
  const narrative = data.resumen_narrativo || '';
  const curiousFacts = data.datos_curiosos || [];

  const handleVoicePlay = () => {
    if (isPlayingVoice) {
      stopSpeaking();
      setIsPlayingVoice(false);
    } else {
      const fullTextToRead = `${activity.title}. ${ideas.join('. ')}. ${narrative}`;
      setIsPlayingVoice(true);
      speakText(fullTextToRead, () => setIsPlayingVoice(false));
    }
  };

  const handleCopy = () => {
    const textToCopy = `${activity.title}\n\nIDEAS PRINCIPALES:\n- ${ideas.join('\n- ')}\n\nRESUMEN:\n${narrative}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleSectionRead = (idx: number) => {
    if (!readSections.includes(idx)) {
      const updated = [...readSections, idx];
      setReadSections(updated);
      if (updated.length >= ideas.length && !activity.completed) {
        onComplete(100, 100);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <span className="text-xs sm:text-sm font-bold text-amber-900">
            Resumen comprensivo para 4° de primaria
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoicePlay}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPlayingVoice
                ? 'bg-amber-600 text-white shadow-xs animate-pulse'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
            }`}
            title="Escuchar resumen con voz clara en español"
          >
            {isPlayingVoice ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
            <span>{isPlayingVoice ? 'Detener lectura' : 'Escuchar en voz alta'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-stone-700 border border-stone-200 hover:bg-stone-100 flex items-center gap-1.5"
            title="Copiar texto para tus tareas o cuaderno"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Main Ideas Checklist */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-xs">
        <h3 className="text-lg font-bold text-stone-900 font-heading flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Ideas Principales para tu Cuaderno</span>
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Haz clic en cada idea conforme la vayas leyendo y comprendiendo:
        </p>

        <div className="space-y-3">
          {ideas.map((idea: string, idx: number) => {
            const isRead = readSections.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleSectionRead(idx)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  isRead
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-stone-200 hover:border-amber-300 bg-stone-50/40'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isRead ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {isRead ? '✓' : idx + 1}
                </div>
                <div className={`text-sm leading-relaxed ${isRead ? 'text-emerald-950 font-medium' : 'text-stone-800'}`}>
                  {idea}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narrative Synthesis */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-xs">
        <h3 className="text-lg font-bold text-stone-900 font-heading mb-3">
          📖 Relato Histórico Sintetizado
        </h3>
        <div className="prose prose-stone text-stone-700 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line bg-amber-50/30 p-4 rounded-2xl border border-amber-100">
          {narrative}
        </div>
      </div>

      {/* Curious facts / Sabías que */}
      {curiousFacts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-5 border border-orange-200">
          <h4 className="text-sm font-bold text-orange-900 uppercase tracking-wide flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>¿Sabías que...?</span>
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
            {curiousFacts.map((fact: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => onComplete(100, 100)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>¡Leído y comprendido! Guardar avance</span>
        </button>
      </div>

    </div>
  );
};
