import React, { createContext, useContext } from 'react';

interface MarkdownRendererProps {
    text: string;
    className?: string;
}

// ─── Dimension accent context ─────────────────────────
// Cada MagicalCard envuelve sus children en este provider con su color.
// MarkdownRenderer lo consume para teñir headings, bullets y numbered lists.
const DimensionAccentContext = createContext<string>('#C9A84C');
export const DimensionAccentProvider = DimensionAccentContext.Provider;
export const useDimensionAccent = () => useContext(DimensionAccentContext);

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

const stripLeadingEmojis = (s: string) =>
    s.replace(/^[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}]+\s*/u, '').trim();

// ─── SectionHeading — reutilizable ────────────────────
export const SectionHeading: React.FC<{ text: string; color: string; first?: boolean }> = ({ text, color, first = false }) => {
    const icon = pickIcon(text);
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: first ? 0 : '22px',
                marginBottom: '12px',
            }}
        >
            {icon && (
                <span
                    className="material-symbols-outlined"
                    style={{
                        fontSize: '16px',
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
                    fontSize: '13px',
                    fontWeight: 500,
                    color,
                    lineHeight: 1.3,
                }}
            >{text}</span>
        </div>
    );
};

// ─── Inline formatter (bold, italic) ──────────────────
const InlineMarkdown: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <span key={i} style={{ fontWeight: 600, color: accent }}>
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

    let headingCount = 0;

    return (
        <div className={className}>
            {text.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} style={{ height: '4px' }} />;

                // Headers (## y ###) — strip leading emojis before detecting and from heading text
                const stripped = stripLeadingEmojis(trimmed);
                if (stripped.startsWith('### ')) {
                    const headingText = stripLeadingEmojis(stripped.slice(4));
                    const isFirst = headingCount === 0;
                    headingCount++;
                    return <SectionHeading key={idx} text={headingText} color={accent} first={isFirst} />;
                }
                if (stripped.startsWith('## ')) {
                    const headingText = stripLeadingEmojis(stripped.slice(3));
                    const isFirst = headingCount === 0;
                    headingCount++;
                    return <SectionHeading key={idx} text={headingText} color={accent} first={isFirst} />;
                }

                // Bullets con palabra clave destacada
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    const content = trimmed.slice(2);
                    const isQuestion = content.trim().endsWith('?');
                    const colonIdx = content.indexOf(':');
                    const hasKeyword =
                        colonIdx > 0 && colonIdx < 60 && !content.slice(0, colonIdx).includes(',');
                    const keyword = hasKeyword ? content.slice(0, colonIdx).replace(/\*+/g, '').trim() : '';
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
                                {hasKeyword && (
                                    <>
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: isQuestion ? '#8B7A6A' : accent,
                                                fontStyle: isQuestion ? 'italic' : 'normal',
                                            }}
                                        >
                                            {keyword}:
                                        </span>
                                        {' '}
                                    </>
                                )}
                                <InlineMarkdown text={rest} accent={accent} />
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
                                <InlineMarkdown text={content} accent={accent} />
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
                                <InlineMarkdown text={content} accent={accent} />
                            </p>
                        </div>
                    );
                }

                // Párrafo normal
                return (
                    <p key={idx} style={{ ...bodyStyle, marginBottom: '14px' }}>
                        <InlineMarkdown text={line} accent={accent} />
                    </p>
                );
            })}
        </div>
    );
};
