import React, { useState } from 'react';
import { ActivityItem, UserMode } from '../../types';
import { Printer, Download, Eye, CheckCircle, FileText, Share2, BookOpen } from 'lucide-react';

interface PrintableWorksheetViewProps {
  activity: ActivityItem;
  userMode: UserMode;
  onComplete: (score: number, total: number) => void;
}

export const PrintableWorksheetView: React.FC<PrintableWorksheetViewProps> = ({
  activity,
  userMode,
  onComplete,
}) => {
  const [activeSheet, setActiveSheet] = useState<'alumno' | 'docente'>(
    userMode === 'docente' ? 'docente' : 'alumno'
  );

  const data = activity.data || {};
  const exercises = data.ejercicios || [
    { numero: 1, tipo: 'Pregunta', consigna: 'Explica con tus palabras el suceso principal del capítulo:', espacio_lineas: 3 },
    { numero: 2, tipo: 'Vocabulario', consigna: 'Escribe 3 palabras clave del tema y explica su significado:', espacio_lineas: 4 },
    { numero: 3, tipo: 'Creatividad', consigna: 'Dibuja en el recuadro una escena representativa de lo aprendido:', espacio_lineas: 6 },
  ];

  const teacherGuide = data.guia_docente || {
    objetivo_aprendizaje: 'Reconocer los hitos históricos, su cronología y su impacto en la identidad mexicana.',
    respuestas_esperadas: [
      '1. Identificación precisa del contexto histórico y los actores sociales.',
      '2. Definición adecuada con vocabulario histórico comprensible para 4° de primaria.',
      '3. Dibujo que demuestre apropiación contextual del periodo histórico.',
    ],
    consejos_pedagogicos: 'Vincular el tema con la vida comunitaria actual y fomentar el respeto a los pueblos originarios.',
  };

  const handlePrint = () => {
    window.print();
    onComplete(100, 100);
  };

  const handleDownloadText = () => {
    let content = `EXPLO RA MÉXICO: GRANDEZA Y DIVERSIDAD - HOJA DE TRABAJO (4° PRIMARIA)\n`;
    content += `Tema: ${activity.sourceReference.title}\n`;
    content += `Referencia: ${activity.sourceReference.chapter || ''} ${activity.sourceReference.pages || ''}\n`;
    content += `Fecha: _____________________  Estudiante: _____________________\n\n`;
    content += `INSTRUCCIONES:\n${data.instrucciones_alumno || 'Lee con atención cada apartado y responde con letra clara.'}\n\n`;

    exercises.forEach((ex: any) => {
      content += `Ejercicio ${ex.numero}. [${ex.tipo}]\n${ex.consigna}\n\n\n\n`;
    });

    content += `\n=========================================\n`;
    content += `GUÍA DE RESPUESTAS PARA DOCENTES O FAMILIAS\n`;
    content += `Objetivo: ${teacherGuide.objetivo_aprendizaje}\n\n`;
    teacherGuide.respuestas_esperadas?.forEach((r: string, i: number) => {
      content += `${i + 1}. ${r}\n`;
    });
    content += `\nConsejos pedagógicos:\n${teacherGuide.consejos_pedagogicos}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hoja_trabajo_${activity.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Control bar (hidden during print) */}
      <div className="no-print bg-stone-100 p-4 rounded-3xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Toggle between student sheet and teacher guide */}
        <div className="flex bg-stone-200/80 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveSheet('alumno')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeSheet === 'alumno' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Hoja del Alumno (Trabajo)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet('docente')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeSheet === 'docente' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Guía de Respuestas (Docente)</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadText}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-xs flex items-center gap-1.5"
            title="Descargar como archivo de texto (.txt)"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Texto</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            title="Imprimir o guardar como PDF en el navegador"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>

      </div>

      {/* Printable Sheet Container */}
      <div className="print-page bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm max-w-4xl mx-auto text-stone-900">
        
        {/* Header of Worksheet */}
        <div className="border-b-2 border-stone-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-stone-600">
                Secretaría de Educación Pública • Historia de México (4° Grado)
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight mt-0.5">
                {data.titulo_hoja || `Hoja de Repaso: ${activity.sourceReference.title}`}
              </h1>
              <p className="text-xs text-stone-600">
                Basado en el libro: <em>México, grandeza y diversidad</em> ({activity.sourceReference.chapter || ''}, {activity.sourceReference.pages || ''})
              </p>
            </div>
            <div className="w-16 h-16 border-2 border-dashed border-stone-400 rounded-xl flex items-center justify-center text-[10px] text-stone-400 font-bold text-center p-1">
              Calificación
            </div>
          </div>

          {/* Student fill-in info row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-stone-200 text-xs">
            <div>
              <strong>Nombre del alumno(a):</strong> _______________________________
            </div>
            <div>
              <strong>Fecha:</strong> ________________
            </div>
            <div>
              <strong>Grupo:</strong> 4° _____
            </div>
          </div>
        </div>

        {/* Student View Content */}
        {activeSheet === 'alumno' && (
          <div className="space-y-6">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700">
              📌 <strong>Instrucciones:</strong> {data.instrucciones_alumno || 'Lee con atención cada apartado y responde con letra clara.'}
            </div>

            <div className="space-y-6">
              {exercises.map((ex: any, idx: number) => (
                <div key={idx} className="keep-together space-y-2">
                  <div className="text-sm font-bold text-stone-900 flex items-start gap-2">
                    <span className="w-6 h-6 rounded-md bg-stone-200 text-stone-800 text-xs flex items-center justify-center shrink-0">
                      {ex.numero}
                    </span>
                    <span>{ex.consigna}</span>
                  </div>

                  {/* Draw area or lined space */}
                  {ex.tipo?.toLowerCase().includes('dibujo') || ex.consigna?.toLowerCase().includes('dibuja') ? (
                    <div className="border-2 border-dashed border-stone-300 rounded-2xl h-44 flex items-center justify-center text-xs text-stone-400">
                      Espacio para dibujo ilustrativo
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {Array.from({ length: ex.espacio_lineas || 3 }).map((_, l) => (
                        <div key={l} className="border-b border-stone-300 h-6 w-full" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher / Family Answer Guide Content */}
        {activeSheet === 'docente' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-1">
                Guía de Respuestas y Sugerencias Pedagógicas para Docentes y Familias
              </h3>
              <p className="text-xs text-emerald-800">
                Material de apoyo para la revisión formativa y retroalimentación positiva del aprendizaje.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs sm:text-sm">
                <strong className="block text-stone-900 font-bold mb-1">Objetivo del aprendizaje:</strong>
                <p className="text-stone-700 leading-relaxed">
                  {teacherGuide.objetivo_aprendizaje}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <strong className="block text-stone-900 font-bold text-xs sm:text-sm">
                  Criterios y respuestas esperadas:
                </strong>
                <div className="space-y-2 text-xs sm:text-sm text-stone-700">
                  {teacherGuide.respuestas_esperadas?.map((resp: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 shrink-0">#{idx + 1}</span>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {teacherGuide.consejos_pedagogicos && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-xs sm:text-sm text-amber-950">
                  <strong className="block text-amber-900 font-bold mb-1">Consejo pedagógico:</strong>
                  <p className="leading-relaxed">{teacherGuide.consejos_pedagogicos}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-stone-300 flex items-center justify-between text-[10px] text-stone-500">
          <span>Explora México: Grandeza y Diversidad • Aplicación educativa para 4° de primaria</span>
          <span>Material educativo gratuito y de libre uso escolar</span>
        </div>

      </div>

    </div>
  );
};
