import { SearchResult, SymptomDetail } from "../../types";
import { supabase } from "../../supabaseClient";
import { logger } from "../../utils/logger";
import { symptomsList } from "../symptomsList";
import {
  METHODOLOGY_VERSION,
  FALLBACK_SYMPTOMS,
  MIN_DETAIL_QUALITY_SCORE,
  createMaestroPrompt,
  createDepthBoosterPrompt,
} from "./promptBuilder";
import {
  parseJsonArrayFromModel,
  parseJsonObjectFromModel,
  sanitizeSearchResult,
  normalizeSymptomDetail,
  normalizeText,
  payloadLooksLegacy,
  hasHumanDepthSignals,
  calculateDetailQualityScore,
} from "./responseParser";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  factor = 1.5
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
  const timeoutId = setTimeout(() => controller.abort(), 75000);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('[SanArte] Session:', session ? 'OK' : 'NULL');

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
    console.error('[SanArte] Gemini error:', {
      message: error?.message,
      status: (error as any)?.status,
      stack: error?.stack?.split('\n')[0]
    });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const generateContentSafe = async (prompt: string, jsonMode = false): Promise<string> => {
  return retryWithBackoff(() => callGeminiDirect([{ role: "user", content: prompt }], jsonMode), 4, 3000);
};

const parseAndNormalizeDetail = (rawText: string, symptomName: string): SymptomDetail => {
  const parsed = parseJsonObjectFromModel(rawText);
  return normalizeSymptomDetail(parsed as Partial<SymptomDetail>, symptomName);
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

    return await retryWithBackoff(() => callGeminiDirect(messages), 4, 3000);
  } catch (error) {
    logger.error("Chat Error:", error);
    return "Siento una interferencia en nuestra conexion. Respira profundo e intenta escribirme nuevamente.";
  }
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

export const getFullSymptomDetails = async (symptomName: string): Promise<SymptomDetail> => {
  const normalizedName = normalizeText(symptomName) || symptomName;
  const slug = normalizedName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  logger.log("🔍 Buscando:", normalizedName);
  console.log('=== slug ===', slug);

  const adoptIfQualityPasses = (
    payload: Partial<SymptomDetail> | undefined,
    source: "catalogo" | "cache"
  ): SymptomDetail | null => {
    if (!payload) return null;

    const payloadVersion = String((payload as any)?._methodology_version || "");
    if (payloadVersion && payloadVersion !== METHODOLOGY_VERSION) {
      logger.warn(`⚠️ ${source} version antigua (${payloadVersion}). Regenerando...`);
      return null;
    }

    if (payloadLooksLegacy(payload)) {
      logger.warn(`⚠️ ${source} detectado con estructura legacy. Regenerando...`);
      return null;
    }

    const normalized = normalizeSymptomDetail(payload, normalizedName);
    const score = calculateDetailQualityScore(normalized);

    if (!hasHumanDepthSignals(normalized)) {
      logger.warn(`⚠️ ${source} sin profundidad humana suficiente. Regenerando...`);
      return null;
    }

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
    console.log('=== catalog result ===', catalogEntry);
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
    console.log('=== cache result ===', cached);
    const fromCache = adoptIfQualityPasses(cachedData, "cache");
    if (fromCache) return fromCache;
  } catch {
    // Ignore cache errors and continue with generation
  }

  logger.log("✨ Generando con Gemini...");

  let detail = parseAndNormalizeDetail(await generateContentSafe(createMaestroPrompt(normalizedName), true), normalizedName);
  console.log('=== gemini result (raw) ===', detail);
  let score = calculateDetailQualityScore(detail);

  if (score < MIN_DETAIL_QUALITY_SCORE || !hasHumanDepthSignals(detail)) {
    logger.warn(`⚠️ Primera generacion insuficiente (${score}). Reintentando con refuerzo...`);
    detail = parseAndNormalizeDetail(
      await generateContentSafe(createDepthBoosterPrompt(normalizedName), true),
      normalizedName
    );
    score = calculateDetailQualityScore(detail);
  }

  if (score < MIN_DETAIL_QUALITY_SCORE || !hasHumanDepthSignals(detail)) {
    logger.warn(`⚠️ Segunda generacion insuficiente (${score}). Intento final...`);
    detail = parseAndNormalizeDetail(
      await generateContentSafe(createDepthBoosterPrompt(normalizedName), true),
      normalizedName
    );
    score = calculateDetailQualityScore(detail);
  }

  logger.log(`✅ Detalle generado con calidad ${score}`);

  supabase
    .from("symptom_cache")
    .upsert(
      {
        slug,
        name: normalizedName,
        data: {
          ...detail,
          _methodology_version: METHODOLOGY_VERSION
        } as any
      },
      { onConflict: "slug" }
    )
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
