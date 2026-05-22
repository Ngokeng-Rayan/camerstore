import crypto from 'crypto';

interface CAPIOrderData {
  customerName: string;
  customerPhone: string;
  customerCity: string;
  totalPrice: number;
  quantity: number;
  // Tracking data saved at order creation
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  eventId?: string | null;
}

interface CAPIProductData {
  id: string;
  title: string;
}

export async function sendPurchaseEvent(order: CAPIOrderData, product: CAPIProductData) {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const accessToken = process.env.FB_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.log("Facebook CAPI: NEXT_PUBLIC_FB_PIXEL_ID ou FB_CAPI_ACCESS_TOKEN manquants. Événement ignoré.");
    return;
  }

  const hash = (str: string) => {
    if (!str) return "";
    return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
  };

  const nameParts = (order.customerName || "").trim().split(" ");
  const fn = nameParts[0] || "";
  const ln = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  const ph = (order.customerPhone || "").replace(/\D/g, "");

  const userData: Record<string, any> = {};
  if (fn) userData.fn = [hash(fn)];
  if (ln) userData.ln = [hash(ln)];
  if (ph) userData.ph = [hash(ph)];
  if (order.customerCity) userData.ct = [hash(order.customerCity)];
  userData.country = [hash("cm")];

  // Données de matching améliorées (Event Match Quality Score)
  if (order.fbp) userData.fbp = order.fbp;
  if (order.fbc) userData.fbc = order.fbc;
  if (order.clientIp) userData.client_ip_address = order.clientIp;
  if (order.userAgent) userData.client_user_agent = order.userAgent;

  const eventData: Record<string, any> = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data: userData,
    custom_data: {
      currency: "XAF",
      value: order.totalPrice,
      content_ids: [product.id],
      content_type: "product",
      content_name: product.title,
      num_items: order.quantity || 1
    }
  };

  // Event ID pour la déduplication
  if (order.eventId) eventData.event_id = order.eventId;

  const payload = { data: [eventData] };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    
    const result = await res.json();
    if (result.error) {
      console.error("Erreur FB CAPI:", result.error);
    } else {
      console.log("FB CAPI Purchase Event envoyé avec succès. Events reçus:", result.events_received);
    }
  } catch (error) {
    console.error("Exception lors de l'envoi de l'événement FB CAPI:", error);
  }
}
