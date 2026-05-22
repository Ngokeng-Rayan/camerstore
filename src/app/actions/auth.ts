"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email et mot de passe requis." };
  }

  // 1. Chercher l'utilisateur dans la base de données
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return { success: false, error: "Identifiants incorrects." };
  }

  if (!user.isActive) {
    return { success: false, error: "Ce compte a été désactivé. Veuillez contacter l'administrateur." };
  }

  // 2. Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { success: false, error: "Identifiants incorrects." };
  }

  // 3. Créer la session (JWT)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 jour
  const sessionData = { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    name: user.name
  };
  
  const session = await encrypt(sessionData);

  // 4. Sauvegarder dans les cookies HTTP-Only
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { success: true, role: user.role };
}
