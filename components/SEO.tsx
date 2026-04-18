import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://sanarte.app';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;
const SITE_NAME = 'SanArte';

interface SEOProps {
  title: string;
  description: string;
  /** Canonical URL path, e.g. "/search" or "/community". Defaults to window.location.pathname */
  path?: string;
  /** Full URL for og:image. Defaults to default OG image */
  image?: string;
  /** Schema.org JSON-LD object. Renders as <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown>;
  /** noindex for private/logged-in pages */
  noIndex?: boolean;
}

/**
 * Dynamic per-route SEO component using react-helmet-async.
 *
 * Usage:
 *   <SEO
 *     title="Buscar Síntomas — SanArte"
 *     description="Descubrí el mensaje emocional de tus síntomas."
 *     path="/search"
 *   />
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  jsonLd,
  noIndex = false,
}) => {
  const canonicalUrl = `${BASE_URL}${path || (typeof window !== 'undefined' ? window.location.pathname : '')}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={image} />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="es_AR" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

// ── Preset SEO configs per route ─────────────────────────────────────────────

export const SEO_PRESETS = {
  landing: {
    title: 'SanArte — Bienestar Holístico y Autosanación',
    description: 'Descubrí el mensaje emocional detrás de tus síntomas. Biodescodificación + IA + Remedios Naturales. Empieza gratis.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'SanArte',
      url: BASE_URL,
      description: 'Descubrí el mensaje emocional detrás de tus síntomas con biodescodificación asistida por IA.',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, Android',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Plan gratuito con acceso básico. Planes premium desde $3/mes.'
      },
      author: { '@type': 'Organization', name: 'SanArte' }
    }
  },

  search: {
    title: 'Buscar Síntomas — SanArte',
    description: 'Explorá más de 500 síntomas y su mensaje emocional. Biodescodificación con IA, remedios naturales y guías de sanación.',
    path: '/search',
    noIndex: false,
  },

  community: {
    title: 'Comunidad de Sanación — SanArte',
    description: 'Compartí intenciones de sanación, conectá con miles de personas en su camino de bienestar holístico.',
    path: '/community',
    noIndex: false,
  },

  upgrade: {
    title: 'SanArte Premium — Eleva tu Vibración',
    description: 'Desbloqueá búsquedas ilimitadas, meditaciones guiadas con voz IA, guía de arcángeles y más. Probá 7 días gratis.',
    path: '/upgrade',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'SanArte Premium — Sanador',
      description: 'Membresía premium de SanArte con acceso ilimitado a todas las funciones.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Mensual',
          price: '3.00',
          priceCurrency: 'USD',
          billingIncrement: 'P1M',
        },
        {
          '@type': 'Offer',
          name: 'Anual',
          price: '30.00',
          priceCurrency: 'USD',
          billingIncrement: 'P1Y',
        }
      ]
    }
  },

  journal: {
    title: 'Diario de Síntomas — SanArte',
    description: 'Registrá y seguí el historial de tus síntomas. Identificá patrones emocionales en tu camino de autosanación.',
    path: '/journal',
    noIndex: true, // private user data
  },

  profile: {
    title: 'Mi Perfil — SanArte',
    description: 'Tu perfil de sanación: logros, racha, insignias y configuración de cuenta.',
    path: '/profile',
    noIndex: true,
  },

  privacy: {
    title: 'Política de Privacidad — SanArte',
    description: 'Conocé cómo SanArte protege y maneja tus datos personales.',
    path: '/privacy',
  },

  terms: {
    title: 'Términos de Servicio — SanArte',
    description: 'Términos y condiciones de uso de la plataforma SanArte.',
    path: '/terms',
  },
} as const;
