# Agency OS Launch Studio Design Blueprint

**Date:** 2026-03-13
**Product:** SanArte
**Direction approved:** Agency OS como launch studio premium

## Goal

Usar Agency OS para terminar SanArte con nivel de lanzamiento real: funcional, segura, visualmente hermosa, consistente en mobile/desktop y lista para publicarse sin dejar cabos sueltos.

## Why This Model

- **Agency OS dirige el trabajo, no la app publicada:** la agencia opera como sistema de trabajo para estrategia, direccion visual, implementacion, critica premium y QA final.
- **SanArte sigue siendo el producto real:** React + Vite + Supabase + Vercel + Gemini se mantienen como stack productivo; Agency OS no entra al runtime de produccion.
- **Menos contexto por fase:** se activa solo la skill necesaria para el momento actual en vez de arrastrar una mega-skill en cada iteracion.
- **Mejor cierre de lanzamiento:** el sistema obliga a separar discovery, build, premium critique y final QA para evitar cerrar algo que solo "funciona".

## Operating Boundaries

- Las skills maestras de Agency OS viven en el scope global de Antigravity.
- Este repo solo agrega la capa local necesaria para que Agency OS entienda SanArte y lo opere bien.
- Ningun archivo de la app publicada dependera de Agency OS para funcionar.
- La capa local debe ayudar a cerrar gaps ya visibles en `README.md`, no duplicar logica global innecesaria.

## System Architecture

### 1. Global Agency Layer

Agency OS y sus micro-skills globales siguen siendo la fuente principal de orquestacion. Se asume que ya existen roles como:

- `agency-os`
- `role-design-director`
- `role-frontend-builder`
- `role-qa-verifier`
- `role-solution-architect`

### 2. SanArte Workspace Layer

SanArte agrega conocimiento local del proyecto para que la agencia no improvise:

- `./.agent/skills/stack-sanarte-supabase/`
- `./.agent/skills/launch-sanarte/`
- `./.agents/rules/agency-os-governance.md`
- `./.agents/rules/sanarte-launch-standards.md`

Esta capa local debe capturar:

- stack real (`React + Vite + Supabase + Vercel + Gemini`)
- mapa de archivos y rutas criticas
- comandos de verificacion reales del repo
- criterios de calidad visual basados en `docs/plans/2026-03-08-sacred-noir-design.md`
- launch gates y backlog real de salida

### 3. Team Runtime Layer

`./.antigravity/team/` funciona como backend operativo local para Agency OS dentro de SanArte.

Debe incluir:

- `tasks.json` generado desde una plantilla versionada
- `events.jsonl`
- `broadcast.jsonl`
- `mailbox/`
- `leases/`
- `context/`
- `summaries/`
- `artifacts/`
- `registry/`

La version controlada debe guardar plantillas, estructura y documentacion. El estado vivo y efimero debe quedar aislado para no ensuciar git.

## Default Workflow For SanArte

Agency OS debe operar SanArte con este flujo por defecto:

1. `audit` - leer estado real, blockers y blueprint vigente.
2. `architecture` - decidir que area atacar y con que scope.
3. `design direction` - elevar criterio visual antes de implementar superficies premium.
4. `build` - ejecutar cambios concretos en codigo o contenido.
5. `premium critique` - detectar si la pieza aun parece demo, plantilla o version intermedia.
6. `refinement` - pulir solo lo necesario para pasar de correcta a premium.
7. `final QA` - verificar funcionalidad, responsive, claridad, SEO basico y launch readiness.

## Local Skills To Add

### `stack-sanarte-supabase`

Skill local de stack que ensena a Agency OS:

- donde viven pantallas, servicios, API serverless y contextos
- que comandos usar para `typecheck`, `build`, `doctor` y tests
- que areas son sensibles (`api/`, `supabaseClient.ts`, auth, privacidad, premium, IA)
- que gaps de lanzamiento siguen abiertos

### `launch-sanarte`

Skill local de cierre que convierte el backlog del README y del blueprint Sacred Noir en un workflow de lanzamiento:

- priorizacion por impacto de launch
- premium critique obligatoria en superficies clave
- launch checklist final
- handoff corto por iteracion

## Workspace Rules

### `agency-os-governance.md`

Reglas persistentes para:

- no cerrar tareas importantes sin QA independiente
- no salir del scope de paths permitidos
- compactar contexto cuando la salida ya fue aprobada
- usar la skill mas especifica posible

### `sanarte-launch-standards.md`

Reglas especificas del repo para:

- respetar `docs/plans/2026-03-08-sacred-noir-design.md`
- actualizar la bitacora en `README.md` al cerrar cambios tecnicos
- repetir verificaciones clave antes de declarar launch ready
- no bajar el criterio visual por apuro de publicacion

## Launch Backlog Inputs

La launch studio debe nacer con backlog real, no teorico. Los insumos iniciales son:

- blockers y riesgos ya documentados en `README.md`
- blueprint visual aprobado en `docs/plans/2026-03-08-sacred-noir-design.md`
- hardening pendiente de saneamiento EXIF
- SEO basico faltante (`robots.txt`, `sitemap.xml`)
- evidencia operativa pendiente para monitoreo y backups
- limpieza de secretos/config sensible, incluyendo revision de `.agent/mcp_config.json`

## Artifacts And Handoffs

Cada iteracion importante debe dejar un artifact corto y utilizable:

- resumen de tarea
- decisiones tomadas
- riesgos abiertos
- siguiente paso
- verificacion ejecutada

La agencia no debe arrastrar conversaciones largas cuando puede leer un resumen o artifact local.

## Validation Criteria

La integracion se considera correcta cuando:

- Agency OS puede operar SanArte usando skills locales de stack y launch.
- El repo tiene reglas claras para premium critique, QA y bitacora.
- Existe una base local de coordinacion reproducible sin acoplarla al runtime productivo.
- El backlog inicial de lanzamiento refleja blockers reales del proyecto.
- El flujo favorece una app funcional y visualmente refinada, no solo correcta.

## Out Of Scope

- Meter Agency OS dentro del bundle o runtime de produccion.
- Duplicar toda la agencia global dentro del repo.
- Resolver en esta fase todos los cambios visuales o de producto de SanArte.

## Delivery Scope (Design Phase)

1. Crear la capa local de Agency OS para SanArte.
2. Documentar reglas, skills locales y runtime operativo.
3. Sembrar el backlog inicial de lanzamiento.
4. Dejar listo el repo para ejecutar el cierre de SanArte con Agency OS como launch studio.
