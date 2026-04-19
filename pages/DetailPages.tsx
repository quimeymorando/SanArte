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
import { MarkdownRenderer, SectionHeading } from '../components/ui/MarkdownRenderer';
import { MagicalCard } from '../components/ui/MagicalCard';
import { AudioVisualizer } from '../components/AudioVisualizer';

const loadingMessages = [
   "Conectando con la sabiduría de tu cuerpo...",
   "Interpretando el mensaje oculto...",
   "Buscando las hierbas sanadoras...",
];

// ─── Paleta por dimensión ─────────────────────────────
const DIM_ALMA    = '#C9A84C'; // Mensaje del Alma
const DIM_ESPEJO  = '#B5A4DB'; // Espejo Interno — lavanda
const DIM_ALQUIMIA = '#8BA888'; // Alquimia Natural — salvia
const DIM_DIVINA  = '#A78BFA'; // Conexión Divina — violeta
const DIM_RITUAL  = '#F472B6'; // Tu Ritual Diario — rosa coral

const HEADER_BTN_STYLE: React.CSSProperties = {
   width: '40px',
   height: '40px',
   borderRadius: '50%',
   background: 'rgba(201,168,76,0.08)',
   border: '1px solid rgba(201,168,76,0.2)',
   color: '#C9A84C',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   lineHeight: 1,
};

const HEADER_ICON_STYLE: React.CSSProperties = {
   fontSize: '18px',
   fontVariationSettings: "'wght' 300",
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
};

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
         <div
            className="flex flex-col items-center justify-center min-h-screen px-8 text-center"
            style={{ background: '#060D1B' }}
         >
            <div className="relative size-16 mb-8">
               <div
                  className="absolute inset-0 rounded-full border-2 animate-[spin_6s_linear_infinite]"
                  style={{ borderColor: 'rgba(201,168,76,0.2)' }}
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span
                     className="material-symbols-outlined text-2xl animate-pulse"
                     style={{ color: '#C9A84C' }}
                  >self_improvement</span>
               </div>
            </div>
            <p
               style={{
                  fontFamily: '"Playfair Display", serif',
                  fontStyle: 'italic',
                  fontSize: '14px',
                  color: '#6A6460',
                  maxWidth: '280px',
               }}
            >
               {loadingMessages[loadingMsgIndex]}
            </p>
         </div>
      );
   }

   // ── Error ──
   if (error) {
      return (
         <div
            className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
            style={{ background: '#060D1B' }}
         >
            <div className="max-w-sm w-full">
               <div
                  className="size-14 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'rgba(201,168,76,0.05)' }}
               >
                  <span
                     className="material-symbols-outlined"
                     style={{ color: 'rgba(232,168,124,0.8)', fontSize: '28px' }}
                  >cloud_off</span>
               </div>
               <h3
                  style={{
                     fontFamily: '"Playfair Display", serif',
                     fontWeight: 400,
                     fontSize: '22px',
                     color: '#F0EBE0',
                     marginBottom: '8px',
                  }}
               >Conexión interrumpida</h3>
               <p
                  style={{
                     fontFamily: '"Outfit", "Inter", sans-serif',
                     fontSize: '13px',
                     color: '#8B7A6A',
                     lineHeight: 1.75,
                     marginBottom: '32px',
                  }}
               >No pudimos conectar con la fuente. Tu consulta es importante.</p>
               <div className="space-y-3">
                  <button
                     onClick={fetchData}
                     className="w-full active:scale-95 transition-transform"
                     style={{
                        padding: '14px',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, #C9A84C, #F0D080, #C9A84C)',
                        color: '#060D1B',
                        border: 'none',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                     }}
                  >
                     Reintentar
                  </button>
                  <button
                     onClick={() => navigate(-1)}
                     className="w-full"
                     style={{
                        padding: '14px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(201,168,76,0.15)',
                        color: '#8B7A6A',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                        fontSize: '13px',
                        cursor: 'pointer',
                     }}
                  >
                     Volver
                  </button>
               </div>
            </div>
         </div>
      );
   }

   if (!data) {
      return (
         <div
            className="text-center pt-20"
            style={{ color: '#6A6460', background: '#060D1B', minHeight: '100vh' }}
         >
            No se encontró información.
         </div>
      );
   }

   const anyData = data as any;
   const alertasMedicas: string | undefined = anyData.alertas_medicas || anyData.advertencias_medicas;

   // ── Detail Content ──
   return (
      <div style={{ minHeight: '100vh', background: '#060D1B', paddingBottom: '120px' }}>
         {/* Header fixed */}
         <div
            className="fixed top-0 left-0 w-full z-50 pointer-events-none"
            style={{
               paddingTop: 'calc(1rem + env(safe-area-inset-top))',
               paddingLeft: '20px',
               paddingRight: '20px',
               paddingBottom: '24px',
               background: 'linear-gradient(to bottom, #060D1B, rgba(6,13,27,0.8), transparent)',
            }}
         >
            <div
               className="flex justify-between items-center mx-auto pointer-events-auto"
               style={{ maxWidth: '440px', marginTop: '8px' }}
            >
               <button
                  aria-label="Volver"
                  onClick={() => navigate(-1)}
                  style={{ ...HEADER_BTN_STYLE, cursor: 'pointer' }}
               >
                  <span className="material-symbols-outlined" style={HEADER_ICON_STYLE}>arrow_back</span>
               </button>
               <div className="flex gap-2">
                  <button
                     aria-label="Compartir"
                     onClick={handleShare}
                     style={{ ...HEADER_BTN_STYLE, cursor: 'pointer' }}
                  >
                     <span className="material-symbols-outlined" style={HEADER_ICON_STYLE}>share</span>
                  </button>
                  <button
                     aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                     onClick={toggleFavorite}
                     style={isFavorite
                        ? {
                           ...HEADER_BTN_STYLE,
                           background: 'rgba(244,114,182,0.15)',
                           border: '1px solid rgba(244,114,182,0.3)',
                           color: '#F472B6',
                           cursor: 'pointer',
                        }
                        : { ...HEADER_BTN_STYLE, cursor: 'pointer' }
                     }
                  >
                     <span
                        className={`material-symbols-outlined ${isFavorite ? 'filled' : ''}`}
                        style={HEADER_ICON_STYLE}
                     >favorite</span>
                  </button>
               </div>
            </div>
         </div>

         <div style={{ maxWidth: '440px', margin: '0 auto', padding: '96px 20px 0' }}>
            {/* Title */}
            <div style={{ marginBottom: '32px' }}>
               <span
                  style={{
                     display: 'block',
                     fontFamily: '"Outfit", "Inter", sans-serif',
                     fontSize: '10px',
                     fontWeight: 500,
                     letterSpacing: '0.18em',
                     textTransform: 'uppercase',
                     color: '#C9A84C',
                     marginBottom: '10px',
                  }}
               >Guía de Sanación</span>
               <h1
                  style={{
                     fontFamily: '"Playfair Display", serif',
                     fontSize: '30px',
                     fontWeight: 300,
                     color: '#F0EBE0',
                     lineHeight: 1.2,
                     marginBottom: '14px',
                  }}
               >
                  {data.name}
               </h1>
               <p
                  style={{
                     fontFamily: '"Playfair Display", serif',
                     fontSize: '14px',
                     fontStyle: 'italic',
                     color: '#6A6460',
                     lineHeight: 1.7,
                  }}
               >
                  "{data.shortDefinition}"
               </p>
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

               {/* 1. Mensaje del Alma */}
               <MagicalCard
                  id="emocion"
                  isOpen={openSections.has('meaning')}
                  onToggle={toggleSection}
                  title="Mensaje del Alma"
                  subtitle="Zona corporal y emoción"
                  icon="lightbulb"
                  gradientTheme={DIM_ALMA}
                  iconColor={DIM_ALMA}
               >
                  <MarkdownRenderer text={data.zona_detalle} />
                  <div style={{ marginTop: '18px' }}>
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
                  gradientTheme={DIM_ESPEJO}
                  iconColor={DIM_ESPEJO}
               >
                  {/* Bloque quotes */}
                  {data.frases_tipicas && data.frases_tipicas.length > 0 && (
                     <div
                        style={{
                           background: 'rgba(181,164,219,0.05)',
                           border: '1px solid rgba(181,164,219,0.14)',
                           borderRadius: '14px',
                           padding: '22px 20px',
                           marginBottom: '6px',
                        }}
                     >
                        {data.frases_tipicas.map((f, i, arr) => (
                           <p
                              key={i}
                              style={{
                                 fontFamily: '"Playfair Display", serif',
                                 fontSize: '13px',
                                 fontStyle: 'italic',
                                 color: '#8B7A6A',
                                 textAlign: 'center',
                                 marginBottom: i === arr.length - 1 ? 0 : '10px',
                                 lineHeight: 1.6,
                              }}
                           >"{f}"</p>
                        ))}
                     </div>
                  )}

                  <SectionHeading text="Ejercicio de Conexión" color={DIM_ESPEJO} />
                  <MarkdownRenderer text={data.ejercicio_conexion} />
               </MagicalCard>

               {/* 3. Alquimia Natural */}
               <MagicalCard
                  id="alquimia"
                  isOpen={openSections.has('alquimia')}
                  onToggle={toggleSection}
                  title="Alquimia Natural"
                  subtitle="Cuerpo, hierbas y aromas"
                  icon="local_florist"
                  gradientTheme={DIM_ALQUIMIA}
                  iconColor={DIM_ALQUIMIA}
               >
                  <PremiumLock
                     isLocked={!user?.isPremium}
                     title="Farmacia de la Tierra"
                     description="Accedé a remedios ancestrales y plantas maestras."
                  >
                     <SectionHeading text="Recomendaciones físicas específicas" color={DIM_ALQUIMIA} first />
                     <MarkdownRenderer text={data.alternativas_fisicas} />

                     <SectionHeading text="Medicina natural casera" color={DIM_ALQUIMIA} />
                     <MarkdownRenderer text={data.remedios_naturales} />

                     <SectionHeading text="Aromaterapia y sahumerios" color={DIM_ALQUIMIA} />
                     <MarkdownRenderer text={data.aromaterapia_sahumerios} />
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
                  gradientTheme={DIM_DIVINA}
                  iconColor={DIM_DIVINA}
               >
                  <PremiumLock
                     isLocked={!user?.isPremium}
                     title="Guía Celestial"
                     description="Conocé a tu Arcángel guardián y rituales de luz."
                  >
                     <SectionHeading text="Arcángel guía" color={DIM_DIVINA} first />
                     <MarkdownRenderer text={data.angeles_arcangeles} />

                     <SectionHeading text="Terapias holísticas recomendadas" color={DIM_DIVINA} />
                     <MarkdownRenderer text={data.terapias_holisticas} />
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
                  gradientTheme={DIM_RITUAL}
                  iconColor={DIM_RITUAL}
               >
                  <PremiumLock
                     isLocked={!user?.isPremium}
                     title="Ritual Completo"
                     description="Meditación guiada y plan de acción integral."
                  >
                     <AudioVisualizer scriptText={data.meditacion_guiada} isPremium={user?.isPremium} />

                     <div style={{ marginTop: '24px' }}>
                        <SectionHeading text="Ritual diario de integración" color={DIM_RITUAL} first />
                        <MarkdownRenderer text={data.rutina_integral} />

                        <button
                           onClick={handleAddToRoutine}
                           disabled={addedToRoutine}
                           className="active:scale-[0.98] transition-transform"
                           style={addedToRoutine
                              ? {
                                 width: '100%',
                                 padding: '15px 28px',
                                 borderRadius: '999px',
                                 background: 'rgba(52,211,153,0.1)',
                                 color: '#34D399',
                                 border: '1px solid rgba(52,211,153,0.25)',
                                 fontFamily: '"Outfit", "Inter", sans-serif',
                                 fontWeight: 600,
                                 fontSize: '13px',
                                 letterSpacing: '0.04em',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '10px',
                                 marginTop: '24px',
                                 marginBottom: '32px',
                                 cursor: 'default',
                              }
                              : {
                                 width: '100%',
                                 padding: '15px 28px',
                                 borderRadius: '999px',
                                 background: 'linear-gradient(135deg, #C9A84C, #F0D080, #C9A84C)',
                                 color: '#060D1B',
                                 border: 'none',
                                 fontFamily: '"Outfit", "Inter", sans-serif',
                                 fontWeight: 600,
                                 fontSize: '13px',
                                 letterSpacing: '0.04em',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '10px',
                                 marginTop: '24px',
                                 marginBottom: '32px',
                                 cursor: 'pointer',
                                 boxShadow: '0 8px 24px rgba(201,168,76,0.2)',
                              }
                           }
                        >
                           <span
                              className="material-symbols-outlined"
                              style={{
                                 fontSize: '18px',
                                 fontVariationSettings: "'wght' 400",
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                              }}
                           >
                              {addedToRoutine ? 'check_circle' : 'add_task'}
                           </span>
                           {addedToRoutine ? 'Agregada a tus Rutinas' : 'Añadir a mis Rutinas'}
                        </button>
                     </div>

                     {/* PARA CERRAR EL DÍA */}
                     <div
                        style={{
                           marginTop: '8px',
                           paddingTop: '28px',
                           borderTop: '1px solid rgba(201,168,76,0.12)',
                        }}
                     >
                        <span
                           style={{
                              display: 'block',
                              fontFamily: '"Outfit", "Inter", sans-serif',
                              fontSize: '10px',
                              fontWeight: 500,
                              letterSpacing: '0.2em',
                              textTransform: 'uppercase',
                              color: '#C9A84C',
                              marginBottom: '10px',
                           }}
                        >Para cerrar el día</span>
                        <SectionHeading text="Afirmaciones y recordatorios clave" color={DIM_ALMA} first />
                        <MarkdownRenderer text={data.recomendaciones_adicionales} />
                     </div>
                  </PremiumLock>
               </MagicalCard>

               {/* Alertas médicas (si el modelo las incluye) */}
               {alertasMedicas && (
                  <div
                     style={{
                        background: 'rgba(232,168,124,0.05)',
                        border: '1px solid rgba(232,168,124,0.18)',
                        borderLeft: '3px solid #E8A87C',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        marginTop: '20px',
                     }}
                  >
                     <div
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: '8px',
                           marginBottom: '10px',
                        }}
                     >
                        <span
                           className="material-symbols-outlined"
                           style={{
                              fontSize: '16px',
                              color: '#E8A87C',
                              fontVariationSettings: "'wght' 300",
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                           }}
                        >warning</span>
                        <span
                           style={{
                              fontFamily: '"Outfit", "Inter", sans-serif',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#E8A87C',
                           }}
                        >Alertas médicas</span>
                     </div>
                     <p
                        style={{
                           fontFamily: '"Outfit", "Inter", sans-serif',
                           fontSize: '13px',
                           color: '#A08570',
                           lineHeight: 1.75,
                           margin: 0,
                        }}
                     >{alertasMedicas}</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
