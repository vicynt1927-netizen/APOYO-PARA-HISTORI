import React, { useState } from 'react';
import { ActivityItem } from '../types';
import { Bookmark, Trash2, Printer, Play, Download, X, AlertTriangle, Search, Check } from 'lucide-react';
import { exportAllDataAsJson } from '../utils/storage';

interface SavedActivitiesModalProps {
  isOpen: boolean;
  activities: ActivityItem[];
  onSelectActivity: (activity: ActivityItem) => void;
  onDeleteActivity: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const SavedActivitiesModal: React.FC<SavedActivitiesModalProps> = ({
  isOpen,
  activities,
  onSelectActivity,
  onDeleteActivity,
  onClearAll,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<string>('todos');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = activities.filter((act) => {
    if (filterType === 'todos') return true;
    return act.type === filterType;
  });

  const handleConfirmDelete = (id: string) => {
    onDeleteActivity(id);
    setDeletingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-heading">
                Mis Actividades Guardadas (Modo Sin Conexión)
              </h2>
              <p className="text-xs text-stone-500">
                Guardadas en la memoria de este dispositivo. Disponibles sin conexión a internet.
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

        {/* Toolbar: Export JSON & Clear All */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">Total: {activities.length} actividades</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportAllDataAsJson}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold flex items-center gap-1.5 shadow-2xs"
              title="Descargar copia de respaldo en formato JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Copia (.JSON)</span>
            </button>

            {!confirmClearAll ? (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                disabled={activities.length === 0}
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-1.5 disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar todo</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-xl border border-rose-300">
                <span className="text-rose-800 font-bold text-[11px]">¿Seguro que deseas borrar todo?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClearAll(false);
                  }}
                  className="px-2 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px]"
                >
                  Sí, borrar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-1 bg-stone-200 text-stone-700 rounded-lg font-bold text-[11px]"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activities List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <div className="text-4xl">📂</div>
              <p className="text-sm font-semibold text-stone-600">
                No tienes actividades guardadas todavía.
              </p>
              <p className="text-xs text-stone-400">
                Genera una actividad y presiona el botón "Guardar" para tenerla disponible sin internet.
              </p>
            </div>
          ) : (
            filtered.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      {act.type}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(act.createdAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 font-heading">
                    {act.title}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Fuente: {act.sourceReference.title} • {act.sourceReference.chapter || ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectActivity(act);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-2xs flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jugar / Abrir</span>
                  </button>

                  {deletingId === act.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(act.id)}
                        className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 bg-stone-200 text-stone-700 rounded-lg text-xs"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingId(act.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Eliminar esta actividad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-800 text-white font-bold text-xs rounded-xl"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
