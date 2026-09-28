import React, { useState, useEffect } from 'react';
import { UserMode, StudentProfile } from '../types';
import { Volume2, VolumeX, Wifi, WifiOff, Sparkles, User, HelpCircle, Bookmark, PlusCircle, ShieldCheck } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../utils/soundEffects';

interface NavbarProps {
  userMode: UserMode;
  onToggleUserMode: (mode: UserMode) => void;
  studentProfile: StudentProfile;
  onOpenAvatarModal: () => void;
  onOpenSavedModal: () => void;
  onOpenHelpModal: () => void;
  onNewActivity: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userMode,
  onToggleUserMode,
  studentProfile,
  onOpenAvatarModal,
  onOpenSavedModal,
  onOpenHelpModal,
  onNewActivity,
  savedCount,
}) => {
  const [online, setOnline] = useState<boolean>(true);
  const [sound, setSound] = useState<boolean>(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSound = () => {
    const newState = !sound;
    setSound(newState);
    setSoundEnabled(newState);
  };

  const getAvatarEmoji = (avatar: string) => {
    switch (avatar) {
      case 'quetzal': return '🦜';
      case 'jaguar': return '🐆';
      case 'ajolote': return '🦎';
      case 'colibri': return '🌸';
      case 'mariposa': return '🦋';
      case 'aguila': return '🦅';
      default: return '🇲🇽';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-amber-700 via-orange-700 to-emerald-800 text-white shadow-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <button 
            onClick={onNewActivity}
            className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-amber-300 rounded-xl p-1"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
              🏛️
            </div>
            <div>
              <div className="font-heading text-lg sm:text-xl font-bold tracking-tight text-amber-100 leading-tight">
                Explora México
              </div>
              <div className="text-xs text-amber-200 font-medium hidden sm:block">
                Grandeza y Diversidad • 4° de Primaria
              </div>
            </div>
          </button>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Student vs Teacher Switch */}
            <div className="bg-black/25 backdrop-blur-xs p-1 rounded-full flex items-center border border-white/20">
              <button
                type="button"
                onClick={() => onToggleUserMode('estudiante')}
                className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                  userMode === 'estudiante'
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : 'text-amber-100 hover:text-white'
                }`}
                title="Modo interactivo y amigable para el estudiante"
              >
                <span>🎒</span>
                <span className="hidden md:inline">Estudiante</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleUserMode('docente')}
                className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                  userMode === 'docente'
                    ? 'bg-emerald-400 text-emerald-950 shadow-sm'
                    : 'text-emerald-100 hover:text-white'
                }`}
                title="Modo pedagógico para docentes o familias con guías y respuestas"
              >
                <span>👩‍🏫</span>
                <span className="hidden md:inline">Docente o Familia</span>
              </button>
            </div>

            {/* New activity button */}
            <button
              onClick={onNewActivity}
              className="bg-white/15 hover:bg-white/25 text-white font-medium text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors"
              title="Crear o elegir nuevo tema de repaso"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span className="hidden lg:inline">Nuevo Repaso</span>
            </button>

            {/* Saved activities button with counter */}
            <button
              onClick={onOpenSavedModal}
              className="relative bg-white/15 hover:bg-white/25 text-white font-medium text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors"
              title="Ver mis actividades guardadas"
            >
              <Bookmark className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Guardadas</span>
              {savedCount > 0 && (
                <span className="bg-amber-400 text-amber-950 font-bold text-xs px-1.5 py-0.5 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 transition-colors"
              title={sound ? 'Desactivar sonido' : 'Activar sonido'}
              aria-label="Alternar sonido"
            >
              {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-300" />}
            </button>

            {/* Network indicator */}
            <div
              className={`p-2 rounded-xl flex items-center justify-center text-xs font-medium cursor-help ${
                online
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                  : 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
              }`}
              title={
                online
                  ? 'Conexión a internet activa: puedes generar nuevas actividades con IA.'
                  : 'Modo sin conexión activo: puedes jugar y consultar tus actividades guardadas.'
              }
            >
              {online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 animate-pulse" />}
            </div>

            {/* Help & PWA Install */}
            <button
              onClick={onOpenHelpModal}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 transition-colors"
              title="Ayuda, instalación PWA y exportar ZIP"
              aria-label="Ayuda e Instalación"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Student Avatar & Stars Badge */}
            <button
              onClick={onOpenAvatarModal}
              className="flex items-center gap-1.5 bg-amber-300 text-amber-950 px-2.5 py-1 rounded-full text-xs font-bold hover:bg-amber-200 transition-transform active:scale-95 shadow-xs"
              title="Cambiar avatar o alias del explorador"
            >
              <span className="text-base">{getAvatarEmoji(studentProfile.avatar)}</span>
              <span className="hidden xl:inline max-w-[80px] truncate">{studentProfile.nickname}</span>
              <span className="bg-amber-900/15 px-1.5 py-0.5 rounded-full text-xs flex items-center gap-0.5">
                ⭐ {studentProfile.stars}
              </span>
            </button>

          </div>

        </div>
      </div>
    </nav>
  );
};
