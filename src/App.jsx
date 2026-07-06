import { useState } from 'react';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { LiveElasticDemo } from './components/LiveElasticDemo';
import { AdaptiveNetworksDemo } from './components/AdaptiveNetworksDemo';
import { ChatSimulator } from './components/ChatSimulator';
import { ObservabilityDashboard } from './components/ObservabilityDashboard';
import { SecurityDashboard } from './components/SecurityDashboard';
import { IncidentResponseDemo } from './components/IncidentResponseDemo';
import { ExecutiveOutcomesBanner } from './components/shared/ExecutiveOutcomesBanner';

const MODULES = [
  { id: 'live', label: 'Telemetry', live: true },
  { id: 'adaptive-networks', label: 'Networks', live: true },
  { id: 'incident-response', label: 'Response' },
  { id: 'search', label: 'Search' },
  { id: 'observability', label: 'Scale' },
  { id: 'security', label: 'Security' },
];

const MODULE_COMPONENTS = {
  live: LiveElasticDemo,
  'adaptive-networks': AdaptiveNetworksDemo,
  'incident-response': IncidentResponseDemo,
  search: ChatSimulator,
  observability: ObservabilityDashboard,
  security: SecurityDashboard,
};

export default function App() {
  const [activeModule, setActiveModule] = useState('live');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [outcomesOpen, setOutcomesOpen] = useState(false);

  const ActiveComponent = MODULE_COMPONENTS[activeModule];
  const activeMeta = MODULES.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <header className="sticky top-0 z-50 bg-[#fbfbfd]/80 backdrop-blur-xl border-b border-[#d2d2d7]/60">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex items-center justify-between h-11">
            <button
              type="button"
              onClick={() => setActiveModule('live')}
              className="text-[21px] font-semibold tracking-tight text-[#1d1d1f]"
            >
              Telco NOC
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {MODULES.map(mod => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveModule(mod.id)}
                  className={`nav-link ${activeModule === mod.id ? 'nav-link-active' : ''}`}
                >
                  {mod.label}
                  {mod.live && activeModule !== mod.id && (
                    <span className="ml-1 text-[10px] text-[#008009]">●</span>
                  )}
                </button>
              ))}
              <a href="/presenter/" className="nav-link ml-2">Presenter</a>
              <a href="/slides/" className="nav-link">Slides</a>
            </nav>

            <button
              type="button"
              className="md:hidden p-2 -mr-2 text-[#1d1d1f]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[#d2d2d7]/60 px-6 py-3 space-y-1 bg-[#fbfbfd]">
            {MODULES.map(mod => (
              <button
                key={mod.id}
                type="button"
                onClick={() => { setActiveModule(mod.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left py-2 text-[17px] ${
                  activeModule === mod.id ? 'text-[#1d1d1f] font-semibold' : 'text-[#86868b]'
                }`}
              >
                {mod.label}
              </button>
            ))}
            <a href="/presenter/" className="block py-2 text-[17px] text-[#86868b]">Presenter guides</a>
            <a href="/slides/" className="block py-2 text-[17px] text-[#86868b]">Slides</a>
          </nav>
        )}
      </header>

      <main className="max-w-[980px] mx-auto px-6 py-10 md:py-14">
        <ActiveComponent />
      </main>

      <section className="max-w-[980px] mx-auto px-6 pb-8">
        <button
          type="button"
          onClick={() => setOutcomesOpen(v => !v)}
          className="disclosure w-full py-4 flex items-center justify-between text-left text-[14px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        >
          <span>Executive outcomes</span>
          {outcomesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {outcomesOpen && (
          <ExecutiveOutcomesBanner compact className="mb-8 border-0 shadow-none" />
        )}
      </section>

      <footer className="border-t border-[#d2d2d7]/60 mt-4">
        <div className="max-w-[980px] mx-auto px-6 py-6 text-[12px] text-[#86868b] leading-relaxed">
          <p>Telco NOC × Elastic Serverless</p>
          <p className="mt-1">
            {activeMeta?.live ? 'Live cluster data.' : 'Simulated sample data.'}
            {' '}Synthetic demo content only.
          </p>
          <p className="mt-2">
            <a href="/presenter/view.html?doc=demo-walk" className="text-[#0071e3] hover:underline">Demo walk script</a>
            {' · '}
            <a href="/presenter/view.html?doc=landscape" className="text-[#0071e3] hover:underline">Telco landscape</a>
            {' · '}
            <a href="/slides/" className="text-[#0071e3] hover:underline">Slides</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
