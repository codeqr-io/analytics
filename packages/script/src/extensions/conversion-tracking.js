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

  function handleSubmit(e) {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    if (!isAllowedForm(form)) return;
    if (recentlySubmitted.has(form)) return;
    recentlySubmitted.add(form);
    setTimeout(function () {
      recentlySubmitted.delete(form);
    }, 1000);

    const eventName =
      form.getAttribute('data-codeqr-event-name') || config.eventName || 'Lead';
    const externalId = getAnonId();

    trackLead(
      { eventName, customerExternalId: externalId },
      { keepalive: true },
    );
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
