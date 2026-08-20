// Supabase Edge Function: create-razorpay-order
// Deploy with: supabase functions deploy create-razorpay-order
//
// This runs server-side so the Razorpay KEY SECRET never reaches the browser.
// It creates a Razorpay order and returns the order_id to the frontend,
// which then opens the Razorpay checkout modal with that order_id.

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
    const { amount, currency = "INR", receipt } = await req.json();

    if (!amount || typeof amount !== "number" || amount < 100) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be a number in paise, minimum 100." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const keyId     = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured." }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
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
      JSON.stringify({ order_id: data.id, amount: data.amount, currency: data.currency }),
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
