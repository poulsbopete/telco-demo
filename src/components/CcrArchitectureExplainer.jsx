import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  HardDrive,
  Layers,
  Link2,
  Moon,
  Network,
  Radio,
  Shield,
  Sun,
  Workflow,
  Zap,
} from 'lucide-react';

const SITE_MATRIX = [
  { component: 'Kafka (event bus)', primary: 'Yes — source of truth for both sites', secondary: 'None in initial scope' },
  { component: 'Logstash', primary: '×4 · own consumer group', secondary: '×4 · own consumer group, same topics' },
  { component: 'Elasticsearch', primary: 'Complete dataset', secondary: 'Complete dataset (cheaper tiers)' },
  { component: 'Data tiers', primary: 'Production hot / warm / cold as today', secondary: '1 day hot · remainder frozen' },
  { component: 'Ingest + transforms', primary: 'Active (write path)', secondary: 'Active (write path)' },
  { component: 'Machine learning', primary: 'Jobs running', secondary: 'Standby · model state via snapshots (option)' },
  { component: 'Alerting framework', primary: 'Active · actions enabled', secondary: 'Standby · actions suppressed' },
  { component: 'Object storage', primary: 'Shared snapshot repository', secondary: 'Shared snapshot repository' },
  { component: 'Users', primary: 'Routed here normally', secondary: 'Routed here on deliberate failover' },
];

const RPO_OPTIONS = [
  {
    id: 'seconds',
    label: 'Seconds',
    summary: 'Near-zero loss; secondary already indexing',
    recommend: 'dual',
    detail:
      'Choose dual independent ingest (with the required snapshot repository). Prefer dual ingest + ops cluster when ML, alerting, and dashboards must stay off the ingest plane. CCR followers alone are a poor fit when transforms must write on the secondary.',
  },
  {
    id: 'minutes',
    label: 'Minutes',
    summary: 'Short lag is fine if the secondary stays complete',
    recommend: 'dual-ops',
    detail:
      'Dual ingest still leads for data parity. If users, ML, and alert actions should not sit on Polaris/Titan ingest clusters, add operational Cluster 3 via CCS. Real-time CCR is only competitive if the secondary does not need a write-capable transform path. Snapshot repository required either way.',
  },
  {
    id: 'hours',
    label: 'Hours',
    summary: 'Looser RPO · still needs a snapshot repository',
    recommend: 'hybrid',
    detail:
      'Hybrid CCR for hot data plus the mandatory snapshot repository for cold windows and corruption recovery. Dual ingest (± ops cluster) remains valid if you want a fully warm secondary; snapshots are not optional in any case — they are missing today.',
  },
];

const STRATEGIES = [
  {
    id: 'dual',
    title: 'Dual independent ingest',
    subtitle: 'Write-capable secondary · + snapshot repo',
    featured: true,
    rpo: 'Seconds–minutes · bounded by ingest lag',
    rto: 'Minutes · routing change only',
    bandwidth: 'Event-bus fan-out to two consumer groups · no CCR amplify',
    recovery: [
      'Confirm secondary is current enough (lag, transforms, rules)',
      'Suppress or keep notifications as designed on the active site',
      'Point the single user endpoint at the secondary',
      'Replay, cross-copy, or restore from snapshots if corrupted',
    ],
    useCase:
      'Transforms run during ingest; users need an identical complete view after failover. DR storage stays complete but cheaper: 1 day hot, remainder frozen. Snapshot repository is mandatory underneath.',
  },
  {
    id: 'dual-ops',
    title: 'Dual ingest + ops cluster',
    subtitle: 'Polaris / Titan data plane · Cluster 3 via CCS',
    featured: false,
    rpo: 'Seconds–minutes · same dual-ingest lag',
    rto: 'Minutes · retarget CCS / promote ops site',
    bandwidth: 'Dual Logstash fan-out · CCS query traffic to Cluster 3',
    recovery: [
      'Confirm Polaris and Titan data clusters stay in parity',
      'Keep ingest + transforms on Clusters 1 & 2; do not fail those into Cluster 3',
      'Retarget Cluster 3 CCS to the surviving data cluster (or promote ops site)',
      'Users stay on Cluster 3 dashboards; alert actions continue from ops',
    ],
    useCase:
      'Same dual-fed Kafka → Logstash ×4 → Polaris/Titan data path, plus a dedicated operational cluster for ML, alerting, and dashboards. Users land on Cluster 3 via CCS — not on the ingest/transform clusters. Snapshot repository still mandatory.',
  },
  {
    id: 'realtime',
    title: 'Real-time CCR',
    subtitle: 'Follower indices · + snapshot repo',
    rpo: '< 1–30 s (typical lag)',
    rto: 'Minutes · promote follower / retarget clients',
    bandwidth: 'Continuous · roughly write rate × replica count',
    recovery: [
      'Pause auto-follow / follower indices on secondary',
      'Convert followers to regular indices (or promote cluster)',
      'Point traffic at secondary endpoint',
      'Use snapshots for corruption undo and long-window recovery',
    ],
    useCase:
      'Read-oriented secondary when write-heavy transforms are not required on DR. Still requires the shared snapshot repository.',
  },
  {
    id: 'hybrid',
    title: 'Hybrid CCR',
    subtitle: 'Hot followers · + snapshot repo',
    rpo: 'Seconds on hot data · minutes–hours on cold',
    rto: 'Minutes for hot · longer if snapshot restore needed',
    bandwidth: 'CCR for hot paths · burst traffic on snapshot windows',
    recovery: [
      'Fail over hot follower indices first',
      'Restore cold / historical windows from the snapshot repository',
      'Replay or re-seed gaps beyond retention',
      'Verify transforms, rules, and saved objects before opening users',
    ],
    useCase:
      'Only part of the estate needs near-real-time follow; snapshots cover cold data, ML model state, and corruption rollback.',
  },
];

const SNAPSHOT_BASELINE = {
  title: 'Shared snapshot repository',
  subtitle: 'Required under all four choices — not in place today',
  points: [
    'Provision shared object storage and register the repository on both data clusters',
    'Schedule consistent snapshots; prove restore in drills before relying on dual ingest, ops CCS, or CCR',
    'Only reliable undo when a bad change was applied on both sides',
    'Also backs ML model state restore and long-window catch-up',
  ],
};

const OPS_CLUSTER_MATRIX = [
  { component: 'Kafka', role: 'Single source · dual-fed to both Logstash tiers' },
  { component: 'Logstash', role: '×4 on Polaris path · ×4 on Titan path · separate consumer groups' },
  { component: 'Cluster 1 · Polaris', role: 'Full ingest · transform · complete dataset' },
  { component: 'Cluster 2 · Titan', role: 'Full ingest · transform · parity with Cluster 1' },
  { component: 'Object storage', role: 'Shared snapshot repository between Clusters 1 & 2' },
  { component: 'Cluster 3 · Operational', role: 'ML · alerting · dashboards · CCS into 1 and/or 2' },
  { component: 'Users', role: 'Land on Cluster 3 only — not on ingest clusters' },
  { component: 'Alert actions', role: 'Email / API / etc. fire from Cluster 3' },
];

const RECOVERY_TIERS = [
  {
    title: 'Within event-bus retention',
    body: 'The affected site replays from the bus and catches up. Fast and largely self-service.',
  },
  {
    title: 'Beyond bus retention',
    body: 'The healthy site is the source of truth; the missing window is copied across directly. Works in either direction.',
  },
  {
    title: 'Beyond both · or after corruption',
    body: 'Restore from the snapshot repository — the only reliable undo when a bad change was faithfully applied on both sides.',
  },
];

const ML_OPTIONS = [
  {
    title: 'Run jobs on secondary continuously',
    ongoing: 'Modest if ML capacity is underused',
    failover: 'None — models already warm',
  },
  {
    title: 'Restore model state from snapshots',
    ongoing: 'Low · more moving parts',
    failover: 'Bounded catch-up set by restore frequency',
  },
  {
    title: 'Start cold from secondary history',
    ongoing: 'None',
    failover: 'Longer warm-up · competes with everything else at cutover',
  },
];

const LINK_TYPES = [
  {
    id: 'vpn',
    label: 'VPN',
    latency: 'Variable · depends on path',
    notes: 'Encrypted overlay; simplest to stand up for secondary ingest reading the primary event bus.',
  },
  {
    id: 'direct',
    label: 'Direct link',
    latency: 'Lowest · dedicated circuit',
    notes: 'Private circuit between sites; best when secondary continuously consumes high-volume topics.',
  },
  {
    id: 'interconnect',
    label: 'Managed interconnect',
    latency: 'Low–moderate · provider SLA',
    notes: 'Cloud interconnect / exchange; good middle ground when clusters span regions or clouds.',
  },
];

function rtoFromRpo(rpoSeconds) {
  const basePromoteMin = 6;
  const orchestration = Math.max(0, (30 - Math.min(rpoSeconds, 30)) * 0.12);
  const catchUp = Math.sqrt(Math.max(rpoSeconds, 1)) * 0.28;
  const snapshotPenalty = rpoSeconds > 900 ? (rpoSeconds - 900) / 160 : 0;
  return Math.round(basePromoteMin + orchestration + catchUp + snapshotPenalty);
}

function strategyForRpo(rpoSeconds) {
  if (rpoSeconds <= 60) return 'dual';
  if (rpoSeconds <= 900) return 'dual-ops';
  return 'hybrid';
}

function PipelineStep({ label, active, dark }) {
  return (
    <div
      className={`rounded-lg px-2.5 py-1.5 text-[11px] sm:text-[12px] font-medium text-center ${
        active
          ? dark
            ? 'border border-[#64d2ff]/40 bg-[#64d2ff]/10 text-[#f5f5f7]'
            : 'border border-[#0071e3]/25 bg-[#0071e3]/8 text-[#1d1d1f]'
          : dark
            ? 'border border-dashed border-white/25 bg-transparent text-[#98989d]'
            : 'border border-dashed border-[#d2d2d7] bg-transparent text-[#86868b]'
      }`}
    >
      {label}
      {!active && <span className="block text-[10px] font-normal opacity-80 mt-0.5">standby</span>}
    </div>
  );
}

function ElasticClusterCard({ title, dark, mlActive, alertActive, storageNote }) {
  const card = dark
    ? 'border-white/15 bg-[#1c1c1e] text-[#f5f5f7]'
    : 'border-[#d2d2d7] bg-white text-[#1d1d1f]';
  const muted = dark ? 'text-[#98989d]' : 'text-[#86868b]';
  const accent = dark ? 'text-[#64d2ff]' : 'text-[#0071e3]';

  return (
    <div className={`rounded-2xl border p-3 sm:p-4 ${card}`}>
      <div className="flex items-center gap-2 mb-3">
        <Database className={`w-4 h-4 ${accent}`} />
        <div>
          <p className="text-[13px] font-semibold">{title}</p>
          <p className={`text-[11px] ${muted}`}>Elastic cluster</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <PipelineStep label="Ingest" active dark={dark} />
        <PipelineStep label="Transform" active dark={dark} />
        <PipelineStep label="ML" active={mlActive} dark={dark} />
        <PipelineStep label="Alerting" active={alertActive} dark={dark} />
      </div>
      {storageNote && (
        <p className={`mt-2 text-[10px] leading-snug rounded-lg px-2 py-1.5 ${
          dark ? 'bg-[#64d2ff]/10 text-[#64d2ff]' : 'bg-[#0071e3]/8 text-[#0071e3]'
        }`}
        >
          {storageNote}
        </p>
      )}
    </div>
  );
}

function DualIngestCostSection({ dark }) {
  const [open, setOpen] = useState(false);
  const card = dark ? 'border-white/10 bg-[#1c1c1e]' : 'border-[#d2d2d7] bg-white';
  const text = dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]';
  const muted = dark ? 'text-[#98989d]' : 'text-[#86868b]';

  return (
    <section className="mt-10">
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
          aria-expanded={open}
        >
          <div>
            <p className={`text-[12px] font-semibold uppercase tracking-wide ${muted}`}>
              Cost implications
            </p>
            <p className={`mt-1 text-[15px] font-semibold ${text}`}>
              Does dual ingest increase the cost?
            </p>
            <p className={`mt-1 text-[13px] ${muted}`}>
              Yes vs today’s single site — here’s what rises, what you buy, and how it compares.
            </p>
          </div>
          {open
            ? <ChevronUp className={`w-5 h-5 shrink-0 ${muted}`} />
            : <ChevronDown className={`w-5 h-5 shrink-0 ${muted}`} />}
        </button>

        {open && (
          <div className={`px-5 pb-5 border-t space-y-5 ${dark ? 'border-white/10' : 'border-[#d2d2d7]/80'}`}>
            <p className={`pt-4 text-[14px] leading-relaxed ${text}`}>
              <strong>Yes — vs today’s single-site setup, dual ingest costs more.</strong>
              {' '}That’s the trade for a warm, write-capable secondary.
            </p>

            <div>
              <p className={`text-[12px] font-semibold uppercase tracking-wide ${muted}`}>What goes up</p>
              <ul className={`mt-2 space-y-1.5 text-[13px] ${text}`}>
                {[
                  'Second Elastic cluster — compute + storage (mitigated on DR: 1 day hot, rest frozen)',
                  'Second Logstash tier (e.g. ×4) — another consumer group, continuous ingest',
                  'Cross-site network — DR reading Kafka topics from the primary site',
                  'Ops — two live estates (config drift, transforms, suppressed alerts, failover drills)',
                  'Optional ML on DR — if jobs stay warm instead of snapshot restore / cold start',
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <span className={dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className={`mt-2 text-[12px] ${muted}`}>
                Kafka staying primary-only avoids a second event bus. Frozen-tier ILM on DR cuts storage vs a full hot mirror without shortening retention.
              </p>
            </div>

            <div>
              <p className={`text-[12px] font-semibold uppercase tracking-wide ${muted}`}>What you’re buying</p>
              <ul className={`mt-2 space-y-1.5 text-[13px] ${text}`}>
                {[
                  'Failover ≈ routing, not restore-then-hope',
                  'Secondary already writing transforms (CCR followers don’t give you that)',
                  'A standby that does real work, not an idle museum piece',
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <span className={dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`overflow-x-auto rounded-xl border ${dark ? 'border-white/10' : 'border-[#d2d2d7]/80'}`}>
              <table className="w-full text-left text-[13px] min-w-[480px]">
                <thead>
                  <tr className={dark ? 'border-b border-white/10' : 'border-b border-[#d2d2d7]'}>
                    <th className={`px-3 py-2 font-semibold ${muted}`}>Path</th>
                    <th className={`px-3 py-2 font-semibold ${muted}`}>Day-2 cost shape</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Dual ingest', 'Highest steady ingest/compute; DR storage reduced with 1d hot + frozen'],
                    ['Dual ingest + ops', 'Dual ingest cost + Cluster 3 for ML/alerting/UI; CCS query load'],
                    ['Real-time CCR', 'Second cluster storage + continuous CCR bandwidth; weaker if DR must write'],
                    ['Hybrid CCR', 'Between the two; snapshots still mandatory'],
                  ].map(([path, shape]) => (
                    <tr key={path} className={dark ? 'border-t border-white/5' : 'border-t border-[#f0f0f2]'}>
                      <td className={`px-3 py-2 font-medium ${text}`}>{path}</td>
                      <td className={`px-3 py-2 ${muted}`}>{shape}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className={`text-[13px] leading-relaxed ${muted}`}>
              Snapshots are a must on all four — an added cost vs today either way (repo + storage + restore drills).
              Dual ingest and dual ingest + ops don’t replace that; they sit on top.
            </p>

            <div>
              <p className={`text-[12px] font-semibold uppercase tracking-wide ${muted}`}>Practical cost levers</p>
              <ul className={`mt-2 space-y-1.5 text-[13px] ${text}`}>
                {[
                  'Keep full DR retention — move older data to frozen instead of deleting lookback',
                  'ILM on DR: 1 day hot, remainder frozen (searchable, much cheaper than hot)',
                  'Also apply compression / index mode on both sites where safe',
                  'Keep DR alerting actions off and choose ML warm-start deliberately',
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <span className={dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className={`text-[14px] leading-relaxed ${text}`}>
              <strong>Bottom line:</strong> Dual ingest still costs more than a single site, but DR does not need a
              full hot-tier mirror — <strong>1 day hot + frozen for the rest</strong> preserves the complete view
              while cutting the largest storage line item.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function DualIngestHero({ dark }) {
  const card = dark
    ? 'border-white/15 bg-[#1c1c1e] text-[#f5f5f7]'
    : 'border-[#d2d2d7] bg-white text-[#1d1d1f]';
  const muted = dark ? 'text-[#98989d]' : 'text-[#86868b]';
  const line = dark ? 'bg-white/20' : 'bg-[#d2d2d7]';
  const accentBg = dark ? 'bg-[#64d2ff]' : 'bg-[#0071e3]';

  return (
    <div
      className={`mt-10 rounded-3xl border p-4 sm:p-8 overflow-x-auto ${
        dark ? 'border-white/10 bg-[#111113]' : 'border-[#d2d2d7]/80 bg-[#f5f5f7]'
      }`}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
          dark ? 'bg-white/10 text-[#98989d]' : 'bg-black/5 text-[#86868b]'
        }`}
        >
          Draft
        </span>
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
          dark ? 'bg-[#64d2ff]/15 text-[#64d2ff]' : 'bg-[#0071e3]/10 text-[#0071e3]'
        }`}
        >
          Dual Logstash ingest
        </span>
      </div>

      <div className="min-w-[640px] grid grid-cols-[88px_72px_1fr_100px] gap-3 items-stretch">
        <div className={`rounded-xl border p-3 flex flex-col items-center justify-center text-center ${
          dark ? 'border-[#64d2ff]/30 bg-[#0a84ff]/15' : 'border-[#0071e3]/30 bg-[#0071e3]/10'
        }`}
        >
          <Radio className={`w-5 h-5 ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`} />
          <p className={`mt-2 text-[13px] font-semibold ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Kafka</p>
          <p className={`text-[10px] mt-1 ${muted}`}>source of truth</p>
        </div>

        <div className="flex flex-col justify-between py-2 gap-4">
          {['Production', 'DR'].map(label => (
            <div key={label} className={`rounded-xl border p-2 text-center ${card}`}>
              <HardDrive className={`w-4 h-4 mx-auto ${dark ? 'text-[#c4a484]' : 'text-[#8b6914]'}`} />
              <p className="text-[11px] font-semibold mt-1">{label}</p>
              <p className={`text-[10px] ${muted}`}>Logstash ×4</p>
            </div>
          ))}
        </div>

        <div className="relative flex flex-col gap-3">
          <ElasticClusterCard title="Production" dark={dark} mlActive alertActive storageNote="Hot / warm / cold as today" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className={`rounded-md border px-2 py-1 text-[10px] font-semibold shadow-sm ${
              dark ? 'border-white/20 bg-[#2c2c2e] text-[#f5f5f7]' : 'border-[#d2d2d7] bg-white text-[#1d1d1f]'
            }`}
            >
              Object storage
              <span className={`block font-normal ${dark ? 'text-[#ff9f0a]' : 'text-[#bf4800]'}`}>required</span>
            </div>
          </div>
          <ElasticClusterCard
            title="DR"
            dark={dark}
            mlActive={false}
            alertActive={false}
            storageNote="1 day hot · rest frozen (cost)"
          />
          <div className={`pointer-events-none absolute -left-3 top-[22%] w-3 h-0.5 ${line}`}>
            <div className={`h-full w-full ${accentBg} ccr-flow-pulse opacity-70`} />
          </div>
          <div className={`pointer-events-none absolute -left-3 bottom-[22%] w-3 h-0.5 ${line}`}>
            <div className={`h-full w-full ${accentBg} ccr-flow-pulse opacity-70`} />
          </div>
        </div>

        <div className={`rounded-xl border p-3 flex flex-col justify-center ${card}`}>
          <p className="text-[12px] font-semibold">Alert actions</p>
          <ul className={`mt-2 text-[11px] space-y-1 ${muted}`}>
            <li>Email</li>
            <li>API</li>
            <li>etc.</li>
          </ul>
          <p className={`mt-3 text-[10px] leading-snug ${muted}`}>
            Solid from production · dashed from DR until cutover
          </p>
        </div>
      </div>

      <p className={`mt-6 text-center text-[13px] max-w-2xl mx-auto ${muted}`}>
        Kafka fans out to two Logstash tiers (separate consumer groups). Both Elastic clusters ingest and
        transform. DR keeps the full lookback but lands data as{' '}
        <strong className={dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}>1 day hot, remainder frozen</strong>
        {' '}to cut storage cost. ML and alerting stay standby on DR until cutover. Shared object storage
        holds snapshots for corruption and catch-up.
      </p>
    </div>
  );
}

function OpsClusterHero({ dark }) {
  const card = dark
    ? 'border-white/15 bg-[#1c1c1e] text-[#f5f5f7]'
    : 'border-[#d2d2d7] bg-white text-[#1d1d1f]';
  const muted = dark ? 'text-[#98989d]' : 'text-[#86868b]';
  const accent = dark ? 'text-[#64d2ff]' : 'text-[#0071e3]';
  const line = dark ? 'bg-white/20' : 'bg-[#d2d2d7]';
  const accentBg = dark ? 'bg-[#64d2ff]' : 'bg-[#0071e3]';

  return (
    <div
      className={`mt-8 rounded-3xl border p-4 sm:p-8 overflow-x-auto ${
        dark ? 'border-white/10 bg-[#111113]' : 'border-[#d2d2d7]/80 bg-[#f5f5f7]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
          dark ? 'bg-white/10 text-[#98989d]' : 'bg-black/5 text-[#86868b]'
        }`}
        >
          Draft · meeting
        </span>
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
          dark ? 'bg-[#64d2ff]/15 text-[#64d2ff]' : 'bg-[#0071e3]/10 text-[#0071e3]'
        }`}
        >
          Dual ingest + ops cluster
        </span>
      </div>

      <div className="min-w-[720px] grid grid-cols-[80px_72px_1fr_minmax(160px,200px)_88px] gap-3 items-stretch">
        <div className={`rounded-xl border p-3 flex flex-col items-center justify-center text-center ${
          dark ? 'border-[#64d2ff]/30 bg-[#0a84ff]/15' : 'border-[#0071e3]/30 bg-[#0071e3]/10'
        }`}
        >
          <Radio className={`w-5 h-5 ${accent}`} />
          <p className={`mt-2 text-[13px] font-semibold ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Kafka</p>
          <p className={`text-[10px] mt-1 ${muted}`}>dual-fed</p>
        </div>

        <div className="flex flex-col justify-between py-2 gap-4">
          {['Polaris', 'Titan'].map(label => (
            <div key={label} className={`rounded-xl border p-2 text-center ${card}`}>
              <HardDrive className={`w-4 h-4 mx-auto ${dark ? 'text-[#c4a484]' : 'text-[#8b6914]'}`} />
              <p className="text-[11px] font-semibold mt-1">{label}</p>
              <p className={`text-[10px] ${muted}`}>Logstash ×4</p>
            </div>
          ))}
        </div>

        <div className="relative flex flex-col gap-3">
          <ElasticClusterCard
            title="Production (Polaris) · Cluster 1"
            dark={dark}
            mlActive={false}
            alertActive={false}
            storageNote="Ingest · transform · data"
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className={`rounded-md border px-2 py-1 text-[10px] font-semibold shadow-sm ${
              dark ? 'border-white/20 bg-[#2c2c2e] text-[#f5f5f7]' : 'border-[#d2d2d7] bg-white text-[#1d1d1f]'
            }`}
            >
              Object storage
              <span className={`block font-normal ${dark ? 'text-[#ff9f0a]' : 'text-[#bf4800]'}`}>required</span>
            </div>
          </div>
          <ElasticClusterCard
            title="Production (Titan) · Cluster 2"
            dark={dark}
            mlActive={false}
            alertActive={false}
            storageNote="Full parity · dual ingest"
          />
          <div className={`pointer-events-none absolute -left-3 top-[22%] w-3 h-0.5 ${line}`}>
            <div className={`h-full w-full ${accentBg} ccr-flow-pulse opacity-70`} />
          </div>
          <div className={`pointer-events-none absolute -left-3 bottom-[22%] w-3 h-0.5 ${line}`}>
            <div className={`h-full w-full ${accentBg} ccr-flow-pulse opacity-70`} />
          </div>
        </div>

        <div className={`rounded-2xl border p-3 sm:p-4 flex flex-col ${card}`}>
          <div className="flex items-center gap-2 mb-2">
            <Link2 className={`w-4 h-4 ${accent}`} />
            <div>
              <p className="text-[13px] font-semibold">Operational · Cluster 3</p>
              <p className={`text-[11px] ${muted}`}>CCS · Titan or Polaris</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1.5 flex-1">
            <PipelineStep label="ML" active dark={dark} />
            <PipelineStep label="Alerting" active dark={dark} />
            <PipelineStep label="Dashboards" active dark={dark} />
          </div>
          <p className={`mt-2 text-[10px] leading-snug ${muted}`}>
            Cross-cluster search into Clusters 1 &amp; 2
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className={`rounded-xl border p-3 flex-1 ${card}`}>
            <p className="text-[12px] font-semibold">Users</p>
            <p className={`mt-1 text-[10px] leading-snug ${muted}`}>
              Land on Cluster 3 dashboards only
            </p>
          </div>
          <div className={`rounded-xl border p-3 flex-1 ${card}`}>
            <p className="text-[12px] font-semibold">Alert actions</p>
            <ul className={`mt-1 text-[10px] space-y-0.5 ${muted}`}>
              <li>Email</li>
              <li>API</li>
              <li>etc.</li>
            </ul>
          </div>
        </div>
      </div>

      <p className={`mt-6 text-center text-[13px] max-w-3xl mx-auto ${muted}`}>
        Full ingest workload dual-fed into Polaris and Titan to keep data parity. Ingest and transforms
        stay on Clusters 1 &amp; 2. Cluster 3 owns ML, alerting, and dashboards over CCS — users never
        hit the write path directly. Shared object storage remains required under every path.
      </p>

      <div className={`mt-6 overflow-x-auto rounded-2xl border ${card}`}>
        <table className="w-full text-left text-[13px] min-w-[520px]">
          <thead>
            <tr className={dark ? 'border-b border-white/10' : 'border-b border-[#d2d2d7]'}>
              <th className={`px-4 py-3 font-semibold ${muted}`}>Component</th>
              <th className={`px-4 py-3 font-semibold ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Role</th>
            </tr>
          </thead>
          <tbody>
            {OPS_CLUSTER_MATRIX.map(row => (
              <tr key={row.component} className={dark ? 'border-t border-white/5' : 'border-t border-[#f0f0f2]'}>
                <td className={`px-4 py-2.5 font-medium ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>{row.component}</td>
                <td className={`px-4 py-2.5 ${muted}`}>{row.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeaturedDesign({ dark }) {
  const card = dark ? 'border-white/10 bg-[#1c1c1e]' : 'border-[#d2d2d7] bg-white';
  const text = dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]';
  const muted = dark ? 'text-[#98989d]' : 'text-[#86868b]';

  return (
    <section className="mt-16">
      <p className={`section-eyebrow ${dark ? '!text-[#98989d]' : ''}`}>Proposed architecture</p>
      <h2 className={`section-title mt-2 ${dark ? '!text-[#f5f5f7]' : ''}`}>
        Dual Logstash · identical Elastic estate
      </h2>
      <p className={`section-lead mt-3 ${dark ? '!text-[#98989d]' : ''}`}>
        Kafka stays on the production site. Separate Logstash consumer groups feed complete Elastic
        clusters on both sides. DR uses{' '}
        <strong className={dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}>1 day hot + frozen for the rest</strong>
        {' '}so the logical dataset stays complete without mirroring production hot-tier spend. Transforms
        stay active on DR; ML and alert actions stay standby until cutover.
      </p>

      <div className={`mt-8 overflow-x-auto rounded-2xl border ${card}`}>
        <table className="w-full text-left text-[13px] min-w-[560px]">
          <thead>
            <tr className={dark ? 'border-b border-white/10' : 'border-b border-[#d2d2d7]'}>
              <th className={`px-4 py-3 font-semibold ${muted}`}>Component</th>
              <th className={`px-4 py-3 font-semibold ${text}`}>Primary site</th>
              <th className={`px-4 py-3 font-semibold ${text}`}>Secondary site</th>
            </tr>
          </thead>
          <tbody>
            {SITE_MATRIX.map(row => (
              <tr key={row.component} className={dark ? 'border-t border-white/5' : 'border-t border-[#f0f0f2]'}>
                <td className={`px-4 py-3 font-medium ${text}`}>{row.component}</td>
                <td className={`px-4 py-3 ${muted}`}>{row.primary}</td>
                <td className={`px-4 py-3 ${muted}`}>{row.secondary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {[
          { icon: Workflow, title: 'Transforms decide it', body: 'If transforms write during ingest, the secondary cannot be a read-only replica.' },
          { icon: Layers, title: 'Independence', body: 'If the secondary falls behind, its consumer group catches up later. The primary does not notice.' },
          { icon: Shield, title: 'One address', body: 'A single endpoint follows the active site. Cutover stays deliberate — reachable is not the same as current.' },
        ].map(item => (
          <div key={item.title} className={`rounded-2xl border p-4 ${card}`}>
            <item.icon className={`w-5 h-5 ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`} />
            <p className={`mt-2 text-[14px] font-semibold ${text}`}>{item.title}</p>
            <p className={`mt-1 text-[12px] leading-relaxed ${muted}`}>{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-3">
        {RECOVERY_TIERS.map((tier, i) => (
          <div key={tier.title} className={`rounded-2xl border p-4 ${card}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wide ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`}>
              Tier {i + 1}
            </p>
            <p className={`mt-1 text-[14px] font-semibold ${text}`}>{tier.title}</p>
            <p className={`mt-1 text-[12px] leading-relaxed ${muted}`}>{tier.body}</p>
          </div>
        ))}
      </div>

      <div
        className={`mt-6 rounded-2xl border p-5 ${
          dark ? 'border-[#ff9f0a]/40 bg-[#ff9f0a]/10' : 'border-[#bf4800]/30 bg-[#bf4800]/5'
        }`}
      >
        <p className={`text-[12px] font-semibold uppercase tracking-wide ${dark ? 'text-[#ff9f0a]' : 'text-[#bf4800]'}`}>
          Must · {SNAPSHOT_BASELINE.title}
        </p>
        <p className={`mt-1 text-[13px] font-medium ${text}`}>{SNAPSHOT_BASELINE.subtitle}</p>
        <ul className={`mt-3 space-y-1.5 text-[13px] ${muted}`}>
          {SNAPSHOT_BASELINE.points.map(point => (
            <li key={point} className="flex gap-2">
              <span className={dark ? 'text-[#ff9f0a]' : 'text-[#bf4800]'}>•</span>
              <span className={text}>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-6 rounded-2xl border p-5 ${card}`}>
        <p className={`text-[12px] font-semibold uppercase tracking-wide ${muted}`}>Machine learning warm-start</p>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {ML_OPTIONS.map(opt => (
            <div key={opt.title}>
              <p className={`text-[13px] font-medium ${text}`}>{opt.title}</p>
              <p className={`text-[12px] mt-1 ${muted}`}>Ongoing: {opt.ongoing}</p>
              <p className={`text-[12px] ${muted}`}>At failover: {opt.failover}</p>
            </div>
          ))}
        </div>
      </div>

      <p className={`mt-4 text-[12px] ${muted}`}>
        Covered: loss or corruption of search/ingest/UI on the primary. Not covered by initial scope:
        loss of the whole primary site including the event bus — events stop at source until the bus
        is recovered. Align requirements language with that boundary.
      </p>
    </section>
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
        Start from recovery point objective, then check whether the secondary must write.
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
        Four choices
      </h2>
      <p className={`section-lead mt-3 ${dark ? '!text-[#98989d]' : ''}`}>
        Pick one path. Every path includes the shared snapshot repository as a must — that capability does not exist today.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {STRATEGIES.map(s => {
          const highlighted = highlightId === s.id;
          const emphasize = highlighted || s.featured;
          return (
            <article
              key={s.id}
              className={`rounded-2xl border p-5 flex flex-col ${
                emphasize
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
                {emphasize && (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    dark ? 'bg-[#64d2ff]/15 text-[#64d2ff]' : 'bg-[#0071e3]/10 text-[#0071e3]'
                  }`}
                  >
                    {s.featured ? 'Leading' : 'Match'}
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
        Adjust the RPO target to see how recovery time and strategy tend to shift. Illustrative only.
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
              Under ~15 minutes RPO, dual ingest (± ops cluster) keeps cutover as routing. Looser RPO shifts work into restore.
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
        Toggle how the secondary reaches the primary event bus and shared snapshot repository.
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
        className={`mt-6 rounded-2xl border p-6 sm:p-8 ${
          dark ? 'border-white/10 bg-[#111113]' : 'border-[#d2d2d7] bg-[#f5f5f7]'
        }`}
      >
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          <div className={`rounded-xl border p-4 text-center ${dark ? 'border-white/15 bg-[#1c1c1e]' : 'border-[#d2d2d7] bg-white'}`}>
            <HardDrive className={`w-6 h-6 mx-auto ${dark ? 'text-[#64d2ff]' : 'text-[#0071e3]'}`} />
            <p className={`mt-2 text-[14px] font-semibold ${dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
              Primary site
            </p>
            <p className={`text-[12px] ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
              Event bus · ingest · complete cluster
            </p>
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
            <p className={`text-[12px] ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
              Ingest · 1d hot + frozen · warm standby
            </p>
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
          <p className={`section-eyebrow ${dark ? '!text-[#98989d]' : ''}`}>Site disaster recovery</p>
          <h1 className={`mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight leading-[1.1] ${
            dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'
          }`}
          >
            Dual-site recovery architecture
          </h1>
          <p className={`mt-3 text-[17px] leading-relaxed max-w-2xl ${dark ? 'text-[#98989d]' : 'text-[#86868b]'}`}>
            Interactive walkthrough of the draft design: four paths, one mandatory snapshot repository.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDark(v => !v)}
          className={`inline-flex items-center gap-2 text-[13px] px-3 py-2 rounded-full border ${
            dark
              ? 'border-white/20 text-[#f5f5f7] hover:bg-white/5'
              : 'border-[#d2d2d7] text-[#1d1d1f] hover:bg-black/[0.04]'
          }`}
          aria-pressed={dark}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? 'Light' : 'Dark'}
        </button>
      </div>

      <DualIngestHero dark={dark} />
      <OpsClusterHero dark={dark} />
      <DualIngestCostSection dark={dark} />
      <FeaturedDesign dark={dark} />
      <DecisionTree dark={dark} rpoChoice={rpoChoice} setRpoChoice={setRpoChoice} />
      <StrategyCards dark={dark} highlightId={highlightId} />
      <RecoveryTimeline dark={dark} rpoSeconds={rpoSeconds} setRpoSeconds={setRpoSeconds} />
      <NetworkTopology dark={dark} />
    </div>
  );
}

export default CcrArchitectureExplainer;
