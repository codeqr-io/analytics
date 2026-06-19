function initAutoFormCapture({ trackLead, storage, config }) {
  const ANON_KEY = 'cq_anon_id';
  const ANON_TTL_MS = 90 * 24 * 60 * 60 * 1000;
  const recentlySubmitted = new WeakSet();

  function isAllowedForm(form) {
    if (form.closest('[data-codeqr-ignore]')) return false;
    if (form.hasAttribute('data-codeqr-conversion')) return true;
    if (config.formSelector) {
      try {
        return form.matches(config.formSelector);
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  function getAnonId() {
    let id = storage && storage.get(ANON_KEY);
    if (!id) {
      id =
        window.crypto && window.crypto.randomUUID
          ? window.crypto.randomUUID()
          : 'anon_' + Date.now() + '_' + Math.floor(Math.random() * 1e9);
      if (storage) storage.set(ANON_KEY, id, ANON_TTL_MS);
    }
    return id;
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function fieldHint(el) {
    return (
      (el.name || '') +
      ' ' +
      (el.id || '') +
      ' ' +
      (el.getAttribute('autocomplete') || '')
    ).toLowerCase();
  }

  function detectKind(el) {
    const type = (el.type || '').toLowerCase();
    const ac = (el.getAttribute('autocomplete') || '').toLowerCase();
    const hint = fieldHint(el);
    if (type === 'email' || ac.indexOf('email') !== -1 || /email/.test(hint))
      return 'email';
    if (type === 'tel' || ac === 'tel' || /phone|\btel\b/.test(hint))
      return 'phone';
    if (ac === 'given-name') return 'given';
    if (ac === 'family-name') return 'family';
    if (ac === 'name' || (/name/.test(hint) && !/user.?name/.test(hint)))
      return 'name';
    return 'other';
  }

  const CC_KEYWORDS =
    /(card.?number|cc.?num|credit.?card|expir|cvv|cvc|ccv|security.?code|amex|mastercard)/i;

  function looksLikeCard(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits.charAt(i), 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function isSensitive(el) {
    const type = (el.type || '').toLowerCase();
    if (type === 'password' || type === 'hidden' || type === 'file')
      return true;
    const ac = (el.getAttribute('autocomplete') || '').toLowerCase();
    if (ac === 'one-time-code' || ac.indexOf('cc-') === 0) return true;
    if (el.hasAttribute('data-codeqr-ignore')) return true;
    const hint =
      (el.name || '') +
      ' ' +
      (el.id || '') +
      ' ' +
      (el.placeholder || '') +
      ' ' +
      (el.getAttribute('aria-label') || '');
    if (CC_KEYWORDS.test(hint)) return true;
    if (looksLikeCard(el.value)) return true;
    return false;
  }

  function extract(form) {
    const out = {
      email: null,
      name: null,
      phone: null,
      given: null,
      family: null,
    };
    const fields = form.querySelectorAll('input, select, textarea');
    for (let i = 0; i < fields.length; i++) {
      const el = fields[i];
      if (isSensitive(el)) continue;
      const value = el.value;
      if (value == null || value === '') continue;
      const kind = detectKind(el);
      if (kind === 'email') {
        if (EMAIL_RE.test(value)) out.email = value;
        continue;
      }
      if (kind === 'phone') {
        out.phone = value;
        continue;
      }
      if (kind === 'given') {
        out.given = value;
        continue;
      }
      if (kind === 'family') {
        out.family = value;
        continue;
      }
      if (kind === 'name') {
        out.name = value;
        continue;
      }
    }
    if (!out.name && (out.given || out.family)) {
      out.name = [out.given, out.family].filter(Boolean).join(' ');
    }
    return out;
  }

  function handleSubmit(e) {
    const form = e.target;
    if (!form || !(form instanceof HTMLFormElement)) return;
    if (!isAllowedForm(form)) return;
    if (recentlySubmitted.has(form)) return;
    recentlySubmitted.add(form);
    setTimeout(function () {
      recentlySubmitted.delete(form);
    }, 1000);

    const eventName =
      form.getAttribute('data-codeqr-event-name') || config.eventName || 'Lead';
    const data = extract(form);
    const externalId = data.email || data.phone || getAnonId();

    const input = {
      eventName,
      customerExternalId: externalId,
    };
    if (data.email) input.customerEmail = data.email;
    if (data.name) input.customerName = data.name;
    if (data.phone) input.metadata = { phone: data.phone };

    trackLead(input, { keepalive: true }).catch(function (err) {
      console.error('[CodeQR Analytics] auto form capture failed', err);
    });
  }

  // Delegated, capture-phase listener — covers dynamically added forms and runs
  // before any page-level submit handler. Never calls preventDefault.
  document.addEventListener('submit', handleSubmit, true);
}

const initConversionTracking = () => {
  const {
    a: API_HOST,
    k: PUBLISHABLE_KEY,
    c: cookieManager,
    i: CODEQR_ID_VAR,
    s: storage,
    ac: AUTO_CONVERT,
  } = window._CodeQRAnalytics || {};

  if (!API_HOST) {
    console.warn('[codeqrAnalytics] Missing API_HOST');
    return;
  }

  if (!PUBLISHABLE_KEY) {
    console.warn('[CodeQR Analytics] Missing PUBLISHABLE_KEY');
    return;
  }

  // Track lead conversion

  /**
   * Track a lead event (sign-up, form submission, etc.)
   * @param {Object} input - Lead event data
   * @param {string} input.eventName - Name of the event (e.g., "Sign Up", "Form Submit")
   * @param {string} input.customerId - External customer identifier
   * @param {string} [input.customerName] - Customer name
   * @param {string} [input.customerEmail] - Customer email
   * @param {string} [input.customerAvatar] - Customer avatar URL
   * @param {Object} [input.metadata] - Additional metadata
   * @param {Object} [opts] - Options
   * @param {boolean} [opts.keepalive] - Use fetch keepalive (for navigating submits)
   * @returns {Promise<Object>} - Response from the API
   */
  const trackLead = async (input, opts) => {
    const clickId = cookieManager?.get(CODEQR_ID_VAR);

    const requestBody = {
      ...(clickId && { clickId }),
      ...input,
    };

    const response = await fetch(`${API_HOST}/track/lead/client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(requestBody),
      ...(opts && opts.keepalive ? { keepalive: true } : {}),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[CodeQR Analytics] trackLead failed', result.error);
    }

    return result;
  };

  // Track sale conversion

  /**
   * Track a sale event (purchase, subscription, etc.)
   * @param {Object} input - Sale event data
   * @param {string} input.customerId - External customer identifier
   * @param {number} input.amount - Amount in cents
   * @param {string} input.paymentProcessor - Payment processor ('stripe', 'shopify', 'paddle')
   * @param {string} [input.eventName] - Event name (default: 'Purchase')
   * @param {string} [input.invoiceId] - Invoice identifier
   * @param {string} [input.currency] - Currency code (default: 'usd')
   * @param {Object} [input.metadata] - Additional metadata
   * @returns {Promise<Object>} - Response from the API
   */
  const trackSale = async (input) => {
    const response = await fetch(`${API_HOST}/track/sale/client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(input),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[CodeQR Analytics] trackSale failed', result.error);
    }

    return result;
  };

  // Add methods to the global codeqrAnalytics object for direct calls
  if (window.codeqrAnalytics) {
    window.codeqrAnalytics.trackLead = function (...args) {
      trackLead(...args);
    };

    window.codeqrAnalytics.trackSale = function (...args) {
      trackSale(...args);
    };
  }

  // Process any existing queued conversion events
  if (window._CodeQRAnalytics && window._CodeQRAnalytics.qm) {
    const queueManager = window._CodeQRAnalytics.qm;
    const existingQueue = queueManager.queue || [];

    const remainingQueue = existingQueue.filter(([method, ...args]) => {
      if (method === 'trackLead') {
        trackLead(...args);
        return false;
      } else if (method === 'trackSale') {
        trackSale(...args);
        return false;
      }

      return true;
    });

    // Update the queue with remaining items
    queueManager.queue = remainingQueue;
  }

  // Auto form capture (opt-in, allowlist-gated).
  if (AUTO_CONVERT && AUTO_CONVERT.forms) {
    initAutoFormCapture({ trackLead, storage, config: AUTO_CONVERT });
  }
};

// Run when base script is ready
if (window._CodeQRAnalytics) {
  initConversionTracking();
} else {
  window.addEventListener('load', initConversionTracking);
}
