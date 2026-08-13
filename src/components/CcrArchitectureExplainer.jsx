import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  Moon,
  Network,
  Shield,
  Sun,
  Zap,
} from 'lucide-react';

const RPO_OPTIONS = [
  {
    id: 'seconds',
    label: 'Seconds',
    summary: 'Near-zero data loss under site failure',
    recommend: 'realtime',
    detail:
      'Choose real-time cross-cluster replication with follower indices. Keep snapshots as a corruption backstop — replication alone cannot undo a bad write that was faithfully copied.',
  },
  {
    id: 'minutes',
    label: 'Minutes',
    summary: 'Short lag is acceptable for most analytics',
    recommend: 'hybrid',
    detail:
      'A hybrid of CCR for hot indices plus scheduled snapshots balances lag, bandwidth, and recovery from logical corruption. Pair with deliberate failover routing.',
  },
  {
    id: 'hours',
    label: 'Hours',
    summary: 'Cost and simplicity outweigh immediacy',
    recommend: 'snapshot',
    detail:
      'Snapshot-restore is usually enough. Invest in repository durability, restore drills, and a clear RTO playbook rather than continuous replication traffic.',
  },
];

const STRATEGIES = [
  {
    id: 'realtime',
    title: 'Real-time CCR',
    subtitle: 'Follower indices',
    accent: 'teal',
    rpo: '< 1–30 s (typical lag)',
    rto: 'Minutes · promote follower / retarget clients',
    bandwidth: 'Continuous · roughly write rate × replica count',
    recovery: [
      'Pause auto-follow / follower indices on secondary',
      'Convert followers to regular indices (or promote cluster)',
      'Point traffic at secondary endpoint',
      'Rebuild primary as new follower when healthy',
    ],
    useCase:
      'Mission-critical search and observability where losing more than a few seconds of events blocks high-tier workloads.',
  },
  {
    id: 'hybrid',
    title: 'Hybrid CCR + snapshots',
    subtitle: 'Mixed approach',
    accent: 'blue',
    rpo: 'Seconds on hot data · minutes–hours on cold',
    rto: 'Minutes for hot · longer if snapshot restore needed',
    bandwidth: 'CCR for hot paths · burst traffic on snapshot windows',
    recovery: [
      'Fail over hot follower indices first',
      'Restore cold / historical windows from shared repository if needed',
      'Replay or re-seed gaps beyond retention',
      'Verify transforms, rules, and saved objects before opening users',
    ],
    useCase:
      'Platforms that need a warm secondary for recent data while using snapshots for retention, ML model state, and corruption rollback.',
  },
  {
    id: 'snapshot',
    title: 'Snapshot-restore only',
    subtitle: 'Cost-optimized',
    accent: 'slate',
    rpo: 'Equals snapshot interval (often 30–120 min)',
    rto: 'Tens of minutes to hours · restore + warm-up',
    bandwidth: 'Periodic · repository write/read only',
    recovery: [
      'Stand up secondary cluster (or clear target)',
      'Restore latest consistent snapshot',
      'Apply post-restore config and ILM',
      'Validate dashboards and SLOs, then cut over',
    ],
    useCase:
      'Non-critical or cost-sensitive estates where planned RPO in hours is acceptable and continuous WAN replication is hard to justify.',
  },
];

const LINK_TYPES = [
  {
    id: 'vpn',
    label: 'VPN',
    latency: 'Variable · depends on path',
    notes: 'Encrypted overlay; simplest to stand up; watch MTU and jitter under peak ingest.',
  },
  {
    id: 'direct',
    label: 'Direct link',
    latency: 'Lowest · dedicated circuit',
    notes: 'Private fiber or wave between sites; best for sustained CCR write amplification.',
  },
  {
    id: 'interconnect',
    label: 'Managed interconnect',
    latency: 'Low–moderate · provider SLA',
    notes: 'Cloud interconnect / exchange; good middle ground when clusters span regions or clouds.',
  },
];

function rtoFromRpo(rpoSeconds) {
  // Illustrative model: recovery overhead grows as replication lag allowance shrinks
  // (more orchestration) and as lag grows (more catch-up / restore).
  const basePromoteMin = 8;
  const orchestration = Math.max(0, (30 - Math.min(rpoSeconds, 30)) * 0.15);
  const catchUp = Math.sqrt(Math.max(rpoSeconds, 1)) * 0.35;
  const snapshotPenalty = rpoSeconds > 900 ? (rpoSeconds - 900) / 180 : 0;
  return Math.round(basePromoteMin + orchestration + catchUp + snapshotPenalty);
}

function strategyForRpo(rpoSeconds) {
  if (rpoSeconds <= 30) return 'realtime';
  if (rpoSeconds <= 900) return 'hybrid';
  return 'snapshot';
}

function ClusterNode({ title, role, dark }) {
  return (
    <div
      className={`relative rounded-2xl border px-5 py-4 min-w-[140px] sm:min-w-[160px] text-center shadow-sm ${
        dark
          ? 'border-white/15 bg-[#1c1c1e] text-[#f5f5f7]'
          : 'border-[#d2d2d7] bg-white text-[#1d1d1f]'
      }`}
    >
      <Database className={`w-7 h-7 mx-auto mb-2 ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`} />
      <p className="text-[15px] font-semibold tracking-tight">{title}</p>
      <p className={`text-[12px] mt-1 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>{role}</p>
    </div>
  );
}

function FlowArrow({ dark }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 sm:px-4">
      <div className="relative w-16 sm:w-24 h-8 flex items-center">
        <div
          className={`absolute inset-x-0 h-0.5 overflow-hidden ${
            dark ? 'bg-white/20' : 'bg-[#d2d2d7]'
          }`}
        >
          <div
            className={`h-full w-1/3 ${dark ? 'bg-[#64d2ff]' : 'bg-[#0071e3]'} ccr-flow-pulse`}
          />
        </div>
        <ArrowRight
          className={`absolute right-0 w-4 h-4 ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`}
        />
      </div>
      <span className={`text-[11px] ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
        replicate
      </span>
    </div>
  );
}

function HeroDiagram({ dark }) {
  return (
    <div
      className={`mt-10 rounded-3xl border p-6 sm:p-10 ${
        dark ? 'border-white/10 bg-[#111113]' : 'border-[#d2d2d7]/80 bg-[#f5f5f7]'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2">
        <ClusterNode title="Primary cluster" role="Leader indices · writes" dark={dark} />
        <FlowArrow dark={dark} />
        <ClusterNode title="Secondary cluster" role="Follower indices · read-ready" dark={dark} />
      </div>
      <p className={`mt-6 text-center text-[13px] max-w-xl mx-auto ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
        Changes on the primary are shipped continuously to follower indices on the secondary.
        Snapshots remain the backstop for corruption and long-window recovery.
      </p>
    </div>
  );
}

function DecisionTree({ dark, rpoChoice, setRpoChoice }) {
  const selected = RPO_OPTIONS.find(o => o.id === rpoChoice);
  const strategy = STRATEGIES.find(s => s.id === selected?.recommend);

  return (
    <section className="mt-16">
      <p className={`section-eyebrow ${dark ? '!text-[#98989d]' : ''}`}>Section 1</p>
      <h2 className={`section-title mt-2 ${dark ? '!text-[#f5f5f7]' : ''}`}>
        What&apos;s your RPO requirement?
      </h2>
      <p className={`section-lead mt-3 ${dark ? '!text-[#98989d]' : ''}`}>
        Recovery Point Objective drives whether you need continuous replication, a hybrid, or
        snapshot-only.
      </p>

      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        {RPO_OPTIONS.map(opt => {
          const active = rpoChoice === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRpoChoice(opt.id)}
              className={`text-left rounded-2xl border p-4 transition-colors ${
                active
                  ? dark
                    ? 'border-[#64d2ff] bg-[#64d2ff]/10'
                    : 'border-[#0071e3] bg-[#0071e3]/8'
                  : dark
                    ? 'border-white/10 bg-[#1c1c1e] hover:border-white/25'
                    : 'border-[#d2d2d7] bg-white hover:border-[#86868b]'
              }`}
            >
              <p className={`text-[17px] font-semibold ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
                {opt.label}
              </p>
              <p className={`text-[13px] mt-1 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
                {opt.summary}
              </p>
            </button>
          );
        })}
      </div>

      {selected && strategy && (
        <div
          className={`mt-6 rounded-2xl border p-5 ${
            dark ? 'border-[#64d2ff]/30 bg-[#64d2ff]/5' : 'border-[#0071e3]/25 bg-[#0071e3]/5'
          }`}
        >
          <p className={`text-[12px] font-semibold uppercase tracking-wide ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`}>
            Recommendation · {strategy.title}
          </p>
          <p className={`mt-2 text-[15px] leading-relaxed ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
            {selected.detail}
          </p>
        </div>
      )}
    </section>
  );
}

function StrategyCards({ dark, highlightId }) {
  return (
    <section className="mt-16">
      <p className={`section-eyebrow ${dark ? '!text-[#98989d]' : ''}`}>Section 2</p>
      <h2 className={`section-title mt-2 ${dark ? '!text-[#f5f5f7]' : ''}`}>
        Architecture comparison
      </h2>
      <p className={`section-lead mt-3 ${dark ? '!text-[#98989d]' : ''}`}>
        Three common strategies for keeping a secondary site useful when the primary fails.
      </p>

      <div className="mt-8 grid lg:grid-cols-3 gap-4">
        {STRATEGIES.map(s => {
          const highlighted = highlightId === s.id;
          return (
            <article
              key={s.id}
              className={`rounded-2xl border p-5 flex flex-col ${
                highlighted
                  ? dark
                    ? 'border-[#64d2ff] ring-1 ring-[#64d2ff]/40 bg-[#1c1c1e]'
                    : 'border-[#0071e3] ring-1 ring-[#0071e3]/25 bg-white'
                  : dark
                    ? 'border-white/10 bg-[#1c1c1e]'
                    : 'border-[#d2d2d7] bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={`text-[17px] font-semibold ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
                    {s.title}
                  </h3>
                  <p className={`text-[12px] mt-0.5 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
                    {s.subtitle}
                  </p>
                </div>
                {highlighted && (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    dark ? 'bg-[#64d2ff]/15 text-[#64d2ff]' : 'bg-[#0071e3]/10 text-[#0071e3]'
                  }`}
                  >
                    Match
                  </span>
                )}
              </div>

              <dl className="mt-4 space-y-3 text-[13px]">
                <div>
                  <dt className={`flex items-center gap-1.5 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
                    <Clock className="w-3.5 h-3.5" /> RPO / RTO
                  </dt>
                  <dd className={`mt-1 ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
                    {s.rpo}
                    <br />
                    {s.rto}
                  </dd>
                </div>
                <div>
                  <dt className={`flex items-center gap-1.5 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
                    <Zap className="w-3.5 h-3.5" /> Bandwidth
                  </dt>
                  <dd className={`mt-1 ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>{s.bandwidth}</dd>
                </div>
                <div>
                  <dt className={`flex items-center gap-1.5 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
                    <Shield className="w-3.5 h-3.5" /> Recovery steps
                  </dt>
                  <dd className="mt-1">
                    <ol className={`list-decimal pl-4 space-y-1 ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
                      {s.recovery.map(step => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </dd>
                </div>
              </dl>

              <p className={`mt-auto pt-4 text-[12px] border-t ${
                dark ? 'border-white/10 text-[#98989d]' : 'border-[#d2d2d7]/80 text-[#86868b]'
              }`}
              >
                <span className={`font-medium ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Use case · </span>
                {s.useCase}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RecoveryTimeline({ dark, rpoSeconds, setRpoSeconds }) {
  const rtoMin = useMemo(() => rtoFromRpo(rpoSeconds), [rpoSeconds]);
  const strategyId = strategyForRpo(rpoSeconds);
  const strategy = STRATEGIES.find(s => s.id === strategyId);

  const label =
    rpoSeconds < 60
      ? `${rpoSeconds}s`
      : rpoSeconds < 3600
        ? `${Math.round(rpoSeconds / 60)} min`
        : `${(rpoSeconds / 3600).toFixed(1)} h`;

  return (
    <section className="mt-16">
      <p className={`section-eyebrow ${dark ? '!text-[#98989d]' : ''}`}>Section 3</p>
      <h2 className={`section-title mt-2 ${dark ? '!text-[#f5f5f7]' : ''}`}>
        Recovery time scenarios
      </h2>
      <p className={`section-lead mt-3 ${dark ? '!text-[#98989d]' : ''}`}>
        Adjust the RPO target to see how recovery time and strategy tend to shift. Figures are
        illustrative for planning conversations, not SLAs.
      </p>

      <div
        className={`mt-8 rounded-2xl border p-5 sm:p-6 ${
          dark ? 'border-white/10 bg-[#1c1c1e]' : 'border-[#d2d2d7] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={`text-[12px] ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>RPO target</p>
            <p className={`text-[28px] font-semibold tracking-tight tabular-nums ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
              {label}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-[12px] ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>Modeled RTO</p>
            <p className={`text-[28px] font-semibold tracking-tight tabular-nums ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`}>
              ~{rtoMin} min
            </p>
          </div>
        </div>

        <input
          type="range"
          min={5}
          max={14400}
          step={5}
          value={rpoSeconds}
          onChange={e => setRpoSeconds(Number(e.target.value))}
          className="mt-6 w-full accent-[#0071e3]"
          aria-label="RPO target in seconds"
        />
        <div className={`flex justify-between text-[11px] mt-1 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
          <span>5 s</span>
          <span>Hours</span>
        </div>

        <div className="mt-8">
          <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-[#f5f5f7]'}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${dark ? 'bg-[#64d2ff]' : 'bg-[#0071e3]'}`}
              style={{ width: `${Math.min(100, (rtoMin / 90) * 100)}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
            <span className={`inline-flex items-center gap-1.5 ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
              <CheckCircle2 className={`w-4 h-4 ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`} />
              Preferred strategy: <strong>{strategy?.title}</strong>
            </span>
            <span className={dark ? 'text-[#98989d]' : 'text-[#86868b]'}>
              Tighter RPO usually means more orchestration at cutover; looser RPO shifts work into restore and catch-up.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkTopology({ dark }) {
  const [enabled, setEnabled] = useState({
    vpn: true,
    direct: false,
    interconnect: false,
  });

  const activeLinks = LINK_TYPES.filter(l => enabled[l.id]);

  function toggle(id) {
    setEnabled(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section className="mt-16 mb-8">
      <p className={`section-eyebrow ${dark ? '!text-[#98989d]' : ''}`}>Section 4</p>
      <h2 className={`section-title mt-2 ${dark ? '!text-[#f5f5f7]' : ''}`}>
        Network topology
      </h2>
      <p className={`section-lead mt-3 ${dark ? '!text-[#98989d]' : ''}`}>
        Toggle inter-site links to compare how traffic between primary and secondary usually rides.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {LINK_TYPES.map(link => {
          const on = enabled[link.id];
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => toggle(link.id)}
              className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                on
                  ? dark
                    ? 'border-[#64d2ff] bg-[#64d2ff]/15 text-[#64d2ff]'
                    : 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                  : dark
                    ? 'border-white/15 text-[#98989d]'
                    : 'border-[#d2d2d7] text-[#86868b]'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-6 rounded-2xl border p-6 sm:p-8 relative overflow-hidden ${
          dark ? 'border-white/10 bg-[#111113]' : 'border-[#d2d2d7] bg-[#f5f5f7]'
        }`}
      >
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          <div className={`rounded-xl border p-4 text-center ${dark ? 'border-white/15 bg-[#1c1c1e]' : 'border-[#d2d2d7] bg-white'}`}>
            <HardDrive className={`w-6 h-6 mx-auto ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`} />
            <p className={`mt-2 text-[14px] font-semibold ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
              Primary site
            </p>
            <p className={`text-[12px] ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>Ingest · leader shards</p>
          </div>

          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <Network className={`w-5 h-5 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`} />
            {activeLinks.length === 0 ? (
              <p className={`text-[12px] text-center ${dark ? 'text-[#ff453a]' : 'text-[#cc0000]'}`}>
                No link selected
              </p>
            ) : (
              activeLinks.map(link => (
                <div key={link.id} className="w-full flex flex-col items-center">
                  <div className={`w-full h-0.5 relative ${dark ? 'bg-white/20' : 'bg-[#d2d2d7]'}`}>
                    <div className={`absolute inset-y-0 left-0 w-1/2 ${dark ? 'bg-[#64d2ff]' : 'bg-[#0071e3]'} ccr-flow-pulse`} />
                  </div>
                  <span className={`text-[11px] mt-1 ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`}>
                    {link.label}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className={`rounded-xl border p-4 text-center ${dark ? 'border-white/15 bg-[#1c1c1e]' : 'border-[#d2d2d7] bg-white'}`}>
            <HardDrive className={`w-6 h-6 mx-auto ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`} />
            <p className={`mt-2 text-[14px] font-semibold ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
              Secondary site
            </p>
            <p className={`text-[12px] ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>Followers · restore target</p>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {LINK_TYPES.map(link => (
            <li
              key={link.id}
              className={`text-[13px] rounded-xl px-3 py-2 border ${
                enabled[link.id]
                  ? dark
                    ? 'border-[#64d2ff]/30 bg-[#64d2ff]/5'
                    : 'border-[#0071e3]/20 bg-[#0071e3]/5'
                  : dark
                    ? 'border-transparent opacity-40'
                    : 'border-transparent opacity-45'
              }`}
            >
              <span className={`font-medium ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>{link.label}</span>
              <span className={dark ? 'text-[#98989d]' : 'text-[#86868b]'}> · {link.latency}</span>
              <p className={`mt-0.5 ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>{link.notes}</p>
            </li>
          ))}
        </ul>
      </div>

      <aside
        className={`mt-8 rounded-2xl border p-5 ${
          dark ? 'border-white/10 bg-[#1c1c1e]' : 'border-[#d2d2d7] bg-white'
        }`}
      >
        <p className={`text-[12px] font-semibold uppercase tracking-wide ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
          Design note
        </p>
        <p className={`mt-2 text-[14px] leading-relaxed ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
          Follower indices are read-oriented. If the secondary must run write-heavy ingest transforms
          or identical operational workloads, teams often pair CCR with dual independent ingest, or
          choose an active-active write pattern instead of followers alone. Snapshots remain essential
          in every model — they are the only reliable undo for corruption that replication would
          otherwise copy faithfully.
        </p>
      </aside>
    </section>
  );
}

export function CcrArchitectureExplainer() {
  const [dark, setDark] = useState(false);
  const [rpoChoice, setRpoChoice] = useState('minutes');
  const [rpoSeconds, setRpoSeconds] = useState(120);

  const highlightId = RPO_OPTIONS.find(o => o.id === rpoChoice)?.recommend;

  return (
    <div className={dark ? 'ccr-dark -mx-6 px-6 py-2 rounded-3xl bg-[#000]' : ''}>
      <style>{`
        .ccr-flow-pulse {
          animation: ccr-flow 1.8s ease-in-out infinite;
        }
        @keyframes ccr-flow {
          0% { transform: translateX(-120%); opacity: 0.35; }
          40% { opacity: 1; }
          100% { transform: translateX(280%); opacity: 0.2; }
        }
      `}</style>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className={`section-eyebrow ${dark ? '!text-[#98989d]' : ''}`}>Distributed databases</p>
          <h1 className={`mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight leading-[1.1] ${
            dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'
          }`}
          >
            Cross-Cluster Replication Explained
          </h1>
          <p className={`mt-3 text-[17px] leading-relaxed max-w-2xl ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
            How primary and secondary clusters stay aligned — and how to choose between real-time
            followers, hybrid CCR plus snapshots, and snapshot-restore only.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDark(v => !v)}
          className={`inline-flex items-center gap-2 text-[13px] px-3 py-2 rounded-full border ${
            dark
              ? 'border-white/20 text-[#f5f5f7] hover:bg-white/5'
              : 'border-[#d2d2d7] text-[#1d1d1f] hover:bg-black/4'
          }`}
          aria-pressed={dark}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? 'Light' : 'Dark'}
        </button>
      </div>

      <HeroDiagram dark={dark} />
      <DecisionTree dark={dark} rpoChoice={rpoChoice} setRpoChoice={setRpoChoice} />
      <StrategyCards dark={dark} highlightId={highlightId} />
      <RecoveryTimeline dark={dark} rpoSeconds={rpoSeconds} setRpoSeconds={setRpoSeconds} />
      <NetworkTopology dark={dark} />
    </div>
  );
}

export default CcrArchitectureExplainer;
