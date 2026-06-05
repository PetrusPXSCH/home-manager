"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { categories } from "../data/categories";

export default function AjouterFacturePage() {
  const router = useRouter();

  const [organisme, setOrganisme] = useState("");
  const [categorie, setCategorie] = useState(categories[0]);
  const [montant, setMontant] = useState("");
  const [dateLimite, setDateLimite] = useState("");
  const [statut, setStatut] = useState("À payer");
  const [fichier, setFichier] = useState<string | null>(null);
  const [nomFichier, setNomFichier] = useState("");

  function choisirFichier(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const fichierChoisi = e.target.files?.[0];

    if (!fichierChoisi) return;

    setNomFichier(fichierChoisi.name);

    const reader = new FileReader();

    reader.onload = () => {
      setFichier(reader.result as string);
    };

    reader.readAsDataURL(fichierChoisi);
  }

  async function enregistrerFacture() {
    if (
      !organisme ||
      !montant ||
      !dateLimite
    ) {
      alert("Tous les champs sont obligatoires");
      return;
    }

    const { error } = await supabase
      .from("factures")
      .insert({
        organisme,
        categorie,
        montant: Number(montant),
        date_limite: dateLimite,
        statut,
        fichier,
        nom_fichier: nomFichier,
      });

    if (error) {
      alert("Erreur Supabase : " + error.message);
      return;
    }

    router.push("/factures");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">

        <Link href="/" className="text-blue-600">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">
          ➕ Ajouter une facture
        </h1>

        <div className="bg-white rounded-2xl shadow p-5 space-y-4">

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Organisme"
            value={organisme}
            onChange={(e) =>
              setOrganisme(e.target.value)
            }
          />

          <select
            className="w-full border rounded-xl p-3"
            value={categorie}
            onChange={(e) =>
              setCategorie(e.target.value)
            }
          >
            {categories.map((categorie) => (
              <option key={categorie}>
                {categorie}
              </option>
            ))}
          </select>

          <input
            className="w-full border rounded-xl p-3"
            type="number"
            step="0.01"
            placeholder="Montant"
            value={montant}
            onChange={(e) =>
              setMontant(e.target.value)
            }
          />

          <input
            className="w-full border rounded-xl p-3"
            type="date"
            value={dateLimite}
            onChange={(e) =>
              setDateLimite(e.target.value)
            }
          />

          <select
            className="w-full border rounded-xl p-3"
            value={statut}
            onChange={(e) =>
              setStatut(e.target.value)
            }
          >
            <option>À vérifier</option>
            <option>À payer</option>
            <option>Payée</option>
            <option>En retard</option>
          </select>

          <input
            type="file"
            accept="image/*,.pdf"
            className="w-full border rounded-xl p-3"
            onChange={choisirFichier}
          />

          {nomFichier && (
            <p className="text-sm text-gray-500">
              Fichier : {nomFichier}
            </p>
          )}

          <button
            onClick={enregistrerFacture}
            className="w-full bg-blue-600 text-white rounded-xl p-4 font-bold"
          >
            💾 Enregistrer
          </button>

        </div>
      </div>
    </main>
  );
}