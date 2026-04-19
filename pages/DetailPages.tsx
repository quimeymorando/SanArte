import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SymptomDetail } from '../types';
import { getFullSymptomDetails } from '../services/geminiService';
import { addFromSymptom } from '../services/routineService';
import { authService } from '../services/authService';
import { supabase } from '../supabaseClient';
import { historyService } from '../services/dataService';
import { PremiumLock } from '../components/PremiumLock';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { MagicalCard } from '../components/ui/MagicalCard';
import { AudioVisualizer } from '../components/AudioVisualizer';

const loadingMessages = [
   "Conectando con la sabiduría de tu cuerpo...",
   "Interpretando el mensaje oculto...",
   "Buscando las hierbas sanadoras...",
];

export const SymptomDetailPage: React.FC = () => {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const query = searchParams.get('q');

   const [data, setData] = useState<SymptomDetail | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [openSections, setOpenSections] = useState<Set<string>>(new Set(['meaning']));
   const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
   const [isFavorite, setIsFavorite] = useState(false);
   const [addedToRoutine, setAddedToRoutine] = useState(false);
   const [user, setUser] = useState<any>(null);

   useEffect(() => {
      authService.getUser().then(setUser);
   }, []);

   const fetchData = async () => {
      if (!query) return;
      setIsLoading(true);
      setError(null);

      const interval = setInterval(() => {
         setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length);
      }, 3000);

      try {
         const detail = await getFullSymptomDetails(query);
         if (detail) {
            setData(detail);
            const currentUser = await authService.getUser();
            if (currentUser) {
               const { data: fav } = await supabase
                  .from('favorites')
                  .select('id')
                  .eq('user_id', currentUser.id)
                  .eq('symptom_name', detail.name)
                  .single();
               setIsFavorite(!!fav);
            }
            historyService.saveSymptomLog({
               date: new Date().toISOString(),
               intensity: 0,
               duration: 'Consulta',
               notes: `Consulta: ${detail.name}`
            }).catch(logger.warn);
         }
      } catch (error: any) {
         logger.error("Error fetching details:", error);
         setError(error.message || "No pudimos conectar con la fuente.");
      } finally {
         clearInterval(interval);
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
      return () => { window.speechSynthesis.cancel(); };
   }, [query]);

   const handleShare = async () => {
      if (!data) return;
      const shareData = {
         title: `SanArte: ${data.name}`,
         text: `Descubrí el mensaje emocional de "${data.name}" en SanArte:\n\n"${data.shortDefinition}"`,
         url: `${window.location.origin}/share/${encodeURIComponent(data.name)}`,
      };
      try {
         if (navigator.share) { await navigator.share(shareData); }
         else {
            await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            alert("¡Texto copiado al portapapeles!");
         }
      } catch (err) { logger.log('Error sharing', err); }
   };

   const handleAddToRoutine = async () => {
      if (!data || addedToRoutine) return;
      const success = await addFromSymptom(data);
      if (success) setAddedToRoutine(true);
   };

   const toggleSection = useCallback((id: string) => {
      setOpenSections(prev => {
         const s = new Set(prev);
         if (s.has(id)) s.delete(id); else s.add(id);
         return s;
      });
   }, []);

   const toggleFavorite = async () => {
      if (!data || !user) return;
      try {
         if (isFavorite) {
            await supabase.from('favorites').delete().eq('user_id', user.id).eq('symptom_name', data.name);
            setIsFavorite(false);
         } else {
            await (supabase.from('favorites') as any).insert({ user_id: user.id, symptom_name: data.name, description: data.shortDefinition });
            setIsFavorite(true);
         }
      } catch (e) { logger.error(e); }
   };

   // ── Loading ──
   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center" style={{ background: '#060D1B' }}>
            <div className="relative size-16 mb-8">
               <div className="absolute inset-0 rounded-full border-2 animate-[spin_6s_linear_infinite]" style={{ borderColor: 'rgba(201,168,76,0.2)' }} />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl animate-pulse" style={{ color: '#C9A84C' }}>self_improvement</span>
               </div>
            </div>
            <p className="text-sm italic max-w-xs" style={{ color: '#4A5280' }}>
               {loadingMessages[loadingMsgIndex]}
            </p>
         </div>
      );
   }

   // ── Error ──
   if (error) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center" style={{ background: '#060D1B' }}>
            <div className="max-w-sm w-full">
               <div className="size-14 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.05)' }}>
                  <span className="material-symbols-outlined text-red-400/60 text-3xl">cloud_off</span>
               </div>
               <h3 className="text-lg font-semibold mb-2" style={{ color: '#F0EBE0' }}>Conexión interrumpida</h3>
               <p className="text-sm mb-8 leading-relaxed" style={{ color: '#4A5280' }}>
                  No pudimos conectar con la fuente. Tu consulta es importante.
               </p>
               <div className="space-y-3">
                  <button
                     onClick={fetchData}
                     className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                     style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)', color: '#060D1B', border: 'none' }}
                  >
                     Reintentar
                  </button>
                  <button
                     onClick={() => navigate(-1)}
                     className="w-full py-3.5 rounded-xl text-sm transition-all"
                     style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.15)', color: '#6A6460' }}
                  >
                     Volver
                  </button>
               </div>
            </div>
         </div>
      );
   }

   if (!data) return <div className="text-center pt-20" style={{ color: '#4A5280' }}>No se encontró información.</div>;

   // ── Detail Content ──
   return (
      <div className="min-h-screen pb-32" style={{ background: '#060D1B' }}>
         {/* Header */}
         <div className="fixed top-0 left-0 w-full z-50 px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #060D1B, rgba(6,13,27,0.8), transparent)' }}>
            <div className="flex justify-between items-center max-w-xl mx-auto pointer-events-auto mt-2">
               <button aria-label="Volver" onClick={() => navigate(-1)} className="size-10 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
               </button>
               <div className="flex gap-2">
                  <button aria-label="Compartir" onClick={handleShare} className="size-10 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
                     <span className="material-symbols-outlined text-xl">share</span>
                  </button>
                  <button
                     aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                     onClick={toggleFavorite}
                     className="size-10 rounded-xl flex items-center justify-center transition-all"
                     style={isFavorite
                        ? { background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185' }
                        : { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }
                     }
                  >
                     <span className={`material-symbols-outlined text-xl ${isFavorite ? 'filled' : ''}`}>favorite</span>
                  </button>
               </div>
            </div>
         </div>

         <div className="max-w-xl mx-auto px-5 pt-28 pb-8">
            {/* Title */}
            <div className="mb-10">
               <span className="text-[10px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(201,168,76,0.6)' }}>
                  Guía de Sanación
               </span>
               <h1 className="text-3xl md:text-4xl leading-tight mb-4" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 300, color: '#F0EBE0' }}>
                  {data.name}
               </h1>
               <p className="text-base font-serif italic leading-relaxed" style={{ color: '#6A6460' }}>
                  "{data.shortDefinition}"
               </p>
            </div>

            {/* Sections */}
            <div className="space-y-4">
               {/* 1. Mensaje del Alma */}
               <MagicalCard
                  id="emocion"
                  isOpen={openSections.has('meaning')}
                  onToggle={toggleSection}
                  title="Mensaje del Alma"
                  subtitle="Zona corporal y emoción"
                  icon="lightbulb"
                  gradientTheme="#C9A84C"
                  iconColor="#C9A84C"
               >
                  <div className="p-5 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                     <MarkdownRenderer text={data.zona_detalle} />
                  </div>
                  <div className="leading-relaxed" style={{ color: '#8B7A6A' }}>
                     <MarkdownRenderer text={data.emociones_detalle} />
                  </div>
               </MagicalCard>

               {/* 2. Espejo Interno */}
               <MagicalCard
                  id="monologo"
                  isOpen={openSections.has('monologo')}
                  onToggle={toggleSection}
                  title="Espejo Interno"
                  subtitle="Frases que resuenan"
                  icon="record_voice_over"
                  gradientTheme="#A78BFA"
                  iconColor="#A78BFA"
               >
                  <div className="p-6 rounded-xl text-center mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                     <div className="space-y-3 font-serif italic text-base" style={{ color: '#8B7A6A' }}>
                        {data.frases_tipicas?.map((f, i) => (
                           <p key={i}>"{f}"</p>
                        ))}
                     </div>
                  </div>
                  <div className="pt-5" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                     <h4 className="font-semibold mb-3 text-sm flex items-center gap-2" style={{ color: '#8B7A6A' }}>
                        <span className="material-symbols-outlined text-lg" style={{ color: '#A78BFA' }}>flare</span>
                        Ejercicio de Conexión
                     </h4>
                     <div className="leading-relaxed" style={{ color: '#6A6460' }}>
                        <MarkdownRenderer text={data.ejercicio_conexion} />
                     </div>
                  </div>
               </MagicalCard>

               {/* 3. Alquimia Natural */}
               <MagicalCard
                  id="alquimia"
                  isOpen={openSections.has('alquimia')}
                  onToggle={toggleSection}
                  title="Alquimia Natural"
                  subtitle="Cuerpo, hierbas y aromas"
                  icon="local_florist"
                  gradientTheme="#8BA888"
                  iconColor="#8BA888"
               >
                  <PremiumLock isLocked={!user?.isPremium} title="Farmacia de la Tierra" description="Accedé a remedios ancestrales y plantas maestras.">
                     <div className="mb-6">
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(139,168,136,0.6)' }}>Activación Física</p>
                        <div className="leading-relaxed" style={{ color: '#6A6460' }}>
                           <MarkdownRenderer text={data.alternativas_fisicas} />
                        </div>
                     </div>

                     <div className="p-5 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(240,208,128,0.7)' }}>
                           <span className="material-symbols-outlined text-lg">experiment</span>
                           Remedios de la Abuela
                        </p>
                        <div className="leading-relaxed" style={{ color: '#6A6460' }}>
                           <MarkdownRenderer text={data.remedios_naturales} />
                        </div>
                     </div>

                     <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(244,114,182,0.7)' }}>
                           <span className="material-symbols-outlined text-lg">filter_drama</span>
                           Aromas y Sahumerios
                        </p>
                        <div className="leading-relaxed" style={{ color: '#6A6460' }}>
                           <MarkdownRenderer text={data.aromaterapia_sahumerios} />
                        </div>
                     </div>
                  </PremiumLock>
               </MagicalCard>

               {/* 4. Conexión Divina */}
               <MagicalCard
                  id="angel"
                  isOpen={openSections.has('angel')}
                  onToggle={toggleSection}
                  title="Conexión Divina"
                  subtitle="Ángeles y energía"
                  icon="self_improvement"
                  gradientTheme="#A78BFA"
                  iconColor="#A78BFA"
               >
                  <PremiumLock isLocked={!user?.isPremium} title="Guía Celestial" description="Conocé a tu Arcángel guardián y rituales de luz.">
                     <div className="p-6 rounded-xl text-center mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                        <span className="material-symbols-outlined text-3xl mb-3" style={{ color: 'rgba(167,139,250,0.6)' }}>flight</span>
                        <div className="leading-relaxed" style={{ color: '#6A6460' }}>
                           <MarkdownRenderer text={data.angeles_arcangeles} />
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#4A5280' }}>Terapias Holísticas</p>
                        <div className="leading-relaxed" style={{ color: '#6A6460' }}>
                           <MarkdownRenderer text={data.terapias_holisticas} />
                        </div>
                     </div>
                  </PremiumLock>
               </MagicalCard>

               {/* 5. Tu Ritual Diario */}
               <MagicalCard
                  id="ritual"
                  isOpen={openSections.has('ritual')}
                  onToggle={toggleSection}
                  title="Tu Ritual Diario"
                  subtitle="Meditación y plan de acción"
                  icon="auto_awesome"
                  gradientTheme="#F472B6"
                  iconColor="#F472B6"
               >
                  <PremiumLock isLocked={!user?.isPremium} title="Ritual Completo" description="Meditación guiada y plan de acción integral.">
                     <AudioVisualizer scriptText={data.meditacion_guiada} isPremium={user?.isPremium} />

                     <div className="mb-6 mt-6">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#8B7A6A' }}>
                           <span className="material-symbols-outlined text-lg" style={{ color: 'rgba(244,114,182,0.6)' }}>schedule</span>
                           Rutina Integral
                        </p>
                        <div className="p-5 rounded-xl leading-relaxed mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)', color: '#6A6460' }}>
                           <MarkdownRenderer text={data.rutina_integral} />
                        </div>
                        <button
                           onClick={handleAddToRoutine}
                           disabled={addedToRoutine}
                           className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.98]"
                           style={addedToRoutine
                              ? { background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }
                              : { background: 'linear-gradient(135deg, #C9A84C, #F0D080)', color: '#060D1B', border: 'none' }
                           }
                        >
                           <span className="material-symbols-outlined text-lg">
                              {addedToRoutine ? 'check_circle' : 'add_task'}
                           </span>
                           {addedToRoutine ? 'Agregada a tus Rutinas' : 'Añadir a mis Rutinas'}
                        </button>
                     </div>

                     <div className="pt-5" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#4A5280' }}>Para cerrar el día</p>
                        <div className="leading-relaxed" style={{ color: '#6A6460' }}>
                           <MarkdownRenderer text={data.recomendaciones_adicionales} />
                        </div>
                     </div>
                  </PremiumLock>
               </MagicalCard>
            </div>
         </div>
      </div>
   );
};
