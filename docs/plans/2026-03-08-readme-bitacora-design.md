# Diseno: barrido de protocolo + bitacora persistente en README

**Fecha:** 2026-03-08
**Proyecto:** SanArte
**Objetivo:** Tener un barrido operativo completo del protocolo pre-lanzamiento y una bitacora viva en `README.md` que mantenga contexto al reabrir terminal.

---

## 1) Arquitectura de la solucion

Se usa `README.md` como fuente unica de verdad operativa. El contenido se organiza en dos capas:

1. **Estado actual verificable** (snapshot): resultado del barrido del protocolo con semaforo `[ROJO]/[AMAR]/[OK]` y evidencia tecnica.
2. **Bitacora viva por sesiones**: entradas cronologicas para capturar cambios, bloqueantes y proximo paso.

Esto evita depender de memoria de conversacion y permite retomar trabajo con contexto completo desde un solo archivo.

## 2) Componentes del README bitacora

- **Regla operativa obligatoria:** cada cambio tecnico exige actualizar la bitacora en el mismo flujo.
- **Ultimo barrido (resumen ejecutivo):** estado global y top bloqueantes.
- **Matriz por apartados A-I del protocolo:** evaluacion corta por seccion, evidencia y accion.
- **Pendientes de infraestructura/variables:** lista concreta y verificable.
- **Checklist de cierre de sesion:** control para no perder contexto.
- **Plantilla de nueva entrada de bitacora:** formato fijo para futuras sesiones.

## 3) Flujo de actualizacion

1. Ejecutar o revisar checks tecnicos relevantes.
2. Actualizar estado global y semaforo.
3. Registrar cambios del dia (que se hizo, que falta, que bloquea).
4. Definir siguiente paso accionable (una accion concreta).

## 4) Manejo de calidad y errores

- Si falta evidencia para un punto del protocolo, marcar como `Pendiente de evidencia` (no asumir cumplimiento).
- Si un comando falla, registrar error real y accion de mitigacion.
- Mantener tono operativo: hechos, evidencia y acciones; no texto narrativo ambiguo.

## 5) Verificacion minima

Antes de cerrar sesion, verificar que `README.md` incluya:

- fecha/hora del ultimo barrido,
- estado global,
- bloqueantes activos,
- pendientes de variables/infra,
- proximo paso.

Con esto, cualquier nueva sesion puede continuar sin perdida de contexto.
