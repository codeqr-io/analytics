// Wait for base script to initialize
const initConversionTracking = () => {
  const {
    c: cookieManager,
    i: CODEQR_ID_VAR,
    a: API_HOST,
    k: PUBLISHABLE_KEY,
    d: SHORT_DOMAIN,
    n: DOMAINS_CONFIG,
    qm: queueManager,
  } = window._CodeQRAnalytics || {};

  if (!API_HOST) {
    console.warn('[CodeQR Analytics] Missing API_HOST');
    return;
  }

  if (!PUBLISHABLE_KEY) {
    console.warn('[CodeQR Analytics] Missing PUBLISHABLE_KEY');
    return;
  }

  // Conversion tracking methods
  const conversionAPI = {
    /**
     * Track a lead event (sign-up, form submission, etc.)
     * @param {Object} eventData - Lead event data
     * @param {string} eventData.eventName - Name of the event (e.g., "Sign Up", "Form Submit")
     * @param {string} eventData.customerId - External customer identifier
     * @param {string} [eventData.customerName] - Customer name
     * @param {string} [eventData.customerEmail] - Customer email
     * @param {string} [eventData.customerAvatar] - Customer avatar URL
     * @param {Object} [eventData.metadata] - Additional metadata
     * @returns {Promise<Object>} - Response from the API
     */
    async trackLead(eventData) {
      const clickId = cookieManager?.get(CODEQR_ID_VAR);

      const requestBody = {
        ...(clickId && { clickId }),
        ...eventData,
      };

      try {
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
          return null;
        }

        console.log('[CodeQR Analytics] Lead tracked successfully:', result);
        return result;
      } catch (error) {
        console.error('[CodeQR Analytics] Error tracking lead:', error);
        return null;
      }
    },

    /**
     * Track a sale event (purchase, subscription, etc.)
     * @param {Object} eventData - Sale event data
     * @param {string} eventData.customerId - External customer identifier
     * @param {number} eventData.amount - Amount in cents
     * @param {string} eventData.paymentProcessor - Payment processor ('stripe', 'shopify', 'paddle')
     * @param {string} [eventData.eventName] - Event name (default: 'Purchase')
     * @param {string} [eventData.invoiceId] - Invoice identifier
     * @param {string} [eventData.currency] - Currency code (default: 'usd')
     * @param {Object} [eventData.metadata] - Additional metadata
     * @returns {Promise<Object>} - Response from the API
     */
    async trackSale(eventData) {
      try {
        const response = await fetch(`${API_HOST}/track/sale/client`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(eventData),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('[CodeQR Analytics] trackSale failed', result.error);
          return null;
        }

        console.log('[CodeQR Analytics] Sale tracked successfully:', result);
        return result;
      } catch (error) {
        console.error('[CodeQR Analytics] Error tracking sale:', error);
        return null;
      }
    },

    /**
     * Get the current click ID from cookie
     * @returns {string|null} - Current click ID or null if not found
     */
    getClickId() {
      return cookieManager?.get(CODEQR_ID_VAR);
    },

    /**
     * Check if user has a valid click ID
     * @returns {boolean} - True if click ID exists
     */
    hasClickId() {
      return !!cookieManager?.get(CODEQR_ID_VAR);
    },

    /**
     * Get current configuration
     * @returns {Object} - Current configuration
     */
    getConfig() {
      return {
        clickId: cookieManager?.get(CODEQR_ID_VAR),
        shortDomain: SHORT_DOMAIN,
        domainsConfig: DOMAINS_CONFIG,
        apiHost: API_HOST,
        hasPublishableKey: !!PUBLISHABLE_KEY,
      };
    },
  };

  // Add conversion methods to the global API
  window._CodeQRAnalytics = {
    ...window._CodeQRAnalytics,
    trackLead: conversionAPI.trackLead.bind(conversionAPI),
    trackSale: conversionAPI.trackSale.bind(conversionAPI),
    getClickId: conversionAPI.getClickId.bind(conversionAPI),
    hasClickId: conversionAPI.hasClickId.bind(conversionAPI),
    getConfig: conversionAPI.getConfig.bind(conversionAPI),
  };

  // Also expose a more user-friendly global object
  window.CodeQRAnalytics = {
    ...window.CodeQRAnalytics,
    trackLead: conversionAPI.trackLead.bind(conversionAPI),
    trackSale: conversionAPI.trackSale.bind(conversionAPI),
    getClickId: conversionAPI.getClickId.bind(conversionAPI),
    hasClickId: conversionAPI.hasClickId.bind(conversionAPI),
    getConfig: conversionAPI.getConfig.bind(conversionAPI),
  };

  // Add methods to the callable function for direct calls
  if (window.codeqrAnalytics) {
    window.codeqrAnalytics.trackLead = function (...args) {
      return conversionAPI.trackLead(...args);
    };

    window.codeqrAnalytics.trackSale = function (...args) {
      return conversionAPI.trackSale(...args);
    };
  }

  // Process any existing queued conversion events
  if (queueManager) {
    const existingQueue = queueManager.queue || [];

    const remainingQueue = existingQueue.filter(([method, ...args]) => {
      if (method === 'trackLead') {
        conversionAPI.trackLead(...args);
        return false;
      } else if (method === 'trackSale') {
        conversionAPI.trackSale(...args);
        return false;
      }

      return true;
    });

    // Update the queue with remaining items
    queueManager.queue = remainingQueue;
  }

  console.log('[CodeQR Analytics] Conversion tracking initialized.');
};

// Run when base script is ready
if (window._CodeQRAnalytics) {
  initConversionTracking();
} else {
  window.addEventListener('load', initConversionTracking);
}
