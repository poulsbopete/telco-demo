import { ExternalLink } from 'lucide-react';
import { elasticWorkflowUrl, resolveElasticWorkflowId } from '../lib/elastic-api';

export function ElasticWorkflowLink({
  kibanaUrl,
  workflowId,
  executionId,
  href,
  label,
  className = 'text-[10px] text-elastic-teal hover:underline inline-flex items-center gap-1 shrink-0',
}) {
  const resolvedWorkflowId = workflowId ? resolveElasticWorkflowId(workflowId) : null;
  const link = href || elasticWorkflowUrl(kibanaUrl, { workflowId: resolvedWorkflowId, executionId });
  if (!link) return null;

  const text = label || (executionId ? 'View execution' : 'Open workflow');

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
      <ExternalLink className="w-3 h-3" />
      {text}
    </a>
  );
}

export default ElasticWorkflowLink;
