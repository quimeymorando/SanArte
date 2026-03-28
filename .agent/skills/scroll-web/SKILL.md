# De vídeo a web premium animada por scroll

Transforma un archivo de vídeo en una experiencia web interactiva donde el **scroll controla la animación**.  
La clave es crear una **coreografía de animaciones variada**, donde diferentes tipos de movimiento trabajan juntos en lugar de repetir siempre el mismo efecto.

---

## Entrada

El usuario proporciona:
- Ruta a un archivo de vídeo (MP4, MOV, etc.)

Opcionalmente también puede indicar:
- Nombre de marca o temática
- Secciones de texto deseadas y dónde deben aparecer
- Preferencias de color
- Dirección visual o estilo de diseño

---

# Requisitos Premium (Obligatorios)

1. **Scroll suave con Lenis**
2. **Mínimo 4 tipos de animación**
3. **Revelado escalonado de contenido**
4. **Nada de tarjetas glassmorphism**
5. **Variedad de direcciones de entrada**
6. **Overlay oscuro para estadísticas** (opacidad 0.88 - 0.92)
7. **Texto horizontal gigante en movimiento** (12vw+)
8. **Contadores animados**
9. **Tipografía muy grande** (Hero: 12rem+)
10. **CTA persistente**
11. **Hero dominante + scroll amplio** (mín. 800vh)
12. **Texto siempre en los laterales** (40% exterior)
13. **Revelado circular del hero** (`clip-path: circle()`)
14. **Velocidad de frames 1.8–2.2**

---

# Flujo de procesamiento

Video (MP4) → FFMPEG → Secuencia de imágenes (WebP) → Canvas + lógica de scroll

---

# Flujo de trabajo

**FFmpeg y FFprobe ya están instalados en el sistema.**

### Paso 1: Analizar el vídeo
```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,r_frame_rate,nb_frames -of csv=p=0 "<VIDEO_PATH>"
```

### Paso 2: Extraer los frames
```bash
mkdir -p frames
ffmpeg -i "<VIDEO_PATH>" -vf "fps=<CALCULATED_FPS>,scale=<WIDTH>:-1" -c:v libwebp -quality 80 "frames/frame_%04d.webp"
```

### Paso 3: Estructura del proyecto
- index.html
- css/style.css
- js/app.js
- frames/

---

# Desarrollo Técnico

## JavaScript (app.js)
- Lenis para scroll suave.
- GSAP para animaciones.
- Precarga de frames en Canvas.
- Sincronización scroll/frame fuera del evento scroll (requestAnimationFrame).

## Animaciones (GSAP)
- `fade-up`, `slide-left`, `slide-right`, `scale-up`, `rotate-in`, `stagger-up`, `clip-reveal`.
