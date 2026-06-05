"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const categories = ["Assurances", "Banque", "Santé", "Impôts", "Maison", "Véhicules", "Enfants"];

export default function AjouterDocumentPage() {
  const router = useRouter();

  const [categorie, setCategorie] = useState(categories[0]);
  const [fichier, setFichier] = useState<File | null>(null);
  const [chargement, setChargement] = useState(false);

  async function envoyerDocument() {
    if (!fichier) {
      alert("Choisis un fichier");
      return;
    }

    setChargement(true);

    const chemin = `${categorie}/${Date.now()}-${fichier.name}`;

    const { error: uploadError } = await supabase.storage
      .from("Documents")
      .upload(chemin, fichier);

    if (uploadError) {
      alert(uploadError.message);
      setChargement(false);
      return;
    }

    const { error } = await supabase.from("documents").insert({
      nom: fichier.name,
      categorie,
      chemin,
    });

    if (error) {
      alert(error.message);
      setChargement(false);
      return;
    }

    router.push("/documents");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">← Retour</Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">📎 Ajouter un document</h1>

        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <select
            className="w-full border rounded-xl p-3"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            type="file"
            className="w-full border rounded-xl p-3"
            onChange={(e) => setFichier(e.target.files?.[0] || null)}
          />

          <button
            onClick={envoyerDocument}
            disabled={chargement}
            className="w-full bg-blue-600 text-white rounded-xl p-4 font-bold"
          >
            {chargement ? "Envoi..." : "📤 Envoyer"}
          </button>
        </div>
      </div>
    </main>
  );
}