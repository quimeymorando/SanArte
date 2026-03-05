# PROTOCOLO NUESTRO DE VALIDACION PRE-LANZAMIENTO

Archivo persistente para no perder contexto entre sesiones.

---

## MEMORIA VIVA DEL PROYECTO (ACTUALIZABLE)

- Proyecto: `SanArte`
- Stack actual: React + Vite + Supabase + Vercel + APIs serverless (`/api/*`)
- Estado de deploy: ultimo build en Vercel `READY` (problema de Root Directory resuelto)
- Estado de seguridad runtime: `npm run audit:prod` sin vulnerabilidades
- Estado IA: respuestas en profundidad mejoradas con metodologia `depth-v2` y cache en `symptom_cache`
- Pendiente critico de configuracion en produccion:
  - `ALLOWED_ORIGINS`
  - `VITE_LS_CHECKOUT_MONTHLY`
  - `VITE_LS_CHECKOUT_ANNUAL`
  - `VITE_LS_CHECKOUT_MECENAS`
  - `VITE_ADSENSE_SLOT_DASHBOARD_BANNER`

### Ultimos acuerdos implementados

1. Consentimiento de cookies para ads/analytics.
2. Exportacion de datos y eliminacion de cuenta desde perfil.
3. Endurecimiento de API Gemini y webhook de pagos.
4. Metodologia de profundidad emocional en respuestas de sintomas.
5. Cache para ahorro de tokens en sintomas repetidos.

---

## PROTOCOLO DEFINITIVO DE VALIDACION PRE-LANZAMIENTO

Para Proyectos Fullstack y Ecosistemas de IA

Tu checklist de elite para asegurar que cada proyecto esta blindado a nivel de seguridad, rendimiento, experiencia de usuario (UX) y comportamiento del modelo antes de llegar a manos del cliente.

Basado en el framework original de Victor Perez (MonetizIA Masters), expandido para Top-Tier Fullstack y AI Apps.

### Instrucciones de uso (prompt para la IA)

Copia este documento completo y pegalo en una conversacion limpia con tu LLM de preferencia (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro) junto con la documentacion, codigo o descripcion tecnica de tu proyecto.

Rol del asistente:

Actua como un Staff Engineer y Director de Producto. Tu trabajo es recorrer cada apartado de forma conversacional conmigo. Hazme preguntas concretas sobre mi proyecto, senala los puntos debiles criticos, exige buenas practicas de desarrollo moderno y ofreceme soluciones accionables.

Semaforo de prioridad:

- `[ROJO]` Bloqueante. Vulnerabilidad critica o fallo severo. Hay que resolverlo antes de entregar.
- `[AMAR]` Importante. Deuda tecnica o mejora de UX que no bloquea, pero debe planificarse.
- `[OK]` Conforme. Cumple los estandares top-tier. No requiere accion.

Regla de oro: no asumas nada. Si no te doy informacion sobre un punto, preguntame como lo he resuelto.

---

## APARTADO A: RADIOGRAFIA DEL PROYECTO

- Cual es el proposito central de la aplicacion y que metrica define su exito?
- Que stack tecnico se ha usado? (Frontend, Backend, BBDD, ORM, Hosting/Cloud).
- Que modelos de IA, servicios cognitivos o APIs de terceros consume el sistema?
- Quien interactuara con el producto? (B2B, B2C, uso interno, publico masivo).
- Que categoria de datos maneja? (PII, financieros, clinicos, operativos, secretos industriales).
- Implementa algun mecanismo de autenticacion? Cual? (OAuth 2.0, JWT, Magic Links, Passkeys).
- Intervienen pasarelas de pago (Stripe/PayPal), suscripciones o datos financieros sensibles?

## APARTADO B: SALUD DEL ECOSISTEMA DE PAQUETES

### B.1 Deteccion de fallos de seguridad (CVEs)

Comandos a ejecutar:

- `npm audit`
- `yarn audit`
- `pip-audit`
- `cargo audit`

Checks:

- `[OK]` Vulnerabilidades criticas o altas mitigadas o justificadas.
- `[OK]` Evaluacion de si el fallo es aprovechable en el contexto real de esta app.

### B.2 Obsolescencia y mantenibilidad

Comandos a ejecutar:

- `npm outdated`
- `pip list-outdated`

Checks:

- `[AMAR]` Cero paquetes clave con mas de 2 versiones mayores de retraso.
- `[OK]` Las dependencias core (React, Next.js, FastAPI, LangChain, etc.) tienen comunidades activas y mantenimiento continuo.

### B.3 Revision de licencias comerciales

- `[AMAR]` Cero licencias restrictivas (GPL, AGPL) en dependencias si el codigo sera propietario/privado comercial.

## APARTADO C: BLINDAJE DE SEGURIDAD

### C.1 Identidad y permisos

- `[ROJO]` Contraseñas hasheadas con algoritmos robustos (Argon2id, bcrypt). MD5/SHA-1 prohibidos.
- `[OK]` Rate limiting estricto en login y recuperacion de contraseña.
- `[OK]` Tokens con expiracion corta y estrategia de refresh tokens.
- `[OK]` RBAC validado en servidor (no solo ocultar botones).

### C.2 Saneamiento de entrada

- `[ROJO]` Archivos e imagenes para IA limitados por peso, resolucion, MIME, y sanitizados (EXIF removido) antes de salir a APIs externas.
- `[OK]` Validacion de esquemas en backend (Zod/Joi/Pydantic).
- `[OK]` Consultas 100% parametrizadas u ORM robusto (anti-SQLi).
- `[OK]` Proteccion anti-XSS en frontend.

### C.3 Entorno operativo y custodia

- `[ROJO]` Cero secretos/API keys/URIs sensibles expuestas en codigo o repos.
- `[OK]` Secretos inyectados por gestores (AWS Secrets, Doppler, Infisical).
- `[OK]` TLS/HTTPS forzado.
- `[OK]` BBDD en red privada (VPC), no expuesta publicamente.

## APARTADO D: COMPORTAMIENTO Y SEGURIDAD DE LA IA

### D.1 Resiliencia del prompt y modelo

- `[ROJO]` Prevencion de prompt injection/jailbreaking en pipeline de entrada.
- `[OK]` Validacion estructural y fallback elegante ante JSON roto/alucinaciones.
- `[OK]` Gestion de contexto (token limits, truncado/resumen) para no disparar costos.

### D.2 Experiencia IA

- `[OK]` Streaming de texto en respuestas largas.
- `[OK]` Limites de costo y cuota por usuario para evitar abuse/factura sorpresa.

## APARTADO E: UX Y ESTETICA UI

### E.1 Diseno top-tier

- `[OK]` Design system consistente (tipografia, espaciado, paleta).
- `[OK]` Dark/light mode con contraste correcto.
- `[OK]` Microinteracciones fluidas (hover/focus/transiciones 60fps).

### E.2 Rendimiento percibido

- `[ROJO]` Mobile-first real: tap targets minimos 44x44, sin scroll horizontal indeseado.
- `[OK]` Estados de carga con skeleton/spinner elegante.
- `[OK]` Prevencion de CLS reservando espacio en imagenes/componentes async.

## APARTADO F: VELOCIDAD, CAPACIDAD Y RESILIENCIA

### F.1 Performance core

- `[ROJO]` Vista principal < 2.5 segundos (Core Web Vitals).
- `[OK]` N+1 en BBDD resuelto.
- `[OK]` Assets comprimidos por CDN (Brotli/Gzip).

### F.2 Resiliencia a fallos

- `[OK]` Fallback/circuit breaker si IA o proveedor de pagos cae.
- `[OK]` Errores amigables sin exponer stack traces.
- `[OK]` Degradacion elegante ante perdida de internet.

## APARTADO G: SEO, ANALITICA Y CONVERSION

### G.1 Visibilidad

- `[OK]` Meta tags dinamicos (`title`, `description`).
- `[OK]` Open Graph y Twitter Cards configurados.
- `[OK]` SEO tecnico para bots (SSR/SSG si aplica, `sitemap.xml`, `robots.txt`).

### G.2 Tracking estrategico

- `[OK]` Analitica no bloqueante (GA/Plausible/PostHog/Mixpanel).
- `[OK]` Eventos de conversion clave (signup, compra, upgrade, uso feature core).

## APARTADO H: NORMATIVA Y LEGALIDAD

- `[ROJO]` Privacidad de prompts explicita en terminos, con control del usuario.
- `[OK]` GDPR/CCPA: banner cookies, politicas visibles, borrar cuenta e historial.
- `[OK]` Accesibilidad basica (teclado, ARIA, contraste).

## APARTADO I: OPERACIONES Y ENTREGA

### I.1 Despliegue y monitoreo

- `[OK]` CI/CD en cada push a `main` con build/lint/deploy.
- `[OK]` Monitoreo de errores en frontend/backend (Sentry/Datadog/etc.).
- `[OK]` Backups diarios de BBDD con retencion definida.

### I.2 Kit de entrega cliente

- `[OK]` Codigo limpio sin debug sobrante en produccion.
- `[OK]` README completo para levantar local.
- `[OK]` `.env.example` documentado sin valores reales.
- `[OK]` Traspaso seguro de facturacion, dominios, licencias y credenciales.

---

## VEREDICTO DEL ASISTENTE (PLANTILLA)

Al terminar la revision, devolver este formato:

```
🏆 INFORME DE VALIDACION PRE-LANZAMIENTO FULLSTACK
Proyecto: [Nombre] | Fecha: [DD/MM/AAAA]

ESTADO GLOBAL: 🟢 LISTO | 🟡 LISTO CON RESERVAS | 🔴 NO LISTO

🚨 [ROJO] Bloqueantes (Zero-Day): ...
⚡ [AMAR] Deuda Tecnica y Mejoras UI/UX: ...
🤖 Diagnostico de la capa de IA: ...
🚀 Performance y SEO: ...
🔮 Backlog Futuro: Recomendaciones para la v2.0
```

---

## BITACORA RAPIDA DE SESIONES (EDITAR EN CADA CIERRE)

- Fecha:
- Cambios realizados:
- Bloqueantes abiertos:
- Variables/infra pendientes:
- Proximo paso recomendado:
