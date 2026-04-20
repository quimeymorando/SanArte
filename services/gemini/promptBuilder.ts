import { SymptomDetail } from "../../types";

export const METHODOLOGY_VERSION = "depth-v2";

export type DetailTextField =
  | "zona_detalle"
  | "emociones_detalle"
  | "ejercicio_conexion"
  | "alternativas_fisicas"
  | "aromaterapia_sahumerios"
  | "remedios_naturales"
  | "angeles_arcangeles"
  | "terapias_holisticas"
  | "meditacion_guiada"
  | "recomendaciones_adicionales"
  | "rutina_integral";

export const DETAIL_TEXT_FIELDS: DetailTextField[] = [
  "zona_detalle",
  "emociones_detalle",
  "ejercicio_conexion",
  "alternativas_fisicas",
  "aromaterapia_sahumerios",
  "remedios_naturales",
  "angeles_arcangeles",
  "terapias_holisticas",
  "meditacion_guiada",
  "recomendaciones_adicionales",
  "rutina_integral",
];

export const DETAIL_HEADINGS: Record<DetailTextField, string> = {
  zona_detalle: "🦶 **Simbologia del sintoma y del avance**",
  emociones_detalle: "🌌 **Significado emocional profundo**",
  ejercicio_conexion: "🫂 **Preguntas para ir al corazon**",
  alternativas_fisicas: "🧬 **Recomendaciones fisicas especificas**",
  aromaterapia_sahumerios: "🌸 **Aromaterapia y sahumerios**",
  remedios_naturales: "🫖 **Medicina natural casera**",
  angeles_arcangeles: "👼 **Arcangel guia**",
  terapias_holisticas: "🌈 **Terapias holisticas recomendadas**",
  meditacion_guiada: "🧘 **Meditacion guiada**",
  recomendaciones_adicionales: "📖 **Afirmaciones y recordatorios clave**",
  rutina_integral: "⏱️ **Ritual diario de integracion**",
};

export const DETAIL_MIN_LENGTH: Record<DetailTextField, number> = {
  zona_detalle: 320,
  emociones_detalle: 720,
  ejercicio_conexion: 260,
  alternativas_fisicas: 180,
  aromaterapia_sahumerios: 150,
  remedios_naturales: 150,
  angeles_arcangeles: 130,
  terapias_holisticas: 120,
  meditacion_guiada: 170,
  recomendaciones_adicionales: 160,
  rutina_integral: 180,
};

export const LEGACY_RESPONSE_MARKERS = [
  "📍 Zona Corporal",
  "🧠 No es solo físico",
  "🫧 El Encuentro",
  "⏱️ Ritual (15 min)",
  "🔥 Tríada Emocional"
];

export const FALLBACK_SYMPTOMS = [
  {
    name: "Dolor de Cabeza",
    emotionalMeaning: "Desvalorizacion intelectual y autoexigencia excesiva.",
    conflict: "Querer controlar todo racionalmente.",
    category: "Cabeza",
    isFallback: true,
  },
  {
    name: "Dolor de Espalda",
    emotionalMeaning: "Cargas emocionales y falta de apoyo percibido.",
    conflict: "Llevar el peso del mundo.",
    category: "Huesos",
    isFallback: true,
  },
  {
    name: "Ansiedad",
    emotionalMeaning: "Miedo al futuro y desconfianza en la vida.",
    conflict: "Querer controlar lo incontrolable.",
    category: "Emocional",
    isFallback: true,
  },
  {
    name: "Gastritis",
    emotionalMeaning: "Rabia contenida y algo que no logras tragar.",
    conflict: "Contrariedad indigesta.",
    category: "Digestivo",
    isFallback: true,
  },
  {
    name: "Gripe",
    emotionalMeaning: "Necesidad de descanso y limites mas claros.",
    conflict: "Conflicto de saturacion.",
    category: "Respiratorio",
    isFallback: true,
  },
];

export const MIN_DETAIL_QUALITY_SCORE = 60;

export const createMaestroPrompt = (symptomName: string): string => `
Actua como una terapeuta integrativa con base en biodescodificacion, narrativa terapeutica y regulacion emocional.
Objetivo: crear una guia de sanacion completa para "${symptomName}" con profundidad, humanidad y estructura uniforme.

Reglas no negociables:
- Responde SOLO JSON valido, sin markdown exterior.
- Espanol rioplatense con voseo.
- Genero neutro.
- Tono calido, humano, profundo, sin frases vacias.
- No reemplazar diagnostico medico. Incluir alertas para consulta profesional cuando corresponda.
- No uses placeholders entre corchetes (ej: [Emocion], [Conflicto]).

Profundidad minima obligatoria:
- shortDefinition: 100 a 190 caracteres.
- Cada campo de texto: minimo 220 caracteres (excepto angeles_arcangeles y terapias_holisticas: minimo 140).
- frases_tipicas: 3 a 5 frases reales.
- En emociones_detalle: minimo 700 caracteres, incluir "💔 **Lectura de fondo**" y al menos 4 bullets concretos.

Importante para consistencia visual:
- Cada campo de texto debe comenzar con el emoji y titulo exacto indicado.
- Usa bullets para ordenar ideas y hacerlo legible.

Devuelve este JSON exacto (sin campos extra):
{
  "name": "${symptomName}",
  "shortDefinition": "Frase breve pero potente y humana.",
  "zona_detalle": "🦶 **Simbologia del sintoma y del avance**\\nDescribe funcion corporal, simbolismo emocional y lectura del lado comprometido (izquierdo/derecho).",
  "emociones_detalle": "🌌 **Significado emocional profundo**\\nDesarrolla la raiz emocional con profundidad.\\n\\n💔 **Lectura de fondo**\\nExplica que dolor emocional suele sostener este sintoma en la vida real.\\n\\n🔍 **Posibles conflictos emocionales**\\nIncluye al menos 4 bullets claros y concretos.",
  "frases_tipicas": ["— Frase 1", "— Frase 2", "— Frase 3"],
  "ejercicio_conexion": "🫂 **Preguntas para ir al corazon**\\nIncluye 4 a 6 preguntas de indagacion profunda.",
  "alternativas_fisicas": "🧬 **Recomendaciones fisicas especificas**\\nIncluye 4 a 6 recomendaciones de recuperacion fisica segura.",
  "aromaterapia_sahumerios": "🌸 **Aromaterapia y sahumerios**\\nIncluye al menos 3 aromas y su beneficio emocional.",
  "remedios_naturales": "🫖 **Medicina natural casera**\\nIncluye 3 a 5 sugerencias practicas (infusiones/habitos) con criterio.",
  "angeles_arcangeles": "👼 **Arcangel guia**\\nIncluye arcangel, proposito y breve invocacion.",
  "terapias_holisticas": "🌈 **Terapias holisticas recomendadas**\\nIncluye al menos 3 terapias y como ayudan.",
  "meditacion_guiada": "🧘 **Meditacion guiada**\\nGuion de 10 a 14 lineas, respiracion, visualizacion y cierre.",
  "recomendaciones_adicionales": "📖 **Afirmaciones y recordatorios clave**\\nIncluye 4 afirmaciones + bloque de alertas medicas con emoji 🚩.",
  "rutina_integral": "⏱️ **Ritual diario de integracion**\\nRutina de 15 minutos en 4 pasos numerados."
}
`;

export const createDepthBoosterPrompt = (symptomName: string): string => `
${createMaestroPrompt(symptomName)}

Refuerzo final:
- No devuelvas contenido corto.
- Evita generalidades.
- Prioriza ejemplos concretos de vida real y lenguaje emocional humano.
`;

export const buildFallbackByField = (field: DetailTextField, symptomName: string): string => {
  const symptom = symptomName.toLowerCase();

  switch (field) {
    case "zona_detalle":
      return `El ${symptom} no habla solo del organo: habla del modo en que estas caminando tu vida por dentro. Cuando esta zona se altera, suele aparecer un mensaje de freno, de reorganizacion y de limite emocional que no estaba siendo escuchado.\n\n🦵 **Lectura del lado corporal**\n* **Lado derecho:** tendencia a exigirte en lo laboral, en la accion y en el deber.\n* **Lado izquierdo:** tension en lo afectivo, lo receptivo y la historia emocional.\n\nEste sintoma te pregunta con mucha claridad: ¿estas avanzando por fidelidad a tu verdad o por miedo a fallar?`;
    case "emociones_detalle":
      return `Tu cuerpo no te castiga: te protege cuando detecta que seguis empujando un ritmo que te lastima. En este sintoma suele haber una mezcla de saturacion, autoexigencia y necesidad de control, con una emocion de fondo que no encontro un canal seguro para expresarse.\n\n💔 **Lectura de fondo**\nMucho de lo que duele no es lo que paso, sino lo que callaste para poder seguir. Tu sistema nervioso se pone en alerta cuando siente que no hay permiso para descansar, pedir ayuda o mostrar fragilidad.\n\n🔍 **Posibles conflictos emocionales**\n* Miedo a decepcionar si bajas el ritmo.\n* Rabia contenida por sostener mas de lo que corresponde.\n* Culpa al priorizar tus necesidades.\n* Tristeza acumulada que no llego al llanto.\n* Sensacion de estar en modo supervivencia, no en modo vida.\n\nLa clave no es forzarte a ser fuerte: es construir un ritmo mas humano, con pausas reales y limites claros.`;
    case "ejercicio_conexion":
      return "Tomate tres respiraciones profundas y hace estas preguntas por escrito, sin censura:\n\n* ¿Que parte de mi vida estoy empujando por miedo a quedar mal?\n* ¿Que necesidad emocional vengo postergando hace semanas?\n* ¿En que lugar me abandono para sostener a otras personas?\n* ¿Que limite necesito poner para recuperar paz interna?\n* ¿Que pasaria si avanzo mas lento pero mas fiel a mi verdad?";
    case "alternativas_fisicas":
      return "Prioriza reposo real, acompanamiento profesional y una rehabilitacion progresiva. Evita forzarte por ansiedad de resultados y respeta los tiempos biologicos de recuperacion.";
    case "aromaterapia_sahumerios":
      return "Lavanda para bajar exigencia, romero para recuperar claridad y palo santo para soltar la frustracion acumulada. Usa aromas suaves, con intencion y respiracion lenta.";
    case "remedios_naturales":
      return "Infusiones antiinflamatorias suaves, hidratacion sostenida y habitos simples de descanso. Lo natural acompana, pero no reemplaza el seguimiento medico cuando hay dolor persistente.";
    case "angeles_arcangeles":
      return "Conecta con la energia de proteccion y coraje para soltar sobrecargas. Pide claridad para avanzar a un ritmo mas fiel a tu verdad interna.";
    case "terapias_holisticas":
      return "Reiki, respiracion consciente y abordajes cuerpo-mente pueden ayudarte a liberar tension emocional que quedo fijada en esta zona.";
    case "meditacion_guiada":
      return `Lleva la atencion a ${symptom}, respira en cuatro tiempos y repite: "No necesito forzarme para demostrar mi valor". Visualiza una luz azul que calma y reorganiza tu energia.`;
    case "recomendaciones_adicionales":
      return "Afirmaciones para integrar: \n* 'Me permito avanzar sin violencia interna.'\n* 'Mi cuerpo no me traiciona: me orienta.'\n* 'Descansar tambien es sanar.'\n* 'Pedir ayuda es una forma madura de cuidarme.'\n\n🚩 Si el dolor es intenso, persistente o limita funciones basicas, consulta con un profesional de salud para evaluacion clinica.";
    case "rutina_integral":
      return "1) Respiracion consciente 3 minutos. 2) Movimiento suave indicado por tu tratamiento. 3) Registro emocional breve. 4) Cierre con gratitud y descanso reparador.";
  }
};
