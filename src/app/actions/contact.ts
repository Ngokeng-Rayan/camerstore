"use server";

import { sendContactMessage } from "@/lib/mail";

export async function submitContact(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;

    if (!name || !phone || !message) {
      return { success: false, error: "Tous les champs sont requis." };
    }

    await sendContactMessage(name, phone, message);

    return { success: true };
  } catch (error) {
    console.error("Erreur d'envoi du message de contact :", error);
    return { success: false, error: "Une erreur est survenue lors de l'envoi du message." };
  }
}
