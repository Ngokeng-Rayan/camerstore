import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductEditForm from "./ProductEditForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return <ProductEditForm product={product} categories={categories} />;
}
