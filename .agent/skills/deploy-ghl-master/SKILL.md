name: deploy-ghl-master
description: Despliega aplicaciones web en Vercel optimizadas para GoHighLevel. Configura automáticamente CORS, CSP headers para iframes y genera el código de incrustación (Embed Code) responsivo.

# Deploy GHL Master

Esta habilidad actúa como un Ingeniero de DevOps especializado en integraciones SaaS. Su función es tomar una aplicación Next.js/React local y llevarla a producción en Vercel, asegurando que sea compatible con la incrustación en iframes de GoHighLevel.

## Capacidades

1.  **Auditoría de Configuración**: Verifica `next.config.js` y `vercel.json`.
2.  **Inyección de Seguridad**: Configura `frame-ancestors` para permitir que GHL cargue la app.
3.  **Despliegue Autónomo**: Ejecuta `vercel --prod` gestionando la interacción no interactiva.
4.  **Generación de Entregable**: Produce el código HTML exacto para el elemento "Custom HTML" de GHL.

## Instrucciones para el Agente

### Paso 1: Verificación de Pre-requisitos
1.  Comprueba si existe el archivo `next.config.js` o `next.config.mjs`.
2.  Comprueba si el usuario ha iniciado sesión en Vercel (`vercel whoami`). Si no, solicita el login.

### Paso 2: Configuración de Headers (CSP)
EJECUTA el script `scripts/inject_csp.py`. Este script debe:
*   Leer la configuración de Next.js.
*   Inyectar las cabeceras `Content-Security-Policy` permitiendo: `https://app.gohighlevel.com`, `https://*.gohighlevel.com`, `https://*.leadconnectorhq.com`.
*   Asegurar que `x-frame-options` no esté bloqueando el iframe.

### Paso 3: Despliegue en Vercel
1.  EJECUTA el comando de despliegue: `vercel deploy --prod --yes`.
2.  CAPTURA la URL de salida. IMPORTANTE: Vercel puede devolver múltiples líneas. Debes extraer la URL que termina en `.vercel.app`.

### Paso 4: Generación de Snippet GHL
Con la URL obtenida, genera el siguiente bloque de código y preséntalo al usuario:

```html
<script>
  window.addEventListener('message', function(event) {
    if(event.data.type === 'setHeight') {
      var iframe = document.getElementById('ghl-iframe');
      if(iframe) iframe.style.height = event.data.height + 'px';
    }
  });
</script>
<iframe 
  id="ghl-iframe"
  src="[INSERT_VERCEL_URL_HERE]" 
  style="width: 100%; border: none; min-height: 100vh;"
  scrolling="no"
></iframe>
```

## Scripts
Esta skill depende de `scripts/inject_csp.py` para la manipulación segura de archivos de configuración.
