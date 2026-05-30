import Stripe from "stripe";
import { getStore } from "@netlify/blobs";
import { Resend } from "resend";
import JSZip from "jszip";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("OK", { status: 200 });
  }

  const session = event.data.object;
  
  // Verifică dacă am mai procesat acest eveniment (deduplicare)
  const eventId = event.id;
  const store = getStore("books");
  
  const alreadyProcessed = await store.get(`processed_${eventId}`).catch(() => null);
  if (alreadyProcessed) {
    console.log(`Eveniment ${eventId} deja procesat, ignorat.`);
    return new Response("OK", { status: 200 });
  }

  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name || "Cititor";

  if (!customerEmail) {
    console.error("Nu am găsit emailul cumpărătorului");
    return new Response("OK", { status: 200 });
  }

  try {
    // Marchează evenimentul ca procesat
    await store.set(`processed_${eventId}`, "1");

    // Descarcă epub-ul original
    const epubBuffer = await store.get("ainavigator2026.epub", {
      type: "arrayBuffer",
    });

    if (!epubBuffer) {
      throw new Error("Fișierul epub nu a fost găsit în store");
    }

    // Aplică watermark în epub
    const zip = await JSZip.loadAsync(epubBuffer);

    const watermarkHtml = `<div style="font-size:0.75em;color:#888;text-align:center;padding:4px 0;border-top:1px solid #eee;margin-top:2em;">Copie licențiată pentru: ${customerName} (${customerEmail})</div>`;

    const htmlFiles = Object.keys(zip.files).filter(
      (name) => name.endsWith(".html") || name.endsWith(".xhtml")
    );

    for (const filename of htmlFiles) {
      const content = await zip.files[filename].async("string");
      let watermarked;
      if (content.includes("</body>")) {
        watermarked = content.replace("</body>", `${watermarkHtml}</body>`);
      } else {
        watermarked = content + watermarkHtml;
      }
      zip.file(filename, watermarked);
    }

    const watermarkedEpub = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    await resend.emails.send({
      from: "carti@radupascu.online",
      to: customerEmail,
      subject: "Cartea ta: AI Navigator 2026",
      html: `
        <p>Bună ziua, ${customerName}!</p>
        <p>Îți mulțumim pentru achiziție. Găsești cartea <strong>AI Navigator 2026</strong> atașată acestui email.</p>
        <p>Această copie este licențiată personal pentru tine și nu poate fi redistribuită.</p>
        <br/>
        <p>Cu drag,<br/>Radu Pascu</p>
      `,
      attachments: [
        {
          filename: "ainavigator2026.epub",
          content: watermarkedEpub.toString("base64"),
        },
      ],
    });

    console.log(`Email trimis cu succes către ${customerEmail}`);
    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Eroare procesare:", err);
    return new Response("Internal error", { status: 500 });
  }
}

export const config = {
  path: "/.netlify/functions/stripe-webhook",
  bodyParser: false,
};
