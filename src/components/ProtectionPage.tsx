"use client";

import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectionPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [chargement, setChargement] = useState(true);
  const [autorise, setAutorise] = useState(false);

  useEffect(() => {
    verifierConnexion();
  }, [pathname]);

  async function verifierConnexion() {
    setChargement(true);

    const pagesPubliques = ["/connexion"];

    if (pagesPubliques.includes(pathname)) {
      setAutorise(true);
      setChargement(false);
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setAutorise(false);
      router.replace("/connexion");
      return;
    }

    setAutorise(true);
    setChargement(false);
  }

  if (chargement) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="font-semibold">Vérification de la connexion...</p>
      </main>
    );
  }

  if (!autorise) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="font-semibold">Redirection vers la connexion...</p>
      </main>
    );
  }

  return <>{children}</>;
}