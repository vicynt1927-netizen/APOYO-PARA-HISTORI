import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { User, Check, X, ShieldCheck } from 'lucide-react';

interface StudentAvatarModalProps {
  isOpen: boolean;
  profile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
  onClose: () => void;
}

const AVATARS = [
  { id: 'quetzal', emoji: '🦜', name: 'Quetzal', title: 'Guardián del Saber' },
  { id: 'jaguar', emoji: '🐆', name: 'Jaguar', title: 'Fuerza Prehispánica' },
  { id: 'ajolote', emoji: '🦎', name: 'Ajolote', title: 'Creatividad Acuática' },
  { id: 'colibri', emoji: '🌸', name: 'Colibrí', title: 'Mensajero Veloz' },
  { id: 'mariposa', emoji: '🦋', name: 'Mariposa', title: 'Viajera Monarca' },
  { id: 'aguila', emoji: '🦅', name: 'Águila', title: 'Visión de Grandeza' },
];

export const StudentAvatarModal: React.FC<StudentAvatarModalProps> = ({
  isOpen,
  profile,
  onSaveProfile,
  onClose,
}) => {
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      nickname: nickname.trim() || 'Explorador Maya',
      avatar: selectedAvatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-heading">
                Perfil del Explorador
              </h3>
              <p className="text-xs text-stone-500">
                Personaliza tu personaje histórico
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nickname input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Tu apodo o nombre corto:
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="Ej. Explorador Leo"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-stone-800"
            />
            <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>Por tu seguridad, usa solo un apodo, sin apellidos ni datos personales.</span>
            </div>
          </div>

          {/* Avatar choice */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Elige tu avatar de la naturaleza mexicana:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 shadow-xs ring-2 ring-amber-300'
                        : 'border-stone-200 hover:border-amber-300 bg-stone-50/50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{av.emoji}</div>
                    <div className="text-xs font-bold text-stone-800 font-heading">
                      {av.name}
                    </div>
                    <div className="text-[10px] text-stone-400 line-clamp-1">
                      {av.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar perfil</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
