// Supabase Edge Function: create-razorpay-order
// Deploy with: npx supabase functions deploy create-razorpay-order --no-verify-jwt
//
// This runs server-side so the Razorpay KEY SECRET never reaches the browser.
// Supports:
// 1. Order creation: { amount, currency, receipt } -> returns { order_id, amount, currency, key_id }
// 2. Signature verification: { action: "verify", orderId, paymentId, signature } -> returns { isValid }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const payload = await req.json();

    const keyId     = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_TwZdmzgdIbx55r";
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured." }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ── Signature Verification ────────────────────────────────────────────────
    if (payload.action === "verify") {
      const orderId   = payload.orderId || payload.order_id;
      const paymentId = payload.paymentId || payload.payment_id;
      const signature = payload.signature;

      if (!orderId || !paymentId || !signature) {
        return new Response(
          JSON.stringify({ error: "Missing orderId, paymentId, or signature for verification.", isValid: false }),
          { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }

      const enc = new TextEncoder();
      const body = `${orderId}|${paymentId}`;
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(keySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(body));
      const computedHex = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const isValid = computedHex.toLowerCase() === signature.toLowerCase();
      return new Response(
        JSON.stringify({ isValid }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ── Order Creation ────────────────────────────────────────────────────────
    const { amount, currency = "INR", receipt } = payload;

    if (!amount || typeof amount !== "number" || amount < 100) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be a number in paise, minimum 100." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Create order via Razorpay REST API
    const credentials = btoa(`${keyId}:${keySecret}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,           // in paise (₹1 = 100 paise)
        currency,
        receipt: receipt ?? `receipt_${Date.now()}`,
        payment_capture: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay API error:", data);
      return new Response(
        JSON.stringify({ error: data.error?.description ?? "Razorpay order creation failed." }),
        { status: response.status, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        order_id: data.id,
        amount: data.amount,
        currency: data.currency,
        key_id: keyId,
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
