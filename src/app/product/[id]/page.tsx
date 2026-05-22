import prisma from "@/lib/prisma";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

// SEO + Open Graph dynamique pour chaque produit
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  
  if (!product) {
    return { title: "Produit non trouvé - Camer Store" };
  }

  const description = product.description.substring(0, 155) + "...";
  const imageUrl = product.images?.[0] || "/og-default.png";

  return {
    title: `${product.title} | Camer Store`,
    description,
    openGraph: {
      title: `${product.title} — ${product.sellingPrice.toLocaleString()} FCFA`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!product) {
    notFound();
  }

  // Récupérer les avis (reviews) du produit depuis la base de données
  const reviews = await prisma.review.findMany({
    where: { productId: resolvedParams.id },
    orderBy: { createdAt: 'desc' },
  });

  return <ProductClient product={product} reviews={reviews} />;
}
