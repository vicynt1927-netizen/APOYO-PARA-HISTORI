import { MaterialSource } from '../types';

export const DEMO_MATERIALS: MaterialSource[] = [
  {
    id: 'demo-1-maiz-aldeas',
    title: 'Capítulo 4: El maíz y las primeras aldeas mesoamericanas',
    chapter: 'Capítulo IV: Pueblos del Maíz',
    pages: 'Págs. 58-69',
    isDemo: true,
    wordCount: 380,
    dateAdded: new Date().toISOString(),
    content: `Hace miles de años, los antiguos habitantes de Mesoamérica aprendieron a domesticar plantas silvestres. La más importante de todas fue el maíz, descendiente del teocintle. Al domesticar el maíz, las comunidades dejaron de ser nómadas y construyeron las primeras aldeas sedentarias. 

Junto con el maíz cultivaban frijol, calabaza y chile, creando un sistema agrícola armónico llamado la milpa. En la milpa, el frijol trepa por el tallo del maíz y nutre la tierra, mientras las hojas de la calabaza cubren el suelo y evitan que se seque.

Un gran invento mesoamericano fue la nixtamalización: cocer el maíz con agua y cal de piedra o ceniza. Este proceso ablanda los granos, facilita hacer masa para tortillas y tamales, y aporta calcio y nutrientes esenciales para el cuerpo.

En las aldeas, mujeres y hombres se organizaban para construir viviendas de lodo, paja y madera, elaborar vasijas de barro para almacenar semillas y agradecer a la naturaleza por la lluvia y las cosechas. El maíz no solo era alimento: era el centro de la vida, los mitos y la identidad comunitaria.`
  },
  {
    id: 'demo-2-tenochtitlan',
    title: 'Capítulo 8: Tenochtitlan y el encuentro de dos mundos',
    chapter: 'Capítulo VIII: La Gran Tenochtitlan',
    pages: 'Págs. 124-138',
    isDemo: true,
    wordCount: 410,
    dateAdded: new Date().toISOString(),
    content: `México-Tenochtitlan fue fundada en el año 1325 por los mexicas en un islote del lago de Texcoco, en el Valle de México. Para aprovechar las aguas del lago, los mexicas desarrollaron una tecnología agrícola asombrosa: las chinampas, que eran islas artificiales hechas con lodo fértil, cañas y árboles llamados ahuejotes. En ellas cosechaban hasta cuatro veces al año verduras, flores y maíz.

La ciudad estaba comunicada con tierra firme por tres grandes calzadas: Tepeyac, Tlacopan e Iztapalapa, con puentes de madera que se levantaban para defender la urbe. En su corazón se elevaba el Templo Mayor, dedicado a Tláloc, dios de la lluvia, y a Huitzilopochtli, dios de la guerra y el sol. Al lado, en Tlatelolco, funcionaba el mercado más grande de Mesoamérica, donde miles de personas intercambiaban cacao, plumas de quetzal, jade, mantas de algodón y cerámica.

En noviembre de 1519, llegaron los españoles encabezados por Hernán Cortés. El tlatoani Moctezuma II los recibió pacíficamente en la calzada de Iztapalapa. Sin embargo, las diferencias culturales, las alianzas de los españoles con pueblos tributarios como los tlaxcaltecas y la epidemia de viruela provocaron la caída de Tenochtitlan el 13 de agosto de 1521, iniciando el periodo virreinal.`
  },
  {
    id: 'demo-3-independencia',
    title: 'Capítulo 14: Los Sentimientos de la Nación y la Independencia',
    chapter: 'Capítulo XIV: La Lucha por la Libertad',
    pages: 'Págs. 210-225',
    isDemo: true,
    wordCount: 395,
    dateAdded: new Date().toISOString(),
    content: `La madrugada del 16 de septiembre de 1810, el cura Miguel Hidalgo y Costilla convocó al pueblo en Dolores, Guanajuato, llamando a terminar con las injusticias del gobierno virreinal. Al movimiento se unieron indígenas, campesinos, mineros y afrodescendientes que buscaban igualdad y tierras para trabajar.

A finales de 1810, en Guadalajara, Hidalgo decretó la abolición de la esclavitud y de los tributos que pagaban los pueblos originarios. Tras la captura y muerte de Hidalgo en 1811, el sacerdote José María Morelos y Pavón asumió el liderazgo del movimiento en el sur de México.

En septiembre de 1813, Morelos convocó al Congreso de Chilpancingo y presentó su célebre documento: "Sentimientos de la Nación". En él declaró que América debía ser libre e independiente de España, propuso dividir el poder en Ejecutivo, Legislativo y Judicial, y exigió que las leyes favorecieran la igualdad, moderando la opulencia y la indigencia. Morelos pidió ser llamado simplemente "Siervo de la Nación", un servidor humilde de su pueblo.`
  },
  {
    id: 'demo-4-diversidad-cultural',
    title: 'Capítulo 20: Lenguas originarias y riqueza cultural de México',
    chapter: 'Capítulo XX: Grandeza y Diversidad Hoy',
    pages: 'Págs. 340-356',
    isDemo: true,
    wordCount: 370,
    dateAdded: new Date().toISOString(),
    content: `México es uno de los países con mayor diversidad cultural y lingüística del planeta. En nuestro territorio se hablan 68 lenguas indígenas con 364 variantes lingüísticas, pertenecientes a 11 familias de lenguas originarias, como el náhuatl, el maya, el zapoteco, el mixteco, el rarámuri, el purépecha y el wixárika.

Cada lengua indígena contiene una forma única de entender el mundo, los conocimientos ancestrales sobre las plantas medicinales, los ciclos agrícolas y el respeto por los bosques, ríos y montañas. 

La diversidad de México también se manifiesta en sus fiestas populares, en la música tradicional como el son jarocho, el huapango y la pirekua, en la gastronomía declarada patrimonio de la humanidad, y en el arte textil donde cada bordado cuenta historias sobre el cosmos y la naturaleza. Respetar y proteger los derechos y las lenguas de los pueblos originarios es indispensable para valorar la grandeza de nuestro país.`
  }
];

export const ACTIVITY_METADATA_LIST = [
  {
    id: 'resumen',
    title: '1. Resumen por Apartados e Ideas Clave',
    shortTitle: 'Resumen e Ideas',
    icon: 'BookOpen',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Aprende los puntos centrales y apartados narrativos con explicaciones amables.',
    category: 'comprension'
  },
  {
    id: 'palabras_clave',
    title: '2. Palabras Clave y Vocabulario',
    shortTitle: 'Palabras Clave',
    icon: 'Key',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Descubre los términos históricos con definiciones sencillas y ejemplos cotidianos.',
    category: 'comprension'
  },
  {
    id: 'tarjetas',
    title: '3. Glosario y Tarjetas de Memoria',
    shortTitle: 'Tarjetas de Memoria',
    icon: 'Layers',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Tarjetas 3D interactivas para voltear, recordar conceptos y autoevaluarte.',
    category: 'juego'
  },
  {
    id: 'preguntas',
    title: '4. Cuestionario de Comprensión',
    shortTitle: 'Cuestionario',
    icon: 'HelpCircle',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    description: 'Preguntas de opción múltiple, verdadero o falso y preguntas de reflexión.',
    category: 'evaluacion'
  },
  {
    id: 'relacionar',
    title: '5. Relacionar Columnas y Conceptos',
    shortTitle: 'Relacionar Columnas',
    icon: 'GitCompare',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Une personajes, fechas, lugares y hechos históricos con sus significados.',
    category: 'juego'
  },
  {
    id: 'crucigrama',
    title: '6. Crucigrama Histórico',
    shortTitle: 'Crucigrama',
    icon: 'Grid',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Resuelve pistas horizontales y verticales para completar las palabras en la cuadrícula.',
    category: 'juego'
  },
  {
    id: 'sopa_letras',
    title: '7. Sopa de Letras Temática',
    shortTitle: 'Sopa de Letras',
    icon: 'Search',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'Encuentra las palabras clave escondidas en la cuadrícula de letras.',
    category: 'juego'
  },
  {
    id: 'linea_tiempo',
    title: '8. Línea del Tiempo y Orden Cronológico',
    shortTitle: 'Línea del Tiempo',
    icon: 'Clock',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Ordena los sucesos históricos del más antiguo al más reciente.',
    category: 'comprension'
  },
  {
    id: 'mapa_conceptual',
    title: '9. Mapa Conceptual y Esquema Visual',
    shortTitle: 'Mapa Conceptual',
    icon: 'Network',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Visualiza la relación jerárquica entre las ideas principales del tema.',
    category: 'comprension'
  },
  {
    id: 'completar',
    title: '10. Completar Espacios en Blanco',
    shortTitle: 'Completar Espacios',
    icon: 'FileEdit',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Elige del banco de palabras los términos correctos para completar el texto.',
    category: 'evaluacion'
  },
  {
    id: 'explica_palabras',
    title: '11. Explica con tus Palabras y Causa-Efecto',
    shortTitle: 'Explica con tus Palabras',
    icon: 'MessageSquare',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-300',
    description: 'Desarrolla tu pensamiento histórico comparando ideas y explicando causas.',
    category: 'comprension'
  },
  {
    id: 'reto_repaso',
    title: '12. Reto de Repaso y Juego de Estrellas',
    shortTitle: 'Reto de Repaso',
    icon: 'Trophy',
    badgeColor: 'bg-amber-200 text-amber-900 border-amber-400',
    description: 'Gana estrellas y medallas respondiendo retos rápidos con retroalimentación.',
    category: 'juego'
  },
  {
    id: 'imprimible',
    title: '13. Hojas Imprimibles y Guía para Docentes',
    shortTitle: 'Imprimible y Docente',
    icon: 'Printer',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
    description: 'Genera hojas de trabajo en PDF/impresión con guía de respuestas para el maestro o la familia.',
    category: 'docente'
  }
] as const;
