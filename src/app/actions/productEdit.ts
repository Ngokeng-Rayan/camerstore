"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isValidFile(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;
}

export async function updateProductAction(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const costPrice = parseFloat(formData.get("costPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const comparePriceStr = formData.get("comparePrice") as string;
  const comparePrice = comparePriceStr ? parseFloat(comparePriceStr) : null;
  const stock = parseInt(formData.get("stock") as string);
  const categoryIdStr = formData.get("categoryId") as string;
  const categoryId = categoryIdStr ? categoryIdStr : null;
  
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) return { success: false, error: "Produit non trouvé" };

  const imageFiles = formData.getAll("imageFiles") as File[];
  let images = existingProduct.images; 

  const uploadDir = path.join(process.cwd(), "public/uploads/products");

  if (imageFiles.length > 0 && imageFiles[0].size > 0) {
    await mkdir(uploadDir, { recursive: true });
    images = []; // Remplace les anciennes images
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        if (!isValidFile(file)) continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        images.push(`/uploads/products/${filename}`);
      }
    }
  }

  const descriptionMediaFiles = formData.getAll("descriptionMediaFiles") as File[];
  let descriptionMedia = existingProduct.descriptionMedia || [];

  if (descriptionMediaFiles.length > 0 && descriptionMediaFiles[0].size > 0) {
    await mkdir(uploadDir, { recursive: true });
    // Si on veut ajouter, on concatène. Si on veut remplacer, on reset. On reset pour l'instant.
    descriptionMedia = [];
    for (const file of descriptionMediaFiles) {
      if (file && file.size > 0) {
        if (!isValidFile(file)) continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        descriptionMedia.push(`/uploads/products/${filename}`);
      }
    }
  }

  try {
    await prisma.product.update({
      where: { id },
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
    revalidatePath(`/product/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la modification du produit." };
  }
}

export async function deleteProductAction(id: string) {
  try {
    // Delete related orders first or handle cascade (Assuming we can't delete if there are orders, or we should soft delete)
    // For now, let's just delete the product. If it fails due to foreign keys, we return an error.
    await prisma.product.delete({
      where: { id }
    });
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Impossible de supprimer ce produit car il est lié à des commandes." };
  }
}
