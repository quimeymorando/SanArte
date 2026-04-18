import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { historyService } from '../services/dataService';
import { SymptomLogEntry } from '../types';

export const JournalPage: React.FC = () => {
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
        if (val <= 3) return { text: "Malestar", color: "text-red-400", bg: "bg-red-400" };
        if (val <= 6) return { text: "En proceso", color: "text-amber-400", bg: "bg-amber-400" };
        if (val <= 8) return { text: "Mejorando", color: "text-teal-400", bg: "bg-teal-400" };
        return { text: "Paz", color: "text-emerald-400", bg: "bg-emerald-400" };
    };

    return (
        <div className="min-h-screen bg-[#080c0f] pb-28 pt-20 px-5">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-white">Diario</h1>
                        <p className="text-white/25 text-sm mt-0.5">Tu espacio de reflexión</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">edit_note</span>
                        Escribir
                    </button>
                </div>

                {/* Tabs: Diario / Historial */}
                <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl mb-6 border border-white/[0.06]">
                    <button
                        onClick={() => setTab('journal')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            tab === 'journal'
                                ? 'bg-white/[0.08] text-white'
                                : 'text-white/30 hover:text-white/50'
                        }`}
                    >
                        Reflexiones
                    </button>
                    <button
                        onClick={() => setTab('history')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            tab === 'history'
                                ? 'bg-white/[0.08] text-white'
                                : 'text-white/30 hover:text-white/50'
                        }`}
                    >
                        Historial de búsquedas
                    </button>
                </div>

                {/* Entries */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="material-symbols-outlined text-white/10 text-3xl animate-pulse">self_improvement</span>
                    </div>
                ) : visibleEntries.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="size-14 rounded-full bg-white/[0.03] mx-auto mb-4 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white/15 text-2xl">
                                {tab === 'journal' ? 'edit_note' : 'history'}
                            </span>
                        </div>
                        <p className="text-white/25 text-sm mb-1">
                            {tab === 'journal' ? 'Tu diario está en blanco.' : 'Sin búsquedas registradas.'}
                        </p>
                        {tab === 'journal' && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-teal-400 text-sm font-medium mt-2 hover:text-teal-300 transition-colors"
                            >
                                Escribí tu primera reflexión
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {visibleEntries.map((entry) => {
                            const info = entry.intensity > 0 ? getIntensityInfo(entry.intensity) : null;
                            const displayTitle = tab === 'history'
                                ? entry.notes?.replace('Consulta: ', '') || 'Búsqueda'
                                : entry.symptom_name || 'Reflexión';

                            return (
                                <div
                                    key={entry.id}
                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-white truncate">{displayTitle}</h3>
                                            <span className="text-[11px] text-white/20 mt-0.5 block">
                                                {new Date(entry.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {info && (
                                                <span className={`text-[10px] font-medium ${info.color}`}>{info.text}</span>
                                            )}
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className="p-1.5 rounded-lg text-white/0 group-hover:text-white/20 hover:!text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-base">close</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Notes (only for journal entries) */}
                                    {tab === 'journal' && entry.notes && (
                                        <p className="mt-3 text-white/30 text-sm leading-relaxed whitespace-pre-wrap">
                                            {entry.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FAB Mobile */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-24 right-5 md:hidden size-12 bg-teal-500 text-black rounded-full shadow-lg flex items-center justify-center z-50 active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-2xl">edit</span>
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-[#0e1317] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-8 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-4 sm:fade-in sm:zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Nueva reflexión</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Intensity */}
                            <div className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.06]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-white/30">¿Cómo te sentís?</span>
                                    <span className={`text-xs font-medium ${getIntensityInfo(intensity).color}`}>
                                        {getIntensityInfo(intensity).text}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1" max="10"
                                    value={intensity}
                                    onChange={(e) => setIntensity(Number(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-teal-500"
                                />
                                <div className="flex justify-between text-[10px] text-white/15 mt-1.5">
                                    <span>Malestar</span>
                                    <span>Plenitud</span>
                                </div>
                            </div>

                            {/* Title */}
                            <input
                                type="text"
                                value={symptomName}
                                onChange={(e) => setSymptomName(e.target.value)}
                                placeholder="Título (opcional)"
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-teal-500/30 outline-none transition-colors placeholder:text-white/15"
                            />

                            {/* Notes */}
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="¿Qué sentís? Dejá fluir tus palabras..."
                                rows={4}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-teal-500/30 outline-none transition-colors resize-none placeholder:text-white/15 leading-relaxed"
                            />

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
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
