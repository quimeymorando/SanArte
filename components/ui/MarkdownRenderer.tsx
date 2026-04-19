import React, { createContext, useContext } from 'react';

interface MarkdownRendererProps {
    text: string;
    className?: string;
}

// ─── Dimension accent context ─────────────────────────
// Cada MagicalCard envuelve sus children en este provider con su color.
// MarkdownRenderer consume este accent para headings y bullet dots (identidad dimensión).
// Las palabras clave de bullets van SIEMPRE en dorado (legibilidad uniforme).
const DimensionAccentContext = createContext<string>('#C9A84C');
export const DimensionAccentProvider = DimensionAccentContext.Provider;
export const useDimensionAccent = () => useContext(DimensionAccentContext);

// Dorado uniforme para palabras clave (no varía por dimensión).
const KEYWORD_GOLD = '#C9A84C';

// ─── Heading text → Material Symbol ──────────────────
const SECTION_ICON_MAP: Array<{ keywords: string[]; icon: string }> = [
    { keywords: ['simbología', 'simbologia'], icon: 'psychology' },
    { keywords: ['significado emocional', 'significado'], icon: 'auto_stories' },
    { keywords: ['lectura de fondo', 'lectura'], icon: 'favorite_border' },
    { keywords: ['posibles conflictos', 'conflictos emocionales', 'conflictos'], icon: 'search' },
    { keywords: ['frases que resuenan', 'frases típicas', 'frases tipicas', 'frases'], icon: 'format_quote' },
    { keywords: ['ejercicio de conexión', 'ejercicio de conexion', 'ejercicio'], icon: 'flare' },
    { keywords: ['preguntas para ir al corazón', 'preguntas para ir al corazon', 'preguntas'], icon: 'help_outline' },
    { keywords: ['recomendaciones físicas', 'recomendaciones fisicas', 'activación física', 'activacion fisica'], icon: 'self_improvement' },
    { keywords: ['medicina natural', 'remedios de la abuela', 'remedios'], icon: 'science' },
    { keywords: ['aromaterapia', 'sahumerios', 'aromas'], icon: 'local_florist' },
    { keywords: ['arcángel', 'arcangel', 'ángel', 'angel'], icon: 'auto_awesome' },
    { keywords: ['terapias holísticas', 'terapias holisticas', 'terapias'], icon: 'palette' },
    { keywords: ['ritual diario', 'ritual de integración', 'ritual'], icon: 'nightlight' },
    { keywords: ['afirmaciones', 'recordatorios'], icon: 'menu_book' },
    { keywords: ['alertas médicas', 'alertas medicas', 'alertas', 'advertencia'], icon: 'warning' },
];

const pickIcon = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const entry of SECTION_ICON_MAP) {
        if (entry.keywords.some(k => lower.includes(k))) return entry.icon;
    }
    return null;
};

// ─── Emoji stripping ──────────────────────────────────
// Cubre Extended_Pictographic + bloques Unicode de símbolos/emoji comunes.
const EMOJI_GLOBAL_RE = /[\p{Extended_Pictographic}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu;
const EMOJI_LEADING_RE = /^[\p{Extended_Pictographic}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]+\s*/u;

const stripAllEmojis = (s: string) => s.replace(EMOJI_GLOBAL_RE, '').replace(/\s+/g, ' ').trim();
const stripLeadingEmojis = (s: string) => s.replace(EMOJI_LEADING_RE, '').trim();

// ─── Pre-processor ───────────────────────────────────
// Convierte líneas que son headings disfrazados en markdown real,
// y elimina duplicados emoji + **bold** que aparecerían como párrafo extra.
const preprocessMarkdown = (raw: string): string => {
    if (!raw) return raw;
    const lines = raw.split('\n');
    const out: string[] = [];

    // Patterns para detectar "heading camuflado":
    //   🌿 **Título**           → ### Título
    //   🌿 Texto terminado en : → ### Texto
    //   🌿 **Texto:** resto     → ### Texto  (+ resto como bullet)
    const boldHeadingRe = /^[\p{Extended_Pictographic}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]+\s+\*\*(.+?)\*\*\s*:?\s*$/u;
    const colonHeadingRe = /^[\p{Extended_Pictographic}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]+\s+([^:*]+):\s*$/u;
    const boldLeadWithTailRe = /^[\p{Extended_Pictographic}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]+\s+\*\*(.+?):\*\*\s+(.+)$/u;

    for (const line of lines) {
        const trimmed = line.trim();

        // Heading camuflado: "🌿 **Título**"
        const mBold = trimmed.match(boldHeadingRe);
        if (mBold) {
            out.push(`### ${stripAllEmojis(mBold[1])}`);
            continue;
        }

        // Heading camuflado: "🌿 Texto:"
        const mColon = trimmed.match(colonHeadingRe);
        if (mColon) {
            out.push(`### ${stripAllEmojis(mColon[1])}`);
            continue;
        }

        // "🌿 **Título:** descripción" → heading + bullet
        const mTail = trimmed.match(boldLeadWithTailRe);
        if (mTail) {
            out.push(`### ${stripAllEmojis(mTail[1])}`);
            out.push(`* ${mTail[2]}`);
            continue;
        }

        // Heading markdown con emoji embebido: "## 🌿 Título" o "### 🌿 **Título**"
        if (/^###?\s/.test(trimmed)) {
            const hashMatch = trimmed.match(/^(###?)\s+(.*)$/);
            if (hashMatch) {
                const cleaned = stripAllEmojis(hashMatch[2]).replace(/\*+/g, '').trim();
                out.push(`${hashMatch[1]} ${cleaned}`);
                continue;
            }
        }

        out.push(line);
    }

    return out.join('\n');
};

// ─── Deduplicación defensiva ─────────────────────────
// La IA a veces devuelve el mismo heading dos veces consecutivas
// (uno con diacríticos/caps distintos al otro). Conservamos el primero.
const normalizeForCompare = (text: string): string =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

const dedupeConsecutiveHeadings = (markdown: string): string => {
    if (!markdown) return markdown;
    const lines = markdown.split('\n');
    const result: string[] = [];
    let lastHeadingNormalized: string | null = null;

    for (const line of lines) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const currentNormalized = normalizeForCompare(headingMatch[2]);
            if (currentNormalized && currentNormalized === lastHeadingNormalized) {
                continue;
            }
            lastHeadingNormalized = currentNormalized;
        } else if (line.trim() !== '') {
            lastHeadingNormalized = null;
        }
        result.push(line);
    }

    return result.join('\n');
};

// ─── SectionHeading — reutilizable ────────────────────
export const SectionHeading: React.FC<{ text: string; color: string; first?: boolean }> = ({ text, color, first = false }) => {
    const cleanText = stripAllEmojis(text).replace(/\*+/g, '').trim();
    const icon = pickIcon(cleanText);
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: first ? 0 : '24px',
                marginBottom: '14px',
            }}
        >
            {icon && (
                <span
                    className="material-symbols-outlined"
                    style={{
                        fontSize: '22px',
                        color,
                        fontVariationSettings: "'wght' 300",
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >{icon}</span>
            )}
            <span
                style={{
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color,
                    lineHeight: 1.3,
                }}
            >{cleanText}</span>
        </div>
    );
};

// ─── Inline formatter (bold, italic) ──────────────────
// Bold → dorado uniforme. Italic → gris suave.
const InlineMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <span key={i} style={{ fontWeight: 600, color: KEYWORD_GOLD }}>
                            {part.slice(2, -2)}
                        </span>
                    );
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return (
                        <span key={i} style={{ fontStyle: 'italic', color: '#8B7A6A' }}>
                            {part.slice(1, -1)}
                        </span>
                    );
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </>
    );
};

const bodyStyle: React.CSSProperties = {
    fontFamily: '"Outfit", "Inter", sans-serif',
    fontSize: '13px',
    color: '#8B7A6A',
    lineHeight: 1.75,
    margin: 0,
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, className = '' }) => {
    const accent = useDimensionAccent();
    if (!text) return null;

    const processed = dedupeConsecutiveHeadings(preprocessMarkdown(text));
    let headingCount = 0;

    return (
        <div className={className}>
            {processed.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} style={{ height: '4px' }} />;

                // Headers (## y ###) — emojis ya limpiados por preprocessor
                if (trimmed.startsWith('### ')) {
                    const headingText = trimmed.slice(4);
                    const isFirst = headingCount === 0;
                    headingCount++;
                    return <SectionHeading key={idx} text={headingText} color={accent} first={isFirst} />;
                }
                if (trimmed.startsWith('## ')) {
                    const headingText = trimmed.slice(3);
                    const isFirst = headingCount === 0;
                    headingCount++;
                    return <SectionHeading key={idx} text={headingText} color={accent} first={isFirst} />;
                }

                // Bullets: dot en color dimensión, keyword en dorado.
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    const content = stripLeadingEmojis(trimmed.slice(2));
                    const isQuestion = content.trim().endsWith('?');
                    const colonIdx = content.indexOf(':');
                    const hasKeyword =
                        colonIdx > 0 && colonIdx < 60 && !content.slice(0, colonIdx).includes(',');
                    const keyword = hasKeyword
                        ? stripAllEmojis(content.slice(0, colonIdx)).replace(/\*+/g, '').trim()
                        : '';
                    const rest = hasKeyword ? content.slice(colonIdx + 1).trim() : content;

                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                marginBottom: '12px',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    background: accent,
                                    opacity: 0.8,
                                    marginTop: '8px',
                                    flexShrink: 0,
                                }}
                            />
                            <p
                                style={{
                                    ...bodyStyle,
                                    flex: 1,
                                    fontStyle: isQuestion ? 'italic' : 'normal',
                                }}
                            >
                                {hasKeyword && keyword && (
                                    <>
                                        <span
                                            style={{
                                                fontFamily: '"Outfit", "Inter", sans-serif',
                                                fontWeight: 600,
                                                color: isQuestion ? '#8B7A6A' : KEYWORD_GOLD,
                                                fontStyle: isQuestion ? 'italic' : 'normal',
                                            }}
                                        >
                                            {keyword}:
                                        </span>
                                        {' '}
                                    </>
                                )}
                                <InlineMarkdown text={rest} />
                            </p>
                        </div>
                    );
                }

                // Numbered lists
                if (/^\d+\.\s/.test(trimmed)) {
                    const numberPart = trimmed.match(/^(\d+)\./)?.[1] || '1';
                    const content = trimmed.replace(/^\d+\.\s/, '');
                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '14px',
                                marginBottom: '16px',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-flex',
                                    width: '28px',
                                    height: '28px',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    background: `${accent}1F`,
                                    border: `1px solid ${accent}4D`,
                                    color: accent,
                                    fontFamily: '"Outfit", "Inter", sans-serif',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    flexShrink: 0,
                                    lineHeight: 1,
                                }}
                            >
                                {numberPart}
                            </span>
                            <p style={{ ...bodyStyle, flex: 1 }}>
                                <InlineMarkdown text={content} />
                            </p>
                        </div>
                    );
                }

                // Checklist
                if (/^\[( |x|X)\]\s/.test(trimmed)) {
                    const checked = /^\[(x|X)\]\s/.test(trimmed);
                    const content = trimmed.replace(/^\[( |x|X)\]\s/, '');
                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                marginBottom: '12px',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-flex',
                                    width: '16px',
                                    height: '16px',
                                    marginTop: '4px',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                    border: `1px solid ${checked ? accent + '66' : 'rgba(255,255,255,0.2)'}`,
                                    background: checked ? `${accent}1F` : 'transparent',
                                    color: checked ? accent : 'transparent',
                                    fontSize: '10px',
                                    flexShrink: 0,
                                }}
                            >✓</span>
                            <p style={{ ...bodyStyle, flex: 1 }}>
                                <InlineMarkdown text={content} />
                            </p>
                        </div>
                    );
                }

                // Párrafo normal
                return (
                    <p key={idx} style={{ ...bodyStyle, marginBottom: '14px' }}>
                        <InlineMarkdown text={line} />
                    </p>
                );
            })}
        </div>
    );
};
