import { Bot, CheckCircle2, Loader2, Workflow, Zap } from 'lucide-react';
import { ElasticWorkflowLink } from './ElasticWorkflowLink';
import { P1IncidentCounter } from './shared/P1IncidentCounter';

const STATUS_STYLE = {
  completed: 'bg-success text-white',
  running: 'bg-telco-magenta text-white animate-pulse',
  pending: 'bg-gray-200 text-elastic-gray',
};

export function WorkflowResolutionPanel({
  workflowRun,
  loading = false,
  title = 'Elastic Workflow — AI Resolution',
  compact = false,
  kibanaUrl,
  workflowId,
}) {
  if (loading && !workflowRun) {
    return (
      <div className={`border border-telco-magenta/20 rounded-xl ${compact ? 'p-3 bg-telco-magenta/5' : 'p-4 bg-white'}`}>
        <p className="text-xs text-telco-magenta flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Starting Elastic Workflow…
        </p>
      </div>
    );
  }

  if (!workflowRun) return null;

  const resolved = workflowRun.steps?.every(s => s.status === 'completed');

  return (
    <div className={`border rounded-xl overflow-hidden ${resolved ? 'border-success/30' : 'border-telco-magenta/20'} ${compact ? '' : 'bg-white'}`}>
      <div className={`px-3 py-2 flex items-center justify-between gap-2 ${resolved ? 'bg-success/10' : 'bg-telco-magenta/5'}`}>
        <p className="text-xs font-semibold text-elastic-dark flex items-center gap-1.5">
          <Workflow className={`w-3.5 h-3.5 ${resolved ? 'text-success' : 'text-telco-magenta'}`} />
          {title}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {(workflowRun?.executionId || workflowId || workflowRun?.workflowId) && (
            <ElasticWorkflowLink
              kibanaUrl={kibanaUrl}
              workflowId={workflowRun?.kibanaWorkflowId || workflowId || workflowRun?.workflowId}
              executionId={workflowRun?.kibanaExecutionId}
              href={workflowRun?.kibanaExecutionUrl || workflowRun?.kibanaWorkflowUrl}
              label={compact ? 'Workflow' : undefined}
            />
          )}
          {resolved && (
            <span className="text-[10px] text-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        {workflowRun.message && (
          <p className={`text-xs flex items-center gap-1 ${resolved ? 'text-success' : 'text-telco-magenta'}`}>
            <Zap className="w-3 h-3" /> {workflowRun.message}
          </p>
        )}
        {workflowRun.aiSummary && (
          <p className="text-[10px] text-elastic-dark p-2 bg-elastic-teal/5 rounded border border-elastic-teal/15">
            {workflowRun.aiSummary}
          </p>
        )}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {workflowRun.steps?.map(step => (
            <div key={step.id} className="flex items-start gap-2 text-[10px]">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold ${STATUS_STYLE[step.status] || STATUS_STYLE.pending}`}>
                {step.status === 'completed' ? '✓' : step.id}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-elastic-dark truncate">{step.name}</p>
                {!compact && <p className="text-elastic-gray truncate">{step.detail}</p>}
              </div>
            </div>
          ))}
        </div>
        {workflowRun.kibanaRunError && (
          <p className="text-[10px] text-warning">{workflowRun.kibanaRunError}</p>
        )}
        {workflowRun.kibanaNote && !workflowRun.kibanaLinked && (
          <p className="text-[10px] text-warning">{workflowRun.kibanaNote}</p>
        )}
        {workflowRun.estimatedResolutionMin && !resolved && (
          <p className="text-[10px] text-elastic-gray flex items-center gap-1">
            <Bot className="w-3 h-3" /> Est. {workflowRun.estimatedResolutionMin} min · no human escalation
          </p>
        )}
        {resolved && (
          <P1IncidentCounter
            compact={compact}
            context={workflowRun.message || 'Elastic Workflow auto-remediation completed'}
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}

export default WorkflowResolutionPanel;
