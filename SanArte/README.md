# Sanarte

Aplicacion React + Vite + Supabase para busqueda de sintomas, detalle guiado y funciones de comunidad.

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
- `SUPABASE_SERVICE_ROLE_KEY`
- `LEMON_SQUEEZY_WEBHOOK_SECRET`
- `GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Seguridad

- El upgrade premium ya no se concede desde cliente.
- Gemini se consume via endpoint backend (`/api/gemini`).
- Webhook usa verificacion HMAC de firma.
