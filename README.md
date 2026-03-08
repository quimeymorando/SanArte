# Sanarte

Aplicacion React + Vite + Supabase para busqueda de sintomas, detalle guiado y funciones de comunidad.

## Bitacora Operativa Persistente (leer primero)

Ultima actualizacion: `2026-03-08`

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
