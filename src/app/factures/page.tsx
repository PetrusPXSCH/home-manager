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
  fichier?: string;
  nom_fichier?: string;
};

const moisFrancais = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function convertirDate(date: string) {
  return new Date(date);
}

function couleurStatut(statut: string) {
  if (statut === "Payée") return "bg-green-500";
  if (statut === "À payer") return "bg-orange-500";
  if (statut === "En retard") return "bg-red-500";
  return "bg-blue-500";
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [anneesOuvertes, setAnneesOuvertes] = useState<string[]>([]);
  const [moisOuverts, setMoisOuverts] = useState<string[]>([]);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [factureEnEdition, setFactureEnEdition] = useState<Facture | null>(null);

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

    if (data && data.length > 0) {
      const premiereAnnee = String(new Date(data[0].date_limite).getFullYear());
      setAnneesOuvertes([premiereAnnee]);

      const premierMois = moisFrancais[new Date(data[0].date_limite).getMonth()];
      setMoisOuverts([`${premiereAnnee}-${premierMois}`]);
    }
  }

  async function supprimerFacture(id: number) {
    const { error } = await supabase.from("factures").delete().eq("id", id);

    if (error) {
      alert("Erreur Supabase : " + error.message);
      return;
    }

    setFactures(factures.filter((facture) => facture.id !== id));
  }

  async function modifierFacture() {
    if (!factureEnEdition) return;

    const { error } = await supabase
      .from("factures")
      .update({
        organisme: factureEnEdition.organisme,
        categorie: factureEnEdition.categorie,
        montant: Number(factureEnEdition.montant),
        date_limite: factureEnEdition.date_limite,
        statut: factureEnEdition.statut,
      })
      .eq("id", factureEnEdition.id);

    if (error) {
      alert("Erreur Supabase : " + error.message);
      return;
    }

    setFactureEnEdition(null);
    chargerFactures();
  }

  function basculerAnnee(annee: string) {
    setAnneesOuvertes((actuelles) =>
      actuelles.includes(annee)
        ? actuelles.filter((a) => a !== annee)
        : [...actuelles, annee]
    );
  }

  function basculerMois(cle: string) {
    setMoisOuverts((actuels) =>
      actuels.includes(cle)
        ? actuels.filter((m) => m !== cle)
        : [...actuels, cle]
    );
  }

  const facturesFiltrees = factures.filter((f) => {
    const matchRecherche =
      f.organisme.toLowerCase().includes(recherche.toLowerCase()) ||
      f.categorie.toLowerCase().includes(recherche.toLowerCase());

    const matchStatut = filtreStatut === "Tous" || f.statut === filtreStatut;

    return matchRecherche && matchStatut;
  });

  const facturesParAnneeMois = facturesFiltrees.reduce<
    Record<string, Record<string, Facture[]>>
  >((groupes, facture) => {
    const date = convertirDate(facture.date_limite);
    const annee = String(date.getFullYear());
    const mois = moisFrancais[date.getMonth()];

    if (!groupes[annee]) groupes[annee] = {};
    if (!groupes[annee][mois]) groupes[annee][mois] = [];

    groupes[annee][mois].push(facture);
    return groupes;
  }, {});

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600">← Retour</Link>

        <h1 className="text-3xl font-bold mt-6 mb-6">📄 Factures</h1>

        <div className="bg-white rounded-2xl shadow p-4 mb-6 space-y-3">
          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="w-full border rounded-xl p-3"
          >
            <option>Tous</option>
            <option>À vérifier</option>
            <option>À payer</option>
            <option>Payée</option>
            <option>En retard</option>
          </select>
        </div>

        <div className="space-y-5">
          {Object.entries(facturesParAnneeMois).map(([annee, moisGroupes]) => {
            const anneeOuverte = anneesOuvertes.includes(annee);
            const totalAnnee = Object.values(moisGroupes)
              .flat()
              .reduce((s, f) => s + Number(f.montant), 0);

            return (
              <section key={annee} className="bg-white rounded-2xl shadow">
                <button
                  onClick={() => basculerAnnee(annee)}
                  className="w-full p-5 flex justify-between items-center"
                >
                  <div className="text-left">
                    <h2 className="text-2xl font-bold">📆 {annee}</h2>
                    <p className="text-sm text-gray-500">
                      Total année : {totalAnnee.toFixed(2)} €
                    </p>
                  </div>

                  <span className="text-2xl">{anneeOuverte ? "▼" : "▶"}</span>
                </button>

                {anneeOuverte && (
                  <div className="px-4 pb-4 space-y-4">
                    {Object.entries(moisGroupes).map(([mois, facturesDuMois]) => {
                      const cleMois = `${annee}-${mois}`;
                      const moisOuvert = moisOuverts.includes(cleMois);
                      const totalMois = facturesDuMois.reduce(
                        (s, f) => s + Number(f.montant),
                        0
                      );

                      return (
                        <section key={cleMois} className="border rounded-2xl">
                          <button
                            onClick={() => basculerMois(cleMois)}
                            className="w-full p-4 flex justify-between items-center"
                          >
                            <div className="text-left">
                              <h3 className="text-xl font-bold">📅 {mois}</h3>
                              <p className="text-sm text-gray-500">
                                {facturesDuMois.length} facture(s) —{" "}
                                {totalMois.toFixed(2)} €
                              </p>
                            </div>

                            <span>{moisOuvert ? "▼" : "▶"}</span>
                          </button>

                          {moisOuvert && (
                            <div className="p-4 pt-0 space-y-4">
                              {facturesDuMois.map((facture) => (
                                <div
                                  key={facture.id}
                                  className="bg-slate-50 rounded-2xl p-4"
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="font-bold">
                                        {facture.organisme}
                                      </h4>
                                      <p className="text-gray-500">
                                        {facture.categorie}
                                      </p>
                                    </div>

                                    <p className="font-bold">
                                      {Number(facture.montant).toFixed(2)} €
                                    </p>
                                  </div>

                                  <div className="mt-4 flex justify-between items-center">
                                    <p className="text-sm text-gray-500">
                                      Échéance : {facture.date_limite}
                                    </p>

                                    <span
                                      className={`text-sm px-3 py-1 rounded-full text-white font-semibold ${couleurStatut(
                                        facture.statut
                                      )}`}
                                    >
                                      {facture.statut}
                                    </span>
                                  </div>

                                  {facture.fichier && (
                                    <a
                                      href={facture.fichier}
                                      target="_blank"
                                      className="block mt-4 text-blue-600 font-semibold"
                                    >
                                      📎 Voir la facture
                                    </a>
                                  )}

                                  <div className="mt-4 flex gap-4">
                                    <button
                                      onClick={() => setFactureEnEdition(facture)}
                                      className="text-blue-600 font-semibold"
                                    >
                                      ✏️ Modifier
                                    </button>

                                    <button
                                      onClick={() => supprimerFacture(facture.id)}
                                      className="text-red-600 font-semibold"
                                    >
                                      🗑 Supprimer
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {facturesFiltrees.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            Aucune facture trouvée.
          </p>
        )}

        {factureEnEdition && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow p-5 w-full max-w-md space-y-4">
              <h2 className="text-2xl font-bold">✏️ Modifier la facture</h2>

              <input
                className="w-full border rounded-xl p-3"
                value={factureEnEdition.organisme}
                onChange={(e) =>
                  setFactureEnEdition({
                    ...factureEnEdition,
                    organisme: e.target.value,
                  })
                }
              />

              <select
                className="w-full border rounded-xl p-3"
                value={factureEnEdition.categorie}
                onChange={(e) =>
                  setFactureEnEdition({
                    ...factureEnEdition,
                    categorie: e.target.value,
                  })
                }
              >
                <option>Maison</option>
                <option>Électricité</option>
                <option>Eau</option>
                <option>Assurance</option>
                <option>Cantine</option>
                <option>Enfants</option>
                <option>Voiture</option>
                <option>Impôts</option>
                <option>Santé</option>
                <option>Internet</option>
              </select>

              <input
                className="w-full border rounded-xl p-3"
                type="number"
                step="0.01"
                value={factureEnEdition.montant}
                onChange={(e) =>
                  setFactureEnEdition({
                    ...factureEnEdition,
                    montant: Number(e.target.value),
                  })
                }
              />

              <input
                className="w-full border rounded-xl p-3"
                type="date"
                value={factureEnEdition.date_limite}
                onChange={(e) =>
                  setFactureEnEdition({
                    ...factureEnEdition,
                    date_limite: e.target.value,
                  })
                }
              />

              <select
                className="w-full border rounded-xl p-3"
                value={factureEnEdition.statut}
                onChange={(e) =>
                  setFactureEnEdition({
                    ...factureEnEdition,
                    statut: e.target.value,
                  })
                }
              >
                <option>À vérifier</option>
                <option>À payer</option>
                <option>Payée</option>
                <option>En retard</option>
              </select>

              <div className="flex gap-3">
                <button
                  onClick={modifierFacture}
                  className="flex-1 bg-blue-600 text-white rounded-xl p-3 font-bold"
                >
                  💾 Sauvegarder
                </button>

                <button
                  onClick={() => setFactureEnEdition(null)}
                  className="flex-1 bg-slate-200 rounded-xl p-3 font-bold"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}