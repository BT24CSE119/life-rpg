import React, { useState, useEffect } from 'react';
import { healthCheck } from '../services/api';
import type { HealthData } from '../types';

type Status = 'checking' | 'connected' | 'degraded' | 'offline';

const STATUS_CONFIG: Record<Status, { label: string; dot: string; bg: string; border: string }> = {
  checking:  { label: 'Connecting..', dot: '#F5C842', bg: 'rgba(245,200,66,0.08)',  border: 'rgba(245,200,66,0.3)'  },
  connected: { label: 'API Online',   dot: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)' },
  degraded:  { label: 'DB Offline',   dot: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)'  },
  offline:   { label: 'API Offline',  dot: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.3)'  },
};

const HealthStatus: React.FC = () => {
  const [status, setStatus] = useState<Status>('checking');
  const [data, setData] = useState<HealthData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await healthCheck();
        setData(res.data);
        if (res.data.database.status === 'connected') {
          setStatus('connected');
        } else {
          setStatus('degraded');
        }
      } catch {
        setStatus('offline');
      }
    };

    check();
    // Recheck every 30 seconds
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  const cfg = STATUS_CONFIG[status];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-200 hover:brightness-110"
        style={{ background: cfg.bg, borderColor: cfg.border, color: '#94A3B8' }}
        aria-label={`Backend status: ${cfg.label}. Click for details.`}
        aria-expanded={expanded}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: cfg.dot,
            boxShadow: `0 0 6px ${cfg.dot}`,
            animation: status === 'checking' ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }}
          aria-hidden="true"
        />
        {cfg.label}
      </button>

      {/* Expanded details */}
      {expanded && data && (
        <div
          className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-rpg text-xs font-mono border"
          style={{ background: '#13162A', borderColor: '#2D3560', color: '#94A3B8' }}
          role="tooltip"
        >
          <div className="text-rpg-gold font-semibold mb-2">API Health</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Environment</span>
              <span className="text-rpg-text">{data.environment}</span>
            </div>
            <div className="flex justify-between">
              <span>Response</span>
              <span className="text-rpg-emerald">{data.responseTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Database</span>
              <span style={{ color: data.database.status === 'connected' ? '#10B981' : '#EF4444' }}>
                {data.database.status}
              </span>
            </div>
            {data.database.error && (
              <div className="mt-2 text-rpg-danger text-[10px] break-all">
                {data.database.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthStatus;
