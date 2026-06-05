"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Facture = {
  id: number;
  organisme: string;
  date_limite: string;
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

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [connecte, setConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [alertes, setAlertes] = useState<Facture[]>([]);

  useEffect(() => {
    initialiser();
  }, []);

  async function initialiser() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setConnecte(false);
      setChargement(false);
      return;
    }

    setConnecte(true);
    setEmail(data.session.user.email ?? null);
    await chargerAlertes();
    setChargement(false);
  }

  async function chargerAlertes() {
    const { data } = await supabase
      .from("factures")
      .select("*")
      .order("date_limite", { ascending: true });

    if (!data) return;

    const urgentes = data.filter((facture) => {
      if (facture.statut === "Payée") return false;
      return joursAvant(facture.date_limite) <= 7;
    });

    setAlertes(urgentes);
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
    setEmail(null);
    setConnecte(false);
  }

  if (chargement) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="font-semibold">Chargement...</p>
      </main>
    );
  }

  if (!connecte) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-md mx-auto">

          <h1 className="text-4xl font-bold text-center text-blue-700 mt-12">
            🏠 Home Manager
          </h1>

          <p className="text-center text-gray-500 mt-2 mb-8">
            Factures, budget et documents familiaux
          </p>

          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              🔐 Connexion obligatoire
            </h2>

            <p className="text-gray-500 mb-6">
              Connecte-toi pour accéder à Home Manager.
            </p>

            <Link
              href="/connexion"
              className="block bg-blue-600 text-white rounded-xl p-4 font-bold"
            >
              Se connecter
            </Link>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">

        <h1 className="text-4xl font-bold text-center text-blue-700 mt-4">
          🏠 Home Manager
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Factures, budget et documents familiaux
        </p>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            Connecté : {email}
          </p>

          <button
            onClick={seDeconnecter}
            className="text-red-600 font-semibold mt-1"
          >
            Se déconnecter
          </button>
        </div>

        {alertes.length > 0 && (
          <Link
            href="/notifications"
            className="block bg-red-100 border border-red-300 rounded-2xl p-5 mb-6"
          >
            <h2 className="text-xl font-bold text-red-700 mb-3">
              🔔 {alertes.length} notification(s)
            </h2>

            <div className="space-y-2">
              {alertes.slice(0, 3).map((facture) => {
                const jours = joursAvant(facture.date_limite);

                return (
                  <div
                    key={facture.id}
                    className="flex justify-between"
                  >
                    <span>{facture.organisme}</span>

                    <span className="font-semibold">
                      {jours < 0
                        ? `${Math.abs(jours)} j. retard`
                        : jours === 0
                        ? "Aujourd'hui"
                        : `Dans ${jours} j.`}
                    </span>
                  </div>
                );
              })}
            </div>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-4">

          <Link href="/dashboard" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📊<br />Tableau
          </Link>

          <Link href="/budget" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            💶<br />Budget
          </Link>

          <Link href="/statistiques" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📈<br />Statistiques
          </Link>

          <Link href="/notifications" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            🔔<br />Notifications
          </Link>

          <Link href="/calendrier" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📅<br />Calendrier
          </Link>

          <Link href="/factures" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📄<br />Factures
          </Link>

          <Link href="/ajouter-facture" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            ➕<br />Facture
          </Link>

          <Link href="/ocr" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📷<br />OCR
          </Link>

          <Link href="/documents" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📁<br />Documents
          </Link>

          <Link href="/ajouter-document" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📎<br />Document
          </Link>

          <Link href="/recherche" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            🔎<br />Recherche
          </Link>

          <Link href="/export" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📤<br />Export
          </Link>

          <Link href="/export-pdf" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            📄<br />PDF
          </Link>

          <Link href="/parametres" className="bg-white rounded-2xl shadow p-5 text-center font-bold">
            ⚙️<br />Réglages
          </Link>

        </div>

      </div>
    </main>
  );
}