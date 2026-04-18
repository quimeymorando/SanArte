# HANDOFF — Pasos para desplegar SanArte

**Fecha:** 13 de abril 2026  
**Estado:** Todos los cambios estéticos + infraestructura listos en archivos locales.  
**Falta:** Configurar env vars en Vercel + desplegar.

---

## PASO 1 — Configurar ALLOWED_ORIGINS en Vercel (5 min)

Esto es lo que hace que el buscador funcione. Sin esto, la IA no responde.

1. Abrí https://vercel.com → tu proyecto SanArte
2. Andá a **Settings** → **Environment Variables**
3. Verificá que existan estas variables:

| Variable | Valor |
|----------|-------|
| `GEMINI_API_KEY` | Tu clave de Gemini (la que está en .env.local) |
| `SUPABASE_URL` | `https://bjfvjnuapskcmxlusudq.supabase.co` |
| `SUPABASE_ANON_KEY` | La anon key (está en .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | La service role key |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Tu secret de webhooks |
| **`ALLOWED_ORIGINS`** | `https://sanarte.vercel.app` |

**La más crítica es `ALLOWED_ORIGINS`.** Si no existe, creala.

Si tu app tiene dominio propio, poné:
```
https://sanarte.vercel.app,https://sanarte.app
```

---

## PASO 2 — Conectar esta carpeta a GitHub Desktop (5 min)

GitHub Desktop probablemente tiene abierta la carpeta vieja. Hay que cambiarla:

1. Abrí **GitHub Desktop**
2. Menú **File** → **Add local repository...**
3. Navegá a: `C:\CLAUDE CODE\QUIMEY\SanArte`
4. Clic en **Add repository**
5. Ahora vas a ver ~40+ archivos modificados/nuevos en el panel izquierdo

---

## PASO 3 — Hacer commit y push (5 min)

1. En GitHub Desktop, revisá los archivos cambiados
2. En el campo **Summary** escribí:

```
Rediseño estético completo + auditoría Fases 1-4
```

3. En **Description**:

```
- Rediseño minimalista de toda la app (Home, Búsqueda, Detalle, Perfil, 
  Rutinas, Diario, Comunidad, Landing, Upgrade, Navegación)
- Color principal: cyan neón → teal sereno
- Eliminados glows agresivos, emojis en nav, ruido visual
- Fix Diario: separadas reflexiones personales del historial de búsquedas
- Textarea de búsqueda expandible (textos largos ya no se cortan)
- i18n (español/inglés), SEO con react-helmet-async, feature flags
- 83 tests unitarios + Playwright E2E + Vitest
- Sentry, web vitals, structured logging, health endpoint
- Engagement tracking + Web Push para re-engagement
- Admin dashboard + email transaccionales (Resend)
- Bundle 8% más liviano (1107 KB vs 1202 KB)
```

4. Clic en **"Commit to main"**
5. Clic en **"Push origin"** (arriba a la derecha)

---

## PASO 4 — Esperar el deploy en Vercel (2-3 min)

1. Abrí https://vercel.com → tu proyecto
2. Vas a ver un deployment en progreso
3. Cuando termine (marca verde ✓), abrí `sanarte.vercel.app`
4. Verificá que todo se vea bien

---

## PASO 5 — Verificar que el buscador funcione

1. Abrí `sanarte.vercel.app` y logueate
2. Buscá un síntoma, por ejemplo "dolor de cabeza"
3. Si funciona → la IA responde y ves el detalle del síntoma
4. Si sigue fallando → revisá en Vercel que `ALLOWED_ORIGINS` esté bien puesto
   y que `GEMINI_API_KEY` sea válida (no expirada)

---

## CAMBIOS ESTÉTICOS REALIZADOS (referencia)

| Página | Qué cambió |
|--------|-----------|
| **BentoGrid (Home)** | Sin emojis, textarea expandible, cards con Material Icons, stats limpios, quote sin caja |
| **Navigation** | Sin emojis ni badge central, links con active teal, bottom nav Material Icons |
| **SearchPage** | Barra compacta, spinner minimalista, results como botones, empty state con ícono |
| **DetailPages** | Loading limpio, error sobrio, MagicalCards sin glows, header botones sutiles |
| **MagicalCard** | Sin ambient glow, bordes finos, expand_more limpio |
| **JournalPage** | Tabs (Reflexiones vs Historial), modal slide-up mobile, entries compactas |
| **ProfilePage** | Progress ring fino, stats en grid, badges con icons, settings como lista |
| **RoutinesPage** | Cards compactas con toggle, sin glows |
| **FavoritesPage** | Grid simple, hover delete sutil |
| **CommunityPage** | Compose box limpio, tabs de filtro, feed cards sin glows, comments inline |
| **UpgradePage** | Card única premium centrada, billing toggle clean, free/mecenas como filas |
| **LandingPage** | Navbar limpio, CTA directo, sin aurora/grid/particles |
| **HeroSection** | Título limpio, sin parallax, ambient sutil teal |
| **TheShift** | 3 pasos visuales en grid, sin imagen de fondo |
| **OpportunitySection** | Lista de beneficios con icons, sin cards con emojis |
| **FinalCTA** | CTA centrado minimalista, social proof sutil |

## Paleta de colores nueva
- **Antes:** `cyan-400` neón (#00f2ff) con `#0a1114` y glows por todos lados
- **Ahora:** `teal-500` (#14b8a6) con `#080c0f` y bordes `white/[0.06]`
- **Filosofía:** Dark minimal — menos es más, que el contenido brille

---

## QUÉ SIGUE DESPUÉS DEL DEPLOY

1. **Probar toda la app** en producción (búsqueda, detalle, perfil, comunidad)
2. **Ajustar estéticos** si algo no queda como querés (Claude Code sigue disponible)
3. **Configurar dominio propio** (sanarte.app) en Vercel si no lo tenés
4. **Subir imágenes PWA optimizadas** (las actuales pesan mucho)
5. **Configurar Sentry DSN** en Vercel para error tracking
