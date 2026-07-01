import { ExternalLink } from 'lucide-react';
import {
  kibanaDiscoverUrl, kibanaSecurityUrl, elasticWorkflowUrl,
  kibanaSearchHomeUrl, kibanaSearchAppUrl, kibanaAgentBuilderUrl,
} from '../../lib/elastic-api';

export function ModuleHeader({ title, subtitle, badge, children }) {
  return (
    <header className="mb-10 md:mb-12">
      {badge && (
        <p className="section-eyebrow mb-2">{badge}</p>
      )}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="min-w-0">
          <h1 className="section-title">{title}</h1>
          {subtitle && <p className="section-lead mt-3">{subtitle}</p>}
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

function resolveKibanaLink(kibanaUrl, section) {
  if (!kibanaUrl) return null;
  if (section === 'security' || section === 'alerts') return kibanaSecurityUrl(kibanaUrl, 'alerts');
  if (section === 'cases') return kibanaSecurityUrl(kibanaUrl, 'cases');
  if (section === 'rules') return kibanaSecurityUrl(kibanaUrl, 'rules');
  if (section === 'entity-analytics') return kibanaSecurityUrl(kibanaUrl, 'entityAnalytics');
  if (section === 'attack-discovery') return kibanaSecurityUrl(kibanaUrl, 'attackDiscovery');
  if (section === 'security-overview') return kibanaSecurityUrl(kibanaUrl, 'overview');
  if (section === 'workflows') return elasticWorkflowUrl(kibanaUrl);
  if (section === 'search') return kibanaSearchHomeUrl(kibanaUrl);
  if (section === 'search-app') return kibanaSearchAppUrl(kibanaUrl);
  if (section === 'agent-builder') return kibanaAgentBuilderUrl(kibanaUrl);
  return kibanaDiscoverUrl(kibanaUrl);
}

export function StatCard({ label, value, unit, trend, highlight, kibanaUrl, kibanaSection = 'discover' }) {
  const link = resolveKibanaLink(kibanaUrl, kibanaSection);
  return (
    <div className={`surface-card p-5 relative ${highlight ? 'ring-1 ring-[#0071e3]/20' : ''}`}>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 text-[#86868b] hover:text-[#0071e3]"
          title="Open in Kibana"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
      <p className="text-[12px] text-[#86868b]">{label}</p>
      <p className="text-[28px] font-semibold tracking-tight mt-1 text-[#1d1d1f] animate-count">
        {value}
        {unit && <span className="text-[17px] font-normal text-[#86868b] ml-1">{unit}</span>}
      </p>
      {trend && <p className="text-[12px] text-[#86868b] mt-2 leading-snug">{trend}</p>}
    </div>
  );
}

/** @deprecated Use footer note in App shell instead */
export function DemoBanner() {
  return null;
}

export default ModuleHeader;
