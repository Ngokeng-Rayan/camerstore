import prisma from "@/lib/prisma";
import type { MetadataRoute } from "next";

// Force le sitemap à être généré dynamiquement à chaque requête (pas au build)
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://camerstore.cdwfs.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/produits`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Pages produits dynamiques
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
