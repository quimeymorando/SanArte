name: qa-ios-fixer
description: Analiza y corrige automáticamente problemas de renderizado en WebKit (iOS/Safari), incluyendo parpadeos (flickering), errores de hidratación y problemas de z-index.

# QA iOS Fixer

Esta habilidad es un Ingeniero de Frontend especializado en el motor WebKit. Su objetivo es eliminar el "Flickering" y asegurar una experiencia nativa en dispositivos Apple.

## Patologías que Corrige

1.  **Flickering en Scroll/Animación**: Falta de promoción a capa de composición.
2.  **Hydration Mismatch**: Interferencia de detección de teléfonos en Safari.
3.  **Backdrop Filter Glitch**: Errores de renderizado en iOS 17+.

## Instrucciones para el Agente

### Paso 1: Inyección de Metadatos de Hidratación
1.  Analiza `app/layout.tsx` o `pages/_document.js`.
2.  Asegura la presencia de: `<meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />`.
3.  Si no existe, inyéctala en el `<head>`. Esto previene que Safari modifique el DOM antes de que React se hidrate, eliminando el flash inicial.

### Paso 2: Aplicación de Hacks de Aceleración (CSS)
EJECUTA `scripts/apply_ios_css.py`.
Este script debe añadir al CSS global (`globals.css`) las siguientes clases y reglas:
*   Regla universal de `overscroll-behavior-y: none` para prevenir el rebote elástico en iframes.
*   Clase `.ios-gpu-fix` con `transform: translateZ(0); backface-visibility: hidden;`.
*   Aplicar preventivamente estos estilos a selectores comunes de animaciones (modales, drawers, sliders).

### Paso 3: Inyección del Cliente Iframe-Resizer
1.  Verifica si el script `iframeResizer.contentWindow.min.js` está cargado.
2.  Si no, descárgalo en `public/scripts/` e impórtalo en el Layout principal mediante un componente `<Script>` de Next.js con estrategia `beforeInteractive` o `afterInteractive`.

### Paso 4: Verificación (Simulada)
Revisa el código en busca de `backdrop-filter`. Si se encuentra, sugiere al usuario o aplica automáticamente un fallback para navegadores antiguos o contenedores aislados (`isolation: isolate`).

## Scripts
Esta skill utiliza `scripts/apply_ios_css.py` para modificaciones de estilo quirúrgicas.
