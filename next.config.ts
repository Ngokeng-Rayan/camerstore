import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    // Sur o2switch (Passenger/Node), sharp n'est pas disponible.
    // On désactive l'optimisation d'image côté serveur pour éviter les erreurs 500.
    unoptimized: true,
  },
};

export default nextConfig;
