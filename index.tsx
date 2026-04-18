import React from 'react';
import './index.css';
import './i18n'; // Initialize i18n before rendering
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import { initWebVitals } from './utils/webVitals';
import { migrateStorage } from './utils/storage';

// Migrate legacy localStorage keys to versioned format (idempotent)
migrateStorage();

// Activate axe-core accessibility auditor in development only
if (import.meta.env.DEV) {
  import('@axe-core/react').then(({ default: axe }) => {
    axe(React, ReactDOM, 1000);
  }).catch(() => {/* optional dep, ignore in test env */});
}

// Initialize Sentry for error tracking (production only)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
  });
}

// Initialize Core Web Vitals reporting
initWebVitals();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);