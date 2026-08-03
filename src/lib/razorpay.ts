/**
 * Razorpay server functions for Lattév Jouel.
 *
 * These run SERVER-SIDE ONLY via TanStack Start server functions.
 * Your secret key is never sent to the browser.
 *
 * ─── Setup ────────────────────────────────────────────────────
 * Create a .env file in the project root (see .env.example):
 *
 *   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
 *   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
 *   VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
 *
 * Get your keys from: https://dashboard.razorpay.com/app/keys
 * ──────────────────────────────────────────────────────────────
 */

import { createServerFn } from "@tanstack/react-start";

// ─── Types ────────────────────────────────────────────────────────────────────

type CreateOrderInput = {
  /** Amount in paise — ₹1 = 100 paise */
  amountPaise: number;
  receipt: string;
};

type CreateOrderResult = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
};

type VerifyInput = {
  orderId: string;
  paymentId: string;
  signature: string;
};

type VerifyResult = {
  isValid: boolean;
};

// ─── Server Function: Create Order ────────────────────────────────────────────

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as CreateOrderInput)
  .handler(async ({ data }): Promise<CreateOrderResult> => {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay keys not configured. " +
          "Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file. " +
          "See .env.example for details.",
      );
    }

    // Basic auth: base64(key_id:key_secret)
    const credentials = btoa(`${keyId}:${keySecret}`);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: data.amountPaise,
        currency: "INR",
        receipt: data.receipt,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Razorpay order creation failed (${response.status}): ${errText}`,
      );
    }

    return response.json() as Promise<CreateOrderResult>;
  });

// ─── Server Function: Verify Signature ───────────────────────────────────────

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as VerifyInput)
  .handler(async ({ data }): Promise<VerifyResult> => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not set.");

    // Use Web Crypto API (works in Node 18+, Cloudflare Workers, Deno)
    const enc = new TextEncoder();
    const body = `${data.orderId}|${data.paymentId}`;

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      enc.encode(body),
    );

    const computedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return { isValid: computedHex === data.signature };
  });
