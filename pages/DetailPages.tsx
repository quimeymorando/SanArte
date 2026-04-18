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
         <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c0f] px-8 text-center">
            <div className="relative size-16 mb-8">
               <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 animate-[spin_6s_linear_infinite]" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-teal-400 text-2xl animate-pulse">self_improvement</span>
               </div>
            </div>
            <p className="text-white/30 text-sm italic max-w-xs">
               {loadingMessages[loadingMsgIndex]}
            </p>
         </div>
      );
   }

   // ── Error ──
   if (error) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c0f] px-6 text-center">
            <div className="max-w-sm w-full">
               <div className="size-14 rounded-full bg-white/[0.03] mx-auto mb-6 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400/60 text-3xl">cloud_off</span>
               </div>
               <h3 className="text-lg font-semibold text-white mb-2">Conexión interrumpida</h3>
               <p className="text-white/30 text-sm mb-8 leading-relaxed">
                  No pudimos conectar con la fuente. Tu consulta es importante.
               </p>
               <div className="space-y-3">
                  <button
                     onClick={fetchData}
                     className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm transition-all active:scale-95"
                  >
                     Reintentar
                  </button>
                  <button
                     onClick={() => navigate(-1)}
                     className="w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 text-sm transition-all"
                  >
                     Volver
                  </button>
               </div>
            </div>
         </div>
      );
   }

   if (!data) return <div className="text-center pt-20 text-white/30">No se encontró información.</div>;

   // ── Detail Content ──
   return (
      <div className="min-h-screen bg-[#080c0f] pb-32">
         {/* Header */}
         <div className="fixed top-0 left-0 w-full z-50 px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 bg-gradient-to-b from-[#080c0f] via-[#080c0f]/80 to-transparent pointer-events-none">
            <div className="flex justify-between items-center max-w-xl mx-auto pointer-events-auto mt-2">
               <button aria-label="Volver" onClick={() => navigate(-1)} className="size-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/60 transition-all">
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
               </button>
               <div className="flex gap-2">
                  <button aria-label="Compartir" onClick={handleShare} className="size-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-teal-400 transition-all">
                     <span className="material-symbols-outlined text-xl">share</span>
                  </button>
                  <button aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'} onClick={toggleFavorite} className={`size-10 rounded-xl border flex items-center justify-center transition-all ${isFavorite ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : 'bg-white/[0.06] border-white/[0.08] text-white/40 hover:text-rose-400'}`}>
                     <span className={`material-symbols-outlined text-xl ${isFavorite ? 'filled' : ''}`}>favorite</span>
                  </button>
               </div>
            </div>
         </div>

         <div className="max-w-xl mx-auto px-5 pt-28 pb-8">
            {/* Title */}
            <div className="mb-10">
               <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400/60 mb-2 block">
                  Guía de Sanación
               </span>
               <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                  {data.name}
               </h1>
               <p className="text-base text-white/40 font-serif italic leading-relaxed">
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
                  gradientTheme="bg-gradient-to-br from-teal-400 to-blue-500"
                  iconColor="text-teal-500"
               >
                  <div className="bg-white/[0.02] p-5 rounded-xl border border-white/[0.06] mb-5">
                     <MarkdownRenderer text={data.zona_detalle} />
                  </div>
                  <div className="text-white/60 leading-relaxed">
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
                  gradientTheme="bg-gradient-to-br from-violet-400 to-indigo-500"
                  iconColor="text-violet-400"
               >
                  <div className="bg-white/[0.02] p-6 rounded-xl border border-white/[0.06] text-center mb-6">
                     <div className="space-y-3 font-serif italic text-white/60 text-base">
                        {data.frases_tipicas?.map((f, i) => (
                           <p key={i}>"{f}"</p>
                        ))}
                     </div>
                  </div>
                  <div className="pt-5 border-t border-white/[0.06]">
                     <h4 className="font-semibold text-white/80 mb-3 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-violet-400 text-lg">flare</span>
                        Ejercicio de Conexión
                     </h4>
                     <div className="text-white/50 leading-relaxed">
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
                  gradientTheme="bg-gradient-to-br from-emerald-400 to-teal-500"
                  iconColor="text-emerald-400"
               >
                  <PremiumLock isLocked={!user?.isPremium} title="Farmacia de la Tierra" description="Accedé a remedios ancestrales y plantas maestras.">
                     <div className="mb-6">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/60 mb-3">Activación Física</p>
                        <div className="text-white/50 leading-relaxed">
                           <MarkdownRenderer text={data.alternativas_fisicas} />
                        </div>
                     </div>

                     <div className="bg-white/[0.02] p-5 rounded-xl border border-white/[0.06] mb-4">
                        <p className="text-sm font-medium text-amber-300/70 mb-2 flex items-center gap-2">
                           <span className="material-symbols-outlined text-lg">experiment</span>
                           Remedios de la Abuela
                        </p>
                        <div className="text-white/50 leading-relaxed">
                           <MarkdownRenderer text={data.remedios_naturales} />
                        </div>
                     </div>

                     <div className="bg-white/[0.02] p-5 rounded-xl border border-white/[0.06]">
                        <p className="text-sm font-medium text-rose-300/70 mb-2 flex items-center gap-2">
                           <span className="material-symbols-outlined text-lg">filter_drama</span>
                           Aromas y Sahumerios
                        </p>
                        <div className="text-white/50 leading-relaxed">
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
                  gradientTheme="bg-gradient-to-br from-indigo-400 to-violet-500"
                  iconColor="text-indigo-400"
               >
                  <PremiumLock isLocked={!user?.isPremium} title="Guía Celestial" description="Conocé a tu Arcángel guardián y rituales de luz.">
                     <div className="bg-white/[0.02] p-6 rounded-xl border border-white/[0.06] text-center mb-6">
                        <span className="material-symbols-outlined text-3xl text-indigo-400/60 mb-3">flight</span>
                        <div className="text-white/50 leading-relaxed">
                           <MarkdownRenderer text={data.angeles_arcangeles} />
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">Terapias Holísticas</p>
                        <div className="text-white/50 leading-relaxed">
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
                  gradientTheme="bg-gradient-to-br from-orange-400 to-red-500"
                  iconColor="text-orange-400"
               >
                  <PremiumLock isLocked={!user?.isPremium} title="Ritual Completo" description="Meditación guiada y plan de acción integral.">
                     <AudioVisualizer scriptText={data.meditacion_guiada} isPremium={user?.isPremium} />

                     <div className="mb-6 mt-6">
                        <p className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                           <span className="material-symbols-outlined text-orange-400/60 text-lg">schedule</span>
                           Rutina Integral
                        </p>
                        <div className="bg-white/[0.02] p-5 rounded-xl border border-white/[0.06] text-white/50 leading-relaxed mb-4">
                           <MarkdownRenderer text={data.rutina_integral} />
                        </div>
                        <button
                           onClick={handleAddToRoutine}
                           disabled={addedToRoutine}
                           className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.98] ${addedToRoutine
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-teal-500 hover:bg-teal-400 text-black'
                              }`}
                        >
                           <span className="material-symbols-outlined text-lg">
                              {addedToRoutine ? 'check_circle' : 'add_task'}
                           </span>
                           {addedToRoutine ? 'Agregada a tus Rutinas' : 'Añadir a mis Rutinas'}
                        </button>
                     </div>

                     <div className="pt-5 border-t border-white/[0.06]">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/20 mb-3">Para cerrar el día</p>
                        <div className="text-white/50 leading-relaxed">
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
