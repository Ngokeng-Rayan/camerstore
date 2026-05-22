"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isValidFile(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;
}

export async function createProductAction(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const costPrice = parseFloat(formData.get("costPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const comparePriceStr = formData.get("comparePrice") as string;
  const comparePrice = comparePriceStr ? parseFloat(comparePriceStr) : null;
  const stock = parseInt(formData.get("stock") as string);
  const categoryIdStr = formData.get("categoryId") as string;
  const categoryId = categoryIdStr ? categoryIdStr : null;
  
  // Handling multiple image files
  const imageFiles = formData.getAll("imageFiles") as File[];
  let images: string[] = [];

  const uploadDir = path.join(process.cwd(), "public/uploads/products");
  await mkdir(uploadDir, { recursive: true });

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      if (!isValidFile(file)) continue; // Skip invalid files
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      images.push(`/uploads/products/${filename}`);
    }
  }
  
  // Handling description media (images/gifs/videos)
  const descriptionMediaFiles = formData.getAll("descriptionMediaFiles") as File[];
  let descriptionMedia: string[] = [];

  for (const file of descriptionMediaFiles) {
    if (file && file.size > 0) {
      if (!isValidFile(file)) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      descriptionMedia.push(`/uploads/products/${filename}`);
    }
  }

  try {
    await prisma.product.create({
      data: {
        title,
        description,
        costPrice,
        sellingPrice,
        comparePrice,
        stock,
        categoryId,
        images,
        descriptionMedia
      }
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la création du produit." };
  }
}
