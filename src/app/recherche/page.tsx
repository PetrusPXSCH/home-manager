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

type DocumentItem = {
  id: number;
  nom: string;
  categorie: string;
  chemin: string;
};

export default function RecherchePage() {
  const [recherche, setRecherche] = useState("");
  const [factures, setFactures] = useState<Facture[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    const { data: facturesData } = await supabase.from("factures").select("*");
    const { data: documentsData } = await supabase.from("documents").select("*");

    setFactures(facturesData || []);
    setDocuments(documentsData || []);
  }

  async function ouvrirDocument(chemin: string) {
    const { data, error } = await supabase.storage
      .from("Documents")
      .createSignedUrl(chemin, 60);

    if (error) {
      alert(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  const facturesFiltrees = factures.filter((facture) =>
    `${facture.organisme} ${facture.categorie} ${facture.statut}`
      .toLowerCase()
      .includes(recherche.toLowerCase())
  );

  const documentsFiltres = documents.filter((document) =>
    `${document.nom} ${document.categorie}`
      .toLowerCase()
      .includes(recherche.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">← Retour</Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">🔎 Recherche globale</h1>

        <input
          className="w-full border rounded-xl p-3 mb-6"
          placeholder="Rechercher EDF, cantine, assurance..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />

        <section className="bg-white rounded-2xl shadow p-5 mb-6">
          <h2 className="text-xl font-bold mb-4">📄 Factures</h2>

          <div className="space-y-3">
            {facturesFiltrees.map((facture) => (
              <div key={facture.id} className="border rounded-xl p-3">
                <p className="font-bold">{facture.organisme}</p>
                <p className="text-gray-500">{facture.categorie}</p>
                <p className="font-semibold">{Number(facture.montant).toFixed(2)} €</p>
                <p className="text-sm">{facture.date_limite} — {facture.statut}</p>
              </div>
            ))}
          </div>

          {facturesFiltrees.length === 0 && (
            <p className="text-gray-500">Aucune facture trouvée.</p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-4">📁 Documents</h2>

          <div className="space-y-3">
            {documentsFiltres.map((document) => (
              <div key={document.id} className="border rounded-xl p-3">
                <p className="font-bold">{document.nom}</p>
                <p className="text-gray-500">{document.categorie}</p>

                <button
                  onClick={() => ouvrirDocument(document.chemin)}
                  className="text-blue-600 font-semibold mt-2"
                >
                  👁 Voir
                </button>
              </div>
            ))}
          </div>

          {documentsFiltres.length === 0 && (
            <p className="text-gray-500">Aucun document trouvé.</p>
          )}
        </section>
      </div>
    </main>
  );
}