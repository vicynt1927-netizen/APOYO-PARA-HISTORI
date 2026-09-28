import { ActivityItem, MaterialSource, StudentProfile } from '../types';

const ACTIVITIES_KEY = 'explora_mexico_activities_v1';
const PROFILE_KEY = 'explora_mexico_profile_v1';
const RECENT_MATERIALS_KEY = 'explora_mexico_materials_v1';

export const DEFAULT_PROFILE: StudentProfile = {
  nickname: 'Explorador Maya',
  avatar: 'quetzal',
  stars: 15,
  streak: 3,
  masteredTopics: ['El Maíz y la Milpa', 'Fundación de Tenochtitlan'],
  topicsToReview: ['Fechas de la Independencia'],
  completedCount: 2,
};

export function getSavedActivities(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error cargando actividades guardadas:', e);
    return [];
  }
}

export function saveActivity(activity: ActivityItem): void {
  try {
    const current = getSavedActivities();
    const existingIdx = current.findIndex((a) => a.id === activity.id);
    if (existingIdx >= 0) {
      current[existingIdx] = activity;
    } else {
      current.unshift(activity);
    }
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error guardando actividad:', e);
  }
}

export function deleteSavedActivity(id: string): void {
  try {
    const current = getSavedActivities().filter((a) => a.id !== id);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error eliminando actividad:', e);
  }
}

export function clearAllSavedActivities(): void {
  localStorage.removeItem(ACTIVITIES_KEY);
}

export function getStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error guardando perfil:', e);
  }
}

export function addStarsToProfile(count: number, topic?: string): StudentProfile {
  const profile = getStudentProfile();
  profile.stars += count;
  profile.completedCount += 1;
  profile.streak += 1;
  if (topic && !profile.masteredTopics.includes(topic)) {
    profile.masteredTopics.push(topic);
    profile.topicsToReview = profile.topicsToReview.filter((t) => t !== topic);
  }
  saveStudentProfile(profile);
  return profile;
}

export function exportAllDataAsJson(): void {
  const exportObj = {
    app: 'Explora México: Grandeza y Diversidad',
    exportDate: new Date().toISOString(),
    profile: getStudentProfile(),
    activities: getSavedActivities(),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `explora_mexico_progreso_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Text-to-speech reading helper for primary students
 */
export function speakText(text: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel(); // Stop any previous speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.rate = 0.92; // Slightly gentler pace for 4th graders
  utterance.pitch = 1.05;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
