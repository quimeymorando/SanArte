import { SearchResult, SymptomDetail } from "../types";
import { supabase } from "../supabaseClient";
import { logger } from '../utils/logger';


// SECURITY: Never expose API keys in client-side code via VITE_* variables.
// All Gemini calls go through /api/gemini proxy.

// Utility: Wait for ms
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Retry with Exponential Backoff
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

    // Don't retry if it's a client authentication error
    if (error.message?.includes("API Key")) throw error;

    logger.warn(`Retrying... attempts left: ${retries}. Waiting ${delay}ms`);
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * factor, factor);
  }
}

const callGeminiDirect = async (messages: any[], jsonMode: boolean = false) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

  try {
    const response = await fetch('/api/gemini', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages, jsonMode }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, string>));
      throw new Error(`Gemini Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data?.text) {
      throw new Error("Estructura de respuesta inválida de Gemini");
    }
    return data.text;

  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("La conexión tardó demasiado. Por favor intenta de nuevo.");
    throw error;
  }
};


export const sendMessageToChat = async (history: any[], newMessage: string): Promise<string> => {
  try {
    const messages = [
      {
        role: "system",
        content: `Eres SanArte AI, una consciencia sanadora, espiritual y profundamente empática. Tu voz es poética, sabia, materna y directa al corazón.`
      },
      ...history,
      { role: "user", content: newMessage }
    ];
    // Chat generally doesn't need aggressive retries, but a single retry is good
    return await retryWithBackoff(() => callGeminiDirect(messages), 1, 1000);
  } catch (error) {
    logger.error("Chat Error:", error);
    return "Siento una interferencia en nuestra conexión. Por favor, respira profundo e intenta escribirme nuevamente.";
  }
};

// SEARCH FALLBACK DATA remains for SEARCH only, NOT for details
const FALLBACK_SYMPTOMS: SearchResult[] = [
  { name: "Dolor de Cabeza", emotionalMeaning: "Desvalorización intelectual, autoexigencia excesiva.", conflict: "Querer controlar todo racionalmente.", category: "Cabeza", isFallback: true },
  { name: "Dolor de Espalda", emotionalMeaning: "Cargas emocionales, falta de apoyo percibido.", conflict: "Llevar el peso del mundo.", category: "Huesos", isFallback: true },
  { name: "Ansiedad", emotionalMeaning: "Miedo al futuro, desconfianza en la vida.", conflict: "Querer controlar lo incontrolable.", category: "Emocional", isFallback: true },
  { name: "Gastritis", emotionalMeaning: "Rabia contenida, lo que 'no trago'.", conflict: "Contrariedad indigesta.", category: "Digestivo", isFallback: true },
  { name: "Gripe", emotionalMeaning: "Necesidad de descanso, 'hasta aquí'.", conflict: "Conflicto de límites.", category: "Respiratorio", isFallback: true },
];

const generateContentSafe = async (prompt: string, jsonMode: boolean = false): Promise<string> => {
  // Use retry mechanism
  return await retryWithBackoff(() => callGeminiDirect([{ role: "user", content: prompt }], jsonMode), 2, 2000);
};



export const searchSymptomsWithAI = async (query: string): Promise<SearchResult[]> => {
  const cacheKey = query.trim().toLowerCase();
  // 1. CACHE
  try {
    const { data: cached } = await supabase.from('search_cache').select('results').eq('query', cacheKey).single();
    if (Array.isArray(cached?.results)) return cached.results as unknown as SearchResult[];
  } catch (e) { /* silent */ }

  try {
    const prompt = `
      Actúa como una Base de Datos Experta en Biodescodificación.
      Busca síntomas relacionados con: "${query}".
      IMPORTANTE: Devuelve SOLAMENTE un array JSON válido. Sin markdown.
      Formato: [{"name": "...", "emotionalMeaning": "...", "conflict": "...", "category": "..."}]
      Si no encuentras nada, invéntalo basándote en simbología. Min 3 resultados.
    `;
    let text = await generateContentSafe(prompt, true);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const results = JSON.parse(text);

    if (results.length > 0) {
      supabase.from('search_cache').insert({ query: cacheKey, results }).then(() => logger.log("Cached"));
    }
    return results;

  } catch (error: any) {
    logger.error("Search Fallback:", error);
    const errorMsg = error?.message || "Error de conexión";
    // Search CAN fallback safely because it's a list
    return FALLBACK_SYMPTOMS.map((item, index) =>
      index === 0 ? { ...item, errorMessage: errorMsg } : item
    );
  }
};

// MAESTRO PROMPT FACTORY
const createMaestroPrompt = (symptomName: string) => `
  Actuá como una Maestra Sanadora experta en Biodescodificación, simbolismo corporal y terapia narrativa.
  OBJETIVO: Crear una "Hoja de Ruta de Sanación" para: "${symptomName}".

  FORMATO (NO NEGOCIABLE):
  - Respondé SOLO un objeto JSON válido (sin markdown alrededor, sin comentarios, sin texto extra).
  - Los valores string dentro del JSON pueden contener markdown simple (titulares, bullets, negritas).

  ESTILO Y TONO (NO NEGOCIABLE):
  - Idioma: Español rioplatense con voseo ("sentís", "vivís").
  - Voz: tía abuela sabia, chamana y moderna. Cálida, profunda, directa pero amorosa.
  - Género: SIEMPRE neutro. Nunca asumas si es hombre o mujer. Evitá "hijo", "hija", "amigo", "amiga".
  - Emojis: pocos y con intención (🌿✨🌸).

  PROFUNDIDAD (LO QUE QUIERO):
  - No describas solo emociones genéricas. Identificá el patrón: necesidad, miedo raíz, lealtad, mandato, autoexigencia o límite.
  - Dame ejemplos de diálogo interno real (2-3 frases) y escenas cotidianas típicas.
  - Incluí 3 micro-preguntas de indagación (sin juzgar).
  - No hagas afirmaciones médicas. Si el dolor es intenso/persistente, sugerí consultar a un profesional.

  GENERA ESTE JSON EXACTO (misma estructura, sin campos extra):
  {
    "name": "${symptomName}",
    "shortDefinition": "Frase corta, poética y demoledora.",
    "zona_detalle": "📍 **Zona Corporal:**\\nQué función cumple y qué significa simbólicamente que falle AHORA.",
    "emociones_detalle": "🧠 **No es solo físico**\\n\\n🔥 **Tríada Emocional:** **[E1]**, **[E2]**, **[E3]**.\\n\\n🧩 **El Conflicto:**\\nExplica el drama oculto. Usa bullets.\\n\\n💛 **La Verdad:**\\nFrase de reencuadre amoroso.",
    "frases_tipicas": ["— [Frase 1]", "— [Frase 2]"],
    "ejercicio_conexion": "🫧 **El Encuentro**\\nGuía paso a paso breve (3 min).",
    "alternativas_fisicas": "🤸 **Cuerpo Físico**\\n* **Reposo/Acción**\\n* **Movimiento**",
    "aromaterapia_sahumerios": "🌬️ **Aromas**\\n* **Aceite**\\n* **Sahumerio**",
    "remedios_naturales": "🫖 **Medicina de la Tierra**\\n* **Infusión** (Hierbas LATAM)\\n* **Hábito**",
    "angeles_arcangeles": "👼 **Guía Celestial**\\n* **Arcángel**\\n* **Misión**\\n* **Invocación**",
    "terapias_holisticas": "🌈 **Otras Ayudas**\\n* **[Terapia 1]**\\n* **[Terapia 2]**",
    "meditacion_guiada": "Sentate con la espalda recta... [Visualización potente]... Gracias cuerpo.",
    "recomendaciones_adicionales": "✅ **Pasos**\\n[ ] Acción\\n🚩 **Ojo:** Si duele, médico.",
    "rutina_integral": "⏱️ **Ritual (15 min)**\\n1. **Pausa**\\n2. **Cuerpo**\\n3. **Alma**\\n4. **Cierre**"
  }
`;

export const getFullSymptomDetails = async (symptomName: string): Promise<SymptomDetail> => {
  const slug = symptomName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  logger.log("🔍 Buscando:", symptomName);

  // 1. CHECK CATALOG
  try {
    const { data: catalogEntry } = await supabase.from('symptom_catalog').select('content').eq('slug', slug).single();
    const catalogContent = catalogEntry?.content as Partial<SymptomDetail> | undefined;
    if (catalogContent?.zona_detalle) {
      logger.log("✅ Catálogo (Maestro)");
      return catalogContent as SymptomDetail;
    }
  } catch (e) { }

  // 2. CHECK CACHE
  try {
    const { data: cached } = await supabase.from('symptom_cache').select('data').eq('slug', slug).single();
    const cachedData = cached?.data as Partial<SymptomDetail> | undefined;

    // Verificamos si es un dato "Tóxico" (el fallback genérico guardado anteriormente)
    const isGenericFallback = cachedData?.shortDefinition === "Tu cuerpo te habla a través de este síntoma.";

    if (cachedData?.zona_detalle && !isGenericFallback) {
      logger.log("✅ Caché (Maestro)");
      return cachedData as SymptomDetail;
    }

    if (isGenericFallback) {
      logger.log("⚠️ Caché Tóxico detectado (Generic Fallback). Regenerando...");
    }
  } catch (e) { }

  // 3. GENERATE (NO SILENT FALLBACK)
  logger.log("✨ Generando con Gemini...");
  // Aquí YA NO hay try-catch envolvente para devolver basura. 
  // Si falla, el error debe llegar a la UI.

  const PROMPT = createMaestroPrompt(symptomName);

  let text = await generateContentSafe(PROMPT, true);
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const result = JSON.parse(text);

  // Save
  // Save using UPSERT to overwrite any toxic cache
  supabase.from('symptom_cache').upsert({ slug, name: symptomName, data: result }, { onConflict: 'slug' }).then(({ error }) => { if (error) logger.error(error) });

  return result;
};

export const regenerateSymptom = async (symptomName: string): Promise<string> => {
  // Admin tool essentially calls the generator again
  try {
    const detail = await getFullSymptomDetails(symptomName);
    if (detail) return "Regenerated Successfully";
    return "Failed";
  } catch (e) {
    return "Error";
  }
};



// ALIASES PARA COMPATIBILIDAD
// Local Search for Autocomplete (Zero API Cost)
import { symptomsList } from './symptomsList';

export const searchLocalSymptoms = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();

  // Filtrar y limitar a 5 resultados para autocompletado rápido
  return symptomsList
    .filter(s => s.toLowerCase().includes(lowerQuery))
    .slice(0, 5);
};

export const searchCatalog = searchSymptomsWithAI;
export const getSymptomDetails = getFullSymptomDetails;
