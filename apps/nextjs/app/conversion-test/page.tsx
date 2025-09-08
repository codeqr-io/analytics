'use client';

import { useState } from 'react';

declare global {
  interface Window {
    CodeQRAnalytics: {
      trackLead: (data: any) => Promise<any>;
      trackSale: (data: any) => Promise<any>;
      getClickId: () => string | null;
      hasClickId: () => boolean;
      getConfig: () => any;
    };
  }
}

export default function ConversionTestPage() {
  const [leadResult, setLeadResult] = useState<any>(null);
  const [saleResult, setSaleResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Form states
  const [leadForm, setLeadForm] = useState({
    eventName: 'Newsletter Signup',
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerAvatar: '',
  });

  const [saleForm, setSaleForm] = useState({
    customerId: '',
    amount: '',
    paymentProcessor: 'stripe',
    eventName: 'Purchase',
    invoiceId: '',
    currency: 'usd',
  });

  const updateDebugInfo = () => {
    if (typeof window !== 'undefined' && window.CodeQRAnalytics) {
      setDebugInfo({
        hasClickId: window.CodeQRAnalytics.hasClickId(),
        clickId: window.CodeQRAnalytics.getClickId(),
        config: window.CodeQRAnalytics.getConfig(),
      });
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLeadResult(null);

    try {
      if (!window.CodeQRAnalytics) {
        throw new Error('CodeQRAnalytics not loaded');
      }

      const result = await window.CodeQRAnalytics.trackLead({
        eventName: leadForm.eventName,
        customerId: leadForm.customerId,
        customerName: leadForm.customerName || undefined,
        customerEmail: leadForm.customerEmail || undefined,
        customerAvatar: leadForm.customerAvatar || undefined,
        metadata: {
          testMode: true,
          timestamp: new Date().toISOString(),
          pageUrl: window.location.href,
        },
      });

      setLeadResult(result);
      updateDebugInfo();
    } catch (error) {
      setLeadResult({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaleResult(null);

    try {
      if (!window.CodeQRAnalytics) {
        throw new Error('CodeQRAnalytics not loaded');
      }

      const result = await window.CodeQRAnalytics.trackSale({
        customerId: saleForm.customerId,
        amount: parseInt(saleForm.amount) * 100, // Convert to cents
        paymentProcessor: saleForm.paymentProcessor,
        eventName: saleForm.eventName,
        invoiceId: saleForm.invoiceId || undefined,
        currency: saleForm.currency,
        metadata: {
          testMode: true,
          timestamp: new Date().toISOString(),
          pageUrl: window.location.href,
        },
      });

      setSaleResult(result);
      updateDebugInfo();
    } catch (error) {
      setSaleResult({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async (type: 'lead' | 'sale') => {
    setLoading(true);
    setLeadResult(null);
    setSaleResult(null);

    try {
      if (!window.CodeQRAnalytics) {
        throw new Error('CodeQRAnalytics not loaded');
      }

      if (type === 'lead') {
        const result = await window.CodeQRAnalytics.trackLead({
          eventName: 'Quick Test Lead',
          customerId: `test-user-${Date.now()}`,
          customerEmail: 'test@example.com',
          customerName: 'Test User',
          metadata: {
            testMode: true,
            quickTest: true,
            timestamp: new Date().toISOString(),
          },
        });
        setLeadResult(result);
      } else {
        const result = await window.CodeQRAnalytics.trackSale({
          customerId: `test-user-${Date.now()}`,
          amount: 2500, // $25.00
          paymentProcessor: 'stripe',
          eventName: 'Quick Test Sale',
          currency: 'usd',
          metadata: {
            testMode: true,
            quickTest: true,
            timestamp: new Date().toISOString(),
          },
        });
        setSaleResult(result);
      }

      updateDebugInfo();
    } catch (error) {
      const errorResult = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      if (type === 'lead') {
        setLeadResult(errorResult);
      } else {
        setSaleResult(errorResult);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update debug info on mount
  useState(() => {
    const timer = setTimeout(updateDebugInfo, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans bg-white dark:bg-gray-900 min-h-screen">
      <header className="text-center mb-12 pb-8 border-b-2 border-gray-200 dark:border-gray-700">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          CodeQR Analytics - Conversion Tracking Test
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Test the conversion tracking methods with interactive forms
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {/* Debug Information */}
        <section className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Debug Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
              <strong className="text-gray-700 dark:text-gray-300 block mb-1">
                Has Click ID:
              </strong>
              <span className="text-gray-900 dark:text-gray-100">
                {debugInfo?.hasClickId ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
              <strong className="text-gray-700 dark:text-gray-300 block mb-1">
                Click ID:
              </strong>
              <span className="text-gray-900 dark:text-gray-100">
                {debugInfo?.clickId || 'None'}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
              <strong className="text-gray-700 dark:text-gray-300 block mb-1">
                API Host:
              </strong>
              <span className="text-gray-900 dark:text-gray-100">
                {debugInfo?.config?.apiHost || 'Not set'}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
              <strong className="text-gray-700 dark:text-gray-300 block mb-1">
                Short Domain:
              </strong>
              <span className="text-gray-900 dark:text-gray-100">
                {debugInfo?.config?.shortDomain || 'Not set'}
              </span>
            </div>
          </div>
          <button
            onClick={updateDebugInfo}
            className="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm cursor-pointer transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Refresh Debug Info
          </button>
        </section>

        {/* Quick Test Buttons */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Quick Tests
          </h2>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Test conversion tracking with predefined data
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => handleQuickTest('lead')}
              disabled={loading}
              className="bg-blue-500 text-white border-none px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              Test Lead Event
            </button>
            <button
              onClick={() => handleQuickTest('sale')}
              disabled={loading}
              className="bg-blue-500 text-white border-none px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              Test Sale Event
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lead Tracking Form */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 pb-2 border-b-2 border-gray-100 dark:border-gray-600">
              Lead Tracking Test
            </h2>
            <form onSubmit={handleLeadSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="leadEventName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Event Name:
                </label>
                <input
                  id="leadEventName"
                  type="text"
                  value={leadForm.eventName}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, eventName: e.target.value })
                  }
                  required
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="leadCustomerId"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Customer ID:
                </label>
                <input
                  id="leadCustomerId"
                  type="text"
                  value={leadForm.customerId}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, customerId: e.target.value })
                  }
                  placeholder="user_123"
                  required
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="leadCustomerName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Customer Name:
                </label>
                <input
                  id="leadCustomerName"
                  type="text"
                  value={leadForm.customerName}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, customerName: e.target.value })
                  }
                  placeholder="John Doe"
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="leadCustomerEmail"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Customer Email:
                </label>
                <input
                  id="leadCustomerEmail"
                  type="email"
                  value={leadForm.customerEmail}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, customerEmail: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="leadCustomerAvatar"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Customer Avatar URL:
                </label>
                <input
                  id="leadCustomerAvatar"
                  type="url"
                  value={leadForm.customerAvatar}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, customerAvatar: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white border-none px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-green-600 hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {loading ? 'Tracking...' : 'Track Lead Event'}
              </button>
            </form>

            {leadResult && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Lead Result:
                </h3>
                <pre className="bg-gray-800 dark:bg-gray-900 text-gray-100 p-4 rounded-md text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(leadResult, null, 2)}
                </pre>
              </div>
            )}
          </section>

          {/* Sale Tracking Form */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 pb-2 border-b-2 border-gray-100 dark:border-gray-600">
              Sale Tracking Test
            </h2>
            <form onSubmit={handleSaleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="saleCustomerId"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Customer ID:
                </label>
                <input
                  id="saleCustomerId"
                  type="text"
                  value={saleForm.customerId}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, customerId: e.target.value })
                  }
                  placeholder="user_123"
                  required
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="saleAmount"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Amount (USD):
                </label>
                <input
                  id="saleAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={saleForm.amount}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, amount: e.target.value })
                  }
                  placeholder="29.99"
                  required
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="salePaymentProcessor"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Payment Processor:
                </label>
                <select
                  id="salePaymentProcessor"
                  value={saleForm.paymentProcessor}
                  onChange={(e) =>
                    setSaleForm({
                      ...saleForm,
                      paymentProcessor: e.target.value,
                    })
                  }
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="stripe">Stripe</option>
                  <option value="shopify">Shopify</option>
                  <option value="paddle">Paddle</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="saleEventName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Event Name:
                </label>
                <input
                  id="saleEventName"
                  type="text"
                  value={saleForm.eventName}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, eventName: e.target.value })
                  }
                  placeholder="Purchase"
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="saleInvoiceId"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Invoice ID:
                </label>
                <input
                  id="saleInvoiceId"
                  type="text"
                  value={saleForm.invoiceId}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, invoiceId: e.target.value })
                  }
                  placeholder="inv_123456"
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="saleCurrency"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Currency:
                </label>
                <select
                  id="saleCurrency"
                  value={saleForm.currency}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, currency: e.target.value })
                  }
                  className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="brl">BRL</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white border-none px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-green-600 hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {loading ? 'Tracking...' : 'Track Sale Event'}
              </button>
            </form>

            {saleResult && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Sale Result:
                </h3>
                <pre className="bg-gray-800 dark:bg-gray-900 text-gray-100 p-4 rounded-md text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(saleResult, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </div>

        {/* Instructions */}
        <section className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
            How to Test
          </h2>
          <ol className="text-yellow-800 dark:text-yellow-300 leading-relaxed mb-4 space-y-2">
            <li>
              <strong>First, get a click ID:</strong> Visit a page with a CodeQR
              link or use the{' '}
              <a
                href="/?cq_id=test-click-id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 dark:text-red-400 underline font-medium hover:text-red-700 dark:hover:text-red-300"
              >
                test link
              </a>{' '}
              to set a test click ID
            </li>
            <li>
              <strong>Check Debug Info:</strong> Verify that &quot;Has Click
              ID&quot; shows ✅ Yes
            </li>
            <li>
              <strong>Test Lead Events:</strong> Use the form above or quick
              test button to track lead events
            </li>
            <li>
              <strong>Test Sale Events:</strong> Use the form above or quick
              test button to track sale events
            </li>
            <li>
              <strong>Check Results:</strong> View the API response in the
              result section
            </li>
          </ol>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
            <strong>Note:</strong> This page uses the conversion tracking
            methods from the CodeQR Analytics script. Make sure the script is
            loaded and configured properly.
          </div>
        </section>
      </div>
    </div>
  );
}
