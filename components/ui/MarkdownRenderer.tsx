import React from 'react';

interface MarkdownRendererProps {
    text: string;
    className?: string;
}

// Helper for inline bold/italic
const InlineMarkdown = ({ text }: { text: string }) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <span key={i} className="font-black text-primary dark:text-neon-cyan">{part.slice(2, -2)}</span>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <span key={i} className="font-serif italic text-gray-600 dark:text-white">{part.slice(1, -1)}</span>;
                }
                return part;
            })}
        </>
    );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, className = "" }) => {
    if (!text) return null;

    return (
        <div className={`space-y-3 ${className}`}>
            {text.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} className="h-2" />;

                // Headers
                if (trimmed.startsWith('### ')) return <h5 key={idx} className="text-sm font-black uppercase tracking-widest text-primary mt-4 mb-2">{trimmed.slice(4)}</h5>;
                if (trimmed.startsWith('## ')) return <h4 key={idx} className="text-lg font-bold text-gray-900 dark:text-white mt-5 mb-2">{trimmed.slice(3)}</h4>;

                // Lists
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    const content = trimmed.slice(2);
                    return (
                        <div key={idx} className="flex items-start gap-2 pl-2">
                            <span className="mt-1.5 size-1.5 rounded-full bg-primary/60 flex-shrink-0"></span>
                            <p className="leading-relaxed">
                                <InlineMarkdown text={content} />
                            </p>
                        </div>
                    );
                }

                // Normal Paragraph
                return (
                    <p key={idx} className="leading-relaxed text-gray-700 dark:text-gray-300">
                        <InlineMarkdown text={line} />
                    </p>
                );
            })}
        </div>
    );
};
