const initConversionTracking = () => {
  const {
    a: API_HOST,
    k: PUBLISHABLE_KEY,
    c: cookieManager,
    i: CODEQR_ID_VAR,
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
   * @returns {Promise<Object>} - Response from the API
   */
  const trackLead = async (input) => {
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
};

// Run when base script is ready
if (window._CodeQRAnalytics) {
  initConversionTracking();
} else {
  window.addEventListener('load', initConversionTracking);
}
