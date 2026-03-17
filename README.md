# Sanarte

Aplicacion React + Vite + Supabase para busqueda de sintomas, detalle guiado y funciones de comunidad.

## Bitacora Operativa Persistente (leer primero)

Ultima actualizacion: `2026-03-16`

- Objetivo: al reabrir terminal, retomar exactamente desde el ultimo estado sin depender del historial del chat.
- Regla obligatoria: despues de cada cambio tecnico (codigo, infra, config o decision), actualizar esta bitacora antes de cerrar sesion.
- Estado global del barrido pre-lanzamiento: `LISTO CON RESERVAS`.

### Veredicto del barrido (protocolo A-I)

Proyecto: `SanArte` | Fecha barrido: `2026-03-08`

ESTADO GLOBAL: `LISTO CON RESERVAS`

- `[ROJO]` Bloqueantes activos:
  - Falta cerrar sanitizacion EXIF en flujo de imagen/avatar para cumplir saneamiento reforzado de entrada.

- `[AMAR]` Riesgos/mejoras importantes:
  - Dependencias desactualizadas (`npm outdated`), incluyendo saltos mayores en `vite` y `tailwindcss`.
  - No se encontraron `robots.txt` ni `sitemap.xml` en `public/`.
  - Sin evidencia en repo de monitoreo de errores en produccion (Sentry/Datadog equivalente) ni politica de backups diarios documentada.
  - Sanitizacion de subida de avatar valida MIME/tamano, pero no hay evidencia de limpieza EXIF antes de almacenamiento.
  - Defensa anti prompt-injection implementada con patrones y guardrails server-side; pendiente evolucionar a un enfoque mas robusto por capas (clasificador/allowlist contextual).

- `[OK]` Cumplimientos relevantes:
  - `npm run audit:prod` y `npm audit` sin vulnerabilidades tras hardening de dependencias.
  - `npm run typecheck` y `npm run build` exitosos.
  - CI en `.github/workflows/ci.yml` ejecuta `typecheck`, `audit:prod` y `build` en push/PR.
  - Endpoints sensibles backend con autenticacion y controles base:
    - `api/gemini.js` valida token Supabase, rate limit, tamano payload, longitud de mensajes.
    - `api/gemini.js` aplica guardrail server-side fijo y rechaza patrones clasicos de jailbreak.
    - `api/webhook.js` verifica firma HMAC.
    - `api/account-export.js` y `api/account-delete.js` exigen token.
    - `api/account-export.js`, `api/account-delete.js` y `api/gemini.js` ahora validan origen con politica fail-closed en produccion.
  - Consentimiento de cookies implementado y ads/analytics condicionados por consentimiento explicito.
  - Flujo legal/usuario cubierto: privacidad, terminos, exportacion de datos y eliminacion de cuenta.

### Barrido por apartados del protocolo

#### A) Radiografia del proyecto
- Stack confirmado: React + Vite + Supabase + Vercel + API serverless en `api/*`.
- IA: Gemini via `POST /api/gemini`.
- Autenticacion: Supabase Auth (email/password + OAuth Google + PKCE).
- Datos sensibles: cuenta, email, actividad, sintomas, contenido de comunidad y trazas de interaccion con IA.

#### B) Salud del ecosistema de paquetes
- `B.1 CVEs`: `[OK]` `npm audit` y `npm run audit:prod` en cero vulnerabilidades al cierre de esta actualizacion.
- `B.2 Obsolescencia`: `[AMAR]` varias dependencias con updates pendientes.
- `B.3 Licencias`: `[OK]` no se detectaron GPL/AGPL en dependencias de produccion; el paquete raiz es `UNLICENSED` (esperable en proyecto privado).

#### C) Blindaje de seguridad
- `C.1 Identidad/permisos`: `[OK]` auth delegada a Supabase + RLS en schema.
- `C.2 Saneamiento de entrada`: `[AMAR]` validaciones manuales buenas; `[ROJO]` falta evidencia de limpieza EXIF en imagenes de avatar.
- `C.3 Custodia/entorno`: `[OK]` `ALLOWED_ORIGINS` configurado en Vercel `production` para el proyecto linkeado actual (`tierra-doradas-projects/sanarte`).

#### D) Comportamiento y seguridad de IA
- `D.1 Resiliencia de prompt/modelo`: `[AMAR]` se agrego filtro de patrones + guardrail server-side; pendiente capa avanzada anti-inyeccion por contexto. `[OK]` parseo robusto y fallback en cliente.
- `D.2 Experiencia IA`: `[AMAR]` sin streaming; `[OK]` limites de mensajes/tamano y control basico de abuso por rate limit.

#### E) UX y estetica UI
- `[OK]` experiencia cuidada y design language consistente.
- `[AMAR]` falta evidencia formal de auditoria mobile-first (tap targets) y accesibilidad completa.

#### F) Velocidad, capacidad y resiliencia
- `[OK]` build productivo exitoso y assets optimizados por Vite.
- `[AMAR]` sin medicion documentada de Core Web Vitals/Lighthouse en esta pasada.
- `[OK]` manejo de fallos amigable en endpoints y fallback de respuestas IA.

#### G) SEO, analitica y conversion
- `[OK]` metadatos base + Open Graph + Twitter Card presentes en `index.html`.
- `[AMAR]` faltan `public/robots.txt` y `public/sitemap.xml`.
- `[OK]` analitica/monetizacion con gating por consentimiento.

#### H) Normativa y legalidad
- `[OK]` politica de privacidad, terminos, banner de cookies, exportacion/eliminacion de cuenta.
- `[AMAR]` accesibilidad no auditada formalmente en esta pasada.

#### I) Operaciones y entrega
- `[OK]` pipeline CI en push/PR.
- `[AMAR]` faltan evidencias en repo de monitoreo de errores productivo y plan de backups diarios.
- `[OK]` `.env.example` documentado sin valores reales.

### Evidencia ejecutada en esta sesion

- `npm run audit:prod` -> `found 0 vulnerabilities`.
- `npm audit` (antes de hardening) -> `5 high severity vulnerabilities`.
- `npm install` con overrides (`serialize-javascript@7.0.4`, `tar@7.5.10`) -> dependencias actualizadas.
- `npm audit` (despues de hardening) -> `found 0 vulnerabilities`.
- `npm outdated` -> multiples paquetes desactualizados (incluye updates mayores).
- `node --test` -> tests verdes (incluye `api/securityPolicy.test.js`).
- `npm run doctor` -> env requerida presente, opcionales faltantes (`ALLOWED_ORIGINS`, checkout links y slot AdSense dashboard).
- `npm run typecheck` -> sin errores.
- `npm run build` -> build OK y salida a `dist/`.
- `npx license-checker --production --failOn "GPL;AGPL"` -> sin bloqueo por licencias GPL/AGPL.
- `vercel link --yes --team tierra-doradas-projects --project sanarte` -> proyecto linkeado correctamente.
- `vercel env add ALLOWED_ORIGINS production --value "https://sanarte.app,https://www.sanarte.app,https://sanarte.vercel.app" --force --yes` -> variable guardada en `production`.
- `vercel env ls production` -> confirma `ALLOWED_ORIGINS` activo en `Production`.

### Bloqueantes abiertos (prioridad alta)

1. Cerrar gap de sanitizacion EXIF en flujo de imagen/avatar para cumplir saneamiento reforzado.
2. Evolucionar anti prompt-injection de heuristico a estrategia multicapa (deteccion contextual + politicas mas finas).
3. Completar evidencia operativa de monitoreo productivo y backups diarios.

### Variables/infra pendientes

- `VITE_LS_CHECKOUT_MONTHLY`
- `VITE_LS_CHECKOUT_ANNUAL`
- `VITE_LS_CHECKOUT_MECENAS`
- `VITE_ADSENSE_SLOT_DASHBOARD_BANNER`
- Decision de stack de monitoreo de errores (si aplica) y politica de backup operativo.

### Proximo paso recomendado

1) Priorizar cierre de los bloqueantes de prioridad alta listados arriba.
2) Repetir barrido rapido (`audit`, `doctor`, `typecheck`, `build`).
3) Actualizar esta seccion con nuevo estado global.

## Bitacora de sesiones (actualizar en cada cierre)

### Sesion 2026-03-08
- Cambios realizados:
  - Barrido completo del protocolo pre-lanzamiento (A-I) con evidencia tecnica.
  - Se consolido el estado operativo y riesgos en este `README.md`.
  - Se establecio regla obligatoria de actualizacion de bitacora por sesion.
- Bloqueantes abiertos:
  - Vulnerabilidades `npm audit`.
  - `ALLOWED_ORIGINS` pendiente de confirmacion/configuracion productiva.
  - Falta estrategia explicita anti prompt-injection/jailbreak.
- Variables/infra pendientes:
  - `ALLOWED_ORIGINS`, checkout links premium y slot AdSense dashboard.
- Proximo paso recomendado:
  - Atacar primero vulnerabilidades + CORS de origenes + hardening de prompt.

### Sesion 2026-03-08 (hardening seguridad)
- Cambios realizados:
  - Se implemento `api/securityPolicy.js` con politicas compartidas de origen y guardrails anti-jailbreak.
  - Se agregaron tests en `api/securityPolicy.test.js` (TDD red-green completado).
  - Se endurecieron `api/gemini.js`, `api/account-export.js` y `api/account-delete.js` para exigir politica de origen fail-closed en produccion.
  - Se aplicaron overrides de dependencias en `package.json` para corregir CVEs reportadas por `npm audit`.
- Comandos de verificacion ejecutados:
  - `node --test`
  - `npm run typecheck`
  - `npm run build`
  - `npm audit`
  - `npm run doctor`
- Resultado global del estado:
  - Vulnerabilidades cerradas (`npm audit` en cero), seguridad de origenes endurecida, y defensa anti prompt-injection base activa.
- Bloqueantes abiertos:
  - Definir `ALLOWED_ORIGINS` final en entorno productivo.
- Variables/infra pendientes:
  - `ALLOWED_ORIGINS`, checkout links premium y slot AdSense dashboard.
- Proximo paso recomendado:
  - Configurar `ALLOWED_ORIGINS` en Vercel y validar llamadas reales desde dominio productivo.

### Sesion 2026-03-08 (infra Vercel - ALLOWED_ORIGINS)
- Cambios realizados:
  - Se relinkeo el repo local al proyecto Vercel `tierra-doradas-projects/sanarte`.
  - Se configuro `ALLOWED_ORIGINS` en entorno `production` con valor:
    - `https://sanarte.app,https://www.sanarte.app,https://sanarte.vercel.app`
- Comandos de verificacion ejecutados:
  - `vercel env ls production`
  - `node --test "api/securityPolicy.test.js"`
- Resultado global del estado:
  - Politica de origenes productiva configurada y seguridad fail-closed activa para endpoints protegidos.
- Bloqueantes abiertos:
  - Sanitizacion EXIF pendiente.
- Variables/infra pendientes:
  - `VITE_LS_CHECKOUT_MONTHLY`, `VITE_LS_CHECKOUT_ANNUAL`, `VITE_LS_CHECKOUT_MECENAS`, `VITE_ADSENSE_SLOT_DASHBOARD_BANNER`.
- Proximo paso recomendado:
  - Comenzar sprint de diseno integral con nueva direccion visual validada.

### Sesion 2026-03-08 (diseno Sacred Noir - blueprint aprobado)
- Cambios realizados:
  - Se definio y aprobo direccion visual oficial `Sacred Noir` para evolucionar SanArte a una experiencia mistica premium.
  - Se documento blueprint completo en `docs/plans/2026-03-08-sacred-noir-design.md`.
  - Se creo plan de implementacion fase por fase en `docs/plans/2026-03-08-sacred-noir-implementation.md`.
- Comandos de verificacion ejecutados:
  - `git status --short --branch`
- Resultado global del estado:
  - Estrategia de diseno cerrada y lista para ejecucion tecnica sin ambiguedad.
- Bloqueantes abiertos:
  - Sanitizacion EXIF pendiente.
  - Falta evidencia operativa de monitoreo productivo y backups diarios.
- Variables/infra pendientes:
  - `VITE_LS_CHECKOUT_MONTHLY`, `VITE_LS_CHECKOUT_ANNUAL`, `VITE_LS_CHECKOUT_MECENAS`, `VITE_ADSENSE_SLOT_DASHBOARD_BANNER`.
- Proximo paso recomendado:
  - Ejecutar Task 1 del plan Sacred Noir (tokens globales + contratos de tema).

### Sesion 2026-03-16 (reanudacion + auditoria de continuidad)
- Cambios realizados:
  - Se releyo `README.md` y `BITACORA_SESIONES_SANARTE.md` para recuperar el contexto operativo al reabrir la terminal.
  - Se detecto que la bitacora canonica y mas completa esta en `README.md`; `BITACORA_SESIONES_SANARTE.md` quedo desactualizada y solo cubre hasta `2026-03-05`.
  - Se revisaron los planes no trackeados `docs/plans/2026-03-13-agency-os-launch-studio-design.md` y `docs/plans/2026-03-13-agency-os-launch-studio-implementation.md`.
  - Se confirmo via `git status --short --branch` que el repo sigue en `main` y solo hay dos cambios locales: ambos planes del `2026-03-13`.
- Comandos de verificacion ejecutados:
  - `git status --short --branch`
  - `git log --oneline -5`
- Resultado global del estado:
  - El ultimo punto de trabajo claro y accionable es el `Task 1` del plan `docs/plans/2026-03-13-agency-os-launch-studio-implementation.md` para montar el runtime versionado de Agency OS.
  - Antes de implementar conviene salir de `main` y trabajar en un worktree/branch aislado para no mezclar la ejecucion del plan con el workspace principal.
- Bloqueantes abiertos:
  - Falta elegir la ubicacion del worktree aislado requerido antes de empezar la implementacion del plan.
  - Siguen abiertos los gaps de lanzamiento ya registrados: sanitizacion EXIF, `robots.txt`, `sitemap.xml`, monitoreo y backups.
- Variables/infra pendientes:
  - `VITE_LS_CHECKOUT_MONTHLY`, `VITE_LS_CHECKOUT_ANNUAL`, `VITE_LS_CHECKOUT_MECENAS`, `VITE_ADSENSE_SLOT_DASHBOARD_BANNER`.
- Proximo paso recomendado:
  - Crear un worktree aislado (preferencia operativa: ubicacion global fuera del repo) y ejecutar en batch los Tasks 1-3 del plan del `2026-03-13`, actualizando esta bitacora tras cada tarea.

### Sesion 2026-03-16 (hallazgo del worktree activo)
- Cambios realizados:
  - Se detecto que el trabajo real no estaba en `main`, sino en `.worktrees/agency-os-launch-studio` sobre la rama `agency-os-launch-studio`.
  - Se verifico en ese worktree que ya estan implementados el Launch Studio local, el hardening EXIF, SEO tecnico basico, el runbook de observabilidad/backups, el rollout Sacred Noir y la pasada automatizada de QA.
  - Se corrigio en ese worktree una regresion de `node --test` causada por el script manual `scripts/test-gemini.ts`, renombrado ahi a `scripts/gemini-manual-check.ts` con un contrato nuevo que evita futuras autodetecciones del runner.
  - Se revalido en ese worktree: `node --test` (`42/42`), `npm run typecheck`, `npm run build`, `npm run audit:prod` y `npm run agency:doctor`.
- Resultado global del estado:
  - El siguiente paso real ya no es arrancar el plan desde cero: es continuar directamente en `.worktrees/agency-os-launch-studio` y cerrar el sign-off manual final con evidencia Lighthouse/CWV.
- Bloqueantes abiertos:
  - Falta el QA manual final mobile/desktop y la evidencia Lighthouse/CWV en el worktree activo.
- Proximo paso recomendado:
  - Reabrir trabajo desde `.worktrees/agency-os-launch-studio`, no desde `main`, y continuar el cierre manual final de launch.

### Sesion 2026-03-16 (Lighthouse bloqueado en CLI)
- Cambios realizados:
  - Se intento correr Lighthouse sobre el preview local del worktree activo.
  - El preview levanto, pero Lighthouse en este entorno devolvio `NO_FCP` y `EPERM`, asi que no produjo evidencia valida de performance.
- Resultado global del estado:
  - El bloqueo para cerrar launch ya no es tecnico de repo sino de entorno de captura para Lighthouse/CWV.
- Proximo paso recomendado:
  - Hacer la pasada final desde `.worktrees/agency-os-launch-studio` usando un navegador/entorno interactivo que permita capturar Lighthouse de forma estable.

### Sesion 2026-03-16 (landing publica revalidada)
- Cambios realizados:
  - Se encontro la causa del falso `NO_FCP`: el worktree `.worktrees/agency-os-launch-studio` no tenia `.env.local`, asi que la app quedaba en blank screen al crear el cliente Supabase con valores vacios.
  - Se sincronizo el entorno local al worktree, se recompilo y se obtuvo evidencia automatizada valida de la landing publica en desktop y mobile.
  - Se guardaron artefactos de QA dentro del worktree en `.antigravity/team/artifacts/` para continuidad local.
- Resultado global del estado:
  - La landing publica ya no esta pendiente: tiene screenshots desktop/mobile y Lighthouse valido.
  - El pendiente real de launch queda reducido al journey autenticado (`/home`, `/search`, `/symptom-detail`, `/upgrade`) y al sign-off manual final.
- Proximo paso recomendado:
  - Continuar en `.worktrees/agency-os-launch-studio` con una via reproducible para revisar las rutas autenticadas y cerrar el QA final.

### Sesion 2026-03-16 (rutas autenticadas con helper local)
- Cambios realizados:
  - Se habilito una via local reproducible dentro del worktree para revisar rutas autenticadas con guest mode en dev.
  - Ya hay evidencia visual inicial para `/home`, `/search` y `/upgrade`, mas una pasada mobile de `/home`, todas dentro de `.worktrees/agency-os-launch-studio/.antigravity/team/artifacts/`.
  - `symptom-detail` todavia no queda cerrado porque sin navegar desde una busqueda real solo muestra la camara de preparacion.
- Resultado global del estado:
  - El QA pendiente ya esta muy acotado: completar el flujo real `search -> detail`, revisar overlays/spacing mobile restantes y hacer el sign-off manual final.
- Proximo paso recomendado:
  - Seguir desde `.worktrees/agency-os-launch-studio` reproduciendo el flujo real hacia detalle y cerrar la ultima pasada visual/funcional del journey autenticado.

### Sesion 2026-03-16 (cuello de botella actual: detail)
- Cambios realizados:
  - Se probo `symptom-detail` con query real en el worktree activo.
  - La ruta llega a su estado de error y no a la lectura completa, lo que apunta a una limitacion de integracion local con datos/API, no a un problema de layout base.
  - Se intento `vercel dev` como workaround y tampoco quedo usable en este entorno por un error de `vite` sobre `index.html`.
- Resultado global del estado:
  - El bloqueo tecnico final ya esta acotado y claramente identificado: validar `detail` con una fuente de datos/API real.
- Proximo paso recomendado:
  - Resolver ese ultimo camino de `detail` via backend/proxy local o corriendo la prueba sobre un entorno remoto estable con API operativa.

### Sesion 2026-03-16 (detail local destrabado)
- Cambios realizados:
  - Se implemento en el worktree activo un fallback dev-only para `symptom-detail` cuando se usa guest mode local sin sesion real.
  - Se agrego un nuevo contrato automatizado para blindar ese comportamiento y la suite del worktree ahora corre `44/44` en verde.
  - Se capturaron screenshots desktop/mobile del detalle completo en `.worktrees/agency-os-launch-studio/.antigravity/team/artifacts/`.
- Resultado global del estado:
  - El flujo principal ya puede revisarse visualmente de punta a punta en local desde `.worktrees/agency-os-launch-studio`.
  - La validacion pendiente de `detail` pasa a ser especificamente de integracion real con backend/IA, no de UX base ni layout.
- Proximo paso recomendado:
  - Hacer la pasada manual final de sign-off sobre los artefactos ya reunidos y decidir si queda algun ajuste fino antes de integrar la rama.

### Sesion 2026-03-16 (revalidacion de continuidad actual)
- Cambios realizados:
  - Se releyo `README.md` raiz y el `README.md` del worktree `.worktrees/agency-os-launch-studio` para confirmar el ultimo estado real antes de retomar.
  - Se verifico que `main` sigue funcionando como punto de entrada documental, mientras el trabajo de launch continua en la rama/worktree `agency-os-launch-studio`.
  - Se reviso `docs/plans/2026-03-13-sanarte-launch-backlog.md` dentro del worktree para confirmar que el pendiente real ya no es de implementacion base sino de cierre final.
- Comandos de verificacion ejecutados:
  - `git worktree list`
  - `git status --short --branch`
  - `git status --short --branch` en `.worktrees/agency-os-launch-studio`
- Resultado global del estado:
  - El siguiente paso real sigue siendo cerrar el sign-off manual final en `.worktrees/agency-os-launch-studio`, no reabrir discovery ni arrancar otro branch.
  - Tras ese sign-off, solo queda validar `symptom-detail` contra backend/IA reales para separar QA visual local del chequeo de integracion productiva.
- Bloqueantes abiertos:
  - Falta el sign-off manual final mobile/desktop sobre los artefactos ya capturados.
  - Falta una comprobacion real de integracion para `symptom-detail` con backend/IA operativos.
- Variables/infra pendientes:
  - `VITE_LS_CHECKOUT_MONTHLY`, `VITE_LS_CHECKOUT_ANNUAL`, `VITE_LS_CHECKOUT_MECENAS`, `VITE_ADSENSE_SLOT_DASHBOARD_BANNER`.
- Proximo paso recomendado:
  - Retomar desde `.worktrees/agency-os-launch-studio`, revisar `landing-*`, `home-*`, `search-*`, `upgrade-*` y `detail-full-*` en `.antigravity/team/artifacts/`, decidir si hace falta un ultimo pulido de overlays/spacing y luego correr la validacion real de `detail` con API operativa antes de integrar la rama.

### Sesion 2026-03-16 (hallazgos de cierre al continuar)
- Cambios realizados:
  - Se revisaron los artefactos principales del worktree activo para acercar el sign-off visual real.
  - Se confirmo que el modelo Gemini efectivo del entorno local (`gemini-2.0-flash`) responde correctamente; el `404` observado en un script manual viene de una referencia legacy a `gemini-1.5-flash` y no del backend actual.
  - Se dejo alineado el backlog de cierre del worktree para que estos dos hallazgos queden persistidos tambien en `docs/plans/2026-03-13-sanarte-launch-backlog.md`.
- Resultado global del estado:
  - El bloqueo real para `symptom-detail` queda acotado a la falta de una sesion autenticada valida para `/api/gemini`, no a un problema de modelo/API key.
  - El ultimo ajuste visual a decidir sigue siendo el solapamiento de `ConsentBanner` con la notificacion de rutina en el primer viewport.
- Proximo paso recomendado:
  - Continuar en `.worktrees/agency-os-launch-studio` resolviendo primero el choque visual `toast + cookies` o consiguiendo una ruta de auth real para validar `detail` contra backend/IA antes de integrar la rama.

### Plantilla para nuevas sesiones (copiar/pegar)

#### Sesion YYYY-MM-DD HH:mm
- Cambios realizados:
  -
- Comandos de verificacion ejecutados:
  -
- Resultado global del estado:
  -
- Bloqueantes abiertos:
  -
- Variables/infra pendientes:
  -
- Proximo paso recomendado:
  -

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion local (paso a paso)

1) Instala dependencias:

```bash
npm install
```

2) Crea tu archivo de entorno local usando el ejemplo:

```bash
copy .env.example .env.local
```

3) Completa en `.env.local` los valores necesarios:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (backend/API server)

4) Ejecuta diagnostico rapido (opcional pero recomendado):

```bash
npm run doctor
```

5) Levanta la app:

```bash
npm run dev
```

6) Abre la URL que te muestre Vite (ejemplo: `http://127.0.0.1:5173`).

## Comandos utiles

- `npm run dev` - entorno local
- `npm run build` - build de produccion
- `npm run preview` - preview del build
- `npm run typecheck` - chequeo TypeScript
- `npm run check` - verificacion rapida (build)
- `npm run audit:prod` - auditoria de dependencias de runtime
- `npm run doctor` - valida variables de entorno minimas

## Smoke test manual (2 minutos)

1) Login
2) Ir a `/home`
3) Buscar sintoma
4) Abrir detalle
5) Abrir chat y enviar mensaje
6) Abrir pantalla de upgrade

Si algo falla, comparte:

- ruta exacta
- boton o accion que hiciste
- error de consola/terminal

## Variables para deploy (Vercel)

Configura en el proyecto de Vercel:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LEMON_SQUEEZY_WEBHOOK_SECRET`
- `GEMINI_API_KEY`
- `ALLOWED_ORIGINS` (ej. `https://sanarte.app,https://www.sanarte.app`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Seguridad

- El upgrade premium ya no se concede desde cliente.
- Gemini se consume via endpoint backend (`/api/gemini`).
- Webhook usa verificacion HMAC de firma.
- Ads y analitica solo se activan con consentimiento explicito del usuario.
- Perfil incluye exportacion de datos y eliminacion de cuenta.
