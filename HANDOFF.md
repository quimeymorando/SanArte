# SANARTE — Handoff Completo

## Stack
React 19 + Vite 6 + TypeScript + Tailwind + Supabase + Gemini AI
Repo: github.com/quimeymorando/SanArte
Local: C:\CLAUDE CODE\QUIMEY\SanArte
Deploy: sanarte.vercel.app

## Design System — Sacred Noir · Tierra Dorada v3
- Fondo: #060D1B (navy profundo)
- Dorado: #C9A84C (gradiente real)
- Tipografía: Playfair Display (títulos) + Outfit (body)
- Referencia: tierradorada.ar/agencia
- Bottom nav fijo, mobile-first

## Componentes actualizados
- LandingPage + HeroSection + TheShift + OpportunitySection + FinalCTA ✅
- BentoGrid (home dashboard) ✅
- Navigation (bottom nav) ✅
- SplashScreen ✅
- LoginModal ✅
- SearchPage (HomePages.tsx) ✅
- SymptomDetailPage + MagicalCard ✅

## Problema urgente a resolver
El endpoint /api/gemini devuelve 401 Unauthorized en producción.
Causa probable: falta SUPABASE_ANON_KEY (sin prefijo VITE_) 
en Vercel Environment Variables.
El código en api/gemini.js línea 21 busca:
process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

## Reglas del proyecto
- Siempre indicar: /model X | Effort: Y antes de cada instrucción
- Haiku: cambios simples de 1-2 archivos
- Sonnet medium: cambios múltiples archivos estilos
- Opus high: implementar diseños, backend complejo
- Un paso a la vez, captura antes de continuar

## Próximos pasos
1. Resolver 401 en /api/gemini (Vercel env vars)
2. Mejorar prompt de Gemini para 6 dimensiones
3. Rediseñar SymptomDetail con las 6 cards
4. Logo/ícono nuevo de la app
5. Theme color del PWA a #060D1B
