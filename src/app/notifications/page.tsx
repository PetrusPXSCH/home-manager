"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Facture = {
  id: number;
  organisme: string;
  date_limite: string;
  montant: number;
  statut: string;
};

function joursAvant(date: string) {
  const aujourdHui = new Date();
  const limite = new Date(date);

  return Math.ceil(
    (limite.getTime() - aujourdHui.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export default function NotificationsPage() {
  const [factures, setFactures] = useState<Facture[]>([]);

  useEffect(() => {
    chargerFactures();
  }, []);

  async function chargerFactures() {
    const { data } = await supabase
      .from("factures")
      .select("*")
      .order("date_limite");

    setFactures(data || []);
  }

  const alertes = factures.filter((facture) => {
    if (facture.statut === "Payée") return false;

    return joursAvant(facture.date_limite) <= 7;
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">

        <Link
          href="/"
          className="text-blue-600"
        >
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">
          🔔 Notifications
        </h1>

        <div className="space-y-4">

          {alertes.map((facture) => {
            const jours = joursAvant(facture.date_limite);

            return (
              <div
                key={facture.id}
                className={`rounded-2xl shadow p-5 ${
                  jours < 0
                    ? "bg-red-100"
                    : jours <= 2
                    ? "bg-orange-100"
                    : "bg-yellow-100"
                }`}
              >
                <h2 className="font-bold text-xl">
                  {facture.organisme}
                </h2>

                <p>
                  {Number(facture.montant).toFixed(2)} €
                </p>

                <p className="mt-2">
                  {jours < 0
                    ? `🚨 ${Math.abs(jours)} jour(s) de retard`
                    : jours === 0
                    ? "⚠️ Aujourd'hui"
                    : `⚠️ Dans ${jours} jour(s)`}
                </p>
              </div>
            );
          })}

          {alertes.length === 0 && (
            <div className="bg-green-100 rounded-2xl shadow p-5">
              <h2 className="font-bold text-xl">
                ✅ Tout est à jour
              </h2>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}