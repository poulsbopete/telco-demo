/**
 * Mock ELSER semantic search — simulates Elastic Learned Sparse Encoder
 * intent matching using keyword overlap + semantic phrase boosting.
 * Replace with real ELSER inference endpoint for production integration.
 */
import productData from '../data/telco-services.json';

const SEMANTIC_PHRASES = {
  'email verification': ['account_email_verification'],
  'confirm email': ['account_email_verification'],
  'new account setup': ['account_email_verification'],
  'password reset': ['account_security_lockout'],
  'account locked': ['account_security_lockout'],
  'locked out': ['account_security_lockout'],
  '2fa': ['account_security_lockout'],
  'credit limit': ['paypal_credit_limits'],
  'paypal credit': ['paypal_credit_limits', 'paypal_credit_legal'],
  'credit eligibility': ['paypal_credit_limits'],
  'withdrawal limit': ['account_withdrawal_limits'],
  'transaction limit': ['account_withdrawal_limits'],
  'debit card': ['debit_card_activation'],
  'activate card': ['debit_card_activation'],
  'pci compliance': ['pci_compliance_overview'],
  'kyc': ['kyc_aml_requirements'],
  'aml': ['kyc_aml_requirements'],
  'gdpr': ['regional_eu_gdpr'],
  'legal disclosure': ['paypal_credit_legal'],
  'checkout integration': ['checkout_integration'],
  'business account': ['business_multi_user'],
};

function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function scoreDocument(queryTokens, doc) {
  const docTokens = new Set([
    ...tokenize(doc.title),
    ...tokenize(doc.content),
    ...doc.keywords.flatMap(k => tokenize(k)),
    ...doc.domain_path.flatMap(p => tokenize(p)),
  ]);

  let matchCount = 0;
  for (const token of queryTokens) {
    if (docTokens.has(token)) matchCount++;
    for (const dt of docTokens) {
      if (dt.includes(token) || token.includes(dt)) matchCount += 0.5;
    }
  }

  const baseScore = matchCount / Math.max(queryTokens.length, 1);
  return Math.min(baseScore, 1);
}

export function semanticSearch(query, { limit = 3 } = {}) {
  const start = performance.now();
  const queryLower = query.toLowerCase().trim();
  const queryTokens = tokenize(query);

  const phraseBoosts = {};
  for (const [phrase, docIds] of Object.entries(SEMANTIC_PHRASES)) {
    if (queryLower.includes(phrase)) {
      for (const id of docIds) phraseBoosts[id] = 0.35;
    }
  }

  const scored = productData.documents.map(doc => {
    let score = scoreDocument(queryTokens, doc);
    if (phraseBoosts[doc.doc_id]) score += phraseBoosts[doc.doc_id];
    return { ...doc, confidence: Math.min(Math.round(score * 100) / 100, 0.99) };
  });

  scored.sort((a, b) => b.confidence - a.confidence);
  const results = scored.filter(r => r.confidence > 0.1).slice(0, limit);
  const elapsed = Math.round(performance.now() - start);

  return {
    query,
    results: results.length ? results : [scored[0]].filter(Boolean),
    searchTimeMs: Math.max(elapsed, 45),
    model: 'ELSER v2 (mock)',
  };
}

export function getTaxonomy() {
  return productData.taxonomy;
}

export function getDocuments() {
  return productData.documents;
}

export default semanticSearch;
