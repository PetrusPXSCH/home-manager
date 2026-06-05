"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConnexionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  async function creerCompte() {
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Compte créé. Vérifie ton email si Supabase demande une confirmation.");
  }

  async function seConnecter() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mt-6 mb-6">🔐 Connexion</h1>

        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-xl p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border rounded-xl p-3"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />

          <button
            onClick={seConnecter}
            className="w-full bg-blue-600 text-white rounded-xl p-4 font-bold"
          >
            Se connecter
          </button>

          <button
            onClick={creerCompte}
            className="w-full bg-slate-200 rounded-xl p-4 font-bold"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </main>
  );
}