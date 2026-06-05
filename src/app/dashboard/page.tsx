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

function convertirDate(date: string) {
  return new Date(date);
}

export default function DashboardPage() {
  const [factures, setFactures] = useState<Facture[]>([]);

  useEffect(() => {
    chargerFactures();
  }, []);

  async function chargerFactures() {
    const { data, error } = await supabase
      .from("factures")
      .select("*")
      .order("date_limite", { ascending: false });

    if (error) {
      alert("Erreur Supabase : " + error.message);
      return;
    }

    setFactures(data || []);
  }

  const aujourdHui = new Date();
  const total = factures.reduce((s, f) => s + Number(f.montant), 0);
  const payees = factures.filter((f) => f.statut === "Payée");
  const enRetard = factures.filter((f) => convertirDate(f.date_limite) < aujourdHui && f.statut !== "Payée");

  const dans7Jours = factures.filter((f) => {
    const diff = (convertirDate(f.date_limite).getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && f.statut !== "Payée";
  });

  const totauxParCategorie = factures.reduce<Record<string, number>>((acc, f) => {
    acc[f.categorie] = (acc[f.categorie] || 0) + Number(f.montant);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">← Retour</Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">📊 Tableau de bord</h1>

        <div className="bg-blue-600 text-white rounded-2xl shadow p-6 mb-5">
          <p className="text-sm opacity-80">Dépenses totales</p>
          <p className="text-4xl font-bold mt-2">{total.toFixed(2)} €</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-100 rounded-2xl shadow p-4">
            <p className="text-red-700 font-bold">🚨 Retard</p>
            <p className="text-3xl font-bold text-red-600">{enRetard.length}</p>
          </div>

          <div className="bg-orange-100 rounded-2xl shadow p-4">
            <p className="text-orange-700 font-bold">⚠️ 7 jours</p>
            <p className="text-3xl font-bold text-orange-600">{dans7Jours.length}</p>
          </div>

          <div className="bg-green-100 rounded-2xl shadow p-4">
            <p className="text-green-700 font-bold">🟢 Payées</p>
            <p className="text-xl font-bold text-green-600">
              {payees.reduce((s, f) => s + Number(f.montant), 0).toFixed(2)} €
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500">📄 Factures</p>
            <p className="text-2xl font-bold">{factures.length}</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-4">📊 Par catégorie</h2>
          {Object.entries(totauxParCategorie).map(([categorie, montant]) => (
            <div key={categorie} className="flex justify-between border-b py-2">
              <span>{categorie}</span>
              <strong>{montant.toFixed(2)} €</strong>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}