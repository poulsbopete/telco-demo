import { AlertTriangle, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-danger', icon: ShieldAlert },
  high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', icon: AlertTriangle },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-warning', icon: Shield },
  low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-elastic-blue', icon: ShieldCheck },
};

export function AlertFeed({ alerts, onSelect, selectedId }) {
  return (
    <div className="space-y-2 max-h-[420px] overflow-y-auto">
      {alerts.map(alert => {
        const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium;
        const Icon = style.icon;
        const isSelected = selectedId === alert.id;

        return (
          <button
            key={alert.id}
            type="button"
            onClick={() => onSelect?.(alert)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${style.bg} ${style.border} ${
              isSelected ? 'ring-2 ring-elastic-teal shadow-md' : 'hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-2">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.text}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-elastic-dark truncate">
                    {alert.rule_name || alert.threat_type || alert.title}
                  </span>
                  <span className={`text-xs font-bold ${style.text}`}>
                    {alert.risk_score || alert.score}
                  </span>
                </div>
                <p className="text-xs text-elastic-gray mt-0.5 truncate">
                  {alert.threat_type && alert.rule_name ? `${alert.threat_type} · ` : ''}
                  {alert['user.name']} · {alert['source.ip']} · {alert['host.name']}
                </p>
                {alert.labels?.pci || alert['labels.pci'] ? (
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-telco-magenta text-white px-1.5 py-0.5 rounded">
                    PCI
                  </span>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default AlertFeed;
