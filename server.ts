import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize shared Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    environment: isProduction ? 'production' : 'development',
    time: new Date().toISOString(),
  });
});

// Helper system instruction for 4th grade Mexican History
const SYSTEM_INSTRUCTION = `Eres una maestra o maestro especialista en Historia de México y pedagogía para niñas y niños de cuarto grado de primaria (9 a 10 años).
Tu labor es apoyar el estudio y comprensión del contenido basado exclusivamente en los fragmentos del libro "México, grandeza y diversidad" o textos históricos que proporcione el usuario.

NORMAS OBLIGATORIAS:
1. Lenguaje claro, cálido, motivador, respetuoso y adecuado para cuarto de primaria.
2. Estricto apego al texto proporcionado: NUNCA inventes datos, nombres ni fechas históricas. Si algo no está en el material proporcionado, aclara explícitamente "No se menciona en el material analizado".
3. NO reproduzcas capítulos completos ni párrafos largos del libro. Resume con tus propias palabras pedagógicas y crea actividades originales.
4. Genera siempre una respuesta en formato JSON estrictamente estructurado sin bloques de markdown adicionales.
5. Incluye explicaciones amables de por qué cada respuesta es correcta o qué conviene repasar.
6. Cita siempre el tema, capítulo o páginas cuando se indiquen.`;

// AI Assistant for Google Drive file exploration
app.post('/api/drive-assistant', async (req: Request, res: Response) => {
  const { documentText, fileName, userQuestion, chatHistory = [] } = req.body;

  if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
    return res.status(400).json({ error: 'No se recibió contenido de texto del archivo de Google Drive.' });
  }

  const cleanDoc = documentText.slice(0, 20000);
  const question = userQuestion || 'Hazme un resumen comprensivo de este documento y dime qué personajes y hechos históricos importantes contiene.';

  if (!ai || !apiKey) {
    // Helpful local fallback if API key is absent
    const firstLines = cleanDoc.split('\n').filter(Boolean).slice(0, 5).join(' ');
    return res.json({
      success: true,
      answer: `¡Hola, explorador(a)! He leído el archivo "${fileName}".\n\nEste documento trata sobre la historia de México y contiene temas como:\n${firstLines.slice(0, 300)}...\n\n¿Quieres que generemos un cuestionario, crucigrama o tarjetas de memoria con este archivo?`,
      suggestedQuestions: [
        '¿Quiénes son los personajes clave de este texto?',
        '¿Qué fechas o lugares importantes se mencionan?',
        '¿Cuál es la idea principal para mi cuaderno de 4° grado?'
      ]
    });
  }

  try {
    const systemPrompt = `Eres "Quetzalito", el asistente de inteligencia artificial pedagógico de "Explora México: Grandeza y Diversidad".
Tu misión es acompañar a niñas y niños de 4° de primaria (9 a 10 años) y a sus docentes a explorar, comprender y aprender a partir de los archivos y lecturas que abran desde su Google Drive.

REGLAS PEDAGÓGICAS ESTRICTAS:
1. Lenguaje cálido, entusiasta, claro, motivador y respetuoso con la edad escolar (4° de primaria).
2. Estricta fidelidad al documento: responde basándote ÚNICAMENTE en el contenido del archivo de Google Drive proporcionado. Si un dato no aparece en el texto, dilo amablemente: "En este archivo no se menciona ese dato, pero lo que sí nos enseña es...".
3. NO inventes hechos, fechas ni personajes que no estén en el documento.
4. Si el estudiante te hace preguntas sobre historia, responde de forma estructurada con viñetas o párrafos cortos y comprensibles.
5. Devuelve siempre una respuesta en formato JSON estructurado con:
   - "answer": respuesta explicada en español para niños de 4° grado.
   - "keyEntities": arreglo con 2 a 4 personajes, lugares o conceptos destacados en la respuesta.
   - "suggestedQuestions": arreglo de 3 preguntas breves y curiosas que el estudiante puede pulsar a continuación para seguir explorando el archivo.`;

    const contents = [
      ...chatHistory,
      {
        role: 'user',
        parts: [
          {
            text: `ARCHIVO DE GOOGLE DRIVE: "${fileName}"\n\nCONTENIDO DEL ARCHIVO:\n"""\n${cleanDoc}\n"""\n\nPREGUNTA O PETICIÓN DEL ESTUDIANTE O DOCENTE:\n${question}`
          }
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Respuesta vacía del asistente.');
    }

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      answer: parsed.answer,
      keyEntities: parsed.keyEntities || [],
      suggestedQuestions: parsed.suggestedQuestions || [
        '¿Quiénes son los personajes principales?',
        '¿Qué lugares se mencionan en la lectura?',
        '¿Por qué este acontecimiento es importante para México?'
      ]
    });
  } catch (error: any) {
    console.error('Error en asistente de Drive:', error);
    return res.status(500).json({
      error: 'Hubo un error al consultar el asistente de IA para este archivo.',
      details: error?.message || 'Error desconocido'
    });
  }
});

// Activity generation endpoint
app.post('/api/generate-activity', async (req: Request, res: Response) => {
  const { materialText, activityType, difficulty, chapterTitle, pages, studentGrade = '4° de Primaria' } = req.body;

  if (!materialText || typeof materialText !== 'string' || materialText.trim().length === 0) {
    return res.status(400).json({ error: 'Debes proporcionar un fragmento o texto para generar la actividad.' });
  }

  // If no Gemini API key is configured in the environment, return a helpful signal so client uses offline procedural generator
  if (!ai || !apiKey) {
    return res.status(200).json({
      fallback: true,
      message: 'No hay clave de API configurada en el servidor; usando generador educativo integrado.',
      activityType,
    });
  }

  try {
    const prompt = `Genera una actividad educativa de tipo "${activityType}" para estudiantes de ${studentGrade}.
Dificultad: ${difficulty || 'intermedio'}.
Capítulo o tema de referencia: ${chapterTitle || 'Historia de México'}.
Páginas de referencia: ${pages || 'No especificadas'}.

TEXTO DEL LIBRO O FRAGMENTO A ANALIZAR:
"""
${materialText.slice(0, 15000)}
"""

ESPECIFICACIÓN DEL TIPO DE ACTIVIDAD "${activityType}":
- Si es "resumen": un resumen breve estructurado con apartados claros ("titulo", "ideas_principales" [array de strings], "resumen_narrativo" en 2 párrafos sencillos, "datos_curiosos" [array de strings]).
- Si es "palabras_clave": un arreglo de 4 a 6 palabras o conceptos clave ("termino", "definicion_infantil", "ejemplo_cotidiano", "como_recordarlo").
- Si es "tarjetas": un arreglo de 5 tarjetas de memoria ("anverso" [pregunta o concepto], "reverso" [respuesta o definición breve], "pista_amistosa").
- Si es "preguntas": un arreglo de 5 preguntas ("id", "tipo" ["opcion_multiple" | "verdadero_falso" | "abierta"], "pregunta", "opciones" [si aplica, 3 o 4 opciones], "respuesta_correcta", "explicacion_educativa").
- Si es "relacionar": dos columnas para emparejar de 4 a 5 elementos ("pares": [{"id": "1", "elementoA": "Personaje, concepto o fecha", "elementoB": "Acción, significado o acontecimiento", "explicacion": "breve explicación"}]).
- Si es "crucigrama": palabras y pistas para una cuadrícula ("palabras": [{"palabra": "PALABRA_MAYUSCULAS_SIN_ESPACIOS", "pista": "pista clara para 4°", "orientacion": "horizontal"|"vertical", "numero": 1}]).
- Si es "sopa_letras": 6 a 8 palabras temáticas encontradas en el texto ("palabras": ["PALABRA1", "PALABRA2", ...], "pistas": [{"palabra": "PALABRA1", "pista": "descripción breve"}]).
- Si es "linea_tiempo": 4 a 5 acontecimientos en orden cronológico ("hitos": [{"fecha_o_momento": "año o época", "titulo": "qué pasó", "descripcion": "breve explicación para niños", "orden_correcto": 1}]).
- Si es "mapa_conceptual": esquema jerárquico ("nodo_central": "tema central", "ramas": [{"categoria": "nombre", "conceptos": ["detalle 1", "detalle 2"]}]).
- Si es "completar": texto con 4 a 5 espacios en blanco ("texto_con_huecos": "Texto con ___1___ y ___2___", "respuestas": ["palabra1", "palabra2"], "banco_palabras": ["palabra1", "palabra2", "distractor1", "distractor2"], "explicaciones": ["por qué..."]).
- Si es "explica_palabras": 3 retos de reflexión ("retos": [{"tipo": "explica_con_tus_palabras"|"compara"|"causa_consecuencia", "consigna": "instrucción amigable", "guia_ayuda": "comienza diciendo...", "sugerencia_respuesta": "lo que se espera comprender"}]).
- Si es "reto_repaso": un juego de preguntas rápidas con 5 preguntas dinámicas y puntuación ("preguntas": [{"pregunta": "...", "opciones": [...], "correcta": 0, "puntos": 100, "sabias_que": "dato extra"}]).
- Si es "imprimible": contenido para hoja de trabajo imprimible y guía del docente ("titulo_hoja": "...", "instrucciones_alumno": "...", "ejercicios": [{"numero": 1, "tipo": "...", "consigna": "..."}], "guia_docente": {"respuestas_esperadas": [...], "consejos_pedagogicos": "..."}}).

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura:
{
  "titulo": "Título atractivo de la actividad",
  "tema": "${chapterTitle || 'Historia de México'}",
  "referencia": "Capítulo/tema: ${chapterTitle || 'General'}, Páginas: ${pages || 'Fragmento'}",
  "tipo": "${activityType}",
  "dificultad": "${difficulty}",
  "datos": { ... segun la especificacion anterior ... }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('La respuesta del modelo estuvo vacía.');
    }

    const parsedData = JSON.parse(text);
    return res.json({
      success: true,
      activity: parsedData,
    });
  } catch (error: any) {
    console.error('Error generando actividad con Gemini:', error);
    return res.status(500).json({
      error: 'Hubo un error al generar la actividad con IA. Puedes usar el generador integrado sin conexión.',
      details: error?.message || 'Error desconocido',
      fallback: true,
    });
  }
});

// Configure Vite or Static Serve
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Servidor Explora México listo en http://localhost:${PORT}`);
  });
}

startServer();
