import React, { useState, useEffect } from 'react';
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
            }).catch(console.warn);
         }
      } catch (error: any) {
         console.error("Error fetching details:", error);
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
         console.log('Error sharing', error);
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
      } catch (e) { console.error(e); }
   };

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark px-8 text-center">
            <div className="relative size-24 mb-8">
               <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-purple-400 border-l-transparent animate-spin"></div>
               <div className="absolute inset-4 rounded-full bg-white dark:bg-surface-dark shadow-inner flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary animate-pulse">psychology</span>
               </div>
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-pulse">
               {loadingMessages[loadingMsgIndex]}
            </h3>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark px-6 text-center">
            <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-red-100 dark:border-red-900/30 max-w-md w-full">
               <div className="size-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                  <span className="material-symbols-outlined text-4xl">cloud_off</span>
               </div>
               <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                  Interrupción Temporal
               </h3>
               <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {error === "La conexión tardó demasiado. Por favor intenta de nuevo."
                     ? "La sabiduría antigua se está tomando un momento para responder. Por favor, intenta de nuevo."
                     : "Hubo un problema al conectar con la fuente. Tu consulta es importante, por favor intenta nuevamente."}
               </p>
               <div className="flex flex-col gap-3">
                  <button
                     onClick={fetchData}
                     className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                     <span className="material-symbols-outlined">refresh</span>
                     Reintentar Conexión
                  </button>
                  <button
                     onClick={() => navigate(-1)}
                     className="w-full py-4 rounded-xl bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold transition-all"
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
      <div className="flex-1 w-full min-h-screen bg-[#f8fafc] dark:bg-background-dark pb-32 relative">
         {/* HEADER NAV */}
         <div className="fixed top-0 left-0 w-full z-50 px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-4 bg-gradient-to-b from-[#fcfdfe] to-transparent dark:from-background-dark pointer-events-none">
            <div className="flex justify-between items-center max-w-2xl mx-auto pointer-events-auto">
               <button onClick={() => navigate(-1)} className="size-10 rounded-xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-lg text-gray-600 dark:text-gray-300">
                  <span className="material-symbols-outlined">arrow_back</span>
               </button>
               <div className="flex gap-3">
                  <button onClick={handleShare} className="size-10 rounded-xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-lg text-cyan-600 dark:text-cyan-400 active:scale-95 transition-transform">
                     <span className="material-symbols-outlined">share</span>
                  </button>
                  <button onClick={toggleFavorite} className={`size-10 rounded-xl backdrop-blur-md border flex items-center justify-center shadow-lg transition-all ${isFavorite ? 'bg-pink-50 border-pink-100 text-pink-500 scale-110' : 'bg-white/80 dark:bg-surface-dark/80 border-gray-100 text-gray-400'}`}>
                     <span className={`material-symbols-outlined ${isFavorite ? 'filled' : ''}`}>favorite</span>
                  </button>
               </div>
            </div>
         </div>

         <div className="max-w-2xl mx-auto px-5 pt-24 pb-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HERO TITLE */}
            <div className="mb-8">
               <div className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-3">
                  Guía de Sanación
               </div>
               <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                  {data.name}
               </h1>
               <p className="text-lg text-gray-600 dark:text-gray-300 font-serif italic opacity-90">
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
               <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-500/10 mb-6">
                  <MarkdownRenderer text={data.zona_detalle} />
               </div>

               {/* Emociones Detalle */}
               <div className="text-gray-700 dark:text-gray-200">
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
               <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-500/10 text-center">
                  <span className="material-symbols-outlined text-3xl text-purple-300 mb-2">format_quote</span>
                  <div className="space-y-3 font-serif italic text-gray-700 dark:text-gray-200 text-lg">
                     {data.frases_tipicas?.map((f, i) => (
                        <p key={i}>{f}</p>
                     ))}
                  </div>
               </div>
               <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Ejercicio de Conexión</h4>
                  <MarkdownRenderer text={data.ejercicio_conexion} />
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
                  <div className="mb-6">
                     <h4 className="text-sm font-black uppercase tracking-widest text-emerald-600 mb-2">Activación Física</h4>
                     <MarkdownRenderer text={data.alternativas_fisicas} />
                  </div>

                  {/* Remedios */}
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 mb-6">
                     <h4 className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300 mb-2">
                        <span className="material-symbols-outlined">experiment</span>
                        Remedios de la Abuela
                     </h4>
                     <MarkdownRenderer text={data.remedios_naturales} />
                  </div>

                  {/* Aromaterapia */}
                  <div className="bg-pink-50 dark:bg-pink-900/10 p-5 rounded-3xl border border-pink-100">
                     <h4 className="flex items-center gap-2 font-black text-pink-800 dark:text-pink-300 mb-2">
                        <span className="material-symbols-outlined">filter_drama</span>
                        Aromas y Sahumerios
                     </h4>
                     <MarkdownRenderer text={data.aromaterapia_sahumerios} />
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
                  <div className="text-center mb-6 bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem]">
                     <span className="material-symbols-outlined text-4xl text-indigo-400 mb-2">flight</span>
                     <MarkdownRenderer text={data.angeles_arcangeles} />
                  </div>

                  <div>
                     <h4 className="font-black text-gray-900 dark:text-white mb-2 text-sm uppercase">Terapias Holísticas</h4>
                     <MarkdownRenderer text={data.terapias_holisticas} />
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
                  <div className="mb-8">
                     <h4 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">schedule</span>
                        Rutina Integral
                     </h4>
                     <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-3xl border border-orange-100">
                        <MarkdownRenderer text={data.rutina_integral} />
                     </div>
                     <button
                        onClick={handleAddToRoutine}
                        disabled={addedToRoutine}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${addedToRoutine
                           ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                           : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg hover:shadow-orange-500/25 active:scale-95'
                           }`}
                     >
                        <span className="material-symbols-outlined">
                           {addedToRoutine ? 'check_circle' : 'add_task'}
                        </span>
                        {addedToRoutine ? 'Agregada a tus Rutinas' : 'Agregar a mis Rutinas'}
                     </button>
                  </div>

                  {/* Checklist / Adicionales */}
                  <div>
                     <h4 className="font-black text-gray-900 dark:text-white mb-3 text-sm uppercase">Para cerrar el día</h4>
                     <MarkdownRenderer text={data.recomendaciones_adicionales} />
                  </div>

               </PremiumLock>
            </MagicalCard>

         </div>
      </div>
   );
};

