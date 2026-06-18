import { useState, useMemo } from 'react';
import { Bot, Calculator, GitBranch, Server, TrendingDown } from 'lucide-react';
import {
  calculateObservabilityCost,
  calculateSecurityCost,
  getSecurityScenarioComparisons,
  ELASTIC_SERVERLESS_PRICING_URL,
  ELASTIC_PRICING_EFFECTIVE,
  HYBRID_CAPABILITIES,
  HYBRID_DEFAULTS,
  FEDERATION_ARCHITECTURE,
  OBSERVABILITY_VOLUME_TIERS,
  TELCO_O11Y_VOLUMES,
  getTieredPricingMatrix,
  getVolumeTierById,
  formatNumber,
  formatCompactUsd,
  formatCompactCount,
  formatDailyVolume,
  traceVolumeFromSpansPerMinute,
} from '../utils/cost-calculator';

function CostTotal({ amount, variant = 'elastic' }) {
  const colors = {
    elastic: 'text-elastic-teal',
    hybrid: 'text-telco-magenta',
    onPrem: 'text-elastic-dark',
    legacy: 'text-elastic-gray',
  };
  const color = colors[variant] || colors.elastic;
  const full = `$${amount.toLocaleString()}`;

  return (
    <div className={`mt-2 w-full max-w-full ${color}`} title={`${full}/mo`}>
      <p className="text-sm @md:text-base @3xl:text-lg font-bold tabular-nums leading-tight tracking-tight">
        <span className="inline-block max-w-full">{formatCompactUsd(amount)}</span>
        <span className="text-[10px] @md:text-xs font-semibold opacity-75 whitespace-nowrap">/mo</span>
      </p>
    </div>
  );
}

function CostCard({ title, titleClassName = 'text-elastic-gray', className = '', children }) {
  return (
    <div className={`@container flex flex-col p-3 rounded-lg min-w-0 w-full ${className}`}>
      <p className={`text-[11px] font-medium leading-snug ${titleClassName}`}>
        {title}
      </p>
      <div className="w-full max-w-full min-w-0">{children}</div>
    </div>
  );
}

function DiscountBadge({ pct, label = 'enterprise discount' }) {
  const text = pct ? `${pct}% ${label} applied` : label;
  if (!text) return null;
  return (
    <p className="text-[10px] font-medium text-elastic-teal mt-1">{text}</p>
  );
}

function CostBreakdown({ lines }) {
  return (
    <ul className="mt-2 space-y-0.5 text-[10px] text-elastic-gray leading-snug">
      {lines.map(line => (
        <li key={line} className="break-words">{line}</li>
      ))}
    </ul>
  );
}

function SavingsLine({ label, amount, percent, baseline }) {
  return (
    <p className="flex items-start gap-2 text-xs sm:text-sm">
      <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="min-w-0 break-words">
        {label} saves {formatCompactUsd(amount)}/mo vs {baseline} ({percent}%)
      </span>
    </p>
  );
}

const PAYPAL_TIER = OBSERVABILITY_VOLUME_TIERS.find(t => t.isTelcoAnchor) || OBSERVABILITY_VOLUME_TIERS[2];

function TierPricingTable({ rows }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[520px] text-[10px] sm:text-xs border-collapse">
        <thead>
          <tr className="text-left text-elastic-gray border-b border-gray-100">
            <th className="py-2 pr-2 font-semibold">Volume tier</th>
            <th className="py-2 px-1 font-semibold text-elastic-dark">Self-hosted</th>
            <th className="py-2 px-1 font-semibold text-telco-magenta">Split + A2A</th>
            <th className="py-2 pl-1 font-semibold text-elastic-teal">Serverless</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={row.id}
              className={`border-b border-gray-50 ${row.isTelcoAnchor ? 'bg-elastic-teal/5' : ''}`}
            >
              <td className="py-2.5 pr-2 align-top">
                <p className="font-semibold text-elastic-dark">{row.label}</p>
                <p className="text-[10px] text-elastic-gray mt-0.5 leading-snug">{row.description}</p>
                <p className="text-[10px] text-elastic-teal mt-1">
                  SL {row.serverlessDiscountPct}% · on-prem {row.onPremDiscountPct}% off list
                </p>
              </td>
              <td className="py-2.5 px-1 font-semibold text-elastic-dark tabular-nums">
                {formatCompactUsd(row.monthly.selfHosted)}
              </td>
              <td className="py-2.5 px-1 font-semibold text-telco-magenta tabular-nums">
                {formatCompactUsd(row.monthly.hybrid)}
              </td>
              <td className="py-2.5 pl-1 font-semibold text-elastic-teal tabular-nums">
                {formatCompactUsd(row.monthly.serverless)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CostCalculator({ mode = 'observability' }) {
  const [selectedTierId, setSelectedTierId] = useState(mode === 'observability' ? PAYPAL_TIER.id : 'custom');
  const [logsTB, setLogsTB] = useState(mode === 'observability' ? PAYPAL_TIER.logsTBPerDay : 300);
  const [metricsPerMin, setMetricsPerMin] = useState(
    mode === 'observability' ? PAYPAL_TIER.metricsPerMinute / 1_000_000 : 500,
  );
  const [spansPerMin, setSpansPerMin] = useState(
    mode === 'observability' ? PAYPAL_TIER.spansPerMinute / 1_000_000 : 1200,
  );
  const [retention, setRetention] = useState(mode === 'security' ? 365 : 90);
  const [serverlessSharePct, setServerlessSharePct] = useState(Math.round(HYBRID_DEFAULTS.serverlessShare * 100));
  const [serverlessHotDays, setServerlessHotDays] = useState(HYBRID_DEFAULTS.serverlessRetentionDays);
  const [onPremArchiveDays, setOnPremArchiveDays] = useState(HYBRID_DEFAULTS.onPremRetentionDays);
  const [selfHostedRetentionDays, setSelfHostedRetentionDays] = useState(365);
  const [deployMode, setDeployMode] = useState('all');

  const activeTier = useMemo(
    () => getVolumeTierById(selectedTierId),
    [selectedTierId],
  );

  const tierDiscounts = useMemo(() => (
    activeTier
      ? { serverlessPct: activeTier.serverlessDiscountPct, onPremPct: activeTier.onPremDiscountPct }
      : undefined
  ), [activeTier]);

  const applyTier = (tier) => {
    setSelectedTierId(tier.id);
    setLogsTB(tier.logsTBPerDay);
    setMetricsPerMin(tier.metricsPerMinute / 1_000_000);
    setSpansPerMin(tier.spansPerMinute / 1_000_000);
  };

  const markCustomTier = () => {
    if (selectedTierId !== 'custom') setSelectedTierId('custom');
  };

  const hybridOptions = useMemo(() => ({
    serverlessShare: serverlessSharePct / 100,
    serverlessRetentionDays: serverlessHotDays,
    onPremRetentionDays: onPremArchiveDays,
  }), [serverlessSharePct, serverlessHotDays, onPremArchiveDays]);

  const obsCost = useMemo(
    () => calculateObservabilityCost({
      logsTBPerDay: logsTB,
      metricsPerMinute: metricsPerMin * 1_000_000,
      spansPerMinute: spansPerMin * 1_000_000,
      retentionDays: retention,
      hybridOptions,
      selfHostedRetentionDays,
      discounts: tierDiscounts,
      volumeTierId: selectedTierId === 'custom' ? null : selectedTierId,
    }),
    [logsTB, metricsPerMin, spansPerMin, retention, hybridOptions, selfHostedRetentionDays, tierDiscounts, selectedTierId]
  );

  const tieredPricing = useMemo(
    () => getTieredPricingMatrix({
      retentionDays: retention,
      selfHostedRetentionDays,
      hybridOptions,
    }),
    [retention, selfHostedRetentionDays, hybridOptions],
  );

  const secCost = useMemo(
    () => calculateSecurityCost({ securityTBPerDay: logsTB, retentionDays: retention }),
    [logsTB, retention]
  );

  const securityScenarios = useMemo(() => getSecurityScenarioComparisons(), []);

  const currentDiscounts = obsCost.inputs.discounts;

  const traceVolume = useMemo(
    () => traceVolumeFromSpansPerMinute(spansPerMin * 1_000_000),
    [spansPerMin],
  );

  if (mode === 'security') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 min-w-0 w-full max-w-full overflow-visible @container">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-elastic-teal" />
          <h3 className="font-semibold text-elastic-dark">Security TCO Calculator</h3>
        </div>
        <p className="text-xs text-elastic-gray mb-3">
          Compare Elastic Security Serverless against an illustrative legacy SIEM model at telco scale. Uses official Complete-tier rates ·{' '}
          <a
            href={ELASTIC_SERVERLESS_PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-elastic-teal hover:underline"
          >
            elastic.co/pricing
          </a>
        </p>
        <label className="block text-sm text-elastic-gray mb-2">
          Security data volume: <strong>{logsTB} TB/day</strong>
          <span className="text-xs text-elastic-gray ml-1">(illustrative legacy baseline)</span>
        </label>
        <input
          type="range"
          min={50}
          max={500}
          value={logsTB}
          onChange={e => setLogsTB(Number(e.target.value))}
          className="w-full accent-elastic-teal"
        />
        <label className="block text-xs text-elastic-gray mt-3 mb-1">
          Retention: <strong>{retention} days</strong>
        </label>
        <input
          type="range"
          min={30}
          max={365}
          value={retention}
          onChange={e => setRetention(Number(e.target.value))}
          className="w-full accent-elastic-teal"
        />
        <div className="grid grid-cols-2 gap-4 mt-4 min-w-0">
          <div className="p-3 rounded-lg bg-elastic-teal/5 border border-elastic-teal/20 min-w-0">
            <p className="text-xs text-elastic-gray">Target · {secCost.elasticLabel}</p>
            <CostTotal amount={secCost.elastic} variant="elastic" />
            <p className="text-[10px] text-elastic-gray mt-1">Search AI Lake · SIEM + retention</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 min-w-0">
            <p className="text-xs text-elastic-gray">Baseline · {secCost.legacyLabel}</p>
            <CostTotal amount={secCost.legacy} variant="legacy" />
            <p className="text-[10px] text-elastic-gray mt-1">Illustrative legacy SIEM model</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-success text-sm font-medium">
          <TrendingDown className="w-4 h-4" />
          ${secCost.savings.amount.toLocaleString()}/mo savings vs illustrative legacy baseline ({secCost.savings.percent}%)
        </div>
        <p className="text-[10px] text-elastic-gray mt-2 italic">{secCost.migrationNote}</p>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-elastic-gray uppercase mb-2">Reference scenarios</p>
          <div className="space-y-1.5">
            {securityScenarios.map(s => (
              <div key={s.label} className="flex justify-between text-[10px] gap-2">
                <span className="text-elastic-gray shrink-0">{s.label}</span>
                <span className="text-right">
                  <span className="text-elastic-teal font-medium">${s.elastic.toLocaleString()}</span>
                  <span className="text-elastic-gray mx-1">vs legacy</span>
                  <span className="text-elastic-gray">${s.legacy.toLocaleString()}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const h = obsCost.hybrid;
  const sh = obsCost.selfHosted;
  const showHybrid = deployMode === 'all' || deployMode === 'hybrid';
  const showSelfHosted = deployMode === 'all' || deployMode === 'self-hosted';

  const DEPLOY_MODES = [
    { id: 'all', label: 'Compare all' },
    { id: 'self-hosted', label: 'Self-hosted only' },
    { id: 'hybrid', label: 'Split + A2A' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 min-w-0 w-full max-w-full overflow-visible @container">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-elastic-teal" />
        <h3 className="font-semibold text-elastic-dark">Elastic Deployment TCO Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {DEPLOY_MODES.map(mode => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setDeployMode(mode.id)}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              deployMode === mode.id
                ? 'bg-elastic-teal text-white border-elastic-teal'
                : 'bg-white text-elastic-gray border-gray-200 hover:border-elastic-teal/40'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="mb-4 p-3 rounded-lg bg-telco-magenta/5 border border-telco-magenta/15">
        <p className="text-xs font-semibold text-elastic-dark mb-2">Volume commitment tiers</p>
        <p className="text-[10px] text-elastic-gray mb-3 leading-relaxed">
          Tiered pricing anchored on telco production volumes: {TELCO_O11Y_VOLUMES.logsLabel} logs,{' '}
          {TELCO_O11Y_VOLUMES.metricsLabel}, {TELCO_O11Y_VOLUMES.spansLabel}.{' '}
          Enterprise discount: 30% Serverless · 85% on-prem at all tiers.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {OBSERVABILITY_VOLUME_TIERS.map(tier => (
            <button
              key={tier.id}
              type="button"
              onClick={() => applyTier(tier)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                selectedTierId === tier.id
                  ? 'bg-telco-magenta text-white border-telco-magenta'
                  : 'bg-white text-elastic-gray border-gray-200 hover:border-telco-magenta/40'
              }`}
            >
              {tier.label}
            </button>
          ))}
          {selectedTierId === 'custom' && (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-elastic-gray border border-gray-200">
              Custom volumes
            </span>
          )}
        </div>
        {activeTier && (
          <p className="text-[10px] text-elastic-gray">
            Effective Serverless Complete:{' '}
            <strong className="text-elastic-teal">
              ${obsCost.effectiveRates.serverless.ingestPerGB.toFixed(3)}/GB ingest
            </strong>
            {' · '}
            <strong className="text-elastic-teal">
              ${obsCost.effectiveRates.serverless.retentionPerGBMonth.toFixed(4)}/GB retained/mo
            </strong>
            {' '}(list ${obsCost.serverless.ingestRate}/${obsCost.serverless.retentionRate} minus {currentDiscounts.serverlessPct}%).
            {' '}On-prem TCO: {currentDiscounts.onPremPct}% off illustrative list.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-elastic-gray">
            Log volume: <strong>{logsTB >= 1024 ? `${(logsTB / 1024).toFixed(1)} PB` : `${logsTB} TB`}/day</strong>
          </label>
          <input
            type="range"
            min={10}
            max={3072}
            step={10}
            value={logsTB}
            onChange={e => { markCustomTier(); setLogsTB(Number(e.target.value)); }}
            className="w-full accent-elastic-teal mt-1"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-elastic-gray">
              Metrics: <strong>{metricsPerMin} M/min</strong>
            </label>
            <input
              type="range"
              min={50}
              max={2000}
              step={50}
              value={metricsPerMin}
              onChange={e => { markCustomTier(); setMetricsPerMin(Number(e.target.value)); }}
              className="w-full accent-elastic-teal mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-elastic-gray">
              Traces:{' '}
              <strong>
                {spansPerMin} M/min
                {spansPerMin >= 1000 ? ` (${(spansPerMin / 1000).toFixed(1)}B/min)` : ''}
                {' · '}
                {formatDailyVolume(traceVolume.tbPerDay)}
              </strong>
            </label>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={spansPerMin}
              onChange={e => { markCustomTier(); setSpansPerMin(Number(e.target.value)); }}
              className="w-full accent-elastic-teal mt-1"
            />
            <p className="text-[10px] text-elastic-gray mt-1">
              {traceVolume.spansPerDay.toLocaleString()} spans/day · ~{traceVolume.bytesPerSpan.toLocaleString()} B/span indexed
              {spansPerMin === 1200 && (
                <span className="text-elastic-teal"> · RFP reference (1.2B/min ≈ 3 PB/day)</span>
              )}
            </p>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[10px] text-elastic-gray leading-relaxed">
          <p className="font-semibold text-elastic-dark">Trace volume validation (RFP)</p>
          <p className="mt-0.5">{obsCost.volumes.traceValidation.summary}</p>
        </div>
        <div>
          <label className="text-xs text-elastic-gray">Retention window: {retention} days</label>
          <input
            type="range"
            min={7}
            max={365}
            value={retention}
            onChange={e => setRetention(Number(e.target.value))}
            className="w-full accent-elastic-teal mt-1"
          />
          <p className="text-[10px] text-elastic-gray mt-1">
            Elastic Serverless uses published{' '}
            <a
              href={ELASTIC_SERVERLESS_PRICING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-elastic-teal hover:underline"
            >
              Complete tier
            </a>{' '}
            rates (${obsCost.serverless.ingestRate}/GB ingest · ${obsCost.serverless.retentionRate}/GB retained/mo, effective {ELASTIC_PRICING_EFFECTIVE})
            {' '}with tiered enterprise discount ({currentDiscounts.serverlessPct}% Serverless, {currentDiscounts.onPremPct}% on-prem).
          </p>
        </div>

        {showSelfHosted && (
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <p className="text-xs font-semibold text-elastic-dark flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-elastic-dark" />
              Self-hosted Elastic (Telco DC)
            </p>
            <p className="text-[10px] text-elastic-gray leading-relaxed">
              100% self-managed cluster — no Serverless ingest, no A2A federation. Single ES|QL boundary in your data center.
              {' '}Includes {currentDiscounts.onPremPct}% enterprise discount on illustrative TCO.
            </p>
            <div>
              <label className="text-xs text-elastic-gray">
                Retention: <strong>{selfHostedRetentionDays} days</strong>
                {selfHostedRetentionDays >= 365 && ` (${Math.round(selfHostedRetentionDays / 365)}yr)`}
              </label>
              <input
                type="range"
                min={30}
                max={1825}
                step={5}
                value={selfHostedRetentionDays}
                onChange={e => setSelfHostedRetentionDays(Number(e.target.value))}
                className="w-full accent-elastic-dark mt-1"
              />
            </div>
          </div>
        )}

        {showHybrid && (
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <p className="text-xs font-semibold text-elastic-dark flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-telco-magenta" />
            Split deployment (Serverless hot + on-prem archive)
          </p>
          <p className="text-[10px] text-elastic-gray leading-relaxed">
            <strong className="text-elastic-dark">Today:</strong> {FEDERATION_ARCHITECTURE.todayPattern} — agents call each tier over HTTPS, not CCS peering.
            {' '}<strong className="text-elastic-dark">Roadmap:</strong> {FEDERATION_ARCHITECTURE.ccsRoadmap} ({FEDERATION_ARCHITECTURE.ccsRoadmapEta}).
          </p>
          <div>
            <label className="text-xs text-elastic-gray">
              Serverless hot share: <strong>{serverlessSharePct}%</strong> of ingest
            </label>
            <input
              type="range"
              min={5}
              max={30}
              value={serverlessSharePct}
              onChange={e => setServerlessSharePct(Number(e.target.value))}
              className="w-full accent-telco-magenta mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-elastic-gray">Serverless retention: {serverlessHotDays}d</label>
              <input
                type="range"
                min={7}
                max={30}
                value={serverlessHotDays}
                onChange={e => setServerlessHotDays(Number(e.target.value))}
                className="w-full accent-elastic-teal mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-elastic-gray">On-prem archive: {onPremArchiveDays}d</label>
              <input
                type="range"
                min={90}
                max={1825}
                step={5}
                value={onPremArchiveDays}
                onChange={e => setOnPremArchiveDays(Number(e.target.value))}
                className="w-full accent-telco-magenta mt-1"
              />
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 @3xl:grid-cols-3 gap-3 mt-5 min-w-0 w-full">
        {showSelfHosted && (
          <CostCard
            title="Self-hosted · Telco DC"
            titleClassName="text-elastic-dark"
            className={`bg-gray-100 border-2 border-gray-300 ${
              deployMode === 'self-hosted' ? 'ring-2 ring-gray-400/30' : ''
            }`}
          >
            <CostTotal amount={sh.total} variant="onPrem" />
            <DiscountBadge pct={sh.enterpriseDiscountPct} />
            <CostBreakdown lines={[
              `${sh.retentionDays}d retention · ${formatCompactCount(sh.storedTB)} TB stored`,
              `Ingest ${formatCompactUsd(sh.ingest)} · Retention ${formatCompactUsd(sh.retention)}`,
              `Platform ${formatCompactUsd(sh.platform)}`,
            ]} />
          </CostCard>
        )}
        {showHybrid && (
          <CostCard
            title="Split deployment · Serverless + on-prem"
            titleClassName="text-telco-magenta"
            className={`bg-telco-magenta/5 border-2 border-telco-magenta/25 ${
              deployMode === 'hybrid' ? 'ring-2 ring-telco-magenta/20' : ''
            }`}
          >
            <CostTotal amount={h.total} variant="hybrid" />
            <DiscountBadge
              label={`SL ${currentDiscounts.serverlessPct}% · on-prem ${currentDiscounts.onPremPct}% enterprise discounts applied`}
            />
            <CostBreakdown lines={[
              h.ingestModel,
              `Serverless hot ${formatCompactUsd(h.serverless.total)} · on-prem archive ${formatCompactUsd(h.onPrem.total)}`,
              `Ingest ${formatCompactUsd(h.ingest)} · Retention ${formatCompactUsd(h.storage)} · A2A ${formatCompactUsd(h.platform)}`,
              `List ${formatCompactUsd(h.totalList)} before enterprise discounts`,
            ]} />
          </CostCard>
        )}
        {(deployMode === 'all' || deployMode === 'self-hosted' || deployMode === 'hybrid') && (
          <CostCard
            title="Serverless only · Observability Complete"
            className="bg-elastic-teal/5 border border-elastic-teal/20"
          >
            <CostTotal amount={obsCost.elastic.total} variant="elastic" />
            <DiscountBadge pct={obsCost.elastic.enterpriseDiscountPct} />
            <CostBreakdown lines={[
              `Ingest ${formatCompactUsd(obsCost.elastic.ingest)} · Retention ${formatCompactUsd(obsCost.elastic.storage)}`,
              `${formatCompactCount(obsCost.serverless.ingestGBPerMonth)} GB/mo ingested`,
              `${formatCompactCount(obsCost.serverless.storedGB)} GB stored`,
            ]} />
          </CostCard>
        )}
      </div>

      <div className="mt-3 space-y-1.5 text-success font-medium">
        {showSelfHosted && obsCost.savings.selfHostedVsServerless.amount > 0 && (
          <SavingsLine
            label="Self-hosted"
            amount={obsCost.savings.selfHostedVsServerless.amount}
            percent={obsCost.savings.selfHostedVsServerless.percent}
            baseline="Serverless-only"
          />
        )}
        {showHybrid && obsCost.savings.hybridVsServerless.amount > 0 && (
          <SavingsLine
            label="Split + A2A"
            amount={obsCost.savings.hybridVsServerless.amount}
            percent={obsCost.savings.hybridVsServerless.percent}
            baseline="Serverless-only"
          />
        )}
        {showSelfHosted && showHybrid && obsCost.savings.hybridVsSelfHosted.amount > 0 && (
          <SavingsLine
            label="Split + A2A"
            amount={obsCost.savings.hybridVsSelfHosted.amount}
            percent={obsCost.savings.hybridVsSelfHosted.percent}
            baseline="Self-hosted"
          />
        )}
      </div>
      <p className="text-xs text-elastic-gray mt-2 italic">{obsCost.drNote}</p>
      <div className="mt-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-[10px] text-elastic-gray leading-relaxed">
        <p className="font-semibold text-elastic-dark">Architecture note</p>
        <p className="mt-0.5">{FEDERATION_ARCHITECTURE.ccsRoadmapDetail}</p>
        <p className="mt-1">{FEDERATION_ARCHITECTURE.ccsNetworkNote}</p>
      </div>
      <p className="text-[10px] text-elastic-gray mt-2">
        Elastic rates:{' '}
        <a
          href={ELASTIC_SERVERLESS_PRICING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-elastic-teal hover:underline"
        >
          elastic.co/pricing/serverless-observability
        </a>
        {' '}({ELASTIC_PRICING_EFFECTIVE}). On-prem split costs are illustrative. CCS not included — use A2A federation today.
      </p>

      {(deployMode === 'all' || deployMode === 'hybrid') && (
      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-elastic-gray uppercase">Federation &amp; roadmap</p>
        {HYBRID_CAPABILITIES.map(cap => (
          <div key={cap.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px]">
            <p className="font-semibold text-elastic-dark flex items-center gap-1">
              {cap.id === 'a2a' && <Bot className="w-3 h-3 text-telco-magenta" />}
              {cap.id === 'ccs-roadmap' && <GitBranch className="w-3 h-3 text-elastic-gray" />}
              {cap.id === 'retention' && <Server className="w-3 h-3 text-telco-magenta" />}
              {cap.title}
            </p>
            <p className="text-elastic-gray mt-0.5">{cap.detail}</p>
            <p className="text-elastic-gray/80 mt-1 italic">{cap.consideration}</p>
          </div>
        ))}
      </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-elastic-gray uppercase mb-2">Tiered pricing · all deployment options</p>
        <p className="text-[10px] text-elastic-gray mb-3">
          Monthly estimates at 90d Serverless retention, 365d self-hosted, split defaults (12% hot / 14d SL · 100% archive / 730d on-prem).
        </p>
        <TierPricingTable rows={tieredPricing} />
      </div>
    </div>
  );
}

export default CostCalculator;
