"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function createReview(formData: FormData) {
  const customerName = formData.get("customerName") as string;
  const content = formData.get("content") as string;
  const rating = parseInt(formData.get("rating") as string);
  const productId = formData.get("productId") as string;
  const files = formData.getAll("files") as File[];

  if (!customerName || !content || !productId) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  const savedImages: string[] = [];

  // Traitement des images
  if (files && files.length > 0) {
    for (const file of files) {
      if (file.size > 0 && file.name) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name);
        const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
        const uploadDir = path.join(process.cwd(), "public/uploads/reviews");
        const filePath = path.join(uploadDir, uniqueName);
        
        try {
          await writeFile(filePath, buffer);
          savedImages.push(`/uploads/reviews/${uniqueName}`);
        } catch (error) {
          // Dossier inexistant : on le crée et on réessaie
          const fs = require("fs");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            await writeFile(filePath, buffer);
            savedImages.push(`/uploads/reviews/${uniqueName}`);
          } else {
            console.error("Erreur lors de l'enregistrement de l'image de l'avis:", error);
          }
        }
      }
    }
  }

  await prisma.review.create({
    data: {
      customerName,
      content,
      rating,
      productId,
      images: savedImages,
    },
  });

  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${productId}`);
  redirect("/admin/reviews");
}

export async function deleteReview(id: string, productId: string) {
  await prisma.review.delete({
    where: { id },
  });

  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${productId}`);
}
