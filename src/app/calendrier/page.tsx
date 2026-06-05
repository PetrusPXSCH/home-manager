"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { mois } from "../data/mois";

type Facture = {
  id: number;
  organisme: string;
  categorie: string;
  montant: number;
  date_limite: string;
  statut: string;
};

function couleurStatut(statut: string) {
  if (statut === "Payée") return "bg-green-500";
  if (statut === "À payer") return "bg-orange-500";
  if (statut === "En retard") return "bg-red-500";
  return "bg-blue-500";
}

export default function CalendrierPage() {
  const moisActuel = mois[new Date().getMonth()];
  const [moisSelectionne, setMoisSelectionne] = useState(moisActuel);
  const [factures, setFactures] = useState<Facture[]>([]);

  useEffect(() => {
    chargerFactures();
  }, []);

  async function chargerFactures() {
    const { data, error } = await supabase
      .from("factures")
      .select("*")
      .order("date_limite", { ascending: true });

    if (error) {
      alert("Erreur Supabase : " + error.message);
      return;
    }

    setFactures(data || []);
  }

  const facturesDuMois = factures.filter((facture) => {
    const date = new Date(facture.date_limite);
    return mois[date.getMonth()] === moisSelectionne;
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">
          📅 Calendrier
        </h1>

        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <select
            className="w-full border rounded-xl p-3"
            value={moisSelectionne}
            onChange={(e) => setMoisSelectionne(e.target.value)}
          >
            {mois.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {facturesDuMois.map((facture) => {
            const date = new Date(facture.date_limite);
            const jour = date.getDate();

            return (
              <div
                key={facture.id}
                className="bg-white rounded-2xl shadow p-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      {jour} {moisSelectionne}
                    </p>

                    <h2 className="text-xl font-bold">
                      {facture.organisme}
                    </h2>

                    <p className="text-gray-500">
                      {facture.categorie}
                    </p>
                  </div>

                  <p className="font-bold">
                    {Number(facture.montant).toFixed(2)} €
                  </p>
                </div>

                <span
                  className={`inline-block mt-4 text-sm px-3 py-1 rounded-full text-white font-semibold ${couleurStatut(
                    facture.statut
                  )}`}
                >
                  {facture.statut}
                </span>
              </div>
            );
          })}
        </div>

        {facturesDuMois.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            Aucune échéance pour ce mois.
          </p>
        )}
      </div>
    </main>
  );
}