import os
import re

def inject_csp():
    config_path = 'next.config.js'
    # Plantilla robusta que reemplaza o crea el archivo con la configuración CSP correcta para GHL
    csp_config = """
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuración vital para GHL
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://app.gohighlevel.com https://*.gohighlevel.com https://*.leadconnectorhq.com;",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
"""
    print(f"Inyectando configuración CSP en {config_path}...")
    with open(config_path, 'w') as f:
        f.write(csp_config)
    print("Configuración CSP aplicada correctamente.")

if __name__ == "__main__":
    inject_csp()
