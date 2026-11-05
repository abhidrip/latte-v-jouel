// Supabase Edge Function: send-order-email
// Sends a formatted order notification to lavanyapahwa717@gmail.com via Resend.
//
// Deploy: supabase functions deploy send-order-email --no-verify-jwt
// Secret: supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFY_EMAIL = "lavanyapahwa717@gmail.com";
const FROM_EMAIL   = "orders@lattevjouel.com"; // change to onboarding@resend.dev for testing before domain verification

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      subtotal,
      shippingFee,
      grandTotal,
    } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not set");
      return new Response(JSON.stringify({ error: "Email not configured." }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── Build item rows ────────────────────────────────────────────
    const itemRows = (items as { name: string; price: number; quantity: number }[])
      .map(
        (i) =>
          `<tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e8d8;font-family:'Helvetica Neue',sans-serif;font-size:14px;color:#3d3416;">${i.name}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e8d8;font-family:'Helvetica Neue',sans-serif;font-size:14px;color:#3d3416;text-align:center;">${i.quantity}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e8d8;font-family:'Helvetica Neue',sans-serif;font-size:14px;color:#3d3416;text-align:right;">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td>
          </tr>`
      )
      .join("");

    const addr = address as { line1: string; line2?: string; city: string; state: string; pincode: string };
    const addressStr = [addr.line1, addr.line2, `${addr.city}, ${addr.state} — ${addr.pincode}`, "India"]
      .filter(Boolean)
      .join("<br>");

    // ── HTML email ─────────────────────────────────────────────────
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf8f0;font-family:'Helvetica Neue',Helvetica,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 24px rgba(61,52,22,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4F5820,#6B7326);padding:32px;text-align:center;">
      <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:6px;">New Order</div>
      <div style="font-size:28px;font-weight:300;color:#ffffff;letter-spacing:0.04em;">Lattév Jouel</div>
    </div>

    <!-- Order badge -->
    <div style="background:#fdf8f0;padding:20px 32px;border-bottom:1px solid #f0e8d8;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6B7326;margin-bottom:4px;">Order ID</div>
        <div style="font-family:monospace;font-size:13px;color:#3d3416;opacity:0.7;">${String(orderId).split("-")[0].toUpperCase()}</div>
      </div>
      <div style="text-align:right;">
        <div style="display:inline-block;padding:4px 14px;border-radius:999px;background:rgba(40,167,69,0.12);color:#2a7a1f;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Paid ✓</div>
      </div>
    </div>

    <div style="padding:32px;">

      <!-- Customer -->
      <div style="margin-bottom:28px;">
        <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#6B7326;margin-bottom:12px;">Customer</div>
        <div style="background:#fdf8f0;border-radius:8px;padding:16px 20px;font-size:14px;color:#3d3416;line-height:1.9;">
          <strong>${customerName}</strong><br>
          📱 ${customerPhone}
          ${customerEmail ? `<br>✉️ ${customerEmail}` : ""}
        </div>
      </div>

      <!-- Ship to -->
      <div style="margin-bottom:28px;">
        <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#6B7326;margin-bottom:12px;">Ship To</div>
        <div style="background:#fdf8f0;border-radius:8px;padding:16px 20px;font-size:14px;color:#3d3416;line-height:1.9;">
          ${addressStr}
        </div>
      </div>

      <!-- Items -->
      <div style="margin-bottom:28px;">
        <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#6B7326;margin-bottom:12px;">Items Ordered</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #f0e8d8;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#fdf8f0;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6B7326;font-weight:600;">Item</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6B7326;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6B7326;font-weight:600;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="border-top:2px solid #f0e8d8;padding-top:20px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#3d3416;opacity:0.6;margin-bottom:8px;">
          <span>Subtotal</span><span>₹${Number(subtotal).toLocaleString("en-IN")}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#3d3416;opacity:0.6;margin-bottom:12px;">
          <span>Shipping</span><span>${shippingFee === 0 ? "Free" : `₹${shippingFee}`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#3d3416;">
          <span>Total</span><span>₹${Number(grandTotal).toLocaleString("en-IN")}</span>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#fdf8f0;padding:20px 32px;text-align:center;border-top:1px solid #f0e8d8;">
      <div style="font-size:11px;color:#3d3416;opacity:0.4;letter-spacing:0.08em;">
        View all orders → <a href="https://supabase.com/dashboard/project/funbtudlvyvxweduqzrm/editor" style="color:#6B7326;">Supabase Dashboard</a>
      </div>
    </div>

  </div>
</body>
</html>`;

    // ── Send via Resend ────────────────────────────────────────────
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to:   [NOTIFY_EMAIL],
        subject: `🛍️ New Order — ${customerName} · ₹${Number(grandTotal).toLocaleString("en-IN")}`,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email.", detail: resendData }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, emailId: resendData.id }), {
      status: 200, headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-order-email error:", err);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

