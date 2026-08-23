/**
 * On-Demand Dynamic Razorpay Script Loader
 * Prevents loading 70+ scripts upfront on initial page load.
 */
let razorpayLoadingPromise = null;

export function loadRazorpay() {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayLoadingPromise) {
    return razorpayLoadingPromise;
  }

  razorpayLoadingPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK dynamically.');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayLoadingPromise;
}
