import { useState } from 'react';
import {
  Search, Activity, Shield, Menu, X, Radio,
} from 'lucide-react';
import { LiveElasticDemo } from './components/LiveElasticDemo';
import { ChatSimulator } from './components/ChatSimulator';
import { ObservabilityDashboard } from './components/ObservabilityDashboard';
import { SecurityDashboard } from './components/SecurityDashboard';

const MODULES = [
  { id: 'live', label: 'Network Telemetry', icon: Radio, focus: 'Business-relevant OTel by regionID · network SLAs · ML & workflows', live: true },
  { id: 'search', label: 'Enterprise Search', icon: Search, focus: 'Enterprise Search & AI assistant · customer care deflection' },
  { id: 'observability', label: 'Observability', icon: Activity, focus: 'Unified metrics, traces & logs at telco scale' },
  { id: 'security', label: 'Elastic Security', icon: Shield, focus: 'SIEM · Entity Analytics · NOC workflows · threat intel' },
];

const MODULE_COMPONENTS = {
  live: LiveElasticDemo,
  search: ChatSimulator,
  observability: ObservabilityDashboard,
  security: SecurityDashboard,
};

export default function App() {
  const [activeModule, setActiveModule] = useState('live');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ActiveComponent = MODULE_COMPONENTS[activeModule];
  const activeMeta = MODULES.find(m => m.id === activeModule);
  const isLive = activeModule === 'live';

  return (
    <div className="min-h-screen bg-elastic-light">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-telco-magenta flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm font-bold text-telco-magenta leading-tight">Telco NOC</h1>
                  <p className="text-[10px] text-elastic-gray leading-tight">× Elastic Serverless Demo</p>
                </div>
              </div>
              <div className="hidden md:block h-6 w-px bg-gray-200" />
              <div className="hidden md:flex items-center gap-1 text-[10px] text-elastic-gray">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${isLive ? 'bg-success' : 'bg-elastic-teal'}`} />
                {isLive ? 'Live · 5G core & network telemetry' : '2PB logs · 800M spans/min · 150TB security/day'}
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {MODULES.map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveModule(mod.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? mod.live ? 'bg-success text-white' : 'bg-elastic-teal text-white'
                        : 'text-elastic-gray hover:bg-gray-100 hover:text-elastic-dark'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {mod.label}
                    {mod.live && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-gray-100 px-4 py-2 space-y-1">
            {MODULES.map(mod => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => { setActiveModule(mod.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                    activeModule === mod.id
                      ? mod.live ? 'bg-success text-white' : 'bg-elastic-teal text-white'
                      : 'text-elastic-gray'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {mod.label}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeMeta && (
          <p className="text-xs text-elastic-gray mb-4">
            Focus: <strong>{activeMeta.focus}</strong>
            {!isLive && ' · simulated demo data'}
          </p>
        )}
        <ActiveComponent />
      </main>

      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-elastic-gray">
          <p>
            Telco NOC × Elastic Serverless Demo
            {isLive ? ' · Live data from Elastic Cloud Serverless' : ' · Simulated sample data'}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-elastic-teal" />
              Elastic Stack
            </span>
            <span>DR Backup · Cost Optimization · Unified Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
