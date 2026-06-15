import { ExternalLink } from 'lucide-react';
import { kibanaDiscoverUrl, kibanaSecurityUrl, elasticWorkflowUrl } from '../../lib/elastic-api';

export function ModuleHeader({ title, subtitle, badge, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-elastic-dark">{title}</h2>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-elastic-teal/10 text-elastic-teal px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-elastic-gray mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

function resolveKibanaLink(kibanaUrl, section) {
  if (!kibanaUrl) return null;
  if (section === 'security' || section === 'alerts') return kibanaSecurityUrl(kibanaUrl, 'alerts');
  if (section === 'cases') return kibanaSecurityUrl(kibanaUrl, 'cases');
  if (section === 'rules') return kibanaSecurityUrl(kibanaUrl, 'rules');
  if (section === 'workflows') return elasticWorkflowUrl(kibanaUrl);
  return kibanaDiscoverUrl(kibanaUrl);
}

export function StatCard({ label, value, unit, trend, highlight, kibanaUrl, kibanaSection = 'discover' }) {
  const link = resolveKibanaLink(kibanaUrl, kibanaSection);
  return (
    <div className={`p-4 rounded-xl border relative ${highlight ? 'bg-elastic-teal/5 border-elastic-teal/30' : 'bg-white border-gray-200'}`}>
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="absolute top-3 right-3 text-elastic-gray hover:text-elastic-teal"
          title="Open in Kibana">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
      <p className="text-xs font-medium text-elastic-gray uppercase tracking-wide">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold mt-1 ${highlight ? 'text-elastic-teal' : 'text-elastic-dark'} animate-count`}>
        {value}
        {unit && <span className="text-sm font-normal text-elastic-gray ml-1">{unit}</span>}
      </p>
      {trend && <p className="text-xs text-elastic-gray mt-1">{trend}</p>}
    </div>
  );
}

export function DemoBanner() {
  return (
    <div className="bg-telco-magenta/5 border border-telco-magenta/20 rounded-lg px-4 py-2 text-xs text-telco-magenta">
      <strong>Sample Data:</strong> All customer profiles, metrics, and security events are synthetic demo data (@demo.elastic.co).
    </div>
  );
}

export default ModuleHeader;
