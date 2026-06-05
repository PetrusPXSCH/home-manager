import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image manquante" },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analyse cette facture française.

Retourne uniquement un JSON valide, sans texte autour :

{
  "organisme": "",
  "montant": 0,
  "date_limite": "YYYY-MM-DD",
  "categorie": ""
}

Catégories possibles :
Maison, Électricité, Eau, Assurance, Internet, Voiture, Santé, Impôts, Enfants, Cantine, Centre de loisirs, École, Activités sportives, Banque, Crédit, Téléphone, Courses, Autres.

Si tu n'es pas sûr, choisis "Autres".
              `,
            },
            {
              type: "input_image",
              image_url: image,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const texte = response.output_text.trim();

    const debut = texte.indexOf("{");
    const fin = texte.lastIndexOf("}");

    if (debut === -1 || fin === -1) {
      return NextResponse.json(
        { error: "Réponse OCR invalide" },
        { status: 500 }
      );
    }

    const json = texte.slice(debut, fin + 1);
    const resultat = JSON.parse(json);

    return NextResponse.json(resultat);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur OCR" },
      { status: 500 }
    );
  }
}