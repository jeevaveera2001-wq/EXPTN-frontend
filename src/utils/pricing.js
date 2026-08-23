/**
 * Platform-wide Standardized Pricing Calculator
 * Base Price + 18% GST + 5% Platform Fee = Final Total Customer Price
 */
export const calculatePricing = (basePrice) => {
  const base = Math.max(0, Number(basePrice || 0));
  const gst = Math.round(base * 0.18);
  const platformFee = Math.round(base * 0.05);
  const total = base + gst + platformFee; // exactly base * 1.23
  return {
    base,
    gst,
    platformFee,
    total,
    gstRate: '18%',
    platformFeeRate: '5%'
  };
};

export const formatInr = (amount) => {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
};
