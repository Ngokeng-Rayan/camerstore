import prisma from "@/lib/prisma";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return <NewProductForm categories={categories} />;
}
