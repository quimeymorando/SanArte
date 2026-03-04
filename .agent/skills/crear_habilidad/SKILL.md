---
name: crear_habilidad
description: Habilidad para crear nuevas habilidades (skills) en el directorio de habilidades del usuario. Sigue la estructura estándar requerida.
---

# Instrucciones

Esta habilidad te permite crear nuevas habilidades (skills) para Antigravity de manera estandarizada y en español. Sigue estos pasos:

1.  **Obtener Requisitos**:
    *   Si el usuario no ha proporcionado el nombre de la habilidad, pregúntaselo. El nombre debe ser corto, descriptivo y compatible con nombres de carpetas (sin espacios, preferiblemente `snake_case` o `kebab-case`).
    *   Si el usuario no ha proporcionado una descripción, pregúntasela.

2.  **Definir Rutas**:
    *   Directorio Base: `/Users/coralinamilani/Desktop/PROYECTOS ANTIGRAVITY/habilidades`
    *   Directorio de la Nueva Habilidad: `[Directorio Base]/[nombre_habilidad]`
    *   Archivo Principal: `[Directorio de la Nueva Habilidad]/SKILL.md`

3.  **Crear el Directorio**:
    *   Crea la carpeta de la nueva habilidad.

4.  **Generar SKILL.md**:
    *   Crea el archivo `SKILL.md` con el siguiente formato exacto:
        ```markdown
        ---
        name: [nombre_habilidad]
        description: [descripcion_habilidad]
        ---
        
        # Instrucciones
        
        [Escribe aquí las instrucciones detalladas paso a paso para la IA sobre cómo ejecutar esta habilidad.]
        ```

5.  **Carpetas Adicionales (Opcional)**:
    *   Si la habilidad requiere scripts o recursos, crea las carpetas `scripts/` o `resources/` según sea necesario.

6.  **Finalización**:
    *   Informa al usuario que la habilidad ha sido creada.
    *   Muestra la ruta completa del archivo `SKILL.md` creado.
