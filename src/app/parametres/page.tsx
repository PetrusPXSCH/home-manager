"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ParametresPage() {
  const router = useRouter();

  async function deconnexion() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">← Retour</Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">⚙️ Paramètres</h1>

        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <p className="text-gray-600">
            Home Manager — version cloud familiale.
          </p>

          <button
            onClick={deconnexion}
            className="w-full bg-red-600 text-white rounded-xl p-4 font-bold"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  );
}