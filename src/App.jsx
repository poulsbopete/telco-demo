import { useState } from 'react';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { LiveElasticDemo } from './components/LiveElasticDemo';
import { AdaptiveNetworksDemo } from './components/AdaptiveNetworksDemo';
import { ChatSimulator } from './components/ChatSimulator';
import { ObservabilityDashboard } from './components/ObservabilityDashboard';
import { SecurityDashboard } from './components/SecurityDashboard';
import { IncidentResponseDemo } from './components/IncidentResponseDemo';
import { SlidesEmbed, PresenterEmbed, WorkshopDeckEmbed } from './components/FrameEmbed';
import { WorkshopLabEmbed } from './components/WorkshopLabEmbed';
import { ExecutiveOutcomesBanner } from './components/shared/ExecutiveOutcomesBanner';
import { CcrArchitectureExplainer } from './components/CcrArchitectureExplainer';
import { AutomobileTelematicsDemo } from './components/AutomobileTelematicsDemo';

const MODULES = [
  { id: 'live', label: 'iPhone Launch', navLabel: 'Launch', live: true },
  { id: 'telematics', label: 'Telematics', live: true },
  { id: 'adaptive-networks', label: 'Networks', live: true },
  { id: 'incident-response', label: 'Response' },
  { id: 'search', label: 'Search' },
  { id: 'observability', label: 'Scale' },
  { id: 'security', label: 'Security' },
  { id: 'ccr', label: 'Site DR' },
];

/** Instruqt invite — set VITE_INSTRUQT_URL after publishing the track invite */
const INSTRUQT_URL =
  import.meta.env.VITE_INSTRUQT_URL
  || 'https://play.instruqt.com/elastic/invite/0ehftwwsuadb';

const MODULE_COMPONENTS = {
  live: LiveElasticDemo,
  telematics: AutomobileTelematicsDemo,
  'adaptive-networks': AdaptiveNetworksDemo,
  'incident-response': IncidentResponseDemo,
  search: ChatSimulator,
  observability: ObservabilityDashboard,
  security: SecurityDashboard,
  ccr: CcrArchitectureExplainer,
  slides: SlidesEmbed,
  presenter: PresenterEmbed,
  'workshop-deck': WorkshopDeckEmbed,
  workshop: () => <WorkshopLabEmbed instruqtUrl={INSTRUQT_URL} />,
};

const IMMERSIVE = new Set(['slides', 'presenter', 'workshop-deck', 'workshop']);

function NavButton({ id, label, activeModule, setActiveModule, title }) {
  return (
    <button
      type="button"
      onClick={() => setActiveModule(id)}
      className={`nav-link whitespace-nowrap shrink-0 ${activeModule === id ? 'nav-link-active' : ''}`}
      title={title}
    >
      {label}
    </button>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState('live');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [outcomesOpen, setOutcomesOpen] = useState(false);

  const ActiveComponent = MODULE_COMPONENTS[activeModule];
  const activeMeta = MODULES.find(m => m.id === activeModule);
  const isImmersive = IMMERSIVE.has(activeModule);

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <header className="sticky top-0 z-50 bg-[#fbfbfd]/80 backdrop-blur-xl border-b border-[#d2d2d7]/60">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
          <div className="flex items-center gap-3 sm:gap-4 h-12">
            <button
              type="button"
              onClick={() => setActiveModule('live')}
              className="shrink-0 text-[17px] sm:text-[19px] font-semibold tracking-tight text-[#1d1d1f] whitespace-nowrap"
            >
              Telco NOC
            </button>

            <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-end gap-0.5 overflow-x-auto nav-scroll">
              {MODULES.map(mod => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveModule(mod.id)}
                  title={mod.label}
                  className={`nav-link whitespace-nowrap ${activeModule === mod.id ? 'nav-link-active' : ''}`}
                >
                  {mod.navLabel || mod.label}
                  {mod.live && activeModule !== mod.id && (
                    <span className="ml-1 text-[9px] text-[#008009] align-middle">●</span>
                  )}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-[#d2d2d7]/80 shrink-0" aria-hidden />
              <NavButton id="presenter" label="Presenter" activeModule={activeModule} setActiveModule={setActiveModule} />
              <NavButton id="slides" label="Slides" activeModule={activeModule} setActiveModule={setActiveModule} />
              <NavButton
                id="workshop"
                label="Workshop"
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                title="Hands-on Instruqt lab — metrics, ML, workflows"
              />
            </nav>

            <button
              type="button"
              className="lg:hidden ml-auto p-2 -mr-2 text-[#1d1d1f] shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-[#d2d2d7]/60 px-4 sm:px-6 py-3 space-y-1 bg-[#fbfbfd] max-h-[70vh] overflow-y-auto">
            {[
              ...MODULES.map(m => ({ id: m.id, label: m.label })),
              { id: 'presenter', label: 'Presenter guides' },
              { id: 'slides', label: 'Slides' },
              { id: 'workshop', label: 'Workshop' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setActiveModule(item.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left py-2 text-[17px] ${
                  activeModule === item.id ? 'text-[#1d1d1f] font-semibold' : 'text-[#86868b]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className={isImmersive ? 'w-full' : 'max-w-[980px] mx-auto px-6 py-10 md:py-14'}>
        <ActiveComponent />
      </main>

      {!isImmersive && (
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
      )}

      {!isImmersive && (
        <footer className="border-t border-[#d2d2d7]/60 mt-4">
          <div className="max-w-[980px] mx-auto px-6 py-6 text-[12px] text-[#86868b] leading-relaxed">
            <p>Telco NOC × Elastic Serverless</p>
            <p className="mt-1">
              {activeMeta?.live ? 'Live cluster data.' : 'Simulated sample data.'}
              {' '}Synthetic demo content only.
            </p>
            <p className="mt-2">
              Hands-on lab — metrics, ML, and remediating telco incidents on Elastic Serverless.
              {' '}
              <button
                type="button"
                onClick={() => setActiveModule('workshop')}
                className="text-[#0071e3] hover:underline"
              >
                Try the workshop
              </button>
            </p>
            <p className="mt-2">
              <button type="button" onClick={() => setActiveModule('presenter')} className="text-[#0071e3] hover:underline">Presenter</button>
              {' · '}
              <button type="button" onClick={() => setActiveModule('slides')} className="text-[#0071e3] hover:underline">Slides</button>
              {' · '}
              <button type="button" onClick={() => setActiveModule('workshop-deck')} className="text-[#0071e3] hover:underline">Workshop deck</button>
              {' · '}
              <button type="button" onClick={() => setActiveModule('workshop')} className="text-[#0071e3] hover:underline">Workshop</button>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
