"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { sendUserCredentials } from "@/lib/mail";

export async function createUserAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  
  if (!email || !password) {
    return { success: false, error: "Email et mot de passe requis." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Un utilisateur avec cet email existe déjà." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    // Envoyer les identifiants par email
    sendUserCredentials(email, name, password).catch((e) => {
      console.error("Erreur d'envoi d'email à l'utilisateur :", e);
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la création de l'utilisateur." };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la suppression." };
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const isActive = formData.get("isActive") === "true";
  
  if (!email) {
    return { success: false, error: "L'email est requis." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return { success: false, error: "Un autre utilisateur utilise déjà cet email." };
    }

    const updateData: any = {
      name,
      email,
      role,
      isActive
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la modification de l'utilisateur." };
  }
}
