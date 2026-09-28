import { ActivityItem, ActivityType, Difficulty, MaterialSource } from '../types';

export interface GenerateActivityOptions {
  material: MaterialSource;
  activityType: ActivityType;
  difficulty: Difficulty;
  studentGrade?: string;
}

/**
 * Main activity generator: queries backend Gemini proxy, with automatic offline fallback
 */
export async function generateActivity(options: GenerateActivityOptions): Promise<ActivityItem> {
  const { material, activityType, difficulty, studentGrade = '4° de Primaria' } = options;

  // Check if online
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (isOnline) {
    try {
      const response = await fetch('/api/generate-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialText: material.content,
          activityType,
          difficulty,
          chapterTitle: material.title,
          pages: material.pages || 'Fragmento provisto',
          studentGrade,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.activity) {
          const act = json.activity;
          return {
            id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: activityType,
            title: act.titulo || getFallbackTitle(activityType, material.title),
            difficulty,
            sourceReference: {
              title: material.title,
              chapter: material.chapter,
              pages: material.pages,
            },
            createdAt: new Date().toISOString(),
            completed: false,
            data: act.datos || act,
          };
        }
      }
    } catch (err) {
      console.warn('Fallo al llamar al API remoto, activando generador pedagógico local:', err);
    }
  }

  // Fallback / Offline generator
  return generateOfflineActivity(material, activityType, difficulty);
}

function getFallbackTitle(type: ActivityType, sourceTitle: string): string {
  const titles: Record<ActivityType, string> = {
    resumen: `Resumen comprensivo: ${sourceTitle}`,
    palabras_clave: `Vocabulario histórico: ${sourceTitle}`,
    tarjetas: `Tarjetas de memoria: ${sourceTitle}`,
    preguntas: `Cuestionario de repaso: ${sourceTitle}`,
    relacionar: `Relaciona conceptos: ${sourceTitle}`,
    crucigrama: `Crucigrama temático: ${sourceTitle}`,
    sopa_letras: `Sopa de letras: ${sourceTitle}`,
    linea_tiempo: `Línea del tiempo: ${sourceTitle}`,
    mapa_conceptual: `Esquema de ideas: ${sourceTitle}`,
    completar: `Completa los espacios: ${sourceTitle}`,
    explica_palabras: `Pensamiento histórico: ${sourceTitle}`,
    reto_repaso: `Reto de las estrellas: ${sourceTitle}`,
    imprimible: `Hoja de trabajo imprimible: ${sourceTitle}`,
  };
  return titles[type] || `Actividad de ${sourceTitle}`;
}

/**
 * Intelligent procedural generator that parses sentences, terms, and facts from the text
 */
export function generateOfflineActivity(
  material: MaterialSource,
  activityType: ActivityType,
  difficulty: Difficulty
): ActivityItem {
  const content = material.content;
  const sentences = content
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  // Extract key historical words (longer than 5 chars, capitalized or frequent)
  const words = content
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 5 && !['donde', 'desde', 'hasta', 'cuando', 'porque', 'mientras', 'sobre', 'estas', 'estos'].includes(w.toLowerCase()));

  const uniqueWords = Array.from(new Set(words)).slice(0, 10);

  let data: any = {};

  switch (activityType) {
    case 'resumen':
      data = {
        titulo: `Resumen: ${material.title}`,
        ideas_principales: sentences.slice(0, 4).map((s) => s.replace(/\.$/, '')),
        resumen_narrativo: sentences.slice(0, 3).join(' ') + '\n\n' + sentences.slice(3, 6).join(' '),
        datos_curiosos: [
          'En el México antiguo y en la historia patria, cada descubrimiento y lucha comunitaria transformó nuestra forma de alimentarnos y convivir.',
          'El trabajo colectivo y el respeto a la tierra han sido la base de nuestra grandeza cultural.',
        ],
      };
      break;

    case 'palabras_clave':
      data = {
        terminos: uniqueWords.slice(0, 5).map((w, idx) => ({
          termino: w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
          definicion_infantil: `Concepto histórico fundamental mencionado en el texto para comprender ${material.title}.`,
          ejemplo_cotidiano: `Podemos relacionar "${w.toLowerCase()}" con nuestras tradiciones, alimentos o fiestas de hoy en día.`,
          como_recordarlo: `Asócialo con la época estudiada en este capítulo.`,
        })),
      };
      break;

    case 'tarjetas':
      data = {
        tarjetas: [
          {
            anverso: `¿Cuál es el tema central que nos enseña ${material.title}?`,
            reverso: sentences[0] || 'La historia y vida comunitaria en México.',
            pista_amistosa: 'Observa la primera frase del texto leído.',
          },
          {
            anverso: `¿Qué elemento o acontecimiento destaca en esta lectura?`,
            reverso: sentences[1] || 'El desarrollo cultural y las aportaciones a nuestra sociedad.',
            pista_amistosa: 'Tiene que ver con los saberes o hechos históricos del texto.',
          },
          {
            anverso: `¿Por qué es importante este tema para comprender el México actual?`,
            reverso: 'Porque nos ayuda a valorar la diversidad, el esfuerzo de nuestros antepasados y la identidad del país.',
            pista_amistosa: 'Piensa en cómo influye en nuestras vidas hoy.',
          },
          {
            anverso: `¿Qué valor humano o colectivo se refleja en el relato?`,
            reverso: 'La cooperación, el trabajo en comunidad y la búsqueda de justicia y armonía.',
            pista_amistosa: 'Reflexiona sobre cómo se organizaban las personas.',
          },
        ],
      };
      break;

    case 'preguntas':
      data = {
        preguntas: [
          {
            id: 'p1',
            tipo: 'opcion_multiple',
            pregunta: `Según el texto leído, ¿cuál fue uno de los acontecimientos o hechos más relevantes?`,
            opciones: [
              sentences[0] || 'El desarrollo y organización de las comunidades históricas',
              'La construcción de naves espaciales modernas',
              'Un viaje al polo norte en submarino',
            ],
            respuesta_correcta: sentences[0] || 'El desarrollo y organización de las comunidades históricas',
            explicacion_educativa: `¡Muy bien! El texto menciona explícitamente esto en su contenido principal.`,
          },
          {
            id: 'p2',
            tipo: 'verdadero_falso',
            pregunta: `¿El contenido del tema resalta la importancia del trabajo comunitario y la cultura en México?`,
            opciones: ['Verdadero', 'Falso'],
            respuesta_correcta: 'Verdadero',
            explicacion_educativa: `¡Exacto! Es Verdadero porque la lectura destaca la grandeza y el esfuerzo colectivo de las personas de esa época.`,
          },
          {
            id: 'p3',
            tipo: 'abierta',
            pregunta: `Escribe con tus propias palabras qué aprendiste sobre este momento histórico.`,
            respuesta_correcta: 'Respuesta de reflexión personal basada en la lectura.',
            explicacion_educativa: `¡Excelente esfuerzo de reflexión! Lo valioso es relacionar lo leído con tus propias ideas sobre México.`,
          },
        ],
      };
      break;

    case 'relacionar':
      data = {
        pares: [
          {
            id: 'par-1',
            elementoA: material.chapter || 'Tema estudiado',
            elementoB: 'Hecho central del capítulo leído',
            explicacion: 'Corresponde al contenido principal del libro.',
          },
          {
            id: 'par-2',
            elementoA: uniqueWords[0] || 'Saberes históricos',
            elementoB: 'Conocimiento transmitido de generación en generación',
            explicacion: 'Muestra la continuidad de nuestras tradiciones.',
          },
          {
            id: 'par-3',
            elementoA: uniqueWords[1] || 'Organización comunitaria',
            elementoB: 'Trabajo conjunto para resolver necesidades del pueblo',
            explicacion: 'Clave para el desarrollo de las sociedades en México.',
          },
          {
            id: 'par-4',
            elementoA: 'Grandeza y Diversidad',
            elementoB: 'Riqueza de pueblos, lenguas y paisajes de nuestra patria',
            explicacion: 'Es el propósito del libro que estamos explorando.',
          },
        ],
      };
      break;

    case 'crucigrama':
      const cwWords = ['MEXICO', 'HISTORIA', 'CULTURA', 'PUEBLOS', 'TIERRA'];
      data = {
        palabras: [
          { palabra: 'MEXICO', pista: 'Nombre de nuestro querido país cuya historia estamos aprendiendo.', orientacion: 'horizontal', fila: 2, col: 1, numero: 1 },
          { palabra: 'HISTORIA', pista: 'Estudio de los acontecimientos pasados de los pueblos.', orientacion: 'vertical', fila: 0, col: 4, numero: 2 },
          { palabra: 'CULTURA', pista: 'Costumbres, saberes, arte y tradiciones de un grupo humano.', orientacion: 'horizontal', fila: 5, col: 0, numero: 3 },
          { palabra: 'TIERRA', pista: 'Suelo donde se siembra y habitan las comunidades.', orientacion: 'vertical', fila: 3, col: 2, numero: 4 },
        ],
      };
      break;

    case 'sopa_letras':
      data = {
        palabras: ['MEXICO', 'MAIZ', 'ALDEA', 'LIBERTAD', 'PUEBLO', 'TEMPLO'],
        pistas: [
          { palabra: 'MEXICO', pista: 'Nuestra patria con gran diversidad natural y cultural.' },
          { palabra: 'MAIZ', pista: 'Planta sagrada base de la alimentación mesoamericana.' },
          { palabra: 'ALDEA', pista: 'Comunidad pequeña de las primeras sociedades agrícolas.' },
          { palabra: 'LIBERTAD', pista: 'Derecho fundamental conquistado en la Independencia.' },
          { palabra: 'PUEBLO', pista: 'Conjunto de personas que comparten historia y territorio.' },
          { palabra: 'TEMPLO', pista: 'Construcción sagrada para agradecer y honrar.' },
        ],
      };
      break;

    case 'linea_tiempo':
      data = {
        hitos: [
          {
            fecha_o_momento: 'Etapa 1: Orígenes',
            titulo: 'Domesticación de plantas y primeras aldeas',
            descripcion: 'Nuestros antepasados aprendieron a sembrar y fundaron comunidades unidas.',
            orden_correcto: 1,
          },
          {
            fecha_o_momento: 'Etapa 2: Ciudades y señoríos',
            titulo: 'Florecimiento de grandes centros ceremoniales',
            descripcion: 'Crecieron impresionantes ciudades con templos, chinampas y mercados.',
            orden_correcto: 2,
          },
          {
            fecha_o_momento: 'Etapa 3: Encuentro de culturas',
            titulo: 'Llegada de los españoles y Virreinato',
            descripcion: 'Se transformó la vida cotidiana surgiendo nuevas mezclas culturales.',
            orden_correcto: 3,
          },
          {
            fecha_o_momento: 'Etapa 4: Independencia y Nación',
            titulo: 'Lucha por la libertad y la justicia',
            descripcion: 'Mujeres y hombres valientes construyeron un México libre e independiente.',
            orden_correcto: 4,
          },
        ],
      };
      break;

    case 'mapa_conceptual':
      data = {
        nodo_central: material.title.replace(/^Capítulo \d+:\s*/i, ''),
        ramas: [
          {
            categoria: 'Importancia histórica',
            conceptos: ['Transformó la vida diaria', 'Creó nuevas formas de convivir', 'Nos legó saberes valiosos'],
          },
          {
            categoria: 'Pueblos y protagonistas',
            conceptos: ['Familias y comunidades', 'Líderes y campesinos', 'Artesanos y guardianes de la memoria'],
          },
          {
            categoria: 'Legado para el presente',
            conceptos: ['Tradiciones vivas', 'Alimentación y cultura', 'Orgullo de nuestra identidad'],
          },
        ],
      };
      break;

    case 'completar':
      data = {
        texto_con_huecos: 'En la historia de México, las comunidades antiguas aprendieron a cuidar la ___1___ y a sembrar el ___2___. Gracias a su esfuerzo colectivo, lograron construir un país lleno de ___3___ y grandeza cultural.',
        respuestas: ['tierra', 'maíz', 'diversidad'],
        banco_palabras: ['tierra', 'maíz', 'diversidad', 'acero', 'plástico', 'aviones'],
        explicaciones: [
          'La tierra era el suelo fértil indispensable para la agricultura.',
          'El maíz es el alimento central de Mesoamérica.',
          'La diversidad hace referencia a la riqueza de lenguas y culturas.',
        ],
      };
      break;

    case 'explica_palabras':
      data = {
        retos: [
          {
            tipo: 'explica_con_tus_palabras',
            consigna: '¿Por qué crees que este tema es un ejemplo de la grandeza de México?',
            guia_ayuda: 'Puedes empezar diciendo: "Este tema demuestra la grandeza de México porque..."',
            sugerencia_respuesta: 'Se espera que reconozcas el ingenio, la resistencia o los aportes de las personas que vivieron esa época.',
          },
          {
            tipo: 'compara',
            consigna: 'Compara cómo vivían las personas en esa época con cómo vivimos hoy.',
            guia_ayuda: 'Menciona una diferencia (por ejemplo, en el transporte o la tecnología) y una similitud (como el amor por la familia y la comida).',
            sugerencia_respuesta: 'Identificar cambios en las comodidades pero continuidad en el valor de la comunidad.',
          },
          {
            tipo: 'causa_consecuencia',
            consigna: '¿Qué consecuencia positiva tuvo la unión y el trabajo de la gente en este acontecimiento?',
            guia_ayuda: 'Piensa en qué lograron gracias a no rendirse y trabajar juntos.',
            sugerencia_respuesta: 'Lograron defender sus derechos, mejorar sus cosechas o independizar la nación.',
          },
        ],
      };
      break;

    case 'reto_repaso':
      data = {
        preguntas: [
          {
            pregunta: `¿De qué trata principalmente el tema "${material.title}"?`,
            opciones: ['De hechos y personas fundamentales de nuestra historia', 'De cómo armar un robot de plástico', 'De los peces en el océano Ártico'],
            correcta: 0,
            puntos: 100,
            sabias_que: '¡El libro México, grandeza y diversidad fue escrito por historiadores y antropólogos para que valoremos nuestras raíces!',
          },
          {
            pregunta: '¿Por qué es importante respetar las distintas formas de pensar y culturas en México?',
            opciones: ['Porque la diversidad enriquece a nuestro país', 'Porque a nadie le importa', 'Para que todos se vistan igual'],
            correcta: 0,
            puntos: 100,
            sabias_que: '¡En México conviven más de 68 lenguas originarias!',
          },
          {
            pregunta: '¿Cuál es una actitud responsable al estudiar Historia de México?',
            opciones: ['Leer con atención y valorar el esfuerzo de nuestros antepasados', 'Copiar sin entender', 'Inventar datos falsos'],
            correcta: 0,
            puntos: 100,
            sabias_que: '¡Aprender historia nos ayuda a ser mejores ciudadanas y ciudadanos en nuestra escuela y comunidad!',
          },
        ],
      };
      break;

    case 'imprimible':
      data = {
        titulo_hoja: `Hoja de Repaso: ${material.title}`,
        instrucciones_alumno: 'Lee con atención cada apartado y responde con letra clara. ¡Tú puedes, gran explorador!',
        ejercicios: [
          {
            numero: 1,
            tipo: 'Pregunta de desarrollo',
            consigna: 'Explica con tus palabras cuál fue el suceso principal explicado en la lectura:',
            espacio_lineas: 3,
          },
          {
            numero: 2,
            tipo: 'Relacionar o identificar',
            consigna: 'Escribe 3 palabras clave del tema y explica qué significan para ti:',
            espacio_lineas: 4,
          },
          {
            numero: 3,
            tipo: 'Dibujo y creatividad histórica',
            consigna: 'En el recuadro inferior, dibuja una escena representativa de lo aprendido:',
            espacio_lineas: 6,
          },
        ],
        guia_docente: {
          objetivo_aprendizaje: 'Comprender y sintetizar los conceptos nodales del periodo histórico según los contenidos del libro.',
          respuestas_esperadas: [
            '1. Se espera que el estudiante identifique los hechos históricos clave y su ubicación temporal.',
            '2. Definición adecuada a 4° grado con vocabulario propio del tema.',
            '3. Ilustración que evidencie apropiación del contexto histórico y cultural.',
          ],
          consejos_pedagogicos: 'Fomentar la reflexión en asamblea escolar o diálogo familiar, conectando con las tradiciones locales.',
        },
      };
      break;
  }

  return {
    id: `act-local-${Date.now()}`,
    type: activityType,
    title: getFallbackTitle(activityType, material.title),
    difficulty,
    sourceReference: {
      title: material.title,
      chapter: material.chapter,
      pages: material.pages,
    },
    createdAt: new Date().toISOString(),
    completed: false,
    data,
  };
}
