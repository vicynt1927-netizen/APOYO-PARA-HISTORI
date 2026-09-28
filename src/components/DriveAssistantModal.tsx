import React, { useState, useEffect, useRef } from 'react';
import { MaterialSource } from '../types';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  listDriveFiles,
  readDriveFileContent,
  askDriveAssistant,
  DriveFileItem,
  getAccessToken,
} from '../services/googleDrive';
import { User } from 'firebase/auth';
import {
  X,
  Search,
  FileText,
  Sparkles,
  Bot,
  Send,
  Volume2,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  LogOut,
  FolderOpen,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { speakText } from '../utils/storage';

interface DriveAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadMaterialFromDrive: (material: MaterialSource) => void;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  keyEntities?: string[];
  suggestedQuestions?: string[];
}

export const DriveAssistantModal: React.FC<DriveAssistantModalProps> = ({
  isOpen,
  onClose,
  onLoadMaterialFromDrive,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Files state
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoadingFileContent, setIsLoadingFileContent] = useState(false);

  // Chat Assistant state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Check auth status
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setIsAuthenticated(true);
        fetchFiles();
      },
      () => {
        setUser(null);
        setIsAuthenticated(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAskingAI]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      setUser(res.user);
      setIsAuthenticated(true);
      await fetchFiles();
    } catch (err: any) {
      setAuthError(err?.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setUser(null);
    setIsAuthenticated(false);
    setFiles([]);
    setSelectedFile(null);
    setExtractedText('');
    setChatMessages([]);
  };

  const fetchFiles = async (query: string = '') => {
    setIsLoadingFiles(true);
    try {
      const driveFiles = await listDriveFiles(query);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error listando archivos de Drive:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(searchTerm);
  };

  const handleSelectFile = async (file: DriveFileItem) => {
    setSelectedFile(file);
    setIsLoadingFileContent(true);
    setChatMessages([]);

    try {
      const { text, wordCount, pageCount } = await readDriveFileContent(
        file.id,
        file.mimeType,
        file.name
      );
      setExtractedText(text);

      // Initial analysis by AI Assistant
      setIsAskingAI(true);
      const res = await askDriveAssistant(
        text,
        file.name,
        'Analiza este archivo de Google Drive. Preséntate como Quetzalito el asistente de historia para 4° de primaria, resume en 2 párrafos claros de qué trata y menciona qué personajes o lugares históricos importantes incluye.'
      );

      setChatMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: res.answer,
          keyEntities: res.keyEntities,
          suggestedQuestions: res.suggestedQuestions,
        },
      ]);
    } catch (err: any) {
      setChatMessages([
        {
          id: 'error',
          sender: 'assistant',
          text: `Uy, ocurrió un detalle al leer el archivo: ${err?.message || 'No se pudo extraer el texto'}. Puedes intentar con otro documento de tu Drive.`,
        },
      ]);
    } finally {
      setIsLoadingFileContent(false);
      setIsAskingAI(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const question = (customPrompt || inputQuestion).trim();
    if (!question || !extractedText || isAskingAI) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAskingAI(true);

    try {
      // Build previous context
      const history = chatMessages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }],
      }));

      const aiResponse = await askDriveAssistant(
        extractedText,
        selectedFile?.name || 'Archivo de Drive',
        question,
        history
      );

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiResponse.answer,
        keyEntities: aiResponse.keyEntities,
        suggestedQuestions: aiResponse.suggestedQuestions,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Disculpa, tuve un tropiezo al consultar la respuesta. ¿Podrías intentar preguntarme de nuevo?',
        },
      ]);
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleUseFileForActivities = () => {
    if (!selectedFile || !extractedText) return;

    const words = extractedText.split(/\s+/).filter(Boolean).length;
    const material: MaterialSource = {
      id: `drive-${selectedFile.id}`,
      title: selectedFile.name.replace(/\.[^/.]+$/, ''),
      chapter: 'Archivo de Google Drive',
      pages: 'Google Drive',
      content: extractedText,
      wordCount: words,
      isDemo: false,
      dateAdded: new Date().toISOString(),
    };

    onLoadMaterialFromDrive(material);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-700 via-orange-700 to-emerald-800 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                  Google Drive + Asistente IA
                </span>
                <span className="text-xs text-amber-200 hidden sm:inline">Quetzalito Tutor</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-heading">
                Explorar Archivos de Drive con Inteligencia Artificial
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Banner & Account Bar */}
        <div className="px-5 py-2.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-6 h-6 rounded-full border border-stone-300"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
              <span className="font-semibold text-stone-800">
                Conectado como: <strong>{user.displayName || user.email}</strong>
              </span>
            </div>
          ) : (
            <span className="text-stone-600 font-medium">
              Conecta tu Google Drive para que el asistente de IA explore tus lecturas y documentos escolares.
            </span>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-stone-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar Drive</span>
            </button>
          ) : null}
        </div>

        {/* Modal Main Content */}
        {!isAuthenticated ? (
          /* Non-authenticated View: Official Sign In with Google */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center text-4xl shadow-inner">
              📁
            </div>
            
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-bold font-heading text-stone-900">
                Conecta tu Google Drive
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Selecciona tus archivos PDF o Google Docs de Historia para que nuestro asistente de inteligencia artificial pedagógico te explique dudas, resuma temas y genere actividades interactivas para 4° de primaria.
              </p>
            </div>

            {/* Official Google Sign-in Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{isLoggingIn ? 'Conectando con Google...' : 'Iniciar sesión con Google'}</span>
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 max-w-sm">
                {authError}
              </div>
            )}

            <div className="text-xs text-stone-400 max-w-sm">
              🔒 <strong>Permiso de solo lectura:</strong> Tu aplicación solo leerá los documentos que tú selecciones, sin modificar ni borrar nada en tu Google Drive.
            </div>
          </div>
        ) : (
          /* Authenticated Two-Pane Layout: Left File Explorer / Right AI Chat */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Pane: Drive File Browser (35% width on desktop) */}
            <div className="w-full md:w-5/12 border-r border-stone-200 flex flex-col bg-stone-50/60">
              
              {/* Search file bar */}
              <form onSubmit={handleSearchSubmit} className="p-3 border-b border-stone-200 flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar en Drive..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-900"
                >
                  Buscar
                </button>
              </form>

              {/* Files List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {isLoadingFiles ? (
                  <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-600" />
                    <span>Consultando tus archivos de Google Drive...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 space-y-2">
                    <FolderOpen className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="font-semibold text-stone-600">No se encontraron archivos compatibles.</p>
                    <p>Sube a tu Drive archivos PDF o Google Docs sobre Historia de México para explorarlos aquí.</p>
                  </div>
                ) : (
                  files.map((file) => {
                    const isSelected = selectedFile?.id === file.id;
                    const isPdf = file.mimeType === 'application/pdf';
                    const isDoc = file.mimeType === 'application/vnd.google-apps.document';

                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => handleSelectFile(file)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-100/70 border-amber-400 text-amber-950 shadow-2xs ring-1 ring-amber-300'
                            : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-stone-100 text-base shrink-0">
                          {isPdf ? '📄' : isDoc ? '📝' : '📁'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold truncate leading-tight">
                            {file.name}
                          </h4>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            {isPdf ? 'Documento PDF' : isDoc ? 'Google Doc' : 'Archivo de texto'}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Bottom Left: Re-fetch */}
              <div className="p-2 border-t border-stone-200 flex justify-between items-center text-[11px] text-stone-500">
                <span>{files.length} archivos encontrados</span>
                <button
                  type="button"
                  onClick={() => fetchFiles(searchTerm)}
                  className="text-amber-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Actualizar lista</span>
                </button>
              </div>

            </div>

            {/* Right Pane: AI Assistant Chat & Explorer */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              
              {!selectedFile ? (
                /* No file selected state */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl">
                    👈
                  </div>
                  <h3 className="text-base font-bold text-stone-700 font-heading">
                    Elige un archivo de la lista izquierda
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm">
                    Toca cualquier documento o PDF de tu Google Drive para que <strong>Quetzalito</strong> lo analice y responda tus preguntas.
                  </p>
                </div>
              ) : (
                /* File selected & Interactive AI Assistant */
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* File Header Bar inside Right Pane */}
                  <div className="p-3 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">📄</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate font-heading">
                          {selectedFile.name}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {extractedText.split(/\s+/).filter(Boolean).length} palabras extraídas
                        </div>
                      </div>
                    </div>

                    {/* Quick Button: Load into Activity Generator */}
                    <button
                      type="button"
                      onClick={handleUseFileForActivities}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                      title="Usar este archivo de Drive en los 13 tipos de actividades interactivas"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Generar actividades con este archivo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Chat Messages Log */}
                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoadingFileContent && (
                      <div className="p-6 text-center text-xs text-amber-800 space-y-2">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-600" />
                        <span>Leyendo archivo de Google Drive y preparando a Quetzalito...</span>
                      </div>
                    )}

                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'assistant' && (
                          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center text-base shrink-0 shadow-xs">
                            🦜
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-amber-600 text-white rounded-br-xs font-medium'
                              : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-bl-xs shadow-2xs space-y-3'
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.text}</div>

                          {/* Key Entities pill tags */}
                          {msg.keyEntities && msg.keyEntities.length > 0 && (
                            <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                Claves del texto:
                              </span>
                              {msg.keyEntities.map((ent, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200"
                                >
                                  {ent}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Suggested follow-up questions */}
                          {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                            <div className="pt-2 space-y-1.5">
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                                Preguntas sugeridas para explorar:
                              </span>
                              <div className="flex flex-col gap-1">
                                {msg.suggestedQuestions.map((q, qi) => (
                                  <button
                                    key={qi}
                                    type="button"
                                    onClick={() => handleSendMessage(q)}
                                    className="text-left text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-xl transition-colors border border-emerald-200/70"
                                  >
                                    💬 {q}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Text to speech button for assistant answers */}
                          {msg.sender === 'assistant' && (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => speakText(msg.text)}
                                className="text-[11px] text-stone-400 hover:text-amber-700 flex items-center gap-1 font-medium"
                                title="Escuchar respuesta con voz clara"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Escuchar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isAskingAI && (
                      <div className="flex gap-3 justify-start items-center">
                        <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center text-base shrink-0 animate-pulse">
                          🦜
                        </div>
                        <div className="p-3 bg-stone-100 rounded-2xl text-xs text-stone-500 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                          <span>Quetzalito está revisando el archivo de Drive...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Chat Question Field */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="p-3 border-t border-stone-200 bg-stone-50/80 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="Pregunta a Quetzalito sobre este archivo (ej. ¿Qué personajes se mencionan?)..."
                      value={inputQuestion}
                      onChange={(e) => setInputQuestion(e.target.value)}
                      disabled={isAskingAI || !extractedText}
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputQuestion.trim() || isAskingAI || !extractedText}
                      className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-xs transition-colors disabled:opacity-40"
                      title="Enviar pregunta"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
