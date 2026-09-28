import React, { useState } from 'react';
import { ActivityType, Difficulty, MaterialSource, UserMode } from '../types';
import { ACTIVITY_METADATA_LIST } from '../data/demoMaterial';
import {
  BookOpen,
  Key,
  Layers,
  HelpCircle,
  GitCompare,
  Grid,
  Search,
  Clock,
  Network,
  FileEdit,
  MessageSquare,
  Trophy,
  Printer,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ActivitySelectorProps {
  currentMaterial: MaterialSource | null;
  onGenerate: (type: ActivityType, difficulty: Difficulty) => void;
  isGenerating: boolean;
  userMode: UserMode;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  currentMaterial,
  onGenerate,
  isGenerating,
  userMode,
}) => {
  const [selectedType, setSelectedType] = useState<ActivityType>('tarjetas');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermedio');
  const [filterCategory, setFilterCategory] = useState<'todos' | 'comprension' | 'juego' | 'evaluacion' | 'docente'>('todos');

  // Friendly icons map
  const renderIcon = (id: ActivityType) => {
    const props = { className: 'w-6 h-6 shrink-0' };
    switch (id) {
      case 'resumen': return <BookOpen {...props} className="w-6 h-6 text-amber-600" />;
      case 'palabras_clave': return <Key {...props} className="w-6 h-6 text-emerald-600" />;
      case 'tarjetas': return <Layers {...props} className="w-6 h-6 text-indigo-600" />;
      case 'preguntas': return <HelpCircle {...props} className="w-6 h-6 text-sky-600" />;
      case 'relacionar': return <GitCompare {...props} className="w-6 h-6 text-purple-600" />;
      case 'crucigrama': return <Grid {...props} className="w-6 h-6 text-orange-600" />;
      case 'sopa_letras': return <Search {...props} className="w-6 h-6 text-teal-600" />;
      case 'linea_tiempo': return <Clock {...props} className="w-6 h-6 text-rose-600" />;
      case 'mapa_conceptual': return <Network {...props} className="w-6 h-6 text-blue-600" />;
      case 'completar': return <FileEdit {...props} className="w-6 h-6 text-yellow-600" />;
      case 'explica_palabras': return <MessageSquare {...props} className="w-6 h-6 text-lime-600" />;
      case 'reto_repaso': return <Trophy {...props} className="w-6 h-6 text-amber-500" />;
      case 'imprimible': return <Printer {...props} className="w-6 h-6 text-stone-700" />;
    }
  };

  const filteredActivities = ACTIVITY_METADATA_LIST.filter((act) => {
    if (filterCategory === 'todos') return true;
    return act.category === filterCategory;
  });

  const handleStart = () => {
    if (!currentMaterial) return;
    onGenerate(selectedType, difficulty);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-stone-200 mt-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Paso 2 de 2
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-2 font-heading">
            Elige la Actividad de Repaso
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            13 tipos de ejercicios interactivos diseñados para cuarto de primaria.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setFilterCategory('todos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterCategory === 'todos' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Todas (13)
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('comprension')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterCategory === 'comprension' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Comprensión
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('juego')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterCategory === 'juego' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Juegos y Retos
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('evaluacion')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterCategory === 'evaluacion' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Cuestionarios
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('docente')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterCategory === 'docente' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Docente / Imprimible
          </button>
        </div>
      </div>

      {/* Difficulty and Grade Selector Bar */}
      <div className="my-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm">
            4°
          </div>
          <div>
            <div className="text-xs font-bold text-stone-700">Grado Escolar: Cuarto de Primaria</div>
            <div className="text-xs text-stone-500">Vocabulario y conceptos calibrados para 9 a 10 años</div>
          </div>
        </div>

        {/* Difficulty Pill buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-600 mr-1">Dificultad:</span>
          <button
            type="button"
            onClick={() => setDifficulty('basico')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              difficulty === 'basico'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            🌱 Básico (Fácil)
          </button>
          <button
            type="button"
            onClick={() => setDifficulty('intermedio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              difficulty === 'intermedio'
                ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            ⭐ Intermedio (Estándar 4°)
          </button>
          <button
            type="button"
            onClick={() => setDifficulty('avanzado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              difficulty === 'avanzado'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            🔥 Avanzado (Reto)
          </button>
        </div>
      </div>

      {/* Grid of 13 Activities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {filteredActivities.map((act) => {
          const isSelected = selectedType === act.id;
          return (
            <div
              key={act.id}
              onClick={() => setSelectedType(act.id as ActivityType)}
              className={`cursor-pointer rounded-2xl p-4 transition-all border-2 text-left relative flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-600 bg-amber-50/60 shadow-md ring-2 ring-amber-300/40'
                  : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-white shadow-xs border border-stone-100">
                    {renderIcon(act.id as ActivityType)}
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${act.badgeColor}`}>
                    {act.category === 'comprension'
                      ? 'Comprensión'
                      : act.category === 'juego'
                      ? 'Juego interactivo'
                      : act.category === 'evaluacion'
                      ? 'Evaluación'
                      : 'Docente / Familia'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 font-heading leading-tight">
                  {act.title}
                </h3>

                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-medium">4° de Primaria</span>
                <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-amber-800' : 'text-stone-400'}`}>
                  {isSelected ? '✓ Seleccionada' : 'Elegir'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start generation CTA footer */}
      <div className="mt-7 pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-500">
          {currentMaterial ? (
            <span>
              Actividad vinculada a: <strong>{currentMaterial.title}</strong> ({currentMaterial.chapter || 'Capítulo general'})
            </span>
          ) : (
            <span className="text-rose-600 font-bold">
              ⚠️ Selecciona un capítulo o texto en el Paso 1 antes de continuar.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={!currentMaterial || isGenerating}
          className={`w-full sm:w-auto px-7 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all ${
            !currentMaterial || isGenerating
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white active:scale-95'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generando actividad basada en el libro...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Comenzar Actividad Ahora</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
