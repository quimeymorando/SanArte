import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';
import { historyService } from '../services/dataService';
import { SymptomLogEntry } from '../types';

const GOLD = '#C9A84C';
const GOLD_GRAD = 'linear-gradient(135deg, #C9A84C, #F0D080)';

export const JournalPage: React.FC = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<SymptomLogEntry[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'journal' | 'history'>('journal');

    // Form state
    const [symptomName, setSymptomName] = useState('');
    const [intensity, setIntensity] = useState(5);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { loadEntries(); }, []);

    const loadEntries = async () => {
        try {
            const data = await historyService.getHistory();
            setEntries(data);
        } catch (error) {
            logger.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Separate personal journal entries from auto-logged search history
    const journalEntries = entries.filter(e => !e.notes?.startsWith('Consulta:'));
    const historyEntries = entries.filter(e => e.notes?.startsWith('Consulta:'));
    const visibleEntries = tab === 'journal' ? journalEntries : historyEntries;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await historyService.saveSymptomLog({
                date: new Date().toISOString(),
                intensity,
                notes,
                symptom_name: symptomName,
                duration: '',
            });
            setShowModal(false);
            resetForm();
            loadEntries();
        } catch (error) {
            alert('Error al guardar la entrada');
            logger.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => { setSymptomName(''); setIntensity(5); setNotes(''); };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar esta entrada?')) {
            try {
                await historyService.deleteLog(id);
                setEntries(entries.filter(e => e.id !== id));
            } catch (error) { logger.error(error); }
        }
    };

    const getIntensityInfo = (val: number) => {
        if (val <= 3) return { text: 'Malestar', color: '#F87171' };
        if (val <= 6) return { text: 'En proceso', color: '#FCD34D' };
        if (val <= 8) return { text: 'Mejorando', color: '#34D399' };
        return { text: 'Paz', color: '#6EE7B7' };
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-AR', {
                weekday: 'short', day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div
            style={{
                background: '#060D1B',
                minHeight: '100dvh',
                paddingBottom: 100,
            }}
        >
            {/* Sticky Header */}
            <div
                style={{
                    padding: '64px 20px 20px',
                    background: 'linear-gradient(to bottom, rgba(6,13,27,1) 0%, transparent 100%)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
            >
                <p
                    style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: GOLD,
                        marginBottom: 6,
                        margin: '0 0 6px',
                    }}
                >Tu espacio sagrado</p>
                <h1
                    style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 28,
                        fontWeight: 300,
                        color: '#F0EBE0',
                        margin: '0 0 20px',
                    }}
                >Diario</h1>

                {/* Tabs */}
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 12,
                        padding: 4,
                    }}
                >
                    {[
                        { key: 'journal', label: 'Reflexiones', icon: 'edit_note' },
                        { key: 'history', label: 'Historial', icon: 'history' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key as 'journal' | 'history')}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: '8px 12px',
                                borderRadius: 10,
                                border: 'none',
                                cursor: 'pointer',
                                background: tab === t.key
                                    ? 'rgba(201,168,76,0.12)'
                                    : 'transparent',
                                transition: 'background 0.2s',
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: 16,
                                    color: tab === t.key ? GOLD : '#5A6170',
                                    fontVariationSettings: "'wght' 300",
                                }}
                            >{t.icon}</span>
                            <span
                                style={{
                                    fontFamily: '"Outfit", sans-serif',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: tab === t.key ? GOLD : '#5A6170',
                                }}
                            >{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 20px 0' }}>
                {loading ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: 80,
                        }}
                    >
                        <span
                            className="material-symbols-outlined animate-pulse"
                            style={{ fontSize: 32, color: 'rgba(201,168,76,0.2)' }}
                        >self_improvement</span>
                    </div>
                ) : visibleEntries.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 80 }}>
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.03)',
                                margin: '0 auto 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: 24,
                                    color: 'rgba(255,255,255,0.15)',
                                    fontVariationSettings: "'wght' 300",
                                }}
                            >
                                {tab === 'journal' ? 'edit_note' : 'history'}
                            </span>
                        </div>
                        <p
                            style={{
                                fontFamily: '"Outfit", sans-serif',
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.25)',
                                marginBottom: 8,
                            }}
                        >
                            {tab === 'journal' ? 'Tu diario está en blanco.' : 'Sin búsquedas registradas.'}
                        </p>
                        {tab === 'journal' && (
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontFamily: '"Outfit", sans-serif',
                                    fontSize: 13,
                                    color: GOLD,
                                    fontWeight: 500,
                                }}
                            >
                                Escribí tu primera reflexión
                            </button>
                        )}
                    </div>
                ) : tab === 'history' ? (
                    /* ── HISTORIAL ── */
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 16,
                            overflow: 'hidden',
                        }}
                    >
                        {visibleEntries.map((entry, idx) => {
                            const rawTitle = (entry.notes || entry.symptom_name || '').replace('Consulta: ', '');
                            return (
                                <div
                                    key={entry.id}
                                    onClick={() => navigate(`/symptom-detail?q=${encodeURIComponent(rawTitle)}`)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '14px 20px',
                                        borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span
                                        className="material-symbols-outlined"
                                        style={{
                                            fontSize: 18,
                                            color: 'rgba(201,168,76,0.4)',
                                            fontVariationSettings: "'wght' 300",
                                            flexShrink: 0,
                                        }}
                                    >history</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{
                                                fontFamily: '"Outfit", sans-serif',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: '#C8BFB0',
                                                margin: 0,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >{rawTitle}</p>
                                        <p
                                            style={{
                                                fontFamily: '"Outfit", sans-serif',
                                                fontSize: 11,
                                                color: '#4A4840',
                                                margin: '3px 0 0',
                                            }}
                                        >
                                            {formatDate(entry.date)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 6,
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{
                                                fontSize: 18,
                                                color: 'rgba(232,100,100,0.5)',
                                                fontVariationSettings: "'wght' 300",
                                            }}
                                        >close</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── REFLEXIONES ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {visibleEntries.map((entry) => {
                            const info = entry.intensity > 0 ? getIntensityInfo(entry.intensity) : null;
                            return (
                                <div
                                    key={entry.id}
                                    style={{
                                        background: 'rgba(255,255,255,0.025)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderLeft: `3px solid ${GOLD}`,
                                        borderRadius: 14,
                                        padding: '16px 18px',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p
                                                style={{
                                                    fontFamily: '"Outfit", sans-serif',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: '#C8BFB0',
                                                    margin: 0,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {entry.symptom_name || 'Reflexión'}
                                            </p>
                                            <p
                                                style={{
                                                    fontFamily: '"Outfit", sans-serif',
                                                    fontSize: 11,
                                                    color: '#4A4840',
                                                    margin: '3px 0 0',
                                                }}
                                            >
                                                {formatDate(entry.date)}
                                                {info && (
                                                    <span style={{ color: info.color, marginLeft: 8 }}>
                                                        · {info.text}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 4,
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined"
                                                style={{
                                                    fontSize: 18,
                                                    color: 'rgba(232,100,100,0.5)',
                                                    fontVariationSettings: "'wght' 300",
                                                }}
                                            >close</span>
                                        </button>
                                    </div>
                                    {entry.notes && (
                                        <p
                                            style={{
                                                fontFamily: '"Outfit", sans-serif',
                                                fontSize: 13,
                                                color: '#8B7A6A',
                                                lineHeight: 1.7,
                                                margin: '12px 0 0',
                                                whiteSpace: 'pre-wrap',
                                            }}
                                        >
                                            {entry.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setShowModal(true)}
                style={{
                    position: 'fixed',
                    bottom: 90,
                    right: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 24px',
                    background: GOLD_GRAD,
                    color: '#060D1B',
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    zIndex: 50,
                    boxShadow: '0 8px 24px rgba(201,168,76,0.25)',
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                }}
            >
                <span
                    className="material-symbols-outlined"
                    style={{
                        fontSize: 18,
                        fontVariationSettings: "'wght' 400",
                        lineHeight: 1,
                    }}
                >edit</span>
                Escribir
            </button>

            {/* Modal */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.65)',
                            backdropFilter: 'blur(6px)',
                        }}
                        onClick={() => setShowModal(false)}
                    />
                    <div
                        style={{
                            position: 'relative',
                            background: '#0E1420',
                            border: '1px solid rgba(201,168,76,0.12)',
                            borderRadius: '24px 24px 0 0',
                            width: '100%',
                            maxWidth: 480,
                            padding: '28px 24px 40px',
                            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Modal Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 24,
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        fontFamily: '"Playfair Display", serif',
                                        fontSize: 20,
                                        fontWeight: 400,
                                        color: '#F0EBE0',
                                        margin: 0,
                                    }}
                                >Nueva reflexión</h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.4)',
                                }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: 18, fontVariationSettings: "'wght' 300" }}
                                >close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Intensity */}
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(201,168,76,0.1)',
                                    borderRadius: 14,
                                    padding: '16px 18px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 12,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: '"Outfit", sans-serif',
                                            fontSize: 11,
                                            color: 'rgba(255,255,255,0.3)',
                                        }}
                                    >¿Cómo te sentís?</span>
                                    <span
                                        style={{
                                            fontFamily: '"Outfit", sans-serif',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: getIntensityInfo(intensity).color,
                                        }}
                                    >
                                        {getIntensityInfo(intensity).text}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={intensity}
                                    onChange={(e) => setIntensity(Number(e.target.value))}
                                    className="w-full"
                                    style={{ accentColor: GOLD }}
                                />
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: 6,
                                    }}
                                >
                                    <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>Malestar</span>
                                    <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>Plenitud</span>
                                </div>
                            </div>

                            {/* Title input */}
                            <input
                                type="text"
                                value={symptomName}
                                onChange={(e) => setSymptomName(e.target.value)}
                                placeholder="Título (opcional)"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(201,168,76,0.1)',
                                    borderRadius: 12,
                                    padding: '12px 16px',
                                    fontFamily: '"Outfit", sans-serif',
                                    fontSize: 13,
                                    color: '#F0EBE0',
                                    outline: 'none',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                }}
                            />

                            {/* Notes textarea */}
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="¿Qué sentís? Dejá fluir tus palabras..."
                                rows={4}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(201,168,76,0.1)',
                                    borderRadius: 12,
                                    padding: '12px 16px',
                                    fontFamily: '"Outfit", sans-serif',
                                    fontSize: 13,
                                    color: '#F0EBE0',
                                    outline: 'none',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    resize: 'none',
                                    lineHeight: 1.6,
                                }}
                            />

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    padding: '14px',
                                    borderRadius: 999,
                                    background: GOLD_GRAD,
                                    color: '#060D1B',
                                    border: 'none',
                                    fontFamily: '"Outfit", sans-serif',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    letterSpacing: '0.04em',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    opacity: submitting ? 0.5 : 1,
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {submitting ? 'Guardando...' : 'Guardar reflexión'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
