import React from 'react';
import { UserMode, StudentProfile } from '../types';
import { Sparkles, BookOpen, ShieldAlert, Award, Star } from 'lucide-react';

interface HeroHeaderProps {
  userMode: UserMode;
  studentProfile: StudentProfile;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({ userMode, studentProfile }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-50/50 border-b border-amber-200/80 px-4 py-6 sm:py-8 no-print">
      {/* Subtle Mexican decorative sun pattern in background */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 pointer-events-none opacity-15 select-none text-9xl">
        ☀️
      </div>
      <div className="absolute left-6 bottom-1 pointer-events-none opacity-20 select-none text-6xl">
        🌽
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-100 text-amber-900 border border-amber-300 mb-2">
            <span>🇲🇽</span>
            <span>Libro Oficial: México, grandeza y diversidad</span>
            <span className="text-amber-500">•</span>
            <span>4° Grado</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 font-heading tracking-tight leading-tight">
            {userMode === 'estudiante' ? (
              <>
                ¡Hola, <span className="text-amber-700 underline decoration-amber-300">{studentProfile.nickname}</span>! Exploremos la Historia
              </>
            ) : (
              <>
                Panel Pedagógico para <span className="text-emerald-700">Docentes y Familias</span>
              </>
            )}
          </h1>

          <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            {userMode === 'estudiante' ? (
              'Elige un capítulo, lee con atención y diviértete con crucigramas, sopas de letras, cuestionarios y retos. ¡Gana estrellas mientras descubres nuestras raíces!'
            ) : (
              'Cargue el libro o fragmentos autorizados para generar actividades de comprensión, tarjetas, esquemas y hojas imprimibles con guía de respuestas para el aula o el hogar.'
            )}
          </p>
        </div>

        {/* Quick summary stats badge */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-xs border border-amber-200 self-stretch md:self-auto justify-around">
          <div className="text-center px-3 border-r border-amber-100">
            <div className="text-xs text-stone-500 font-medium">Estrellas</div>
            <div className="text-xl font-black text-amber-600 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500 inline" />
              {studentProfile.stars}
            </div>
          </div>
          <div className="text-center px-3 border-r border-amber-100">
            <div className="text-xs text-stone-500 font-medium">Completadas</div>
            <div className="text-xl font-black text-emerald-700">{studentProfile.completedCount}</div>
          </div>
          <div className="text-center px-3">
            <div className="text-xs text-stone-500 font-medium">Racha</div>
            <div className="text-xl font-black text-orange-600 flex items-center justify-center gap-0.5">
              🔥 {studentProfile.streak}
            </div>
          </div>
        </div>

      </div>

      {/* Pedagogical Safety & No Hallucination Notice */}
      <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-amber-200/50 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
        <div className="flex items-center gap-1.5 text-stone-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span><strong>Compromiso educativo:</strong> Todo contenido se basa estrictamente en el texto provisto, sin invención de datos.</span>
        </div>
        <div className="text-stone-500">
          🔒 Seguro para menores: No se solicitan datos personales ni incluye publicidad.
        </div>
      </div>

    </div>
  );
};
