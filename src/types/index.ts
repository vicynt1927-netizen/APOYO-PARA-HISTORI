// Types for Explora México: Grandeza y Diversidad

export type UserMode = 'estudiante' | 'docente';

export type Difficulty = 'basico' | 'intermedio' | 'avanzado';

export type ActivityType =
  | 'resumen'
  | 'palabras_clave'
  | 'tarjetas'
  | 'preguntas'
  | 'relacionar'
  | 'crucigrama'
  | 'sopa_letras'
  | 'linea_tiempo'
  | 'mapa_conceptual'
  | 'completar'
  | 'explica_palabras'
  | 'reto_repaso'
  | 'imprimible';

export interface ActivityMetadata {
  id: ActivityType;
  title: string;
  shortTitle: string;
  icon: string;
  badgeColor: string;
  description: string;
  category: 'comprension' | 'juego' | 'evaluacion' | 'docente';
}

export interface MaterialSource {
  id: string;
  title: string;
  chapter?: string;
  pages?: string;
  content: string;
  wordCount: number;
  isDemo?: boolean;
  dateAdded: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  difficulty: Difficulty;
  sourceReference: {
    title: string;
    chapter?: string;
    pages?: string;
  };
  createdAt: string;
  completed?: boolean;
  score?: number;
  totalPossibleScore?: number;
  data: any; // typed payload per activity
  userNotes?: string;
}

export interface StudentProfile {
  nickname: string;
  avatar: string;
  stars: number;
  streak: number;
  masteredTopics: string[];
  topicsToReview: string[];
  completedCount: number;
}
