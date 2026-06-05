export type Facture = {
  id: number;
  organisme: string;
  categorie: string;
  montant: number;
  date_limite: string;
  statut: string;
  fichier?: string;
  nom_fichier?: string;
};