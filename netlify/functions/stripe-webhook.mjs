import Stripe from "stripe";
import { getStore } from "@netlify/blobs";
import { Resend } from "resend";
import JSZip from "jszip";

export default async function handler(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verifică semnătura Stripe
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Procesează doar plățile completate
  if (event.type !== "checkout.session.completed") {
    return new Response("OK", { status: 200 });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name || "Cititor";

  if (!customerEmail) {
    console.error("Nu am găsit emailul cumpărătorului");
    return new Response("No email", { status: 400 });
  }

  try {
    // Descarcă epub-ul original din Netlify Blobs
    const store = getStore("books");
    const epubBuffer = await store.get("ainavigator2026.epub", {
      type: "arrayBuffer",
    });

    if (!epubBuffer) {
      throw new Error("Fișierul epub nu a fost găsit în store");
    }

    // Aplică watermark în epub
    const zip = await JSZip.loadAsync(epubBuffer);

    // Injectează watermark în toate fișierele HTML/XHTML din epub
    const watermarkHtml = `<div style="display:none;visibility:hidden;">Licențiat pentru: ${customerName} &lt;${customerEmail}&gt;</div>`;

    const htmlFiles = Object.keys(zip.files).filter(
      (name) => name.endsWith(".html") || name.endsWith(".xhtml")
    );

    for (const filename of htmlFiles) {
      const content = await zip.files[filename].async("string");
      const watermarked = content.replace(
        "</body>",
        `${watermarkHtml}</body>`
      );
      zip.file(filename, watermarked);
    }

    // Generează epub-ul watermarkat
    const watermarkedEpub = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // Trimite emailul cu epub-ul atașat
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
};
