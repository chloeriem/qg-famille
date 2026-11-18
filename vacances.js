// Vacances scolaires zone C (académies de Créteil, Montpellier, Paris, Toulouse, Versailles), année 2026-2027.
// Source : calendrier officiel publié sur service-public.gouv.fr.
// du = premier jour sans école, au = veille de la reprise.
// nounouAuto: false = on ne suppose pas que la nounou garde Milan (à confirmer avec elle).
// Pour l'année 2027-2028 : demander à Claude « mets à jour les vacances scolaires ».
export const ZONE = "C";
export const MAJ = "2026-11-18";
export const PERIODES = [
  { id: "toussaint-2026", nom: "Toussaint", du: "2026-10-17", au: "2026-11-01" },
  { id: "noel-2026", nom: "Noël", du: "2026-12-19", au: "2027-01-03" },
  { id: "hiver-2027", nom: "Hiver", du: "2027-02-06", au: "2027-02-21" },
  { id: "printemps-2027", nom: "Printemps", du: "2027-04-03", au: "2027-04-18" },
  { id: "ascension-2027", nom: "Pont de l'Ascension", du: "2027-05-07", au: "2027-05-07", nounouAuto: false, note: "Pas d'école le vendredi 7 mai (jeudi 6 férié)." },
  { id: "ete-2027", nom: "Été", du: "2027-07-03", au: "2027-08-31", nounouAuto: false, note: "Congés d'été de la nounou à lui demander. Date de rentrée 2027 pas encore publiée." },
];
// Jours fériés de l'année scolaire (personne ne travaille, en principe)
export const FERIES = ["2026-11-11", "2026-12-25", "2027-01-01", "2027-03-29", "2027-05-01", "2027-05-06", "2027-05-08", "2027-05-17", "2027-07-14", "2027-08-15"];
