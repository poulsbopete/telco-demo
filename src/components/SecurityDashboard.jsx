import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, AlertTriangle, Search, FileText, Clock,
  Users, Target, CheckCircle, ExternalLink, Bot, Lock, ArrowRight, Zap, Loader2,
} from 'lucide-react';
import { AlertFeed } from './shared/AlertFeed';
import { CostCalculator } from './CostCalculator';
import { ElasticWorkflowLink } from './ElasticWorkflowLink';
import { ModuleHeader, StatCard } from './shared/ModuleHeader';
import { ElasticDeepLinks, SectionElasticLink } from './shared/ElasticDeepLinks';
import { MlSignalIntelligence } from './shared/MlSignalIntelligence';
import { buildDemoMlSignalIntelligence } from '../lib/ml-signal-intelligence';
import { IPHONE_LAUNCH } from '../lib/iphone-launch-event';
import { LaunchEventStrip } from './shared/LaunchEventStrip';
import { TimeSeriesChart } from './shared/TimeSeriesChart';
import {
  generateSecurityFeed,
  generateSecurityIngestionStats,
  generateMetricsSeries,
} from '../utils/data-generator';
import { formatNumber, LEGACY_SECURITY_MAP } from '../utils/cost-calculator';
import {
  kibanaDiscoverUrl,
  kibanaSecurityUrl,
  getSecurityKibanaUrl,
  kibanaSecurityDashboardUrl,
  openSecurityCase,
  runSecurityIncidentWorkflow,
} from '../lib/elastic-api';
import detectionRules from '../data/detection-rules.json';

function extractCaseFromA2A(result) {
  const artifacts = result?.response?.result?.artifacts || result?.response?.artifacts || [];
  const caseArtifact = artifacts.find(a => a.artifactId === 'case-bundle');
  return caseArtifact?.parts?.[0]?.data || null;
}

const SECURITY_CONNECTORS = [
  'PagerDuty', 'ServiceNow', 'Jira', 'Slack', 'CrowdStrike', 'Okta', 'MS Sentinel', 'Webhook',
];

const RULE_TYPE_LABELS = {
  threshold: 'Threshold',
  eql: 'EQL',
  esql: 'ES|QL',
  ml: 'Machine Learning',
};

export function SecurityDashboard() {
  const securityKibanaUrl = getSecurityKibanaUrl();
  const securityDashboardUrl = kibanaSecurityDashboardUrl(securityKibanaUrl);
  const [alerts, setAlerts] = useState(() => generateSecurityFeed(10));
  const [stats, setStats] = useState(() => generateSecurityIngestionStats());
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [threatTrend, setThreatTrend] = useState(() => generateMetricsSeries(20));
  const [investigationQuery, setInvestigationQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseResult, setCaseResult] = useState(null);
  const [caseError, setCaseError] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowRun, setWorkflowRun] = useState(null);
  const [workflowError, setWorkflowError] = useState(null);
  const [isolateLoading, setIsolateLoading] = useState(false);
  const [isolateResult, setIsolateResult] = useState(null);

  const securityLinks = useMemo(() => ({
    alerts: kibanaSecurityUrl(securityKibanaUrl, 'alerts'),
    cases: kibanaSecurityUrl(securityKibanaUrl, 'cases'),
    rules: kibanaSecurityUrl(securityKibanaUrl, 'rules'),
    entityAnalytics: kibanaSecurityUrl(securityKibanaUrl, 'entityAnalytics'),
    attackDiscovery: kibanaSecurityUrl(securityKibanaUrl, 'attackDiscovery'),
    overview: kibanaSecurityUrl(securityKibanaUrl, 'overview'),
  }), [securityKibanaUrl]);

  const refresh = useCallback(() => {
    setStats(generateSecurityIngestionStats());
    setThreatTrend(generateMetricsSeries(20));
    if (Math.random() > 0.6) {
      setAlerts(prev => [generateSecurityFeed(1)[0], ...prev.slice(0, 9)]);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  function handleInvestigate(e) {
    e.preventDefault();
    const start = performance.now();
    setSearchResult(null);
    setTimeout(() => {
      setSearchResult({
        query: investigationQuery,
        hits: 12847 + Math.floor(Math.random() * 5000),
        timeMs: Math.round(performance.now() - start + 1800),
        splunkTimeMs: 42000 + Math.floor(Math.random() * 8000),
        legacyTimeMs: 42000 + Math.floor(Math.random() * 8000),
        timeRange: '2 years',
        index: 'logs-* , .alerts-security.*',
      });
    }, 200);
  }

  const activeAlert = selectedAlert || alerts[0];
  const discoverInvestigationUrl = kibanaDiscoverUrl(securityKibanaUrl, {
    query: investigationQuery
      ? `FROM logs-* | WHERE @timestamp >= NOW() - 2 years | WHERE ${investigationQuery.replace(/\s+AND\s+/gi, ' AND ')} | LIMIT 100`
      : undefined,
  });

  useEffect(() => {
    setCaseResult(null);
    setCaseError(null);
    setWorkflowRun(null);
    setWorkflowError(null);
    setIsolateResult(null);
  }, [activeAlert?.id]);

  async function handleCreateCase() {
    if (!activeAlert) return;
    setCaseLoading(true);
    setCaseError(null);
    try {
      const result = await openSecurityCase({
        alertId: activeAlert.alertId || activeAlert.id,
        threatType: activeAlert.threat_type,
        hostName: activeAlert['host.name'],
        userName: activeAlert['user.name'],
      });
      setCaseResult(extractCaseFromA2A(result));
    } catch (err) {
      setCaseError(err.message || 'Failed to create case');
    } finally {
      setCaseLoading(false);
    }
  }

  async function handleRunWorkflow() {
    if (!activeAlert) return;
    setWorkflowLoading(true);
    setWorkflowError(null);
    try {
      const run = await runSecurityIncidentWorkflow({
        alertId: activeAlert.alertId || activeAlert.id,
        threatType: activeAlert.threat_type,
        hostName: activeAlert['host.name'],
        userName: activeAlert['user.name'],
      });
      setWorkflowRun(run);
    } catch (err) {
      setWorkflowError(err.message || 'Failed to start workflow');
    } finally {
      setWorkflowLoading(false);
    }
  }

  function handleIsolateHost() {
    if (!activeAlert) return;
    setIsolateLoading(true);
    setIsolateResult(null);
    window.setTimeout(() => {
      setIsolateResult({
        host: activeAlert['host.name'],
        actionId: `defend-${Date.now().toString(36)}`,
        status: 'submitted',
        message: `Elastic Defend isolation queued for ${activeAlert['host.name']}`,
      });
      setIsolateLoading(false);
    }, 500);
  }

  const securityMlIntelligence = useMemo(() => ({
    ...buildDemoMlSignalIntelligence([]),
    funnel: {
      rawThresholdAlerts: 12400,
      mlScored: 890,
      correlatedActionable: 23,
      actionableNow: 8,
      watching: 15,
      proactiveWorkflowsReady: 8,
      suppressedNoise: 12377,
      noiseReductionPct: 99.8,
    },
    mlJobs: [
      { id: 'entity-risk-v2', label: 'Entity risk scoring', domain: 'security', lastScore: 0.89, linkedAnomalyId: 'ML-SEC-001' },
      { id: 'auth-anomaly-v1', label: 'Auth failure clustering', domain: 'security', lastScore: 0.76 },
      { id: 'dns-tunnel-ml', label: 'DNS tunnel detection', domain: 'security', lastScore: 0.82 },
    ],
    correlationWindow: 'Entity Analytics + ML · SIEM rule correlation',
    proactiveAvgLeadMin: 8,
  }), []);

  const securityMlAnomalies = useMemo(() => [
    {
      id: 'ML-SEC-001',
      title: 'Entity risk spike — lateral movement pattern',
      mlScore: 0.89,
      severity: 'high',
      domain: 'security',
      mlJobId: 'entity-risk-v2',
      regionId: 'NOC-SOC',
      regionName: 'Security operations',
      signal: 'User/host risk score 3.4σ above peer cohort · MITRE T1021',
      priorityScore: 89,
      proactiveLeadMin: 8,
      suppressedDuplicates: 412,
      status: 'actionable',
      correlatedDomains: ['security'],
    },
  ], []);

  return (
    <div>
      <ModuleHeader
        title="Elastic Security"
        subtitle="SIEM, entity analytics, and automated response on one platform."
      >
        <ElasticDeepLinks
          links={[
            { href: securityLinks.alerts, label: 'Alerts', primary: true },
            { href: securityDashboardUrl, label: 'Dashboard' },
            { href: securityLinks.cases, label: 'Cases' },
            { href: securityLinks.rules, label: 'Rules' },
          ]}
        />
      </ModuleHeader>

      <LaunchEventStrip className="mb-8" />

      <div className="surface-card p-5 mb-8">
        <MlSignalIntelligence
          intelligence={securityMlIntelligence}
          anomalies={securityMlAnomalies}
          compact
          showAnomalies={false}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Events/sec"
          value={formatNumber(stats.eventsPerSecond)}
          trend="Elastic Agent + Beats"
          highlight
          kibanaUrl={securityKibanaUrl}
          kibanaSection="alerts"
        />
        <StatCard
          label="Security Data"
          value={`${stats.tbPerDay.toFixed(0)} TB/day`}
          trend="Search AI Lake ingest"
          kibanaUrl={securityKibanaUrl}
          kibanaSection="security-overview"
        />
        <StatCard
          label="MTTD"
          value={`${stats.mttdMinutes.toFixed(1)} min`}
          trend={`MTTR: ${stats.mttrMinutes.toFixed(0)} min · Kibana Cases`}
          highlight
          kibanaUrl={securityKibanaUrl}
          kibanaSection="cases"
        />
        <StatCard
          label="Detection Queries"
          value={formatNumber(stats.queriesToday)}
          trend="ES|QL · EQL · ML rules"
          kibanaUrl={securityKibanaUrl}
          kibanaSection="rules"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-elastic-teal" />
                Elastic Security Posture
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-danger/5 rounded-lg">
                  <p className="text-2xl font-bold text-danger">{alerts.filter(a => a.severity === 'critical').length}</p>
                  <p className="text-xs text-elastic-gray">Critical alerts</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{alerts.filter(a => a.severity === 'high').length}</p>
                  <p className="text-xs text-elastic-gray">High alerts</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-warning">{alerts.filter(a => a.severity === 'medium').length}</p>
                  <p className="text-xs text-elastic-gray">Medium alerts</p>
                </div>
                <div className="text-center p-3 bg-success/5 rounded-lg">
                  <p className="text-2xl font-bold text-success">94%</p>
                  <p className="text-xs text-elastic-gray">Case close rate</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-telco-magenta" />
                PCI in Elastic Security
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-elastic-gray">PCI-scoped ingest</span>
                  <span className="font-semibold">{stats.pciTbPerDay.toFixed(0)} TB/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-elastic-gray">Retention policy</span>
                  <span className="font-semibold">92 days · Search AI Lake</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-success/5 rounded text-sm">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-success font-medium">Compliant — 0 open findings</span>
                </div>
                <div className="flex justify-between text-xs text-elastic-gray">
                  <span>Audit events (24h)</span>
                  <span>{formatNumber(2840000)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                SIEM Alert Feed
              </h3>
              {securityLinks.alerts && (
                <a
                  href={securityLinks.alerts}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-elastic-teal hover:underline flex items-center gap-1"
                >
                  Open in Kibana Security <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <AlertFeed alerts={alerts} onSelect={setSelectedAlert} selectedId={activeAlert?.id} />
          </div>

          {activeAlert && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-elastic-dark">Alert Investigation</h3>
                <span className="text-[10px] font-mono text-elastic-gray truncate max-w-[180px]">
                  {activeAlert.alert_index || '.alerts-security.alerts-default'}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-elastic-gray">Detection rule</span>
                    <span className="font-medium text-right">{activeAlert.rule_name || activeAlert.threat_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-elastic-gray">Rule type</span>
                    <span className="font-mono text-xs uppercase text-elastic-teal">
                      {RULE_TYPE_LABELS[activeAlert.rule_type] || activeAlert.rule_type || 'SIEM'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-elastic-gray">MITRE ATT&CK</span>
                    <span className="font-medium">{activeAlert.mitre_tactic || activeAlert.threat_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-elastic-gray">Risk score</span>
                    <span className={`font-bold ${
                      activeAlert.risk_score >= 80 ? 'text-danger' : activeAlert.risk_score >= 60 ? 'text-orange-600' : 'text-warning'
                    }`}>
                      {activeAlert.risk_score}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-elastic-gray">Entity blast radius</span>
                    <span className="font-medium">{activeAlert.blast_radius} hosts · Entity Analytics</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-elastic-gray">Correlated signals</span>
                    <span className="font-medium">{activeAlert.events_correlated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-elastic-gray">Status</span>
                    <span className="font-medium capitalize">{activeAlert.status || 'open'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-elastic-gray uppercase mb-2">AI-assisted response</p>
                  <p className="text-sm text-elastic-dark p-3 bg-elastic-teal/5 rounded-lg border border-elastic-teal/20">
                    {activeAlert.remediation}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleCreateCase}
                      disabled={caseLoading || workflowLoading}
                      className="text-xs px-3 py-1.5 bg-elastic-teal text-white rounded-lg inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      {caseLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Create Case
                    </button>
                    <button
                      type="button"
                      onClick={handleRunWorkflow}
                      disabled={workflowLoading || caseLoading}
                      className="text-xs px-3 py-1.5 bg-telco-magenta text-white rounded-lg inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      {workflowLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                      Run Elastic Workflow
                    </button>
                    <button
                      type="button"
                      onClick={handleIsolateHost}
                      disabled={isolateLoading || workflowLoading}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-elastic-gray inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      {isolateLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                      Isolate Host
                    </button>
                  </div>
                  <p className="text-[10px] text-elastic-gray mt-2">
                    Kibana Cases + Workflows replace standalone SOAR/PagerDuty routing
                  </p>

                  {(caseResult || caseError || workflowRun || workflowError || isolateResult) && (
                    <div className="mt-3 space-y-2">
                      {caseError && (
                        <p className="text-xs text-danger">{caseError}</p>
                      )}
                      {caseResult && (
                        <div className="p-2.5 rounded-lg bg-success/5 border border-success/20 text-xs">
                          <p className="font-medium text-success flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Case {caseResult.caseId} · {caseResult.status}
                          </p>
                          <p className="text-elastic-dark mt-1">{caseResult.title}</p>
                          {securityLinks.cases && (
                            <a
                              href={securityLinks.cases}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-elastic-teal mt-1.5 hover:underline"
                            >
                              Open in Kibana Cases <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {workflowError && (
                        <p className="text-xs text-danger">{workflowError}</p>
                      )}
                      {workflowRun && (
                        <div className="p-2.5 rounded-lg bg-telco-magenta/5 border border-telco-magenta/20 text-xs">
                          <p className="font-medium text-telco-magenta flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" />
                            {workflowRun.message}
                          </p>
                          {workflowRun.aiSummary && (
                            <p className="text-elastic-dark mt-1">{workflowRun.aiSummary}</p>
                          )}
                          {(workflowRun.kibanaExecutionId || workflowRun.kibanaWorkflowId) && (
                            <ElasticWorkflowLink
                              kibanaUrl={securityKibanaUrl}
                              workflowId={workflowRun.kibanaWorkflowId}
                              executionId={workflowRun.kibanaExecutionId}
                              href={workflowRun.kibanaExecutionUrl || workflowRun.kibanaWorkflowUrl}
                              className="inline-flex items-center gap-1 text-elastic-teal mt-1.5 hover:underline"
                            />
                          )}
                          {workflowRun.kibanaRunError && (
                            <p className="text-warning mt-1">{workflowRun.kibanaRunError}</p>
                          )}
                          {workflowRun.kibanaNote && !workflowRun.kibanaLinked && (
                            <p className="text-[10px] text-elastic-gray mt-1">{workflowRun.kibanaNote}</p>
                          )}
                          {workflowRun.steps?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {workflowRun.steps.slice(0, 4).map(step => (
                                <li key={step.id} className="text-[10px] text-elastic-gray flex gap-1.5">
                                  <span className={
                                    step.status === 'completed' ? 'text-success'
                                      : step.status === 'running' ? 'text-telco-magenta' : 'text-elastic-gray'
                                  }>
                                    ●
                                  </span>
                                  {step.name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {isolateResult && (
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                          <p className="font-medium text-elastic-dark">{isolateResult.message}</p>
                          <p className="text-[10px] text-elastic-gray mt-0.5">
                            Action ID {isolateResult.actionId} · Elastic Defend response
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-elastic-gray uppercase mb-2">Detection timeline</p>
                <div className="relative pl-4 border-l-2 border-elastic-teal/30 space-y-3">
                  {[
                    { time: '14:30:00', event: `Signal ingested — failed login from ${activeAlert['source.ip']}` },
                    { time: '14:30:45', event: `${activeAlert.events_correlated} correlated auth failures · threshold rule` },
                    { time: '14:31:02', event: 'Threat intel enrichment (OTX) — no known C2 match' },
                    { time: '14:31:12', event: `Rule match: ${activeAlert.rule_name || activeAlert.threat_type}` },
                    { time: '14:31:15', event: 'Entity Analytics blast radius calculated · risk score assigned' },
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-elastic-teal" />
                      <span className="text-[10px] text-elastic-gray">{item.time}</span>
                      <p className="text-xs text-elastic-dark">{item.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-elastic-teal" />
              Search AI Lake · Long-Term Investigation
            </h3>
            <p className="text-xs text-elastic-gray mb-3">
              Query years of security data in Search AI Lake with ES|QL — no cold-tier rehydration required.
            </p>
            <form onSubmit={handleInvestigate} className="flex gap-2">
              <input
                type="text"
                value={investigationQuery}
                onChange={e => setInvestigationQuery(e.target.value)}
                placeholder="e.g., user.name:john.doe AND event.category:authentication"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
              />
              <button type="submit" className="px-4 py-2 bg-elastic-teal text-white text-sm rounded-lg shrink-0">
                Search 2 Years
              </button>
            </form>
            {searchResult && (
              <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                <p className="text-sm text-success font-medium">
                  {searchResult.hits.toLocaleString()} events in {searchResult.timeMs}ms
                  <span className="text-elastic-gray font-normal"> · Elastic Search AI Lake</span>
                </p>
                <p className="text-xs text-elastic-gray mt-1">
                  {searchResult.timeRange} · {searchResult.index}
                </p>
                <p className="text-xs text-elastic-gray mt-1">
                  Illustrative legacy cold-tier query: ~{((searchResult.legacyTimeMs || searchResult.splunkTimeMs) / 1000).toFixed(0)}s
                  <span className="text-elastic-teal font-medium"> · {((searchResult.legacyTimeMs || searchResult.splunkTimeMs) / searchResult.timeMs).toFixed(0)}× faster with Elastic</span>
                </p>
                {discoverInvestigationUrl && (
                  <a
                    href={discoverInvestigationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-elastic-teal mt-2 hover:underline"
                  >
                    Open in Discover <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2">
                <FileText className="w-4 h-4 text-elastic-teal" />
                Detection Engine
              </h3>
              {securityLinks.rules && (
                <a
                  href={securityLinks.rules}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-elastic-teal hover:underline"
                >
                  Manage rules
                </a>
              )}
            </div>
            <div className="space-y-2">
              {detectionRules.map(rule => (
                <div key={rule.id} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-elastic-dark">{rule.name}</span>
                    <span className={`text-[10px] font-bold uppercase ${
                      rule.severity === 'critical' ? 'text-danger' : rule.severity === 'high' ? 'text-orange-600' : 'text-warning'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5 gap-2">
                    <p className="text-[10px] text-elastic-gray">{rule.mitre_tactic}</p>
                    <span className="text-[10px] font-mono text-elastic-teal uppercase">
                      {RULE_TYPE_LABELS[rule.rule_type] || rule.rule_type}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px]">
                    <span className="text-elastic-gray">{rule.matches_last_hour} matches/hr</span>
                    <span className={rule.enabled ? 'text-success' : 'text-elastic-gray'}>
                      {rule.enabled ? '● Active' : '○ Disabled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {securityLinks.rules ? (
              <a
                href={securityLinks.rules}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-3 text-center text-xs py-2 border border-dashed border-elastic-teal text-elastic-teal rounded-lg hover:bg-elastic-teal/5"
              >
                + Create rule in Kibana Security
              </a>
            ) : (
              <button type="button" className="w-full mt-3 text-xs py-2 border border-dashed border-elastic-teal text-elastic-teal rounded-lg hover:bg-elastic-teal/5">
                + Create rule from historical event
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-elastic-teal" />
              Kibana Connectors
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {SECURITY_CONNECTORS.map(name => (
                <span key={name} className="text-[10px] px-2 py-1 bg-gray-100 text-elastic-gray rounded-full">
                  {name}
                </span>
              ))}
            </div>
            <p className="text-xs text-elastic-gray mt-2">
              650+ Elastic Agent integrations · connector-driven alert routing, case updates, and automated response
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-elastic-teal" />
              Threat trend (24h)
            </h3>
            <TimeSeriesChart
              data={threatTrend}
              lines={[{ key: 'errorRate', name: 'Detection signals', color: '#bd271e' }]}
              height={120}
            />
          </div>

          <div className="bg-telco-magenta/5 rounded-xl border border-telco-magenta/20 p-4">
            <p className="text-sm font-semibold text-telco-magenta flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4" />
              Platform capability map
            </p>
            <p className="text-xs text-elastic-gray mt-1 mb-3">
              One platform for SIEM, UBA, SOAR, and long-term search — with Search AI Lake for multi-year investigations.
            </p>
            <div className="space-y-2">
              {LEGACY_SECURITY_MAP.map(row => (
                <div key={row.legacy} className="p-2 bg-white/70 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                    <span className="text-elastic-gray truncate">{row.legacy}</span>
                    <ArrowRight className="w-3 h-3 text-elastic-teal shrink-0" />
                    <span className="text-elastic-teal truncate">{row.elastic}</span>
                  </div>
                  <p className="text-[10px] text-elastic-gray mt-0.5">{row.detail}</p>
                </div>
              ))}
            </div>
            {securityLinks.overview && (
              <a
                href={securityLinks.overview}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-elastic-teal mt-3 hover:underline font-medium"
              >
                Open Elastic Security in Kibana <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <CostCalculator mode="security" />
      </div>
    </div>
  );
}

export default SecurityDashboard;
