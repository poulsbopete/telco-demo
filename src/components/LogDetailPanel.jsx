import { ChevronRight, ExternalLink, Store, X } from 'lucide-react';
import { kibanaDiscoverLogUrl } from '../lib/elastic-api';

const LEVEL_STYLE = {
  ERROR: 'bg-danger/10 text-danger border-danger/20',
  Error: 'bg-danger/10 text-danger border-danger/20',
  WARN: 'bg-warning/10 text-warning border-warning/20',
  Warning: 'bg-warning/10 text-warning border-warning/20',
  INFO: 'bg-elastic-teal/10 text-elastic-teal border-elastic-teal/20',
};

function formatTimestamp(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export function LogDetailPanel({ log, kibanaUrl, onClose, onRegionClick }) {
  if (!log) return null;

  const discoverUrl = kibanaDiscoverLogUrl(kibanaUrl, log);
  const levelClass = LEVEL_STYLE[log.level] || 'bg-gray-100 text-elastic-gray border-gray-200';

  return (
    <div className="mt-4 bg-white rounded-xl border-2 border-elastic-teal/30 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 py-3 bg-elastic-teal/5 border-b border-elastic-teal/20">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelClass}`}>
              {log.level || 'LOG'}
            </span>
            <span className="text-sm font-semibold text-elastic-dark truncate">
              {log.telcoService || log.service || 'Unknown service'}
            </span>
          </div>
          <p className="text-[10px] text-elastic-gray mt-1">{formatTimestamp(log.timestamp)}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close log details"
          className="p-1 rounded hover:bg-white/80 text-elastic-gray shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-elastic-gray">regionID</p>
          <p className="font-mono text-telco-magenta mt-0.5">{log.regionId || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-elastic-gray">Region</p>
          <p className="text-elastic-dark mt-0.5">{log.regionName || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-elastic-gray">Host</p>
          <p className="font-mono text-elastic-dark mt-0.5">{log.host || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-elastic-gray">Trace ID</p>
          <p className="font-mono text-elastic-dark mt-0.5 break-all">{log.traceId || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-elastic-gray">Transaction</p>
          <p className="font-mono text-elastic-dark mt-0.5">{log.sessionId || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-elastic-gray">Service (raw)</p>
          <p className="font-mono text-elastic-dark mt-0.5">{log.service || '—'}</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-[10px] uppercase tracking-wide text-elastic-gray mb-1">Message</p>
        <pre className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-mono text-elastic-dark whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
          {log.message || '(no message body)'}
        </pre>
      </div>

      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {discoverUrl && (
          <a href={discoverUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-2 bg-elastic-teal text-white rounded-lg inline-flex items-center gap-1.5 hover:bg-elastic-teal/90">
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Discover
          </a>
        )}
        {log.regionId && onRegionClick && (
          <button type="button" onClick={() => onRegionClick(log.regionId)}
            className="text-xs px-3 py-2 border border-telco-magenta/30 text-telco-magenta rounded-lg inline-flex items-center gap-1.5 hover:bg-telco-magenta/5">
            <Store className="w-3.5 h-3.5" />
            View regions
          </button>
        )}
      </div>
    </div>
  );
}

export function LogRowButton({ log, onClick, className = '' }) {
  return (
    <button type="button" onClick={() => onClick(log)}
      className={`w-full text-left p-2 bg-gray-50 rounded text-[10px] font-mono hover:bg-elastic-teal/5 hover:border-elastic-teal/20 border border-transparent transition-colors group ${className}`}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-telco-magenta">{log.regionId}</span>
          {' · '}<span className="text-elastic-teal">{log.telcoService || log.service}</span>
          <p className="text-elastic-dark mt-0.5 line-clamp-2">{log.message || '(transaction event)'}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-elastic-gray group-hover:text-elastic-teal shrink-0 mt-0.5" />
      </div>
    </button>
  );
}

export default LogDetailPanel;
