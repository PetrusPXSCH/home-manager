"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Facture = {
  id: number;
  organisme: string;
  categorie: string;
  montant: number;
  date_limite: string;
  statut: string;
};

export default function StatistiquesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);

  useEffect(() => {
    chargerFactures();
  }, []);

  async function chargerFactures() {
    const { data, error } = await supabase
      .from("factures")
      .select("*");

    if (error) {
      alert(error.message);
      return;
    }

    setFactures(data || []);
  }

  const total = factures.reduce(
    (somme, facture) => somme + Number(facture.montant),
    0
  );

  const payees = factures
    .filter((facture) => facture.statut === "Payée")
    .reduce((somme, facture) => somme + Number(facture.montant), 0);

  const aPayer = factures
    .filter((facture) => facture.statut === "À payer")
    .reduce((somme, facture) => somme + Number(facture.montant), 0);

  const enRetard = factures
    .filter((facture) => facture.statut === "En retard")
    .reduce((somme, facture) => somme + Number(facture.montant), 0);

  const parCategorie = factures.reduce<Record<string, number>>(
    (acc, facture) => {
      acc[facture.categorie] =
        (acc[facture.categorie] || 0) + Number(facture.montant);

      return acc;
    },
    {}
  );

  const plusGrosseCategorie = Math.max(
    ...Object.values(parCategorie),
    1
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">
          📊 Statistiques
        </h1>

        <div className="bg-blue-600 text-white rounded-2xl shadow p-6 mb-5">
          <p className="text-sm opacity-80">Total factures</p>
          <p className="text-4xl font-bold mt-2">
            {total.toFixed(2)} €
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-100 rounded-2xl shadow p-4">
            <p className="text-green-700 font-bold">Payées</p>
            <p className="text-2xl font-bold text-green-600">
              {payees.toFixed(2)} €
            </p>
          </div>

          <div className="bg-orange-100 rounded-2xl shadow p-4">
            <p className="text-orange-700 font-bold">À payer</p>
            <p className="text-2xl font-bold text-orange-600">
              {aPayer.toFixed(2)} €
            </p>
          </div>

          <div className="bg-red-100 rounded-2xl shadow p-4">
            <p className="text-red-700 font-bold">En retard</p>
            <p className="text-2xl font-bold text-red-600">
              {enRetard.toFixed(2)} €
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500">Nombre</p>
            <p className="text-2xl font-bold">
              {factures.length}
            </p>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-4">
            Dépenses par catégorie
          </h2>

          <div className="space-y-4">
            {Object.entries(parCategorie).map(([categorie, montant]) => {
              const largeur = (montant / plusGrosseCategorie) * 100;

              return (
                <div key={categorie}>
                  <div className="flex justify-between mb-1">
                    <span>{categorie}</span>
                    <strong>{montant.toFixed(2)} €</strong>
                  </div>

                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${largeur}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}