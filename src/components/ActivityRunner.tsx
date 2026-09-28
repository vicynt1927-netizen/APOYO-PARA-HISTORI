import React from 'react';
import { ActivityItem, UserMode } from '../types';
import { ArrowLeft, Bookmark, Printer, Sparkles, BookOpen, Share2 } from 'lucide-react';
import { SummaryView } from './activities/SummaryView';
import { KeywordsView } from './activities/KeywordsView';
import { FlashcardsView } from './activities/FlashcardsView';
import { QuizView } from './activities/QuizView';
import { MatchingView } from './activities/MatchingView';
import { CrosswordView } from './activities/CrosswordView';
import { WordSearchView } from './activities/WordSearchView';
import { TimelineView } from './activities/TimelineView';
import { ConceptMapView } from './activities/ConceptMapView';
import { FillInBlanksView } from './activities/FillInBlanksView';
import { ExplainWordsView } from './activities/ExplainWordsView';
import { ReviewChallengeView } from './activities/ReviewChallengeView';
import { PrintableWorksheetView } from './activities/PrintableWorksheetView';

interface ActivityRunnerProps {
  activity: ActivityItem;
  userMode: UserMode;
  onBack: () => void;
  onSave: (activity: ActivityItem) => void;
  onComplete: (score: number, total: number) => void;
}

export const ActivityRunner: React.FC<ActivityRunnerProps> = ({
  activity,
  userMode,
  onBack,
  onSave,
  onComplete,
}) => {
  const renderActivityComponent = () => {
    switch (activity.type) {
      case 'resumen':
        return <SummaryView activity={activity} onComplete={onComplete} />;
      case 'palabras_clave':
        return <KeywordsView activity={activity} onComplete={onComplete} />;
      case 'tarjetas':
        return <FlashcardsView activity={activity} onComplete={onComplete} />;
      case 'preguntas':
        return <QuizView activity={activity} onComplete={onComplete} />;
      case 'relacionar':
        return <MatchingView activity={activity} onComplete={onComplete} />;
      case 'crucigrama':
        return <CrosswordView activity={activity} onComplete={onComplete} />;
      case 'sopa_letras':
        return <WordSearchView activity={activity} onComplete={onComplete} />;
      case 'linea_tiempo':
        return <TimelineView activity={activity} onComplete={onComplete} />;
      case 'mapa_conceptual':
        return <ConceptMapView activity={activity} onComplete={onComplete} />;
      case 'completar':
        return <FillInBlanksView activity={activity} onComplete={onComplete} />;
      case 'explica_palabras':
        return <ExplainWordsView activity={activity} onComplete={onComplete} />;
      case 'reto_repaso':
        return <ReviewChallengeView activity={activity} onComplete={onComplete} />;
      case 'imprimible':
        return (
          <PrintableWorksheetView
            activity={activity}
            userMode={userMode}
            onComplete={onComplete}
          />
        );
      default:
        return <div>Tipo de actividad no reconocido.</div>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Navigation & Source Citation */}
      <div className="no-print bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shadow-2xs"
            title="Volver al selector de actividades"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {activity.difficulty === 'basico' ? 'Nivel Básico' : activity.difficulty === 'avanzado' ? 'Nivel Reto' : 'Nivel 4° Grado'}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {activity.sourceReference.chapter || 'Capítulo de Historia'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-heading mt-0.5">
              {activity.title}
            </h2>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => onSave(activity)}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Guardar esta actividad en tu dispositivo"
          >
            <Bookmark className="w-4 h-4 text-emerald-600" />
            <span>Guardar</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Imprimir versión en papel"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Imprimir</span>
          </button>
        </div>

      </div>

      {/* Source Grounding Box */}
      <div className="no-print bg-amber-50/60 border border-amber-200/80 rounded-2xl px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Fuente verificada:</strong> {activity.sourceReference.title} • {activity.sourceReference.pages || 'Texto del alumno'}
          </span>
        </div>
        <span className="text-[11px] text-amber-700 hidden sm:inline">
          Datos respaldados en el material provisto
        </span>
      </div>

      {/* Render the specific activity */}
      <div className="mt-2">
        {renderActivityComponent()}
      </div>

    </div>
  );
};
