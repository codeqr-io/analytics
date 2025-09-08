export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function isCodeQRAnalyticsReady(): boolean {
  return typeof window !== 'undefined' && Boolean(window.CodeQRAnalytics);
}
