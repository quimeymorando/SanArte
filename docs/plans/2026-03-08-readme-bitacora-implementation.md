# README Bitacora Operativa Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ejecutar el barrido del protocolo pre-lanzamiento y consolidar una bitacora operativa completa en `README.md` para continuidad total entre sesiones.

**Architecture:** Se mantiene `README.md` como fuente unica: primero se documenta el estado actual validado por comandos y revision de codigo, luego se agrega una bitacora viva con plantilla de actualizacion obligatoria. El flujo prioriza evidencia verificable, semaforo de riesgos y pasos siguientes accionables.

**Tech Stack:** Markdown, Node.js/npm CLI, Vite, Git, Supabase/Vercel config files.

---

### Task 1: Levantar evidencia tecnica del barrido

**Files:**
- Modify: `README.md`
- Reference: `PROTOCOLO_NUESTRO_PRELANZAMIENTO.md`

**Step 1: Ejecutar checks de seguridad/dependencias**

Run: `npm run audit:prod && npm audit && npm outdated`
Expected: resultados de vulnerabilidades y paquetes desactualizados.

**Step 2: Ejecutar checks de salud del proyecto**

Run: `npm run doctor && npm run typecheck && npm run build`
Expected: doctor reporta env requerida/opcional, typecheck limpio y build exitoso.

**Step 3: Extraer hechos tecnicos del codigo**

Leer endpoints `api/*.js`, consentimiento y auth para completar apartados C, D, H, I.

**Step 4: Registrar hallazgos con semaforo**

Clasificar cada hallazgo como `[ROJO]`, `[AMAR]` o `[OK]` con evidencia breve.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add prelaunch sweep and persistent operational log"
```

### Task 2: Redisenar README como bitacora persistente

**Files:**
- Modify: `README.md`

**Step 1: Crear seccion de bitacora operativa**

Agregar bloques: Estado global, bloqueantes, pendientes de infra y proximo paso.

**Step 2: Incluir barrido por apartados A-I**

Transformar protocolo en una matriz resumida con estado + evidencia + accion.

**Step 3: Definir regla de actualizacion obligatoria**

Agregar politica explicita: cada cambio de codigo o infra debe reflejarse en README antes de cerrar sesion.

**Step 4: Agregar plantilla de entrada por sesion**

Incluir formato reutilizable para futuras actualizaciones con timestamp y checklist.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: establish persistent session log workflow in readme"
```

### Task 3: Verificacion final de continuidad entre sesiones

**Files:**
- Modify: `README.md`

**Step 1: Validar completitud minima**

Confirmar presencia de fecha, estado global, bloqueantes, pendientes y siguiente accion.

**Step 2: Validar legibilidad operativa**

Verificar que cualquier persona pueda retomar trabajo sin contexto de chat.

**Step 3: Ejecutar chequeo de diff**

Run: `git diff -- README.md`
Expected: cambios solo documentales, sin ruido tecnico ajeno.

**Step 4: Confirmar estado git**

Run: `git status --short --branch`
Expected: rama visible y archivos esperados modificados.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: complete operational handoff log for terminal restarts"
```
