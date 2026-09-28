import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import * as pdfjsLib from 'pdfjs-dist';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Scopes required for Drive file reading
export const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory access token cache (NEVER in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Drive.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error en autenticación con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Lists user files from Google Drive
 */
export const listDriveFiles = async (searchTerm: string = ''): Promise<DriveFileItem[]> => {
  if (!cachedAccessToken) {
    throw new Error('Debes iniciar sesión con Google para consultar tus archivos de Drive.');
  }

  // Filter for readable study files: PDFs, Google Docs, plain text, markdown
  let q = "trashed = false and (mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document' or mimeType contains 'text/' or mimeType = 'application/json')";
  if (searchTerm.trim()) {
    const escaped = searchTerm.replace(/'/g, "\\'");
    q += ` and name contains '${escaped}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,mimeType,modifiedTime,size,iconLink)&q=${encodeURIComponent(
    q
  )}&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedAccessToken = null;
      throw new Error('La sesión de Google ha expirado. Por favor vuelve a conectar tu cuenta.');
    }
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || 'Error al obtener archivos de Google Drive.');
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Downloads and extracts plain text from a Google Drive file
 */
export const readDriveFileContent = async (
  fileId: string,
  mimeType: string,
  fileName: string
): Promise<{ text: string; wordCount: number; pageCount?: number }> => {
  if (!cachedAccessToken) {
    throw new Error('No hay sesión activa de Google.');
  }

  // 1. Google Docs: export as plain text
  if (mimeType === 'application/vnd.google-apps.document') {
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
    const res = await fetch(exportUrl, {
      headers: { Authorization: `Bearer ${cachedAccessToken}` },
    });
    if (!res.ok) throw new Error(`No se pudo leer el documento de Google: ${res.statusText}`);
    const text = await res.text();
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return { text: text.trim(), wordCount: words, pageCount: 1 };
  }

  // 2. PDF Document: download binary and parse with pdfjs
  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${cachedAccessToken}` },
    });
    if (!res.ok) throw new Error(`No se pudo descargar el PDF de Google Drive: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();

    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
    }

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= Math.min(numPages, 30); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ');
      fullText += `\n[Página ${i}]\n` + pageStr + '\n';
    }

    const words = fullText.trim().split(/\s+/).filter(Boolean).length;
    return { text: fullText.trim(), wordCount: words, pageCount: numPages };
  }

  // 3. Plain text / Markdown / Other: download raw text
  const rawUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(rawUrl, {
    headers: { Authorization: `Bearer ${cachedAccessToken}` },
  });
  if (!res.ok) throw new Error(`No se pudo leer el archivo de texto: ${res.statusText}`);
  const text = await res.text();
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return { text: text.trim(), wordCount: words, pageCount: 1 };
};

/**
 * Ask the AI Assistant about the Drive file content
 */
export const askDriveAssistant = async (
  documentText: string,
  fileName: string,
  userQuestion: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<{
  answer: string;
  keyEntities: string[];
  suggestedQuestions: string[];
}> => {
  const response = await fetch('/api/drive-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentText,
      fileName,
      userQuestion,
      chatHistory,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || 'Error al comunicarse con el asistente de IA.');
  }

  const data = await response.json();
  return {
    answer: data.answer,
    keyEntities: data.keyEntities || [],
    suggestedQuestions: data.suggestedQuestions || [],
  };
};
