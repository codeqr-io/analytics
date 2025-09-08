import { useCallback, useEffect, useState } from 'react';
import type {
  Discount,
  Partner,
  TrackClickInput,
  TrackLeadInput,
  TrackSaleInput,
} from './types';
import { isCodeQRAnalyticsReady } from './utils';

interface PartnerData {
  partner?: Partner | null;
  discount?: Discount | null;
}

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
    if (!isCodeQRAnalyticsReady()) {
      return;
    }

    window.codeqrAnalytics('ready', () => {
      const { partner, discount } = window.CodeQRAnalytics as {
        partner: Partner | null;
        discount: Discount | null;
      };
      setData({ partner, discount });
    });
  }, []);

  const trackClick = useCallback((event: TrackClickInput) => {
    if (!isCodeQRAnalyticsReady()) {
      return;
    }

    window.codeqrAnalytics.trackClick(event);
  }, []);

  const trackLead = useCallback((event: TrackLeadInput) => {
    if (!isCodeQRAnalyticsReady()) {
      return;
    }

    window.codeqrAnalytics.trackLead(event);
  }, []);

  const trackSale = useCallback((event: TrackSaleInput) => {
    if (!isCodeQRAnalyticsReady()) {
      return;
    }

    window.codeqrAnalytics.trackSale(event);
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
