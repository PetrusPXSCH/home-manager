import { supabase } from "./supabase";

export async function uploaderDocument(
  fichier: File,
  categorie: string
) {
  const nomFichier = `${Date.now()}-${fichier.name}`;

  const chemin = `${categorie}/${nomFichier}`;

  const { error } = await supabase.storage
    .from("Documents")
    .upload(chemin, fichier);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("Documents")
    .getPublicUrl(chemin);

  return {
    nom: fichier.name,
    categorie,
    chemin,
    url: data.publicUrl,
  };
}