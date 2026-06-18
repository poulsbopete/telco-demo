import { LOOPS, NODES, LOOP_PATHS } from '../lib/incident-response/architecture';

const BOX = {
  channels: { fill: '#fce4f3', stroke: '#e20074', text: '#343741' },
  agents: { fill: '#fff4e6', stroke: '#f5a700', text: '#343741' },
  core: { fill: '#fff0e6', stroke: '#f66', text: '#343741' },
  data: { fill: '#e8f4f8', stroke: '#0077cc', text: '#343741' },
  infra: { fill: '#fce4f3', stroke: '#e20074', text: '#343741' },
  ops: { fill: '#fce4f3', stroke: '#e20074', text: '#343741' },
  telemetry: { fill: '#fff0e6', stroke: '#f66', text: '#343741' },
  knowledge: { fill: '#f3e8ff', stroke: '#6b2c91', text: '#343741' },
};

const POSITIONS = {
  consumer: { x: 24, y: 28, w: 88, h: 36 },
  business: { x: 24, y: 72, w: 88, h: 36 },
  enterprise: { x: 24, y: 116, w: 88, h: 36 },
  agentCluster: { x: 140, y: 28, w: 96, h: 52 },
  eventBus: { x: 268, y: 44, w: 72, h: 40 },
  orchestrator: { x: 372, y: 36, w: 108, h: 56 },
  sessionCache: { x: 520, y: 24, w: 78, h: 28 },
  caseStore: { x: 520, y: 58, w: 78, h: 28 },
  counterRegistry: { x: 520, y: 92, w: 78, h: 28 },
  diagnosticArchive: { x: 520, y: 126, w: 78, h: 28 },
  infrastructure: { x: 360, y: 168, w: 132, h: 40 },
  opsConsole: { x: 668, y: 52, w: 96, h: 40 },
  nocTeam: { x: 668, y: 108, w: 96, h: 36 },
  observabilityFeed: { x: 668, y: 168, w: 96, h: 32 },
  telemetryHub: { x: 548, y: 168, w: 96, h: 32 },
  incidentNotes: { x: 792, y: 28, w: 88, h: 28 },
  runbookDraft: { x: 792, y: 64, w: 88, h: 28 },
  knowledgeBase: { x: 792, y: 100, w: 88, h: 28 },
};

function center(nodeId) {
  const b = POSITIONS[nodeId];
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

function edgePath(from, to) {
  const a = center(from);
  const b = center(to);
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

function strokeForLoop(loopId, active) {
  if (!active) return 'rgba(203,213,225,0.35)';
  return LOOPS[loopId]?.color ?? '#69707d';
}

export function IncidentResponseDiagram({ activeLoop, activeNode, completedNodes = new Set() }) {
  const loopEdges = activeLoop ? LOOP_PATHS[activeLoop] ?? [] : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 overflow-x-auto">
      <div className="flex flex-wrap gap-3 mb-2 text-[10px]">
        {Object.values(LOOPS).map(loop => (
          <span key={loop.id} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: loop.color }} />
            {loop.label}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 900 220" className="w-full min-w-[720px] h-auto block" role="img" aria-label="Incident response architecture">
        <rect x="8" y="8" width="130" height="156" rx="6" fill="none" stroke="#d3dae6" strokeDasharray="4 3" />
        <text x="16" y="22" fill="#69707d" fontSize="8" fontWeight="600">Customer channels</text>

        <rect x="128" y="8" width="120" height="156" rx="6" fill="none" stroke="#d3dae6" strokeDasharray="4 3" />
        <text x="136" y="22" fill="#69707d" fontSize="8" fontWeight="600">Monitoring agents</text>

        <rect x="348" y="152" width="156" height="56" rx="6" fill="none" stroke="#d3dae6" strokeDasharray="4 3" />
        <text x="356" y="166" fill="#69707d" fontSize="8" fontWeight="600">Network infrastructure</text>

        <rect x="776" y="8" width="112" height="132" rx="6" fill="none" stroke="#d3dae6" strokeDasharray="4 3" />
        <text x="784" y="22" fill="#69707d" fontSize="8" fontWeight="600">Knowledge pipeline</text>

        {Object.entries(LOOP_PATHS).map(([loopId, edges]) =>
          edges.map((edge, i) => {
            const isLoopActive = activeLoop === loopId;
            const isEdgeActive = isLoopActive && (
              activeNode === edge.to
              || (completedNodes.has(edge.from) && completedNodes.has(edge.to))
              || activeNode === edge.from
            );
            return (
              <path
                key={`${loopId}-${i}`}
                d={edgePath(edge.from, edge.to)}
                fill="none"
                stroke={strokeForLoop(loopId, isEdgeActive)}
                strokeWidth={isEdgeActive ? 2.5 : 1.25}
                opacity={isLoopActive ? 1 : 0.25}
              />
            );
          }),
        )}

        {Object.entries(POSITIONS).map(([id, box]) => {
          const node = NODES[id];
          const tone = BOX[node.layer] ?? BOX.core;
          const isActive = activeNode === id;
          const isDone = completedNodes.has(id);
          const inActiveLoop = !activeLoop || (LOOP_PATHS[activeLoop]?.some(e => e.from === id || e.to === id));
          return (
            <g key={id} opacity={inActiveLoop ? 1 : 0.35}>
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx="5"
                fill={isActive ? tone.fill : isDone ? `${tone.fill}` : '#ffffff'}
                stroke={isActive ? LOOPS[activeLoop]?.color ?? tone.stroke : tone.stroke}
                strokeWidth={isActive ? 2 : 1}
              />
              <text
                x={box.x + box.w / 2}
                y={box.y + box.h / 2 + 3}
                textAnchor="middle"
                fill={tone.text}
                fontSize="7.5"
                fontWeight={isActive ? 700 : 600}
              >
                {node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default IncidentResponseDiagram;
