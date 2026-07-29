export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// Checks the callable installed by inject(), not window.CodeQRAnalytics.
// The callable queues; the data object only exists once the remote script runs.
export function isCodeQRAnalyticsAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.codeqrAnalytics === 'function'
  );
}
