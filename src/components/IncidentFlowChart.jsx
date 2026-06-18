const PHASE_RANK = {
  idle: 0,
  injecting: 1,
  waiting: 2,
  running: 3,
  hitl: 4,
  done: 5,
  error: 0,
};

const NODE_W = 84;

const NODES = [
  { id: 'fault', col: 0, y: 12, h: 28, label: 'Network fault', tone: 'break' },
  { id: 'logs', col: 0, y: 44, h: 24, label: 'OTel logs', sub: 'OTLP /v1/logs', tone: 'break' },
  { id: 'metrics', col: 0, y: 72, h: 24, label: 'OTel metrics', sub: 'OTLP /v1/metrics', tone: 'break' },
  { id: 'stream', col: 0, y: 100, h: 24, label: 'Elastic ingest', sub: 'logs + metrics', tone: 'neutral' },
  { id: 'prom', col: 1, y: 12, h: 24, label: 'Prometheus', sub: 'otel-demo', tone: 'neutral' },
  { id: 'alert', col: 1, y: 40, h: 24, label: 'Alert rule', sub: '~60s · logs', tone: 'detect' },
  { id: 'workflow', col: 1, y: 68, h: 24, label: 'Workflow', sub: 'Incident resp.', tone: 'detect' },
  { id: 'rca', col: 1, y: 96, h: 24, label: 'Agent RCA', sub: 'logs + metrics', tone: 'detect' },
  { id: 'case', col: 1, y: 124, h: 24, label: 'Case', sub: 'Hybrid corr.', tone: 'detect' },
  { id: 'hitl', col: 2, y: 12, h: 24, label: 'Human approval', sub: 'waitForInput', tone: 'hitl' },
  { id: 'remediate', col: 2, y: 40, h: 24, label: 'Remediation', tone: 'fix' },
  { id: 'queue', col: 2, y: 68, h: 24, label: 'Action queue', sub: 'remediation idx', tone: 'fix' },
  { id: 'poller', col: 2, y: 96, h: 24, label: 'Poller', sub: 'Clear channel', tone: 'fix' },
  { id: 'resolved', col: 2, y: 124, h: 24, label: 'Resolved', sub: 'Case closed', tone: 'fix' },
];

const LINKS = [
  { from: 'fault', to: 'logs', minPhase: 'injecting' },
  { from: 'fault', to: 'metrics', minPhase: 'injecting' },
  { from: 'logs', to: 'stream', minPhase: 'injecting' },
  { from: 'metrics', to: 'stream', minPhase: 'injecting' },
  { from: 'prom', to: 'rca', minPhase: 'running' },
  { from: 'stream', to: 'alert', minPhase: 'waiting' },
  { from: 'alert', to: 'workflow', minPhase: 'running' },
  { from: 'workflow', to: 'rca', minPhase: 'running' },
  { from: 'rca', to: 'case', minPhase: 'running' },
  { from: 'case', to: 'hitl', minPhase: 'hitl', skipIfLow: true },
  { from: 'case', to: 'remediate', minPhase: 'running' },
  { from: 'hitl', to: 'remediate', minPhase: 'hitl', skipIfLow: true },
  { from: 'remediate', to: 'queue', minPhase: 'running' },
  { from: 'queue', to: 'poller', minPhase: 'running' },
  { from: 'poller', to: 'resolved', minPhase: 'done' },
];

function colX(col) {
  return [6, 122, 238][col];
}

function nodeBox(node) {
  return { x: colX(node.col), y: node.y, w: NODE_W, h: node.h };
}

function linkPath(from, to) {
  const a = nodeBox(from);
  const b = nodeBox(to);
  const x1 = a.x + a.w;
  const y1 = a.y + a.h / 2;
  const x2 = b.x;
  const y2 = b.y + b.h / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function phaseAtLeast(phase, min) {
  if (phase === 'error') return false;
  if (phase === 'hitl' && min === 'running') return true;
  if (phase === 'done') return true;
  return PHASE_RANK[phase] >= PHASE_RANK[min];
}

function nodeActive(nodeId, phase, fault, workflowStep) {
  if (phase === 'idle' && nodeId === 'fault') return !!fault;
  if (nodeId === 'fault') return phase !== 'idle' || !!fault;

  const stepMap = {
    enrich_context: ['workflow', 'rca'],
    count_errors: ['workflow', 'rca'],
    hybrid_correlation: ['prom', 'rca', 'case'],
    run_rca: ['rca', 'prom'],
    create_case: ['case'],
    hitl_approval: ['hitl'],
    auto_remediate: ['remediate'],
    remediate: ['remediate', 'queue'],
    audit_log: ['resolved'],
  };

  if (workflowStep && stepMap[workflowStep]?.includes(nodeId)) return true;

  const minByNode = {
    logs: 'injecting',
    metrics: 'injecting',
    stream: 'injecting',
    prom: 'running',
    alert: 'waiting',
    workflow: 'running',
    rca: 'running',
    case: 'running',
    hitl: 'hitl',
    remediate: 'running',
    queue: 'running',
    poller: 'running',
    resolved: 'done',
  };

  return phaseAtLeast(phase, minByNode[nodeId] ?? 'idle');
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function strokeForLink(active, to, from) {
  if (!active) return 'rgba(203,213,225,0.6)';
  if (to.tone === 'fix' || to.id === 'resolved') return 'rgba(1,125,115,0.55)';
  if (to.tone === 'hitl' || from.id === 'hitl') return 'rgba(245,158,11,0.55)';
  if (from.tone === 'break' || to.tone === 'break') return 'rgba(226,0,116,0.45)';
  return 'rgba(0,191,179,0.55)';
}

function nodeStroke(tone, active) {
  if (!active) return 'rgba(203,213,225,0.9)';
  if (tone === 'break') return 'rgba(226,0,116,0.55)';
  if (tone === 'detect') return 'rgba(0,191,179,0.65)';
  if (tone === 'hitl') return 'rgba(245,158,11,0.65)';
  if (tone === 'fix') return 'rgba(1,125,115,0.65)';
  return 'rgba(203,213,225,0.9)';
}

function nodeFill(tone, active) {
  if (!active) return '#ffffff';
  if (tone === 'break') return 'rgba(226,0,116,0.06)';
  if (tone === 'detect') return 'rgba(0,191,179,0.08)';
  if (tone === 'hitl') return 'rgba(245,158,11,0.08)';
  if (tone === 'fix') return 'rgba(1,125,115,0.08)';
  return '#f8fafc';
}

export function IncidentFlowChart({ fault, phase, workflowStep }) {
  const isHigh = fault?.severity === 'high';
  const visibleLinks = LINKS.filter(l => !l.skipIfLow || isHigh);

  const nodes = NODES.map(n => {
    if (n.id === 'fault' && fault) {
      return {
        ...n,
        label: `CH${String(fault.channel).padStart(2, '0')} ${fault.name}`,
        sub: fault.errorType,
      };
    }
    if (n.id === 'remediate' && fault) {
      return { ...n, sub: fault.remediationAction };
    }
    return n;
  });

  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="rounded-xl border border-gray-200 bg-elastic-teal/5 p-3">
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="text-sm font-semibold text-elastic-teal m-0">Incident flow</h3>
        <p className="text-[10px] text-elastic-gray m-0">Break → detect → remediate</p>
      </div>
      <svg viewBox="0 0 328 152" className="w-full max-h-[168px] h-auto block" role="img" aria-label="Incident flow from fault to resolution">
        {visibleLinks.map(link => {
          const from = nodeById[link.from];
          const to = nodeById[link.to];
          if (!from || !to) return null;
          const active = phaseAtLeast(phase, link.minPhase) && phase !== 'error';
          return (
            <path
              key={`${link.from}-${link.to}`}
              d={linkPath(from, to)}
              fill="none"
              stroke={strokeForLink(active, to, from)}
              strokeWidth={active ? 5 : 3}
              strokeLinecap="butt"
            />
          );
        })}

        {nodes.map(node => {
          if (node.id === 'hitl' && !isHigh) {
            if (phase === 'idle' || !fault) return null;
            const box = nodeBox(node);
            return (
              <g key={node.id} opacity={0.45}>
                <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="4" fill="#ffffff" stroke="rgba(203,213,225,0.9)" strokeDasharray="3 2" />
                <text x={box.x + box.w / 2} y={box.y + 15} textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="600">HITL skipped</text>
              </g>
            );
          }
          const box = nodeBox(node);
          const active = nodeActive(node.id, phase, fault, workflowStep);
          return (
            <g key={node.id}>
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx="4"
                fill={nodeFill(node.tone, active)}
                stroke={nodeStroke(node.tone, active)}
                strokeWidth={active ? 1.25 : 1}
              />
              <text x={box.x + box.w / 2} y={box.y + (node.sub ? 11 : 14)} textAnchor="middle" fill="#343741" fontSize="7" fontWeight="600">
                {truncate(node.label, 14)}
              </text>
              {node.sub && (
                <text x={box.x + box.w / 2} y={box.y + 20} textAnchor="middle" fill="#69707d" fontSize="6">
                  {truncate(node.sub, 16)}
                </text>
              )}
            </g>
          );
        })}

        <text x={48} y={8} fill="#69707d" fontSize="6.5" fontWeight="600">Break</text>
        <text x={164} y={8} fill="#69707d" fontSize="6.5" fontWeight="600">Detect</text>
        <text x={280} y={8} fill="#69707d" fontSize="6.5" fontWeight="600">Remediate</text>
      </svg>
    </div>
  );
}

export default IncidentFlowChart;
