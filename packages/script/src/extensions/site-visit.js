// Wait for base script to initialize
const initSiteVisit = () => {
  const {
    c: cookieManager,
    i: CODEQR_ID_VAR,
    a: API_HOST,
    d: SHORT_DOMAIN,
    v: QUERY_PARAM_VALUE,
    n: DOMAINS_CONFIG,
  } = window._CodeQRAnalytics;

  let siteVisitTracked = false;

  function trackSiteVisit() {
    const siteShortDomain = DOMAINS_CONFIG.site;
    if (!siteShortDomain || siteVisitTracked) return;
    siteVisitTracked = true;

    // Don't track if we have a query param for click tracking
    if (QUERY_PARAM_VALUE && SHORT_DOMAIN) return;

    if (!cookieManager.get(CODEQR_ID_VAR)) {
      // Extract UTM parameters from current URL
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get('utm_source');
      const utm_medium = params.get('utm_medium');
      const utm_campaign = params.get('utm_campaign');

      // Build payload
      const payload = {
        domain: siteShortDomain,
        url: window.location.href,
        referrer: document.referrer || null,
      };

      // Add UTM parameters if they exist
      if (utm_source) payload.utm_source = utm_source;
      if (utm_medium) payload.utm_medium = utm_medium;
      if (utm_campaign) payload.utm_campaign = utm_campaign;

      fetch(`${API_HOST}/track/visit`, {
        // Use shared API_HOST
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.ok && res.json())
        .then((data) => {
          if (data && data.clickId) {
            cookieManager.set(CODEQR_ID_VAR, data.clickId);
          }
        })
        .catch((error) => {
          console.error('[CodeQR Site Visit] Error tracking visit:', error);
        });
    }
  }

  trackSiteVisit();
};

// Run when base script is ready
if (window._CodeQRAnalytics) {
  initSiteVisit();
} else {
  window.addEventListener('load', initSiteVisit);
}
