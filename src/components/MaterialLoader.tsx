import React, { useState, useRef } from 'react';
import { MaterialSource } from '../types';
import { DEMO_MATERIALS } from '../data/demoMaterial';
import { extractTextFromFile, ExtractedDocument } from '../utils/fileExtractor';
import { BookOpen, Upload, FileText, CheckCircle2, AlertTriangle, Layers, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

interface MaterialLoaderProps {
  currentMaterial: MaterialSource | null;
  onSelectMaterial: (material: MaterialSource) => void;
  onOpenDriveAssistant?: () => void;
}

export const MaterialLoader: React.FC<MaterialLoaderProps> = ({ currentMaterial, onSelectMaterial, onOpenDriveAssistant }) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'paste' | 'upload'>('demo');
  
  // Paste text state
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedChapter, setPastedChapter] = useState('');
  const [pastedPages, setPastedPages] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  
  // Upload file state
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocument | null>(null);
  const [selectedChunkId, setSelectedChunkId] = useState<number | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectDemo = (demo: MaterialSource) => {
    onSelectMaterial(demo);
  };

  const handleApplyPasted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedContent.trim()) {
      alert('Por favor escribe o pega un fragmento de texto.');
      return;
    }

    const words = pastedContent.trim().split(/\s+/).filter(Boolean).length;
    const newMaterial: MaterialSource = {
      id: `custom-paste-${Date.now()}`,
      title: pastedTitle.trim() || 'Fragmento de Historia de México',
      chapter: pastedChapter.trim() || undefined,
      pages: pastedPages.trim() || undefined,
      content: pastedContent.trim(),
      wordCount: words,
      isDemo: false,
      dateAdded: new Date().toISOString(),
    };

    onSelectMaterial(newMaterial);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsProcessingFile(true);

    try {
      const doc = await extractTextFromFile(file);
      setExtractedDoc(doc);

      // Default: if chunks exist and total words > 600, let user choose chunk or whole doc
      if (doc.chunks.length > 1) {
        setSelectedChunkId(doc.chunks[0].id);
        const chunk = doc.chunks[0];
        onSelectMaterial({
          id: `file-${Date.now()}-chunk-${chunk.id}`,
          title: `${doc.fileName} - ${chunk.title}`,
          chapter: chunk.title,
          pages: doc.pageCount > 1 ? `Página ${chunk.id} de ${doc.pageCount}` : undefined,
          content: chunk.text,
          wordCount: chunk.wordCount,
          isDemo: false,
          dateAdded: new Date().toISOString(),
        });
      } else {
        const words = doc.text.split(/\s+/).filter(Boolean).length;
        onSelectMaterial({
          id: `file-${Date.now()}`,
          title: doc.fileName.replace(/\.[^/.]+$/, ''),
          pages: doc.pageCount > 1 ? `1 - ${doc.pageCount}` : undefined,
          content: doc.text,
          wordCount: words,
          isDemo: false,
          dateAdded: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error al procesar el archivo seleccionado.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectChunk = (chunkId: number | 'all') => {
    if (!extractedDoc) return;
    setSelectedChunkId(chunkId);

    if (chunkId === 'all') {
      const words = extractedDoc.text.split(/\s+/).filter(Boolean).length;
      onSelectMaterial({
        id: `file-${Date.now()}-all`,
        title: extractedDoc.fileName.replace(/\.[^/.]+$/, ''),
        pages: extractedDoc.pageCount > 1 ? `1 - ${extractedDoc.pageCount}` : undefined,
        content: extractedDoc.text,
        wordCount: words,
        isDemo: false,
        dateAdded: new Date().toISOString(),
      });
    } else {
      const chunk = extractedDoc.chunks.find((c) => c.id === chunkId);
      if (chunk) {
        onSelectMaterial({
          id: `file-${Date.now()}-chunk-${chunk.id}`,
          title: `${extractedDoc.fileName} - ${chunk.title}`,
          chapter: chunk.title,
          pages: extractedDoc.pageCount > 1 ? `Página ${chunk.id} de ${extractedDoc.pageCount}` : undefined,
          content: chunk.text,
          wordCount: chunk.wordCount,
          isDemo: false,
          dateAdded: new Date().toISOString(),
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-stone-200">
      
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-3">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Paso 1 de 2
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-2 font-heading">
            Selecciona o Carga el Contenido Histórico
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Las actividades se fundamentarán únicamente en este texto, indicando capítulo y páginas.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Capítulos de Ejemplo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Pegar Fragmento</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Cargar Archivo</span>
          </button>
          {onOpenDriveAssistant && (
            <button
              type="button"
              onClick={onOpenDriveAssistant}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 active:scale-95"
              title="Explorar archivos de Google Drive con el Asistente de IA"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Google Drive IA</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Demo Excerpts */}
      {activeTab === 'demo' && (
        <div className="mt-5 space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
            <span className="text-xl">💡</span>
            <span>
              <strong>Aviso de demostración:</strong> Estos fragmentos son resúmenes didácticos de muestra adaptados para cuarto de primaria, identificados claramente como ejemplos para probar la app sin necesidad de subir archivos.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {DEMO_MATERIALS.map((demo) => {
              const isSelected = currentMaterial?.id === demo.id;
              return (
                <div
                  key={demo.id}
                  onClick={() => handleSelectDemo(demo)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all border-2 text-left relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-300/40'
                      : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {demo.chapter}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">{demo.pages}</span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 font-heading leading-snug">
                      {demo.title}
                    </h3>

                    <p className="mt-2 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {demo.content}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/50 flex items-center justify-between text-xs">
                    <span className="text-stone-400">{demo.wordCount} palabras</span>
                    <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-amber-700' : 'text-stone-500'}`}>
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Seleccionado
                        </>
                      ) : (
                        'Elegir este tema →'
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Paste Custom Text */}
      {activeTab === 'paste' && (
        <form onSubmit={handleApplyPasted} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Título del tema o lectura
              </label>
              <input
                type="text"
                placeholder="Ej. La Guerra de Independencia"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Capítulo o Apartado
              </label>
              <input
                type="text"
                placeholder="Ej. Capítulo 14 o Apartado 2"
                value={pastedChapter}
                onChange={(e) => setPastedChapter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Páginas del libro
              </label>
              <input
                type="text"
                placeholder="Ej. Páginas 210-215"
                value={pastedPages}
                onChange={(e) => setPastedPages(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Texto o fragmento del libro:
              </label>
              <span className="text-xs text-stone-400">
                {pastedContent.trim().split(/\s+/).filter(Boolean).length} palabras
              </span>
            </div>
            <textarea
              rows={6}
              placeholder="Pega aquí el fragmento del libro México, grandeza y diversidad o tus notas de clase de Historia..."
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              className="w-full p-3.5 text-sm border border-stone-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setPastedContent('');
                setPastedTitle('');
                setPastedChapter('');
                setPastedPages('');
              }}
              className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              Limpiar texto
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Usar este texto para actividades</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Upload PDF / Text file */}
      {activeTab === 'upload' && (
        <div className="mt-5 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-3xl p-8 text-center cursor-pointer bg-stone-50 hover:bg-amber-50/40 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md"
              className="hidden"
            />
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-800 font-heading">
              Sube tu archivo PDF o de texto (.pdf, .txt, .md)
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Haz clic o arrastra tu archivo aquí. Si el libro o documento es extenso, te ofreceremos explorarlo por capítulos o páginas.
            </p>
            {isProcessingFile && (
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extrayendo texto del archivo...</span>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Error al procesar el archivo:</strong> {uploadError}
              </div>
            </div>
          )}

          {/* If multi-chapter or large document was parsed, offer chunk selector */}
          {extractedDoc && extractedDoc.chunks.length > 1 && (
            <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                    Documento extenso detectado ({extractedDoc.chunks.length} partes/páginas)
                  </span>
                </div>
                <span className="text-xs text-stone-500">{extractedDoc.fileName}</span>
              </div>
              <p className="text-xs text-stone-600 mb-3">
                Para que las actividades sean ágiles y precisas para 4° de primaria, selecciona una sección específica:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                <button
                  type="button"
                  onClick={() => handleSelectChunk('all')}
                  className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    selectedChunkId === 'all'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                  }`}
                >
                  📄 Documento completo ({extractedDoc.text.split(/\s+/).filter(Boolean).length} palabras)
                </button>
                {extractedDoc.chunks.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectChunk(ch.id)}
                    className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedChunkId === ch.id
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    🔖 {ch.title} ({ch.wordCount} palabras)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Currently Selected Material Confirmation Card */}
      {currentMaterial && (
        <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              ✓
            </div>
            <div>
              <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>Material seleccionado listo</span>
                {currentMaterial.isDemo && (
                  <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full">
                    Ejemplo
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-stone-900 font-heading">
                {currentMaterial.title}
              </div>
              <div className="text-xs text-stone-600">
                {currentMaterial.chapter || 'Tema general'} • {currentMaterial.pages || 'Fragmento'} • {currentMaterial.wordCount} palabras
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-300">
            Listo para el Paso 2 👇
          </div>
        </div>
      )}

    </div>
  );
};
