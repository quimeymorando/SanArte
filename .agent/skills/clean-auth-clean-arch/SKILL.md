---
name: clean-auth-clean-arch
description: Guía experta para implementar flujos de autenticación premium usando Clean Architecture (Philipp Lackner Standard) con diseño High-End.
---

# 💎 Clean Auth Guru: The High-End Standard

Esta habilidad es la fusión definitiva entre la **Arquitectura Limpia de Philipp Lackner** y el **Diseño Web/App de Alta Gama**. Proporciona una guía estricta para flujos de autenticación desacoplados, seguros y visualmente impactantes.

## 🏗️ Arquitectura Core (Philipp Lackner Mantra)

### 1. Dominio (Domain Layer) - "El Corazón"
- **Entidades**: Objetos puros. No dependen de librerías.
- **Use Cases (Interactores)**: Una clase por acción. Obligatorio usar el operador `invoke`.
  - *Ejemplo*: `LoginUseCase.invoke(email, pass)`.
- **AuthResult/Resource**: Clase sellada (`Sealed Class`) para manejar estados: `Success`, `Error`, `Loading` y `Unauthorized`.
- **Repository Interface**: Define el contrato. El dominio no sabe si los datos vienen de Supabase, Firebase o Ktor.

### 2. Datos (Data Layer) - "La Implementación"
- **DTOs & Mappers**: Los DTOs mueren en el repositorio. Usa mappers para convertir a Entidades de Dominio.
- **Persistencia Segura**: Usa `DataStore` (Android) o `AsyncStorage` con cifrado para tokens JWT.
- **Configuración de Cliente**: Activar `autoRefreshToken` y `persistSession`.

### 3. Presentación (Presentation Layer) - "La Experiencia"
- **ViewModel**: Expone un único `StateFlow` (UI State). Nunca inyectes el repositorio, solo Use Cases.
- **Validación Real-time**: Usa **Zod** o validadores nativos antes de enviar la petición.
- **UX**: Manejo proactivo de estados de carga y errores amigables.

## 🎨 Diseño de Alta Gama (UI/UX)
- **Visuales**: Layout split-screen, efectos de **Glassmorphism** y activos en formato SVG/WebP.
- **Animaciones (GSAP/Compose)**: Implementa efectos de "stagger" y transiciones "snappy" (0.2s - 0.4s).
- **Interacción**: Botones con efecto "shimmer", bordes animados y feedback táctil (44x44 min tap target).

## 🛠️ Tooling & Gobernanza
- **Inyección de Dependencias**: Preferencia por **Koin** (por simplicidad y KMP) o **Hilt**.
- **Seguridad**: Gestionar secretos (API Keys) mediante `EAS Secrets` o variables de entorno protegidas.
- **Debugging**: Uso de DevTools para monitorear re-renderizados y tráfico de red.

---
## 📜 Reglas de Oro
1. **Un Use Case = Un Archivo**.
2. **Cero Excepciones en UI**: Captura todo en el Data Layer y mapea a `AuthResult.Error`.
3. **No filtración de DTOs**: La UI nunca debe conocer la estructura de la API.
4. **Wow-Factor Inicial**: La primera pantalla (Login) debe respirar lujo (animaciones suaves y limpieza visual).

> [!IMPORTANT]
> Esta Skill integra el conocimiento de los 7 Cuadernos de Estrategia, Diseño, Código e Integración.
