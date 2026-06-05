"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportPDFPage() {
  async function genererPDF() {
    const { data: factures } = await supabase
      .from("factures")
      .select("*");

    const doc = new jsPDF();

    doc.setFontSize(20);

    doc.text("Home Manager", 20, 20);

    doc.setFontSize(14);

    doc.text("Liste des factures", 20, 35);

    autoTable(doc, {
      startY: 45,
      head: [["Organisme", "Catégorie", "Montant", "Date", "Statut"]],
      body:
        factures?.map((facture) => [
          facture.organisme,
          facture.categorie,
          `${Number(facture.montant).toFixed(2)} €`,
          facture.date_limite,
          facture.statut,
        ]) || [],
    });

    doc.save("HomeManager.pdf");
  }

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
          📄 Export PDF
        </h1>

        <div className="bg-white rounded-2xl shadow p-5">

          <button
            onClick={genererPDF}
            className="w-full bg-red-600 text-white rounded-xl p-4 font-bold"
          >
            📄 Générer le PDF
          </button>

        </div>

      </div>
    </main>
  );
}