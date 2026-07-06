import { ExternalLink } from 'lucide-react';

export function ElasticDeepLink({ href, label, primary = false, title }) {
  if (!href) return null;

  const className = primary
    ? 'btn-primary flex items-center gap-1.5'
    : 'btn-link flex items-center gap-1';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title || `Open ${label} in Elastic`}
    >
      {primary ? (
        <>
          <ExternalLink className="w-4 h-4" />
          {label}
        </>
      ) : (
        <>
          {label}
          <ExternalLink className="w-3.5 h-3.5" />
        </>
      )}
    </a>
  );
}

/** Header row of Elastic deep links — omit entries without href. */
export function ElasticDeepLinks({ links = [] }) {
  return links
    .filter(link => link?.href)
    .map(link => (
      <ElasticDeepLink
        key={link.label}
        href={link.href}
        label={link.label}
        primary={Boolean(link.primary)}
        title={link.title}
      />
    ));
}

/** Inline link for a card section heading (Regions, ML forecast, etc.). */
export function SectionElasticLink({ href, label = 'Open in Elastic', className = '' }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-[11px] text-[#86868b] hover:text-[#0071e3] shrink-0 ${className}`}
      title={label}
    >
      {label}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}
