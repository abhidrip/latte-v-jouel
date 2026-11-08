/**
 * Razorpay orders are processed securely via Supabase Edge Functions:
 * - create-razorpay-order
 * - verify-razorpay-payment
 * 
 * Secrets (RAZORPAY_KEY_SECRET) remain strictly in Supabase Vault / Edge Functions.
 */
export const RAZORPAY_CONFIG = {
  currency: 'INR',
} as const;
