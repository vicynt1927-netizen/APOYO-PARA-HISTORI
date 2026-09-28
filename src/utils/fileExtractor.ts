import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to use CDN or local bundle safely in browser
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
}

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  fileName: string;
  chunks: { id: number; title: string; text: string; wordCount: number }[];
}

/**
 * Extracts plain text from a File object (.txt, .md, .pdf)
 */
export async function extractTextFromFile(file: File): Promise<ExtractedDocument> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md') {
    const rawText = await file.text();
    const cleanText = rawText.trim();
    const chunks = createDocumentChunks(cleanText, file.name);
    return {
      text: cleanText,
      pageCount: 1,
      fileName: file.name,
      chunks,
    };
  }

  if (extension === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let fullText = '';
      const pageTexts: { pageNum: number; text: string }[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStr = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ');

        pageTexts.push({ pageNum: i, text: pageStr });
        fullText += `\n[Página ${i}]\n` + pageStr + '\n';
      }

      const chunks = pageTexts.map((pt) => ({
        id: pt.pageNum,
        title: `Página ${pt.pageNum}`,
        text: pt.text.trim(),
        wordCount: pt.text.trim().split(/\s+/).filter(Boolean).length,
      })).filter((c) => c.wordCount > 10);

      return {
        text: fullText.trim(),
        pageCount: numPages,
        fileName: file.name,
        chunks: chunks.length > 0 ? chunks : createDocumentChunks(fullText, file.name),
      };
    } catch (err: any) {
      console.error('Error procesando PDF con pdfjs:', err);
      throw new Error(
        'No se pudo leer el archivo PDF directamente. Asegúrate de que no tenga contraseña o prueba copiando y pegando el texto en la pestaña "Pegar fragmento".'
      );
    }
  }

  throw new Error(
    `Formato de archivo ".${extension}" no compatible. Por favor sube archivos en formato PDF (.pdf) o texto plano (.txt, .md).`
  );
}

/**
 * Splits large texts into logical chapters or 350-word chunks so 4th graders and teachers can easily choose parts
 */
export function createDocumentChunks(
  text: string,
  docTitle: string = 'Documento'
): { id: number; title: string; text: string; wordCount: number }[] {
  // Check if text already has chapter headings like "Capítulo", "Tema", "Unidad"
  const chapterRegex = /(?:^|\n)(Capítulo\s+[0-9IVXLCDM]+[^\n]*|Tema\s+[0-9IVXLCDM]+[^\n]*|Apartado[^\n]*)/i;
  const parts = text.split(chapterRegex);

  if (parts.length > 2) {
    const detected: { id: number; title: string; text: string; wordCount: number }[] = [];
    let currentTitle = 'Introducción';
    let chunkId = 1;

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (chapterRegex.test(trimmed)) {
        currentTitle = trimmed;
      } else {
        const words = trimmed.split(/\s+/).filter(Boolean).length;
        if (words > 20) {
          detected.push({
            id: chunkId++,
            title: currentTitle,
            text: trimmed,
            wordCount: words,
          });
        }
      }
    }
    if (detected.length > 0) return detected;
  }

  // Fallback: chunk by paragraphs or ~400 words
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: { id: number; title: string; text: string; wordCount: number }[] = [];
  let currentChunk = '';
  let chunkIdx = 1;

  for (const p of paragraphs) {
    currentChunk += (currentChunk ? '\n\n' : '') + p;
    const words = currentChunk.split(/\s+/).filter(Boolean).length;
    if (words >= 350) {
      chunks.push({
        id: chunkIdx,
        title: `Sección ${chunkIdx} (${words} palabras)`,
        text: currentChunk,
        wordCount: words,
      });
      chunkIdx++;
      currentChunk = '';
    }
  }

  if (currentChunk.trim().length > 0) {
    const words = currentChunk.split(/\s+/).filter(Boolean).length;
    chunks.push({
      id: chunkIdx,
      title: chunks.length === 0 ? 'Documento completo' : `Sección final (${words} palabras)`,
      text: currentChunk,
      wordCount: words,
    });
  }

  return chunks.length > 0
    ? chunks
    : [
        {
          id: 1,
          title: docTitle,
          text,
          wordCount: text.split(/\s+/).filter(Boolean).length,
        },
      ];
}
