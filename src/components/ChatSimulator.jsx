import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Bot, User, ChevronRight, Sparkles,
  DollarSign, GitBranch, Zap,
} from 'lucide-react';
import { semanticSearch } from '../utils/semantic-search';
import { evaluateRules, getCustomers } from '../utils/rules-engine';
import { ModuleHeader, DemoBanner, StatCard } from './shared/ModuleHeader';

const QUICK_PROMPTS = [
  "I just signed up but haven't confirmed my email",
  'What are Telco credit limits?',
  'My account is locked after too many login attempts',
  'What are the legal requirements for Telco Credit?',
  'How do I activate my debit card?',
  'What are the PCI compliance requirements?',
];

export function ChatSimulator() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: 'Telco IVR/Chat Simulator — powered by Elastic Enterprise Search + ELSER',
    },
  ]);
  const [input, setInput] = useState('');
  const [customerId, setCustomerId] = useState('CUST-1001');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const messagesEnd = useRef(null);
  const customers = getCustomers();

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: query }]);

    // Simulate ELSER inference latency (< 500ms target)
    await new Promise(r => setTimeout(r, 120 + Math.random() * 200));

    const searchResult = semanticSearch(query);
    const customer = customers.find(c => c.customer_id === customerId);
    const topMatch = searchResult.results[0];
    const ruleResult = evaluateRules(customer, topMatch);

    setLastResult({ searchResult, ruleResult });

    const responseText = [
      ruleResult.resolution,
      ruleResult.matchedDoc ? `\n\n📄 Source: ${ruleResult.matchedDoc.title}` : '',
      ruleResult.matchedDoc?.legal_context ? `\n\n⚖️ ${ruleResult.matchedDoc.legal_context}` : '',
      `\n\n💰 Automated resolution: $${ruleResult.costSavings.automated.toFixed(2)} vs human support: $${ruleResult.costSavings.human.toFixed(2)} (${ruleResult.costSavings.savingsPercent}% savings)`,
    ].join('');

    setMessages(prev => [...prev, { role: 'assistant', content: responseText, meta: ruleResult }]);
    setLoading(false);
  }

  return (
    <div>
      <ModuleHeader
        title="Enterprise Search & Conversational AI"
        subtitle="ELSER semantic intent matching + hierarchical navigation + rule-based context engine"
        badge="ELSER v2"
      >
        <select
          value={customerId}
          onChange={e => setCustomerId(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
        >
          {customers.map(c => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.name} ({c.lifecycle_stage}, {c.account_state})
            </option>
          ))}
        </select>
      </ModuleHeader>

      <DemoBanner />

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-telco-magenta text-white' :
                  msg.role === 'assistant' ? 'bg-elastic-teal text-white' : 'bg-gray-100'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> :
                   msg.role === 'assistant' ? <Bot className="w-4 h-4" /> :
                   <Sparkles className="w-4 h-4 text-elastic-gray" />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user' ? 'bg-telco-magenta text-white rounded-br-sm' :
                  msg.role === 'assistant' ? 'bg-elastic-light text-elastic-dark rounded-bl-sm' :
                  'bg-gray-50 text-elastic-gray text-xs italic'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-elastic-teal flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="p-3 rounded-xl bg-elastic-light text-sm text-elastic-gray">
                  ELSER processing intent...
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setInput(p)}
                className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-elastic-gray hover:bg-elastic-teal/10 hover:text-elastic-teal transition-colors"
              >
                {p.length > 40 ? `${p.slice(0, 40)}…` : p}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a customer support question..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elastic-teal/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-elastic-teal text-white rounded-lg hover:bg-elastic-teal/90 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {lastResult ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-elastic-dark mb-3">
                  <GitBranch className="w-4 h-4 text-elastic-teal" />
                  Reasoning Chain
                </h3>
                <div className="space-y-2">
                  {lastResult.ruleResult.reasoning.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-1 text-elastic-teal shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-elastic-dark">{step.step}</span>
                        <p className="text-xs text-elastic-gray">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-elastic-dark mb-3">
                  <Sparkles className="w-4 h-4 text-elastic-teal" />
                  ELSER Match
                </h3>
                {lastResult.searchResult.results.slice(0, 3).map(doc => (
                  <div key={doc.doc_id} className="mb-2 last:mb-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-elastic-dark">{doc.title}</span>
                      <span className={`text-xs font-bold ${
                        doc.confidence > 0.7 ? 'text-success' : doc.confidence > 0.4 ? 'text-warning' : 'text-elastic-gray'
                      }`}>
                        {(doc.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-full bg-elastic-teal rounded-full transition-all"
                        style={{ width: `${doc.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-elastic-gray mt-2">
                  Search time: {lastResult.searchResult.searchTimeMs}ms · {lastResult.searchResult.model}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <StatCard
                  label="Auto Cost"
                  value={`$${lastResult.ruleResult.costSavings.automated.toFixed(2)}`}
                  highlight
                />
                <StatCard
                  label="Human Cost"
                  value={`$${lastResult.ruleResult.costSavings.human.toFixed(2)}`}
                />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-elastic-gray">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-elastic-teal/50" />
              <p className="text-sm">Submit a query to see the reasoning chain</p>
              <p className="text-xs mt-1">Try: &quot;I haven&apos;t confirmed my email&quot; with Alex Rivera selected</p>
            </div>
          )}

          <div className="bg-telco-magenta/5 rounded-xl border border-telco-magenta/20 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-telco-magenta mb-2">
              <DollarSign className="w-4 h-4" />
              Cost Impact
            </div>
            <p className="text-xs text-elastic-gray">
              Elastic + ELSER resolves ~60% of IVR calls automatically at $0.02–$0.25 per interaction vs $6–$45 for human agents.
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-success font-medium">
              <Zap className="w-3 h-3" />
              20-second transfer eliminated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatSimulator;
