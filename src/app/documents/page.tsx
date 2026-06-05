"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DocumentItem = {
  id: number;
  nom: string;
  categorie: string;
  chemin: string;
  created_at: string;
};

const categories = ["Assurances", "Banque", "Santé", "Impôts", "Maison", "Véhicules", "Enfants"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    chargerDocuments();
  }, []);

  async function chargerDocuments() {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setDocuments(data || []);
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

  async function supprimerDocument(document: DocumentItem) {
    await supabase.storage.from("Documents").remove([document.chemin]);

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", document.id);

    if (error) {
      alert(error.message);
      return;
    }

    chargerDocuments();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">← Retour</Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">📁 Documents</h1>

        <Link
          href="/ajouter-document"
          className="block bg-blue-600 text-white rounded-2xl shadow p-4 text-center font-bold mb-6"
        >
          📎 Ajouter un document
        </Link>

        <div className="space-y-5">
          {categories.map((categorie) => {
            const docs = documents.filter((doc) => doc.categorie === categorie);

            return (
              <section key={categorie} className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-xl font-bold mb-4">📂 {categorie}</h2>

                {docs.length === 0 && (
                  <p className="text-gray-500">Aucun document</p>
                )}

                <div className="space-y-3">
                  {docs.map((doc) => (
                    <div key={doc.id} className="border rounded-xl p-3">
                      <p className="font-semibold">{doc.nom}</p>

                      <div className="flex gap-4 mt-3">
                        <button
                          onClick={() => ouvrirDocument(doc.chemin)}
                          className="text-blue-600 font-semibold"
                        >
                          👁 Voir
                        </button>

                        <button
                          onClick={() => supprimerDocument(doc)}
                          className="text-red-600 font-semibold"
                        >
                          🗑 Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}