import { useCallback, useEffect, useState } from 'react';
import type {
  Discount,
  Partner,
  TrackClickInput,
  TrackLeadInput,
  TrackSaleInput,
} from './types';
import { isCodeQRAnalyticsAvailable } from './utils';

interface PartnerData {
  partner?: Partner | null;
  discount?: Discount | null;
}

type TrackMethod = 'trackClick' | 'trackLead' | 'trackSale';

declare global {
  interface Window {
    CodeQRAnalytics: PartnerData;
    codeqrAnalytics: ((event: 'ready', callback: () => void) => void) & {
      trackClick: (event: TrackClickInput) => void;
      trackLead: (event: TrackLeadInput) => void;
      trackSale: (event: TrackSaleInput) => void;
    };
  }
}

// trackLead and trackSale only exist on the loaded script when the
// conversion-tracking variant is in use. Warn instead of throwing into the
// host app's render tree.
function call<T>(method: TrackMethod, event: T): void {
  if (!isCodeQRAnalyticsAvailable()) {
    return;
  }

  const fn = window.codeqrAnalytics[method] as ((input: T) => void) | undefined;

  if (typeof fn !== 'function') {
    // eslint-disable-next-line no-console -- a misconfiguration worth surfacing
    console.warn(
      `[CodeQR Web Analytics] ${method}() is unavailable. It ships with the conversion-tracking script, which loads when publishableKey is set.`,
    );
    return;
  }

  fn(event);
}

/**
 * Hook to access CodeQR Analytics data including partner and discount information.
 * @returns Object containing partner data, discount information, and tracking methods.
 * ```js
 * import { useAnalytics } from '@codeqr/analytics/react';
 *
 * function MyComponent() {
 *   const { partner, discount } = useAnalytics();
 *
 *   return (
 *     <div>
 *       {partner && <img src={partner.image} alt={partner.name} />}
 *       {discount && <p>Discount: {discount.amount}%</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnalytics(): PartnerData & {
  trackClick: (event: TrackClickInput) => void;
  trackLead: (event: TrackLeadInput) => void;
  trackSale: (event: TrackSaleInput) => void;
} {
  const [data, setData] = useState<PartnerData>({
    partner: null,
    discount: null,
  });

  const initialize = useCallback(() => {
    if (!isCodeQRAnalyticsAvailable()) {
      return;
    }

    window.codeqrAnalytics('ready', () => {
      const ready = window.CodeQRAnalytics as PartnerData | undefined;
      setData({
        partner: ready?.partner ?? null,
        discount: ready?.discount ?? null,
      });
    });
  }, []);

  const trackClick = useCallback((event: TrackClickInput) => {
    call('trackClick', event);
  }, []);

  const trackLead = useCallback((event: TrackLeadInput) => {
    call('trackLead', event);
  }, []);

  const trackSale = useCallback((event: TrackSaleInput) => {
    call('trackSale', event);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...data,
    trackClick,
    trackLead,
    trackSale,
  };
}
