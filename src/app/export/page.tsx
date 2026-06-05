"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ExportPage() {
  async function exporterFacturesCSV() {
    const { data, error } = await supabase.from("factures").select("*");

    if (error) {
      alert(error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Aucune facture à exporter");
      return;
    }

    const lignes = [
      ["Organisme", "Catégorie", "Montant", "Date limite", "Statut"],
      ...data.map((facture) => [
        facture.organisme,
        facture.categorie,
        facture.montant,
        facture.date_limite,
        facture.statut,
      ]),
    ];

    const csv = lignes.map((ligne) => ligne.join(";")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");
    lien.href = url;
    lien.download = "factures-home-manager.csv";
    lien.click();

    URL.revokeObjectURL(url);
  }

  async function exporterDocumentsCSV() {
    const { data, error } = await supabase.from("documents").select("*");

    if (error) {
      alert(error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Aucun document à exporter");
      return;
    }

    const lignes = [
      ["Nom", "Catégorie", "Chemin", "Date"],
      ...data.map((document) => [
        document.nom,
        document.categorie,
        document.chemin,
        document.created_at,
      ]),
    ];

    const csv = lignes.map((ligne) => ligne.join(";")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");
    lien.href = url;
    lien.download = "documents-home-manager.csv";
    lien.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">← Retour</Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">📤 Export</h1>

        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <button
            onClick={exporterFacturesCSV}
            className="w-full bg-blue-600 text-white rounded-xl p-4 font-bold"
          >
            📄 Exporter les factures CSV
          </button>

          <button
            onClick={exporterDocumentsCSV}
            className="w-full bg-slate-200 rounded-xl p-4 font-bold"
          >
            📁 Exporter les documents CSV
          </button>
        </div>
      </div>
    </main>
  );
}