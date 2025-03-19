(function () {
  // Store script reference for extensions
  const script = document.currentScript;

  console.log('[CodeQR Analytics] Script initialized.');

  const CODEQR_ID_VAR = 'cq_id';
  const COOKIE_EXPIRES = 90 * 24 * 60 * 60 * 1000; // 90 days
  const HOSTNAME = window.location.hostname;

  console.log('[CodeQR Analytics] Hostname:', HOSTNAME);

  // Common script attributes
  const API_HOST =
    script.getAttribute('data-api-host') || 'https://api.codeqr.io';
  console.log('[CodeQR Analytics] API Host:', API_HOST);

  const COOKIE_OPTIONS = (() => {
    const defaultOptions = {
      domain:
        HOSTNAME === 'localhost'
          ? undefined
          : `.${HOSTNAME.replace(/^www\./, '')}`,
      path: '/',
      sameSite: 'Lax',
      expires: new Date(Date.now() + COOKIE_EXPIRES).toUTCString(),
    };

    const opts = script.getAttribute('data-cookie-options');
    if (!opts) {
      console.log(
        '[CodeQR Analytics] Using default cookie options:',
        defaultOptions,
      );
      return defaultOptions;
    }

    const parsedOpts = JSON.parse(opts);
    if (parsedOpts.expiresInDays) {
      parsedOpts.expires = new Date(
        Date.now() + parsedOpts.expiresInDays * 24 * 60 * 60 * 1000,
      ).toUTCString();
      delete parsedOpts.expiresInDays;
    }

    console.log('[CodeQR Analytics] Parsed cookie options:', {
      ...defaultOptions,
      ...parsedOpts,
    });
    return { ...defaultOptions, ...parsedOpts };
  })();

  const DOMAINS_CONFIG = (() => {
    const domainsAttr = script.getAttribute('data-domains');
    if (domainsAttr) {
      try {
        const parsedDomains = JSON.parse(domainsAttr);
        console.log('[CodeQR Analytics] Parsed domains config:', parsedDomains);
        return parsedDomains;
      } catch (e) {
        console.warn(
          '[CodeQR Analytics] Failed to parse domains config, falling back to old format.',
        );
      }
    }
    const fallbackConfig = {
      refer: script.getAttribute('data-short-domain'),
    };
    console.log('[CodeQR Analytics] Fallback domains config:', fallbackConfig);
    return fallbackConfig;
  })();

  const SHORT_DOMAIN = DOMAINS_CONFIG.refer;
  console.log('[CodeQR Analytics] Short domain:', SHORT_DOMAIN);

  const ATTRIBUTION_MODEL =
    script.getAttribute('data-attribution-model') || 'last-click';
  console.log('[CodeQR Analytics] Attribution model:', ATTRIBUTION_MODEL);

  const QUERY_PARAM = script.getAttribute('data-query-param') || 'via';
  const QUERY_PARAM_VALUE = new URLSearchParams(location.search).get(
    QUERY_PARAM,
  );
  console.log(
    '[CodeQR Analytics] Query param:',
    QUERY_PARAM,
    'Value:',
    QUERY_PARAM_VALUE,
  );

  // Cookie management
  const cookieManager = {
    get(key) {
      const value = document.cookie
        .split(';')
        .map((c) => c.trim().split('='))
        .find(([k]) => k === key)?.[1];
      console.log(`[CodeQR Analytics] Get cookie: ${key} =`, value);
      return value;
    },

    set(key, value) {
      const cookieString = Object.entries(COOKIE_OPTIONS)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');

      document.cookie = `${key}=${value}; ${cookieString}`;
      console.log(`[CodeQR Analytics] Set cookie: ${key} = ${value}`);
    },
  };

  let clientClickTracked = false;
  // Track click and set cookie
  function trackClick(identifier) {
    if (clientClickTracked) {
      console.log('[CodeQR Analytics] Click already tracked, skipping.');
      return;
    }
    clientClickTracked = true;

    console.log(
      '[CodeQR Analytics] Tracking click with identifier:',
      identifier,
    );

    fetch(`${API_HOST}/track/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: SHORT_DOMAIN,
        key: identifier,
        url: window.location.href,
        referrer: document.referrer,
      }),
    })
      .then((res) => {
        if (res.ok) {
          console.log('[CodeQR Analytics] Click tracked successfully.');
          return res.json();
        } else {
          console.error('[CodeQR Analytics] Failed to track click.');
        }
      })
      .then((data) => {
        if (data) {
          console.log(
            '[CodeQR Analytics] Received click tracking response:',
            data,
          );
          cookieManager.set(CODEQR_ID_VAR, data.clickId);
        }
      })
      .catch((error) => {
        console.error('[CodeQR Analytics] Error tracking click:', error);
      });
  }

  // Initialize tracking
  function init() {
    console.log('[CodeQR Analytics] Initializing tracking...');
    const params = new URLSearchParams(location.search);

    const shouldSetCookie = () => {
      const result =
        !cookieManager.get(CODEQR_ID_VAR) ||
        ATTRIBUTION_MODEL !== 'first-click';
      console.log('[CodeQR Analytics] Should set cookie:', result);
      return result;
    };

    // Direct click ID in URL
    const clickId = params.get(CODEQR_ID_VAR);
    if (clickId && shouldSetCookie()) {
      console.log('[CodeQR Analytics] Found click ID in URL:', clickId);
      cookieManager.set(CODEQR_ID_VAR, clickId);
      return;
    }

    // Track via query param
    if (QUERY_PARAM_VALUE && SHORT_DOMAIN) {
      console.log(
        '[CodeQR Analytics] Found query param value:',
        QUERY_PARAM_VALUE,
      );
      if (shouldSetCookie()) {
        trackClick(QUERY_PARAM_VALUE);
      }
    }
  }

  // Export minimal API with minified names
  window._CodeQRAnalytics = {
    c: cookieManager, // was cookieManager
    i: CODEQR_ID_VAR, // was CODEQR_ID_VAR
    h: HOSTNAME, // was HOSTNAME
    a: API_HOST, // was API_HOST
    o: COOKIE_OPTIONS, // was COOKIE_OPTIONS
    d: SHORT_DOMAIN, // was SHORT_DOMAIN
    m: ATTRIBUTION_MODEL, // was ATTRIBUTION_MODEL
    p: QUERY_PARAM, // was QUERY_PARAM
    v: QUERY_PARAM_VALUE, // was QUERY_PARAM_VALUE
    n: DOMAINS_CONFIG, // was DOMAINS_CONFIG
  };

  // Initialize
  init();
})();
