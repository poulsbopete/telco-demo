/**
 * Rule-based context engine — routes customer queries to resolutions
 * based on lifecycle stage, account state, and matched document domain.
 */
import customers from '../data/sample-customers.json';

const RESOLUTION_TEMPLATES = {
  automated_guide: {
    action: 'Play automated IVR guide',
    channel: 'IVR + Chat',
    estimatedCost: 0.02,
    humanCost: 8.50,
  },
  guided_reset: {
    action: 'Initiate guided password reset flow',
    channel: 'Secure Chat',
    estimatedCost: 0.15,
    humanCost: 12.00,
  },
  eligibility_check: {
    action: 'Run eligibility assessment and present credit offer',
    channel: 'Chat + App',
    estimatedCost: 0.08,
    humanCost: 15.00,
  },
  compliance_routing: {
    action: 'Surface regulatory context and route to compliance specialist if needed',
    channel: 'Chat + Document Portal',
    estimatedCost: 0.25,
    humanCost: 45.00,
  },
  information: {
    action: 'Provide contextual information from knowledge base',
    channel: 'Chat',
    estimatedCost: 0.03,
    humanCost: 6.00,
  },
};

const STATE_RULES = [
  {
    id: 'new-unconfirmed-email',
    condition: (c) => c.lifecycle_stage === 'new_account' && c.account_state === 'unconfirmed_email',
    priority: 10,
    override: {
      resolution: 'Trigger automated audio guide for email verification',
      rule: 'RULE-IVR-001: New account + unconfirmed email → email verification guide',
    },
  },
  {
    id: 'locked-account',
    condition: (c) => c.account_state === 'locked',
    priority: 9,
    override: {
      resolution: 'Initiate account unlock verification with identity check',
      rule: 'RULE-SEC-003: Locked account → guided unlock with 2FA verification',
    },
  },
  {
    id: 'pending-verification',
    condition: (c) => c.account_state === 'pending_verification',
    priority: 8,
    override: {
      resolution: 'Guide customer through identity verification steps',
      rule: 'RULE-KYC-002: Pending verification → KYC document upload guide',
    },
  },
  {
    id: 'credit-eligible-active',
    condition: (c, doc) =>
      c.credit_eligible && doc?.doc_id === 'paypal_credit_limits',
    priority: 7,
    override: {
      resolution: 'Present pre-approved credit line of $' + '{limit}',
      rule: 'RULE-CRD-001: Eligible active customer → personalized credit offer',
    },
  },
  {
    id: 'credit-ineligible',
    condition: (c, doc) =>
      !c.credit_eligible && doc?.doc_id === 'paypal_credit_limits',
    priority: 6,
    override: {
      resolution: 'Explain eligibility requirements and suggest verification steps',
      rule: 'RULE-CRD-002: Ineligible customer → verification pathway',
    },
  },
  {
    id: 'compliance-legal',
    condition: (_c, doc) => doc?.legal_context && doc.legal_context.length > 0,
    priority: 5,
    override: {
      resolution: 'Auto-surface regulatory disclosures and compliance context',
      rule: 'RULE-CMP-001: Legal/compliance query → mandatory disclosure + specialist routing',
    },
  },
];

export function getCustomers() {
  return customers;
}

export function getCustomerById(customerId) {
  return customers.find(c => c.customer_id === customerId) || customers[0];
}

function checkEligibility(customer, rules) {
  const failures = [];
  for (const rule of rules) {
    if (rule === 'age >= 18' && customer.age < 18) failures.push(rule);
    if (rule === 'us_resident' && customer.country !== 'US') failures.push(rule);
    if (rule === 'verified_email' && customer.account_state === 'unconfirmed_email') failures.push(rule);
    if (rule === 'identity_verified' && !customer.identity_verified) failures.push(rule);
    if (rule === 'business_account' && customer.account_type !== 'business') failures.push(rule);
    if (rule === 'eu_resident' && !['DE', 'FR', 'UK', 'EU'].includes(customer.country)) failures.push(rule);
  }
  return { eligible: failures.length === 0, failures };
}

export function evaluateRules(customer, matchedDoc) {
  const reasoning = [];
  const applicable = STATE_RULES
    .filter(r => r.condition(customer, matchedDoc))
    .sort((a, b) => b.priority - a.priority);

  reasoning.push({
    step: 'Customer Context',
    detail: `Lifecycle: ${customer.lifecycle_stage} | State: ${customer.account_state} | Type: ${customer.account_type}`,
  });

  if (matchedDoc) {
    reasoning.push({
      step: 'Domain Navigation',
      detail: matchedDoc.domain_path.join(' → '),
    });
    reasoning.push({
      step: 'Matched Intent',
      detail: `${matchedDoc.title} (${matchedDoc.product})`,
    });
  }

  const eligibility = checkEligibility(customer, matchedDoc?.eligibility_rules || []);
  if (matchedDoc?.eligibility_rules?.length) {
    reasoning.push({
      step: 'Eligibility Check',
      detail: eligibility.eligible
        ? 'All eligibility criteria met'
        : `Failed: ${eligibility.failures.join(', ')}`,
    });
  }

  let firedRule = applicable[0];
  let resolution;
  let template = RESOLUTION_TEMPLATES[matchedDoc?.resolution_type] || RESOLUTION_TEMPLATES.information;

  if (firedRule) {
    resolution = { ...firedRule.override };
    if (firedRule.id === 'credit-eligible-active') {
      resolution.resolution = resolution.resolution.replace('{limit}', customer.credit_limit || 2500);
    }
    reasoning.push({ step: 'Rule Fired', detail: firedRule.override.rule });
  } else {
    resolution = {
      resolution: template.action,
      rule: `RULE-DEFAULT: ${matchedDoc?.resolution_type || 'information'} handler`,
    };
    reasoning.push({ step: 'Rule Fired', detail: resolution.rule });
  }

  const savingsPercent = Math.round((1 - template.estimatedCost / template.humanCost) * 100);

  return {
    customer,
    matchedDoc,
    reasoning,
    resolution: resolution.resolution,
    rule: resolution.rule,
    template,
    eligibility,
    costSavings: {
      automated: template.estimatedCost,
      human: template.humanCost,
      savingsPercent,
    },
  };
}

export default evaluateRules;
