import prisma from "@/lib/prisma";
import EditUserForm from "./EditUserForm";
import { notFound } from "next/navigation";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!user) {
    notFound();
  }

  // Sécurité: ne pas passer le mot de passe hashé au client
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  };

  return <EditUserForm user={safeUser} />;
}
