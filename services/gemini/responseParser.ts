import { SearchResult, SymptomDetail } from "../../types";
import {
  DetailTextField,
  DETAIL_TEXT_FIELDS,
  DETAIL_HEADINGS,
  DETAIL_MIN_LENGTH,
  LEGACY_RESPONSE_MARKERS,
  buildFallbackByField,
} from "./promptBuilder";

export const stripCodeFences = (raw: string): string => {
  return raw.replace(/```json/gi, "").replace(/```/g, "").trim();
};

export const normalizeText = (value: string): string => {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
};

export const parseJsonObjectFromModel = (raw: string): Record<string, unknown> => {
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

export const parseJsonArrayFromModel = (raw: string): unknown[] => {
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

export const sanitizeSearchResult = (item: unknown): SearchResult | null => {
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

const containsLegacyMarker = (text: string): boolean => {
  return LEGACY_RESPONSE_MARKERS.some((marker) => text.includes(marker));
};

const hasPlaceholderArtifacts = (text: string): boolean => /\[[^\]]+\]/.test(text);

export const payloadLooksLegacy = (payload: Partial<SymptomDetail>): boolean => {
  const fieldsToCheck = [
    String(payload.zona_detalle || ""),
    String(payload.emociones_detalle || ""),
    String(payload.ejercicio_conexion || ""),
    String(payload.rutina_integral || "")
  ];

  return fieldsToCheck.some((text) => containsLegacyMarker(text));
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

export const normalizeSymptomDetail = (raw: Partial<SymptomDetail>, symptomName: string): SymptomDetail => {
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

const countBullets = (text: string): number => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("*") || line.startsWith("-"))
    .length;
};

export const hasHumanDepthSignals = (detail: SymptomDetail): boolean => {
  if (detail.zona_detalle.length < 300) return false;
  if (detail.emociones_detalle.length < 700) return false;
  // Verificar presencia de al menos uno de los headings clave
  // (flexible con variantes de formato)
  const hasLecturaFondo = detail.emociones_detalle.includes("Lectura de fondo") ||
    detail.emociones_detalle.includes("lectura de fondo");
  const hasConflictos = detail.emociones_detalle.includes("conflictos emocionales") ||
    detail.emociones_detalle.includes("Posibles conflictos");
  if (!hasLecturaFondo && !hasConflictos) return false;
  if (countBullets(detail.emociones_detalle) < 4) return false;
  if (hasPlaceholderArtifacts(detail.emociones_detalle)) return false;
  return true;
};

export const calculateDetailQualityScore = (detail: SymptomDetail): number => {
  let score = 0;

  if (detail.shortDefinition.length >= 90) score += 10;
  if (detail.frases_tipicas.length >= 3) score += 10;

  for (const field of DETAIL_TEXT_FIELDS) {
    if (detail[field].length >= DETAIL_MIN_LENGTH[field]) score += 6;
    if (detail[field].startsWith(DETAIL_HEADINGS[field].slice(0, 2))) score += 2;
  }

  if (detail.emociones_detalle.includes("🔍 **Posibles conflictos emocionales**")) score += 4;
  if (detail.emociones_detalle.includes("💔 **Lectura de fondo**")) score += 6;
  if (detail.ejercicio_conexion.includes("¿")) score += 4;
  if (countBullets(detail.emociones_detalle) >= 4) score += 6;

  return Math.min(100, score);
};
