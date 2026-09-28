import React, { useState } from 'react';
import { HelpCircle, Download, WifiOff, Globe, Smartphone, Monitor, BookOpen, X, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';

interface HelpPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpPwaModal: React.FC<HelpPwaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'instalacion' | 'exportar' | 'offline' | 'pedagogico'>('instalacion');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
              💡
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-heading">
                Centro de Ayuda y Guía de Uso
              </h2>
              <p className="text-xs text-stone-500">
                Instalación PWA, exportación como ZIP y funcionamiento sin conexión.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex bg-stone-100 p-1 rounded-2xl my-3 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('instalacion')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'instalacion' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span>Instalar App (PWA)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exportar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'exportar' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar ZIP & Ejecutar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'offline' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            <WifiOff className="w-4 h-4 text-indigo-600" />
            <span>Modo Sin Conexión</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pedagogico')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pedagogico' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Guía Pedagógica 4°</span>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          
          {/* Tab 1: PWA Installation */}
          {activeTab === 'instalacion' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950">
                <strong className="block font-bold text-sm mb-1">
                  📱 Convierte esta web en una aplicación en tu dispositivo:
                </strong>
                La aplicación cuenta con manifiesto web (PWA) y Service Worker para funcionar en pantalla completa, sin barras de navegación y con acceso directo en tu pantalla de inicio.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50">
                  <h4 className="font-bold text-stone-900 flex items-center gap-2 mb-1">
                    <Monitor className="w-4 h-4 text-amber-600" />
                    <span>En Google Chrome o Microsoft Edge (PC / Mac):</span>
                  </h4>
                  <p className="text-stone-600 text-xs">
                    Busca en la barra de direcciones el ícono de instalación (una computadora pequeña o el símbolo <strong>(+)</strong>) y haz clic en <strong>"Instalar Explora México"</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50">
                  <h4 className="font-bold text-stone-900 flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>En Android (Chrome):</span>
                  </h4>
                  <p className="text-stone-600 text-xs">
                    Toca el menú de tres puntos verticales arriba a la derecha y selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50">
                  <h4 className="font-bold text-stone-900 flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>En iPhone / iPad (Safari en iOS):</span>
                  </h4>
                  <p className="text-stone-600 text-xs">
                    Toca el botón <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba) y elige <strong>"Agregar a inicio"</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Export ZIP & Run */}
          {activeTab === 'exportar' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950">
                <strong className="block font-bold text-sm mb-1">
                  📦 Cómo exportar el proyecto completo como ZIP desde Google AI Studio:
                </strong>
                Puedes descargar todo el código fuente para guardarlo en tu computadora o ejecutarlo localmente.
              </div>

              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm pl-1">
                <li>
                  En la barra superior de <strong>Google AI Studio Build</strong>, haz clic en el menú de opciones (icono de tres puntos o menú del proyecto).
                </li>
                <li>
                  Selecciona la opción <strong>"Export as ZIP"</strong> o <strong>"Download project"</strong>.
                </li>
                <li>
                  Descomprime el archivo <code>.zip</code> descargado en una carpeta de tu computadora.
                </li>
              </ol>

              <div className="p-4 rounded-2xl bg-stone-900 text-amber-200 font-mono text-xs space-y-2">
                <div className="text-stone-400 text-[11px] font-sans flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Para ejecutar en tu computadora:</span>
                </div>
                <div># 1. Instalar dependencias</div>
                <div className="text-white">npm install</div>
                <div className="pt-1"># 2. Iniciar el servidor local</div>
                <div className="text-white">npm run dev</div>
                <div className="text-stone-400 pt-1 text-[11px] font-sans">
                  Abre en tu navegador: <strong>http://localhost:3000</strong>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Offline Mode */}
          {activeTab === 'offline' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-indigo-950">
                <strong className="block font-bold text-sm mb-1 flex items-center gap-2">
                  <WifiOff className="w-5 h-5 text-indigo-600" />
                  <span>¿Qué funciona sin conexión a internet?</span>
                </strong>
                Esta app está diseñada para aulas o zonas sin cobertura permanente.
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Totalmente disponible sin conexión:</strong> Todas tus actividades guardadas, el banco de demostración del libro, los crucigramas, sopas de letras, tarjetas y la opción de imprimir.
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Requiere conexión a internet:</strong> Solicitar a la Inteligencia Artificial (Gemini) que analice nuevos archivos o textos largos recién subidos. Si estás sin conexión, el generador pedagógico local creará la actividad automáticamente.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Pedagogical Guidelines */}
          {activeTab === 'pedagogico' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950">
                <strong className="block font-bold text-sm mb-1">
                  👩‍🏫 Recomendaciones para 4° de Primaria:
                </strong>
                En cuarto grado, los estudiantes abordan por primera vez la Historia de México desde el poblamiento temprano y Mesoamérica hasta el siglo XIX.
              </div>

              <ul className="space-y-2 text-xs text-stone-700 pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Lenguaje amigable:</strong> Todas las explicaciones evitan tecnicismos excesivos y promueven la empatía histórica.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Sin regaños:</strong> Cuando el alumno falla un ejercicio, la retroalimentación destaca el esfuerzo y explica con amabilidad el porqué de la respuesta correcta.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Privacidad garantizada:</strong> No se solicitan apellidos, correos, ubicaciones ni datos sensibles de menores.</span>
                </li>
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-800 text-white font-bold text-xs rounded-xl"
          >
            Entendido, volver a la app
          </button>
        </div>

      </div>
    </div>
  );
};
