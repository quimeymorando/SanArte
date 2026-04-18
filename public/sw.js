/**
 * SanArte Service Worker
 *
 * Handles:
 * - Web Push notification display for re-engagement
 * - Notification click → open app at /home
 */

const APP_URL = self.location.origin;

// ── Push event ────────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = { title: '✨ SanArte', body: 'Retomá tu camino de sanación.', url: '/home' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/favicon.svg',
    tag: 'sanarte-reengagement',
    renotify: false,
    data: { url: data.url || '/home' },
    actions: [
      { action: 'open', title: '🌿 Abrir SanArte' },
      { action: 'dismiss', title: 'Ahora no' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification click ────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url
    ? `${APP_URL}${event.notification.data.url}`
    : `${APP_URL}/home`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if open
      for (const client of windowClients) {
        if (client.url.startsWith(APP_URL) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Install / activate (minimal — no asset caching) ──────────────────────────

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
