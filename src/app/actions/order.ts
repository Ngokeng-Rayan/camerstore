"use server";

import prisma from "@/lib/prisma";
import { sendNewOrderNotification } from "@/lib/mail";
import { headers, cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";

// Regex pour numéro camerounais (6XXXXXXXX ou +237XXXXXXXXX ou 237XXXXXXXXX)
const PHONE_REGEX = /^(\+?237)?[26][0-9]{7,8}$/;

function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

export async function createOrder(formData: FormData) {
  try {
    // 1. Extraire et valider les données
    const customerName = sanitize(formData.get("customerName") as string || "");
    const customerPhone = (formData.get("customerPhone") as string || "").replace(/\s+/g, "").trim();
    const customerCity = sanitize(formData.get("customerCity") as string || "");
    const customerAddress = sanitize(formData.get("customerAddress") as string || "");
    const productId = formData.get("productId") as string;
    const quantity = Math.max(1, parseInt(formData.get("quantity") as string) || 1);
    const eventId = formData.get("eventId") as string || undefined;

    // Honeypot anti-bot (champ caché qui doit rester vide)
    const honeypot = formData.get("website") as string;
    if (honeypot) {
      // Un bot a rempli le champ caché — on simule un succès pour ne pas alerter
      return { success: true, isBot: true, orderId: "fake" };
    }

    // Validation des champs obligatoires
    if (!customerName || customerName.length < 2) {
      return { success: false, error: "Le nom est requis (minimum 2 caractères)." };
    }
    if (!customerPhone) {
      return { success: false, error: "Le numéro de téléphone est requis." };
    }
    // Nettoyer le téléphone (garder uniquement les chiffres et le +)
    const cleanPhone = customerPhone.replace(/[^0-9+]/g, "");
    if (!PHONE_REGEX.test(cleanPhone)) {
      return { success: false, error: "Veuillez entrer un numéro de téléphone camerounais valide (ex: 6XXXXXXXX)." };
    }
    if (!customerCity || customerCity.length < 2) {
      return { success: false, error: "La ville/quartier est requis." };
    }
    if (!productId) {
      return { success: false, error: "Produit manquant." };
    }

    // 2. Rate limiting par IP
    const headerStore = await headers();
    const clientIp = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim()
      || headerStore.get("x-real-ip")
      || "unknown";
    
    if (!checkRateLimit(clientIp)) {
      return { success: false, error: "Trop de commandes. Veuillez réessayer dans quelques minutes." };
    }

    // 3. Récupérer le produit depuis la BD pour avoir le vrai prix
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return { success: false, error: "Produit non trouvé." };
    }

    // Appliquer la même réduction par quantité que sur le frontend
    let discount = 0;
    if (quantity >= 3) {
      discount = 0.35;
    } else if (quantity >= 2) {
      discount = 0.20;
    }
    const unitPrice = Math.round(product.sellingPrice * (1 - discount));
    const totalPrice = unitPrice * quantity;
    // 4. Récupérer les données de tracking Meta
    const userAgent = headerStore.get("user-agent") || undefined;
    const cookieStore = await cookies();
    const fbp = cookieStore.get("_fbp")?.value || undefined;
    const fbc = cookieStore.get("_fbc")?.value || undefined;

    // 5. Créer la commande dans la base de données
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone: cleanPhone,
        customerCity,
        customerAddress,
        quantity,
        totalPrice,
        status: "NEW_LEAD",
        productId: product.id,
        // Tracking Meta Ads
        clientIp,
        userAgent,
        fbp,
        fbc,
        eventId,
      }
    });

    // L'envoi d'email est désormais délégué au client via l'API pour ne pas bloquer la réponse
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erreur lors de la création de la commande :", error);
    return { success: false, error: "Une erreur est survenue lors de la commande." };
  }
}
