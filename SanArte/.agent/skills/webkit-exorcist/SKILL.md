---
name: webkit-exorcist
description: Skill de emergencia para eliminar parpadeos (flickering), flashes blancos y glitches de renderizado en dispositivos Apple (iOS, iPadOS, macOS Safari). Se activa cuando el usuario menciona 'parpadeo', 'flicker', 'iPhone' o 'Safari'.
---

# The WebKit Exorcist: iOS Stability Enforcer

## Diagnóstico
El parpadeo en Safari/iOS suele ocurrir por 3 causas que DEBES corregir agresivamente:

1. **Hydration Mismatch**: Safari detecta números de teléfono/emails e inyecta enlaces `<a>` antes de que React cargue, causando un re-render flash.
2. **Layer Squashing**: La GPU intenta aplanar capas animadas para ahorrar memoria.
3. **Backdrop Filter Glitch**: El uso de `backdrop-filter: blur` sin aislamiento de capa.

## Protocolo de Ejecución (Paso a Paso)

### FASE 1: La Vacuna de Hidratación (Meta Tags)
Busca el archivo de layout principal (`layout.tsx`, `_document.js` o `index.html`) e INYECTA inmediatamente esta etiqueta en el `<head>`. Esto es NO NEGOCIABLE:

```html
<meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
```
Explicación: Esto impide que Safari rompa el DOM al intentar auto-detectar datos.

### FASE 2: Forzado de Aceleración de Hardware (CSS Hacks)
Crea o actualiza tu archivo CSS global (`globals.css` o equivalente) añadiendo esta clase de utilidad "fuerza bruta" y aplícala a los contenedores principales (`main`, `section`, `div` con animaciones):

```css
/* HACK: Forzar capa GPU en WebKit para evitar flickering */
.ios-stabilize, main, section, [data-motion="true"] {
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  /* Evita el parpadeo en scroll inercial */
  -webkit-overflow-scrolling: touch;
}
```

### FASE 3: Aislamiento de Cristal (Glassmorphism Fix)
Escanea el código en busca de `backdrop-filter` o `backdrop-blur`. Si lo encuentras, DEBES añadir la propiedad de aislamiento al mismo elemento para evitar que Safari se confunda al repintar:

```css
.elemento-con-blur {
  /*...tus filtros... */
  isolation: isolate; /* OBLIGATORIO PARA SAFARI */
  transform: translateZ(0); /* OBLIGATORIO PARA SAFARI */
}
```

### FASE 4: Auditoría de Animaciones
Revisa las animaciones de entrada (Framer Motion o CSS):

- Si usas `opacity: 0` a `1`, asegura que el elemento tenga `will-change: opacity, transform;`.
- **PROHIBIDO**: Usar `transition: all`. Cámbialo por propiedades específicas (ej. `transition: opacity 0.3s, transform 0.3s`). `all` sobrecarga la CPU en iPhones.

## Instrucción Final
Una vez aplicados los cambios, informa al usuario: "He blindado el renderizado para WebKit. He desactivado la detección de formatos automática y forzado la composición GPU en las capas animadas."
