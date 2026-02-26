import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Share } from '@capacitor/share';
import { SymptomDetail } from '../types';
import { getFullSymptomDetails } from '../services/geminiService';
import { addFromSymptom } from '../services/routineService';
import { authService } from '../services/authService';
import { supabase } from '../supabaseClient';
import { historyService } from '../services/dataService';
import { PremiumLock } from '../components/PremiumLock';
// New Atomic Components
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { MagicalCard } from '../components/ui/MagicalCard';
import { AudioVisualizer } from '../components/AudioVisualizer';

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

   // Loading messages cycle
   const loadingMessages = [
      "Cada día que intentas sanar, le regalas vida a tu futuro.",
      "Consultando la sabiduría ancestral...",
      "Conectando con la memoria de tu cuerpo...",
      "Buscando las hierbas sanadoras...",
      "Interpretando el mensaje oculto...",
      "Sintonizando con tu energía vital..."
   ];

   useEffect(() => {
      const loadUser = async () => {
         const u = await authService.getUser();
         setUser(u);
      };
      loadUser();
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

            // Check favorite
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

            // Log view
            historyService.saveSymptomLog({
               date: new Date().toISOString(),
               intensity: 0,
               duration: 'Consulta',
               notes: `Consulta: ${detail.name}`
            }).catch(logger.warn);
         }
      } catch (error: any) {
         logger.error("Error fetching details:", error);
         setError(error.message || "No pudimos conectar con la fuente de sabiduría.");
      } finally {
         clearInterval(interval);
         setIsLoading(false);
      }
   };

   // Fetch Data on mount or query change
   useEffect(() => {
      fetchData();
      return () => {
         window.speechSynthesis.cancel();
      };
   }, [query]);

   // Share Functionality
   const handleShare = async () => {
      if (!data) return;

      const shareData = {
         title: `SanArte: ${data.name}`,
         text: `✨ He descubierto el mensaje emocional de "${data.name}" en SanArte:\n\n"${data.shortDefinition}"\n\nDescubre tu capacidad de autosanación aquí:`,
         url: `${window.location.origin}/share/${encodeURIComponent(data.name)}`,
      };

      try {
         // 1. Intenta usar la API nativa del navegador (Móvil y algunos navegadores desktop)
         if (navigator.share) {
            await navigator.share(shareData);
         } else {
            // 2. Fallback: Copiar al portapapeles (Desktop)
            await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            alert("¡Texto copiado al portapapeles! 📋✨");
         }
      } catch (error) {
         logger.log('Error sharing', error);
      }
   };

   // Add to Routine
   const handleAddToRoutine = async () => {
      if (!data || addedToRoutine) return;
      const success = await addFromSymptom(data);
      if (success) {
         setAddedToRoutine(true);
      }
   };

   const toggleSection = (id: string) => {
      const newSections = new Set(openSections);
      if (newSections.has(id)) newSections.delete(id);
      else newSections.add(id);
      setOpenSections(newSections);
   };

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

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a1114] px-8 text-center">
            <div className="relative size-24 mb-10">
               <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-purple-400 border-l-transparent animate-spin shadow-[0_0_20px_rgba(34,211,238,0.3)]"></div>
               <div className="absolute inset-4 rounded-full bg-[#0a1114] shadow-inner flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">psychology</span>
               </div>
            </div>
            <h3 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 animate-pulse drop-shadow-md">
               {loadingMessages[loadingMsgIndex]}
            </h3>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a1114] px-6 text-center">
            <div className="bg-[#0a1114]/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-red-500/20 max-w-md w-full">
               <div className="size-20 bg-red-500/10 rounded-[1.5rem] border border-red-500/20 flex items-center justify-center mx-auto mb-8 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <span className="material-symbols-outlined text-[40px]">cloud_off</span>
               </div>
               <h3 className="text-2xl font-black text-white mb-4">
                  Interrupción Temporal
               </h3>
               <p className="text-white/60 mb-8 font-medium leading-relaxed">
                  {error === "La conexión tardó demasiado. Por favor intenta de nuevo."
                     ? "La sabiduría antigua se está tomando un momento para responder. Por favor, intenta de nuevo."
                     : "Hubo un problema al conectar con la fuente. Tu consulta es importante, por favor intenta nuevamente."}
               </p>
               <div className="flex flex-col gap-4">
                  <button
                     onClick={fetchData}
                     className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500/80 to-orange-500/80 hover:from-red-500 hover:to-orange-500 text-white font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                     <span className="material-symbols-outlined text-lg">refresh</span>
                     Reintentar Conexión
                  </button>
                  <button
                     onClick={() => navigate(-1)}
                     className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                     Volver
                  </button>
               </div>
            </div>
         </div>
      );
   }

   if (!data) return <div className="text-center pt-20">No se encontró información.</div>;

   return (
      <div className="flex-1 w-full min-h-screen bg-[#0a1114] pb-32 relative">
         {/* HEADER NAV */}
         <div className="fixed top-0 left-0 w-full z-50 px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 bg-gradient-to-b from-[#0a1114] via-[#0a1114]/80 to-transparent pointer-events-none">
            <div className="flex justify-between items-center max-w-2xl mx-auto pointer-events-auto mt-2">
               <button aria-label="Volver" onClick={() => navigate(-1)} className="size-11 rounded-[1.2rem] bg-[#0a1114]/60 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  <span className="material-symbols-outlined">arrow_back</span>
               </button>
               <div className="flex gap-3">
                  <button aria-label="Compartir síntoma" onClick={handleShare} className="size-11 rounded-[1.2rem] bg-[#0a1114]/60 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg text-cyan-400 hover:bg-white/5 active:scale-95 transition-all">
                     <span className="material-symbols-outlined">share</span>
                  </button>
                  <button aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'} onClick={toggleFavorite} className={`size-11 rounded-[1.2rem] backdrop-blur-xl border flex items-center justify-center shadow-lg transition-all ${isFavorite ? 'bg-pink-500/20 border-pink-500/30 text-pink-400 scale-110 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-[#0a1114]/60 border-white/10 text-white/40 hover:text-white hover:bg-white/5'}`}>
                     <span className={`material-symbols-outlined ${isFavorite ? 'filled text-pink-400' : ''}`}>favorite</span>
                  </button>
               </div>
            </div>
         </div>

         <div className="max-w-2xl mx-auto px-5 pt-32 pb-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HERO TITLE */}
            <div className="mb-8 relative z-10">
               <div className="inline-block px-4 py-1.5 rounded-xl bg-primary/20 border border-primary/30 text-primary text-[10px] font-black tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  Guía de Sanación
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-md">
                  {data.name}
               </h1>
               <p className="text-lg md:text-xl text-white/70 font-serif italic opacity-90 leading-relaxed max-w-lg">
                  "{data.shortDefinition}"
               </p>
            </div>

            {/* 1. ZONA Y EMOCIÓN (Bloque Principal) */}
            <MagicalCard
               id="emocion"
               isOpen={openSections.has('meaning')}
               onToggle={toggleSection}
               title="Mensaje del Alma"
               subtitle="Zona Corporal y Emoción"
               icon="lightbulb"
               gradientTheme="bg-gradient-to-br from-cyan-400 to-blue-500"
               iconColor="text-cyan-500"
            >
               {/* Zona Corporal */}
               <div className="bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/20 mb-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                  <div className="relative z-10">
                     <MarkdownRenderer text={data.zona_detalle} />
                  </div>
               </div>

               {/* Emociones Detalle */}
               <div className="text-white/80 font-medium leading-relaxed">
                  <MarkdownRenderer text={data.emociones_detalle} />
               </div>
            </MagicalCard>

            {/* 2. ESPEJO INTERNO */}
            <MagicalCard
               id="monologo"
               isOpen={openSections.has('monologo')}
               onToggle={toggleSection}
               title="Espejo Interno"
               subtitle="Frases que resuenan"
               icon="record_voice_over"
               gradientTheme="bg-gradient-to-br from-purple-500 to-indigo-600"
               iconColor="text-purple-500"
            >
               <div className="bg-purple-500/5 p-8 rounded-[2rem] border border-purple-500/20 text-center relative overflow-hidden shadow-inner">
                  <div className="absolute -inset-4 bg-purple-500/5 blur-[40px] pointer-events-none"></div>
                  <span className="material-symbols-outlined text-4xl text-purple-400 mb-4 relative z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">format_quote</span>
                  <div className="space-y-4 font-serif italic text-white/90 text-lg relative z-10 font-medium">
                     {data.frases_tipicas?.map((f, i) => (
                        <p key={i}>"{f}"</p>
                     ))}
                  </div>
               </div>
               <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="font-black text-white mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-purple-400">flare</span>
                     Ejercicio de Conexión
                  </h4>
                  <div className="text-white/80">
                     <MarkdownRenderer text={data.ejercicio_conexion} />
                  </div>
               </div>
            </MagicalCard>

            {/* 3. ALQUIMIA NATURAL (Hierbas, Cuerpo, Aroma) */}
            <MagicalCard
               id="alquimia"
               isOpen={openSections.has('alquimia')}
               onToggle={toggleSection}
               title="Alquimia Natural"
               subtitle="Cuerpo, Hierbas y Aromas"
               icon="local_florist"
               gradientTheme="bg-gradient-to-br from-emerald-400 to-teal-500"
               iconColor="text-emerald-500"
            >
               <PremiumLock isLocked={!user?.isPremium} title="Farmacia de la Tierra" description="Accede a los remedios ancestrales y plantas maestras.">

                  {/* Cuerpo Físico */}
                  <div className="mb-8">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 bg-emerald-500/10 inline-block px-3 py-1 rounded-lg border border-emerald-500/20">Activación Física</h4>
                     <div className="text-white/80">
                        <MarkdownRenderer text={data.alternativas_fisicas} />
                     </div>
                  </div>

                  {/* Remedios */}
                  <div className="bg-amber-500/5 p-6 rounded-[2rem] border border-amber-500/20 mb-6 shadow-inner relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[30px] pointer-events-none"></div>
                     <h4 className="flex items-center gap-2 font-black text-amber-400 mb-3 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)] relative z-10">
                        <span className="material-symbols-outlined text-[20px]">experiment</span>
                        Remedios de la Abuela
                     </h4>
                     <div className="text-white/80 relative z-10">
                        <MarkdownRenderer text={data.remedios_naturales} />
                     </div>
                  </div>

                  {/* Aromaterapia */}
                  <div className="bg-pink-500/5 p-6 rounded-[2rem] border border-pink-500/20 shadow-inner relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-[30px] pointer-events-none"></div>
                     <h4 className="flex items-center gap-2 font-black text-pink-400 mb-3 drop-shadow-[0_0_10px_rgba(244,114,182,0.3)] relative z-10">
                        <span className="material-symbols-outlined text-[20px]">filter_drama</span>
                        Aromas y Sahumerios
                     </h4>
                     <div className="text-white/80 relative z-10">
                        <MarkdownRenderer text={data.aromaterapia_sahumerios} />
                     </div>
                  </div>
               </PremiumLock>
            </MagicalCard>

            {/* 4. MUNDO ESPIRITUAL */}
            <MagicalCard
               id="angel"
               isOpen={openSections.has('angel')}
               onToggle={toggleSection}
               title="Conexión Divina"
               subtitle="Ángeles y Energía"
               icon="self_improvement"
               gradientTheme="bg-gradient-to-br from-indigo-400 to-violet-500"
               iconColor="text-indigo-500"
            >
               <PremiumLock isLocked={!user?.isPremium} title="Guía Celestial" description="Conoce a tu Arcángel guardián y rituales de luz.">
                  <div className="text-center mb-8 bg-indigo-500/5 p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-inner relative overflow-hidden">
                     <div className="absolute inset-0 bg-indigo-500/5 blur-[40px] pointer-events-none"></div>
                     <span className="material-symbols-outlined text-[40px] text-indigo-400 mb-4 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)] relative z-10">flight</span>
                     <div className="text-white/90 relative z-10">
                        <MarkdownRenderer text={data.angeles_arcangeles} />
                     </div>
                  </div>

                  <div>
                     <h4 className="font-black text-white/50 mb-3 text-[10px] uppercase tracking-widest bg-white/5 inline-block px-3 py-1.5 rounded-lg border border-white/10">Terapias Holísticas</h4>
                     <div className="text-white/80">
                        <MarkdownRenderer text={data.terapias_holisticas} />
                     </div>
                  </div>
               </PremiumLock>
            </MagicalCard>

            {/* 5. RITUAL FINAL */}
            <MagicalCard
               id="ritual"
               isOpen={openSections.has('ritual')}
               onToggle={toggleSection}
               title="Tu Ritual Diario"
               subtitle="Meditación y Plan"
               icon="auto_awesome"
               gradientTheme="bg-gradient-to-br from-orange-400 to-red-500"
               iconColor="text-orange-500"
            >
               <PremiumLock isLocked={!user?.isPremium} title="Ritual Completo" description="Meditación guiada y tu plan de acción integral.">

                  {/* New Audio Visualizer Component */}
                  <AudioVisualizer scriptText={data.meditacion_guiada} isPremium={user?.isPremium} />

                  {/* Rutina Integral */}
                  <div className="mb-8 mt-6">
                     <h4 className="font-black text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">schedule</span>
                        Rutina Integral
                     </h4>
                     <div className="bg-orange-500/5 p-6 rounded-[2rem] border border-orange-500/20 shadow-inner text-white/80 mb-6">
                        <MarkdownRenderer text={data.rutina_integral} />
                     </div>
                     <button
                        onClick={handleAddToRoutine}
                        disabled={addedToRoutine}
                        className={`w-full py-4 rounded-[1.2rem] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${addedToRoutine
                           ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                           : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95'
                           }`}
                     >
                        <span className="material-symbols-outlined text-[18px]">
                           {addedToRoutine ? 'check_circle' : 'add_task'}
                        </span>
                        {addedToRoutine ? 'Agregada a tus Rutinas' : 'Añadir a mis Rutinas'}
                     </button>
                  </div>

                  {/* Checklist / Adicionales */}
                  <div className="pt-6 border-t border-white/10">
                     <h4 className="font-black text-white/50 mb-3 text-[10px] uppercase tracking-widest bg-white/5 inline-block px-3 py-1.5 rounded-lg border border-white/10">Para cerrar el día</h4>
                     <div className="text-white/80">
                        <MarkdownRenderer text={data.recomendaciones_adicionales} />
                     </div>
                  </div>

               </PremiumLock>
            </MagicalCard>

         </div>
      </div>
   );
};

