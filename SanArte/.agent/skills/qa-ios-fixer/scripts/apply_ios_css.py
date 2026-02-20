import os

def apply_fixes():
    css_file = 'app/globals.css'
    # Intenta encontrar el archivo CSS si no está en la ruta estándar
    if not os.path.exists(css_file):
        # Fallback simple para estructuras src/app
        if os.path.exists('src/app/globals.css'):
            css_file = 'src/app/globals.css'
        else:
            print(f"No se encontró globals.css en {css_file} ni en src/app/globals.css")
            # En un escenario real podríamos crearlo, pero mejor avisar
            return
        
    fix_content = """
/* --- ANTIGRAVITY IOS STABILITY PATCH START --- */

/* Previene el rebote de scroll que rompe la ilusión de app nativa en GHL */
html, body {
    overscroll-behavior-y: none;
    -webkit-overflow-scrolling: touch;
}

/* Hack maestro para evitar flickering en WebKit */
.fix-ios-flicker, [data-aos], .modal, .drawer {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform, opacity;
}

/* Corrección para imágenes que parpadean al redimensionar */
img {
    -webkit-transform: translateZ(0);
}

/* --- ANTIGRAVITY IOS STABILITY PATCH END --- */
"""
    
    print(f"Aplicando parches en {css_file}...")
    with open(css_file, 'a') as f:
        f.write(fix_content)
    print("Parches CSS de iOS aplicados exitosamente.")

if __name__ == "__main__":
    apply_fixes()
