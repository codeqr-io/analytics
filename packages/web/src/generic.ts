import { name, version } from '../package.json';
import type { AnalyticsProps } from './types';
import { isBrowser } from './utils';

// Definimos uma interface para a função de analytics para garantir a tipagem correta.
interface AnalyticsFunction {
  (...args: unknown[]): void;
  q?: unknown[];
  trackClick: (...args: unknown[]) => void;
  trackLead: (...args: unknown[]) => void;
  trackSale: (...args: unknown[]) => void;
}

// O tipo de janela agora inclui a função de analytics.
type CodeQRAnalyticsWindow = Window & {
  codeqrAnalytics?: AnalyticsFunction;
};

/**
 * Injects the CodeQR Web Analytics script into the page head.
 */
function inject(props: AnalyticsProps): void {
  if (!isBrowser()) return;

  const w = window as CodeQRAnalyticsWindow;
  const da = 'codeqrAnalytics';

  // Initialize analytics function
  const initFn = function analyticsFunction(...args: unknown[]): void {
    if (!initFn.q) {
      initFn.q = [];
    }
    initFn.q.push(args);
  } as AnalyticsFunction;

  // Define methods for the analytics function
  const methods: (keyof Pick<
    AnalyticsFunction,
    'trackClick' | 'trackLead' | 'trackSale'
  >)[] = ['trackClick', 'trackLead', 'trackSale'];

  methods.forEach((method) => {
    initFn[method] = function methodFunction(...args: unknown[]): void {
      initFn(method, ...args);
    };
  });

  w[da] = initFn;

  // Determine script source based on enabled features
  const baseUrl = 'https://cdn.codeqr.io/analytics/script';
  const features = [];

  if (props.domainsConfig?.site) features.push('site-visit');
  if (props.domainsConfig?.outbound) features.push('outbound-domains');
  if (props.publishableKey) features.push('conversion-tracking');

  const src =
    props.scriptProps?.src ||
    (features.length > 0
      ? `${baseUrl}.${features.join('.')}.js`
      : `${baseUrl}.js`);

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement('script');
  script.src = src;
  script.defer = props.scriptProps?.defer ?? true;
  script.setAttribute('data-sdkn', name);
  script.setAttribute('data-sdkv', version);

  if (props.apiHost) {
    script.setAttribute('data-api-host', props.apiHost);
  }

  if (props.publishableKey) {
    script.setAttribute('data-publishable-key', props.publishableKey);
  }

  if (props.domainsConfig) {
    script.setAttribute('data-domains', JSON.stringify(props.domainsConfig));
  }

  if (props.shortDomain) {
    script.setAttribute('data-short-domain', props.shortDomain);
  }

  if (props.attributionModel) {
    script.setAttribute('data-attribution-model', props.attributionModel);
  }

  if (props.cookieOptions && Object.keys(props.cookieOptions).length > 0) {
    script.setAttribute(
      'data-cookie-options',
      JSON.stringify(props.cookieOptions),
    );
  }

  if (props.queryParam) {
    script.setAttribute('data-query-param', props.queryParam);
  }

  if (props.scriptProps) {
    const { src: _, ...restProps } = props.scriptProps; // we already set the src above
    Object.assign(script, restProps);
  }

  script.onerror = (): void => {
    // eslint-disable-next-line no-console -- Logging to console is intentional
    console.log(`[CodeQR Web Analytics] failed to load script from ${src}.`);
  };

  document.head.appendChild(script);
}

export { inject };
export type { AnalyticsProps };

// eslint-disable-next-line import/no-default-export -- Default export is intentional
export default {
  inject,
};
