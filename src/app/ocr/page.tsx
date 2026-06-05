"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { categories } from "../data/categories";

export default function OCRPage() {
  const [image, setImage] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const [organisme, setOrganisme] = useState("");
  const [montant, setMontant] = useState("");
  const [dateLimite, setDateLimite] = useState("");
  const [categorie, setCategorie] = useState("Autres");
  const [statut, setStatut] = useState("À vérifier");

  function choisirImage(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];

    if (!fichier) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(fichier);
  }

  async function analyserFacture() {
    if (!image) {
      alert("Ajoute d'abord une image");
      return;
    }

    setChargement(true);

    const reponse = await fetch("/api/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    const data = await reponse.json();

    setChargement(false);

    if (!reponse.ok) {
      alert(data.error || "Erreur OCR");
      return;
    }

    setOrganisme(data.organisme || "");
    setMontant(String(data.montant || ""));
    setDateLimite(data.date_limite || "");
    setCategorie(data.categorie || "Autres");
  }

  async function creerFacture() {
    if (!organisme || !montant || !dateLimite) {
      alert("Organisme, montant et date sont obligatoires");
      return;
    }

    const { error } = await supabase.from("factures").insert({
      organisme,
      categorie,
      montant: Number(montant),
      date_limite: dateLimite,
      statut,
      fichier: image,
      nom_fichier: "facture-ocr.png",
    });

    if (error) {
      alert("Erreur Supabase : " + error.message);
      return;
    }

    alert("Facture créée !");
    setImage(null);
    setOrganisme("");
    setMontant("");
    setDateLimite("");
    setCategorie("Autres");
    setStatut("À vérifier");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">
          📷 Scanner une facture
        </h1>

        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={choisirImage}
            className="w-full border rounded-xl p-3"
          />

          {image && (
            <img
              src={image}
              alt="Facture"
              className="w-full rounded-xl border"
            />
          )}

          <button
            onClick={analyserFacture}
            disabled={chargement}
            className="w-full bg-blue-600 text-white rounded-xl p-4 font-bold"
          >
            {chargement ? "Analyse..." : "📷 Analyser la facture"}
          </button>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Organisme"
            value={organisme}
            onChange={(e) => setOrganisme(e.target.value)}
          />

          <input
            className="w-full border rounded-xl p-3"
            type="number"
            step="0.01"
            placeholder="Montant"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
          />

          <input
            className="w-full border rounded-xl p-3"
            type="date"
            value={dateLimite}
            onChange={(e) => setDateLimite(e.target.value)}
          />

          <select
            className="w-full border rounded-xl p-3"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
          >
            {categories.map((categorie) => (
              <option key={categorie}>{categorie}</option>
            ))}
          </select>

          <select
            className="w-full border rounded-xl p-3"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
          >
            <option>À vérifier</option>
            <option>À payer</option>
            <option>Payée</option>
            <option>En retard</option>
          </select>

          <button
            onClick={creerFacture}
            className="w-full bg-green-600 text-white rounded-xl p-4 font-bold"
          >
            ✅ Créer la facture
          </button>
        </div>
      </div>
    </main>
  );
}