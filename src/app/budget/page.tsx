"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { mois } from "../data/mois";

type Facture = {
  id: number;
  categorie: string;
  montant: number;
  date_limite: string;
  statut: string;
};

type Revenu = {
  id: number;
  mois: string;
  montant: number;
};

export default function BudgetPage() {
  const moisActuel = mois[new Date().getMonth()];
  const [moisSelectionne, setMoisSelectionne] = useState(moisActuel);
  const [revenu, setRevenu] = useState("");
  const [revenus, setRevenus] = useState<Revenu[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    const { data: revenusData } = await supabase.from("revenus").select("*");
    const { data: facturesData } = await supabase.from("factures").select("*");

    setRevenus(revenusData || []);
    setFactures(facturesData || []);
  }

  async function ajouterRevenu() {
    if (!revenu) {
      alert("Entre un montant");
      return;
    }

    await supabase.from("revenus").insert({
      mois: moisSelectionne,
      montant: Number(revenu),
    });

    setRevenu("");
    chargerDonnees();
  }

  const revenusDuMois = revenus.filter((r) => r.mois === moisSelectionne);
  const totalRevenus = revenusDuMois.reduce((s, r) => s + Number(r.montant), 0);

  const facturesDuMois = factures.filter((f) => {
    const date = new Date(f.date_limite);
    return mois[date.getMonth()] === moisSelectionne;
  });

  const totalFactures = facturesDuMois.reduce((s, f) => s + Number(f.montant), 0);
  const reste = totalRevenus - totalFactures;

  const parCategorie = facturesDuMois.reduce<Record<string, number>>((acc, f) => {
    acc[f.categorie] = (acc[f.categorie] || 0) + Number(f.montant);
    return acc;
  }, {});

  const plusGrosseCategorie = Math.max(...Object.values(parCategorie), 1);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">← Retour</Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">💶 Budget familial</h1>

        <div className="bg-white rounded-2xl shadow p-5 space-y-4 mb-6">
          <select
            className="w-full border rounded-xl p-3"
            value={moisSelectionne}
            onChange={(e) => setMoisSelectionne(e.target.value)}
          >
            {mois.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Ajouter un revenu du mois"
            className="w-full border rounded-xl p-3"
            value={revenu}
            onChange={(e) => setRevenu(e.target.value)}
          />

          <button
            onClick={ajouterRevenu}
            className="w-full bg-blue-600 text-white rounded-xl p-4 font-bold"
          >
            ➕ Ajouter revenu
          </button>
        </div>

        <div
          className={`text-white rounded-2xl shadow p-6 mb-5 ${
            reste >= 0 ? "bg-blue-600" : "bg-red-600"
          }`}
        >
          <p className="text-sm opacity-80">Reste à vivre</p>
          <p className="text-4xl font-bold mt-2">{reste.toFixed(2)} €</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-100 rounded-2xl shadow p-4">
            <p className="text-green-700 font-bold">Revenus</p>
            <p className="text-2xl font-bold text-green-600">
              {totalRevenus.toFixed(2)} €
            </p>
          </div>

          <div className="bg-red-100 rounded-2xl shadow p-4">
            <p className="text-red-700 font-bold">Factures</p>
            <p className="text-2xl font-bold text-red-600">
              {totalFactures.toFixed(2)} €
            </p>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow p-5 mb-6">
          <h2 className="text-xl font-bold mb-4">📊 Dépenses par catégorie</h2>

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

          {Object.keys(parCategorie).length === 0 && (
            <p className="text-gray-500">Aucune dépense ce mois-ci.</p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-4">📄 Factures du mois</h2>

          <div className="space-y-3">
            {facturesDuMois.map((facture) => (
              <div key={facture.id} className="flex justify-between border-b pb-2">
                <span>{facture.categorie}</span>
                <strong>{Number(facture.montant).toFixed(2)} €</strong>
              </div>
            ))}
          </div>

          {facturesDuMois.length === 0 && (
            <p className="text-gray-500">Aucune facture pour ce mois.</p>
          )}
        </section>
      </div>
    </main>
  );
}