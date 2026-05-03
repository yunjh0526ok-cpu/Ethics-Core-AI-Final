import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, RefreshCw, Users } from 'lucide-react';

const POLL_MS = 5 * 60 * 1000;

/**
 * @typedef {{ appId: string; label: string; users: number; activeUsers: number; errorRate: number }} AppMetric
 * @typedef {{ demo?: boolean; fallback?: boolean; error?: string; apps: AppMetric[]; updatedAt: string }} MetricsPayload
 */

export default function Dashboard() {
  /** @type {[MetricsPayload | null, React.Dispatch<React.SetStateAction<MetricsPayload | null>>]} */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(/** @type {string | null} */ (null));
  const [lastFetch, setLastFetch] = useState(/** @type {Date | null} */ (null));

  const load = useCallback(async () => {
    setErr(null);
    try {
      const r = await fetch('/api/metrics', { credentials: 'same-origin' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      /** @type {MetricsPayload} */
      const j = await r.json();
      setData(j);
      setLastFetch(new Date());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(t);
  }, [load]);

  const fmtPct = (x) => `${(x * 100).toFixed(2)}%`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-tight text-white md:text-3xl"
            style={{ fontFamily: "'Orbitron', system-ui, sans-serif" }}
          >
            Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Ethics Core AI · LexGuard · LogosWeb — users, actives, error rate (24h logs)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {data?.updatedAt && (
            <span className="text-xs text-slate-500">
              API: {new Date(data.updatedAt).toLocaleString()}
              {lastFetch ? ` · polled ${lastFetch.toLocaleTimeString()}` : ''}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {(data?.demo || data?.fallback) && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {data?.fallback && data?.error
            ? `MongoDB unavailable — showing demo zeros (${data.error})`
            : 'Demo mode: set MONGODB_URI for live counts.'}
        </div>
      )}

      {err && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {(data?.apps ?? []).map((row) => (
          <div
            key={row.appId}
            className="rounded-2xl border border-[#B89150]/25 bg-slate-900/60 p-5 shadow-[0_0_24px_rgba(0,0,0,0.35)] backdrop-blur"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B89150]/90">{row.label}</p>
            <p className="mt-2 truncate font-mono text-[11px] text-slate-500">{row.appId}</p>

            <div className="mt-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-semibold">Users</span>
                </div>
                <span className="text-2xl font-black tabular-nums text-white">{row.users}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold">Active (15m)</span>
                </div>
                <span className="text-2xl font-black tabular-nums text-emerald-200">{row.activeUsers}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold">Error rate (24h)</span>
                </div>
                <span className="text-2xl font-black tabular-nums text-amber-100">{fmtPct(row.errorRate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && !data && (
        <p className="mt-8 text-center text-sm text-slate-500">Loading metrics…</p>
      )}
    </div>
  );
}
