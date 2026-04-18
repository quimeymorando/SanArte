import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AdminMetrics {
  timestamp: string;
  users: {
    total: number;
    premium: number;
    free: number;
    conversionRate: string;
    newLast7d: number;
    activeLast24h: number;
  };
  levels: Record<string, number>;
}

const StatCard = React.memo(function StatCard({
  label, value, sub, accent = 'cyan'
}: { label: string; value: string | number; sub?: string; accent?: 'cyan' | 'purple' | 'green' | 'amber' }) {
  const colors: Record<string, string> = {
    cyan:   'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
    green:  'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    amber:  'border-amber-500/20 bg-amber-500/5 text-amber-400',
  };
  return (
    <div className={`rounded-2xl border p-6 ${colors[accent]}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">{label}</p>
      <p className="text-4xl font-black text-white">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
});

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [secret, setSecret]     = useState('');
  const [authed, setAuthed]     = useState(false);

  // Gate: only admins can see this page
  useEffect(() => {
    authService.getUser().then(user => {
      if (!user || user.role !== 'admin') navigate('/home', { replace: true });
    });
  }, [navigate]);

  const fetchMetrics = useCallback(async (adminSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin-metrics', {
        headers: { 'x-admin-secret': adminSecret }
      });
      if (!res.ok) {
        setError(res.status === 403 ? 'Secreto inválido' : `Error ${res.status}`);
        return;
      }
      setMetrics(await res.json());
      setAuthed(true);
    } catch {
      setError('No se pudieron cargar las métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMetrics(secret);
  };

  // Secret entry screen
  if (!authed) {
    return (
      <main className="min-h-screen bg-[#050b0d] flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-black text-white text-center">Admin Dashboard</h1>
          <input
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="Admin secret"
            aria-label="Admin secret key"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
            required
          />
          {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black rounded-xl"
          >
            Acceder
          </button>
        </form>
      </main>
    );
  }

  const levelEntries = metrics ? Object.entries(metrics.levels).sort(([a], [b]) => Number(b) - Number(a)) : [];

  return (
    <main className="min-h-screen bg-[#050b0d] text-gray-200 py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
            {metrics && (
              <p className="text-xs text-gray-500 mt-1">
                Actualizado: {new Date(metrics.timestamp).toLocaleString('es-AR')}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchMetrics(secret)}
            aria-label="Refrescar métricas"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refrescar
          </button>
        </div>

        {loading && (
          <div role="status" aria-live="polite" className="text-center py-20 text-gray-500">
            <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
            <p className="mt-2">Cargando métricas…</p>
          </div>
        )}

        {error && !loading && (
          <p role="alert" className="text-red-400 text-center py-8">{error}</p>
        )}

        {metrics && !loading && (
          <>
            {/* User KPIs */}
            <section aria-labelledby="users-heading">
              <h2 id="users-heading" className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                Usuarios
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total"       value={metrics.users.total}         accent="cyan"   />
                <StatCard label="Premium"     value={metrics.users.premium}       sub={`${metrics.users.conversionRate} conversión`} accent="purple" />
                <StatCard label="Gratis"      value={metrics.users.free}          accent="cyan"   />
                <StatCard label="Nuevos 7d"   value={metrics.users.newLast7d}     accent="green"  />
                <StatCard label="Activos 24h" value={metrics.users.activeLast24h} accent="amber"  />
                <StatCard label="Conversión"  value={metrics.users.conversionRate} accent="purple" />
              </div>
            </section>

            {/* Level distribution */}
            {levelEntries.length > 0 && (
              <section aria-labelledby="levels-heading">
                <h2 id="levels-heading" className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Distribución de Niveles (muestra 100 usuarios)
                </h2>
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-3">
                  {levelEntries.slice(0, 10).map(([lvl, count]) => {
                    const max = Math.max(...levelEntries.map(([, c]) => c));
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={lvl} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-16 shrink-0">Nivel {lvl}</span>
                        <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Nivel ${lvl}: ${count} usuarios`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
