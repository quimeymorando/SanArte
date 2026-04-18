import { onLCP, onINP, onCLS } from 'web-vitals';
import type { Metric } from 'web-vitals';

const reportMetric = (metric: Metric) => {
  // Report to Vercel Analytics if available
  if (typeof window !== 'undefined' && 'va' in window) {
    const va = (window as unknown as Record<string, unknown>).va as (event: string, data: Record<string, unknown>) => void;
    if (typeof va === 'function') {
      va('vitals', {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      });
    }
  }
};

export function initWebVitals() {
  onLCP(reportMetric);
  onINP(reportMetric);
  onCLS(reportMetric);
}
