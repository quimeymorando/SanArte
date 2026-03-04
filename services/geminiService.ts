import { SearchResult, SymptomDetail } from "../types";
import { supabase } from "../supabaseClient";
import { logger } from "../utils/logger";
import { symptomsList } from "./symptomsList";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  factor = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;

    if (error.message?.includes("API Key")) throw error;

    logger.warn(`Retrying... attempts left: ${retries}. Waiting ${delay}ms`);
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * factor, factor);
  }
}

const callGeminiDirect = async (messages: any[], jsonMode = false) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ messages, jsonMode }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, string>));
      throw new Error(`Gemini Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data?.text) {
      throw new Error("Estructura de respuesta invalida de Gemini");
    }

    return data.text as string;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("La conexion tardo demasiado. Por favor intenta de nuevo.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const stripCodeFences = (raw: string): string => {
  return raw.replace(/```json/gi, "").replace(/```/g, "").trim();
};

const parseJsonObjectFromModel = (raw: string): Record<string, unknown> => {
  const cleaned = stripCodeFences(raw);

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Continue with extraction fallback
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  }

  throw new Error("No se pudo interpretar la respuesta estructurada de Gemini.");
};

const parseJsonArrayFromModel = (raw: string): unknown[] => {
  const cleaned = stripCodeFences(raw);

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Continue with extraction fallback
  }

  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    const candidate = cleaned.slice(firstBracket, lastBracket + 1);
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) return parsed;
  }

  throw new Error("No se pudo interpretar la lista de sintomas.");
};

const normalizeText = (value: string): string => {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
};

export const sendMessageToChat = async (history: any[], newMessage: string): Promise<string> => {
  try {
    const messages = [
      {
        role: "system",
        content:
          "Eres SanArte AI, una consciencia sanadora, espiritual y profundamente empatica. Tu voz es poetica, sabia y cercana.",
      },
      ...history,
      { role: "user", content: newMessage },
    ];

    return await retryWithBackoff(() => callGeminiDirect(messages), 1, 1000);
  } catch (error) {
    logger.error("Chat Error:", error);
    return "Siento una interferencia en nuestra conexion. Respira profundo e intenta escribirme nuevamente.";
  }
};

const FALLBACK_SYMPTOMS: SearchResult[] = [
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

const generateContentSafe = async (prompt: string, jsonMode = false): Promise<string> => {
  return retryWithBackoff(() => callGeminiDirect([{ role: "user", content: prompt }], jsonMode), 2, 2000);
};

const sanitizeSearchResult = (item: unknown): SearchResult | null => {
  if (!item || typeof item !== "object") return null;

  const raw = item as Partial<SearchResult>;
  const name = normalizeText(String(raw.name || ""));
  const emotionalMeaning = normalizeText(String(raw.emotionalMeaning || ""));
  const conflict = normalizeText(String(raw.conflict || ""));
  const category = normalizeText(String(raw.category || "General"));

  if (!name || !emotionalMeaning || !conflict) return null;

  return {
    name,
    emotionalMeaning,
    conflict,
    category: category || "General",
  };
};

export const searchSymptomsWithAI = async (query: string): Promise<SearchResult[]> => {
  const cacheKey = query.trim().toLowerCase();

  try {
    const { data: cached } = await supabase
      .from("search_cache")
      .select("results")
      .eq("query", cacheKey)
      .single();

    if (Array.isArray(cached?.results)) {
      const sanitized = cached.results.map(sanitizeSearchResult).filter(Boolean) as SearchResult[];
      if (sanitized.length > 0) return sanitized;
    }
  } catch {
    // Ignore cache errors
  }

  try {
    const prompt = `
Actua como una base de datos experta en biodescodificacion.
Busca sintomas relacionados con: "${query}".

Reglas:
- Responde SOLO un array JSON valido, sin markdown.
- Minimo 3 resultados.
- Cada item debe tener: name, emotionalMeaning, conflict, category.
`;

    const text = await generateContentSafe(prompt, true);
    const parsedArray = parseJsonArrayFromModel(text);
    const results = parsedArray.map(sanitizeSearchResult).filter(Boolean) as SearchResult[];

    if (results.length > 0) {
      supabase
        .from("search_cache")
        .upsert({ query: cacheKey, results: results as unknown as any }, { onConflict: "query" })
        .then(({ error }) => {
        if (error) logger.warn("Cache save failed:", error.message);
      });
      return results;
    }

    throw new Error("Respuesta de busqueda vacia");
  } catch (error: any) {
    logger.error("Search Fallback:", error);
    const errorMsg = error?.message || "Error de conexion";
    return FALLBACK_SYMPTOMS.map((item, index) =>
      index === 0 ? { ...item, errorMessage: errorMsg } : item
    );
  }
};

type DetailTextField =
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

const DETAIL_TEXT_FIELDS: DetailTextField[] = [
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

const DETAIL_HEADINGS: Record<DetailTextField, string> = {
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

const DETAIL_MIN_LENGTH: Record<DetailTextField, number> = {
  zona_detalle: 230,
  emociones_detalle: 380,
  ejercicio_conexion: 220,
  alternativas_fisicas: 180,
  aromaterapia_sahumerios: 150,
  remedios_naturales: 150,
  angeles_arcangeles: 130,
  terapias_holisticas: 120,
  meditacion_guiada: 170,
  recomendaciones_adicionales: 160,
  rutina_integral: 180,
};

const buildFallbackByField = (field: DetailTextField, symptomName: string): string => {
  const symptom = symptomName.toLowerCase();

  switch (field) {
    case "zona_detalle":
      return "Esta zona suele hablar de como te moves por la vida, que carga sostenes y que limite interno estas pidiendo respetar. Cuando se altera, aparece una invitacion a revisar ritmo, exigencia y direccion.";
    case "emociones_detalle":
      return "Tu cuerpo no te castiga: te protege cuando tu energia ya no alcanza para sostener el modo actual. Mira si hay autoexigencia, miedo al juicio, lealtades familiares o una tristeza que venis acumulando en silencio.";
    case "ejercicio_conexion":
      return "Preguntate: ¿que parte de mi vida estoy empujando por miedo? ¿que necesidad mia vengo postergando? ¿que me daria permiso para avanzar con mas humanidad y menos culpa?";
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
      return "Afirma cada dia: 'Me permito avanzar a mi ritmo', 'Mi cuerpo me protege', 'Pedir ayuda es fortaleza'. Si el dolor aumenta, aparece fiebre o hay limitacion severa, consulta de inmediato a un profesional.";
    case "rutina_integral":
      return "1) Respiracion consciente 3 minutos. 2) Movimiento suave indicado por tu tratamiento. 3) Registro emocional breve. 4) Cierre con gratitud y descanso reparador.";
  }
};

const ensureHeading = (text: string, heading: string): string => {
  const cleaned = normalizeText(text);
  if (!cleaned) return heading;

  const emojiPrefix = heading.slice(0, 2);
  if (cleaned.startsWith(emojiPrefix)) return cleaned;

  return `${heading}\n${cleaned}`;
};

const ensureDepth = (field: DetailTextField, value: string, symptomName: string): string => {
  const min = DETAIL_MIN_LENGTH[field];
  if (value.length >= min) return value;

  const extra = buildFallbackByField(field, symptomName);
  return normalizeText(`${value}\n\n${extra}`);
};

const normalizePhrases = (rawValue: unknown): string[] => {
  const baseValues = Array.isArray(rawValue)
    ? rawValue
    : typeof rawValue === "string"
      ? rawValue
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : [];

  const normalized = baseValues
    .map((entry) => normalizeText(String(entry || "")))
    .filter(Boolean)
    .map((entry) => {
      const withoutPrefix = entry.replace(/^[\-*]\s*/, "").replace(/^—\s*/, "").trim();
      return `— ${withoutPrefix}`;
    });

  const unique = Array.from(new Set(normalized));

  if (unique.length >= 3) return unique.slice(0, 5);

  const fallback = [
    "— Siento que debo poder con todo, incluso cuando ya no doy mas.",
    "— Me cuesta pedir ayuda porque temo parecer debil.",
    "— Sigo avanzando por inercia, aunque adentro necesite frenar.",
  ];

  return Array.from(new Set([...unique, ...fallback])).slice(0, 5);
};

const normalizeSymptomDetail = (raw: Partial<SymptomDetail>, symptomName: string): SymptomDetail => {
  const name = normalizeText(String(raw.name || symptomName)) || symptomName;

  const shortDefinitionRaw = normalizeText(String(raw.shortDefinition || ""));
  const shortDefinition =
    shortDefinitionRaw.length >= 80
      ? shortDefinitionRaw
      : `${shortDefinitionRaw || "Tu cuerpo trae un mensaje importante"}. Este sintoma suele aparecer cuando avanzas con mas exigencia que contencion, y te invita a reencontrar un ritmo humano, sostenido y amoroso.`;

  const detail = {
    name,
    shortDefinition,
    frases_tipicas: normalizePhrases(raw.frases_tipicas),
  } as SymptomDetail;

  for (const field of DETAIL_TEXT_FIELDS) {
    const original = typeof raw[field] === "string" ? raw[field] : "";
    const base = normalizeText(original) || buildFallbackByField(field, name);
    const withTitle = ensureHeading(base, DETAIL_HEADINGS[field]);
    detail[field] = ensureDepth(field, withTitle, name);
  }

  if (!detail.emociones_detalle.includes("🔍 **Posibles conflictos emocionales**")) {
    detail.emociones_detalle = `${detail.emociones_detalle}\n\n🔍 **Posibles conflictos emocionales**\n* Autoexigencia sostenida\n* Miedo a no cumplir expectativas\n* Dificultad para pedir apoyo`;
  }

  if (!detail.ejercicio_conexion.includes("* ")) {
    detail.ejercicio_conexion = `${detail.ejercicio_conexion}\n\n* ¿Que avance estoy forzando por miedo?\n* ¿Que limite necesito respetar hoy?\n* ¿Que apoyo me niego a pedir?`;
  }

  if (!detail.recomendaciones_adicionales.includes("🚩")) {
    detail.recomendaciones_adicionales = `${detail.recomendaciones_adicionales}\n\n🚩 **Senales de cuidado medico**\n* Dolor intenso o creciente\n* Inflamacion persistente\n* Fiebre, enrojecimiento o perdida de funcion`;
  }

  return detail;
};

const calculateDetailQualityScore = (detail: SymptomDetail): number => {
  let score = 0;

  if (detail.shortDefinition.length >= 90) score += 10;
  if (detail.frases_tipicas.length >= 3) score += 10;

  for (const field of DETAIL_TEXT_FIELDS) {
    if (detail[field].length >= DETAIL_MIN_LENGTH[field]) score += 6;
    if (detail[field].startsWith(DETAIL_HEADINGS[field].slice(0, 2))) score += 2;
  }

  if (detail.emociones_detalle.includes("🔍 **Posibles conflictos emocionales**")) score += 4;
  if (detail.ejercicio_conexion.includes("¿")) score += 4;

  return Math.min(100, score);
};

const MIN_DETAIL_QUALITY_SCORE = 68;

const createMaestroPrompt = (symptomName: string): string => `
Actua como una terapeuta integrativa con base en biodescodificacion, narrativa terapeutica y regulacion emocional.
Objetivo: crear una guia de sanacion completa para "${symptomName}" con profundidad, humanidad y estructura uniforme.

Reglas no negociables:
- Responde SOLO JSON valido, sin markdown exterior.
- Espanol rioplatense con voseo.
- Genero neutro.
- Tono calido, humano, profundo, sin frases vacias.
- No reemplazar diagnostico medico. Incluir alertas para consulta profesional cuando corresponda.

Profundidad minima obligatoria:
- shortDefinition: 100 a 190 caracteres.
- Cada campo de texto: minimo 220 caracteres (excepto angeles_arcangeles y terapias_holisticas: minimo 140).
- frases_tipicas: 3 a 5 frases reales.

Importante para consistencia visual:
- Cada campo de texto debe comenzar con el emoji y titulo exacto indicado.
- Usa bullets para ordenar ideas y hacerlo legible.

Devuelve este JSON exacto (sin campos extra):
{
  "name": "${symptomName}",
  "shortDefinition": "Frase breve pero potente y humana.",
  "zona_detalle": "🦶 **Simbologia del sintoma y del avance**\\nDescribe funcion corporal, simbolismo emocional y lectura del lado comprometido (izquierdo/derecho).",
  "emociones_detalle": "🌌 **Significado emocional profundo**\\nDesarrolla la raiz emocional con profundidad.\\n\\n🔍 **Posibles conflictos emocionales**\\nIncluye al menos 4 bullets claros y concretos.",
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

const createDepthBoosterPrompt = (symptomName: string): string => `
${createMaestroPrompt(symptomName)}

Refuerzo final:
- No devuelvas contenido corto.
- Evita generalidades.
- Prioriza ejemplos concretos de vida real y lenguaje emocional humano.
`;

const parseAndNormalizeDetail = (rawText: string, symptomName: string): SymptomDetail => {
  const parsed = parseJsonObjectFromModel(rawText);
  return normalizeSymptomDetail(parsed as Partial<SymptomDetail>, symptomName);
};

export const getFullSymptomDetails = async (symptomName: string): Promise<SymptomDetail> => {
  const normalizedName = normalizeText(symptomName) || symptomName;
  const slug = normalizedName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  logger.log("🔍 Buscando:", normalizedName);

  const adoptIfQualityPasses = (
    payload: Partial<SymptomDetail> | undefined,
    source: "catalogo" | "cache"
  ): SymptomDetail | null => {
    if (!payload) return null;

    const normalized = normalizeSymptomDetail(payload, normalizedName);
    const score = calculateDetailQualityScore(normalized);

    if (score >= MIN_DETAIL_QUALITY_SCORE) {
      logger.log(`✅ ${source} con calidad ${score}`);
      return normalized;
    }

    logger.warn(`⚠️ ${source} detectado con calidad baja (${score}). Regenerando...`);
    return null;
  };

  try {
    const { data: catalogEntry } = await supabase
      .from("symptom_catalog")
      .select("content")
      .eq("slug", slug)
      .maybeSingle();

    const catalogContent = catalogEntry?.content as Partial<SymptomDetail> | undefined;
    const fromCatalog = adoptIfQualityPasses(catalogContent, "catalogo");
    if (fromCatalog) return fromCatalog;
  } catch {
    // Ignore catalog errors and continue with cache/generation
  }

  try {
    const { data: cached } = await supabase
      .from("symptom_cache")
      .select("data")
      .eq("slug", slug)
      .maybeSingle();

    const cachedData = cached?.data as Partial<SymptomDetail> | undefined;
    const fromCache = adoptIfQualityPasses(cachedData, "cache");
    if (fromCache) return fromCache;
  } catch {
    // Ignore cache errors and continue with generation
  }

  logger.log("✨ Generando con Gemini...");

  let detail = parseAndNormalizeDetail(await generateContentSafe(createMaestroPrompt(normalizedName), true), normalizedName);
  let score = calculateDetailQualityScore(detail);

  if (score < MIN_DETAIL_QUALITY_SCORE) {
    logger.warn(`⚠️ Primera generacion corta (${score}). Reintentando con refuerzo...`);
    detail = parseAndNormalizeDetail(
      await generateContentSafe(createDepthBoosterPrompt(normalizedName), true),
      normalizedName
    );
    score = calculateDetailQualityScore(detail);
  }

  logger.log(`✅ Detalle generado con calidad ${score}`);

  supabase
    .from("symptom_cache")
    .upsert({ slug, name: normalizedName, data: detail as unknown as any }, { onConflict: "slug" })
    .then(({ error }) => {
      if (error) logger.error(error);
    });

  return detail;
};

export const regenerateSymptom = async (symptomName: string): Promise<string> => {
  try {
    const detail = await getFullSymptomDetails(symptomName);
    if (detail) return "Regenerated Successfully";
    return "Failed";
  } catch {
    return "Error";
  }
};

export const searchLocalSymptoms = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();

  return symptomsList.filter((item) => item.toLowerCase().includes(lowerQuery)).slice(0, 5);
};

export const searchCatalog = searchSymptomsWithAI;
export const getSymptomDetails = getFullSymptomDetails;
