// Collectes des poubelles à La Ferté-Alais (calendrier Val d'Essonne 2026).
// On sort la poubelle la veille au soir.
// Pour 2027 : envoyer le nouveau calendrier à Claude dès qu'il est publié.
export const MAJ = "2026-11-16";
export const SORTES = {
  om: { nom: "Poubelle verte", detail: "Ordures ménagères", moment: "après-midi", couleur: "#2F8F3E", texte: "#FFFFFF" },
  emb: { nom: "Poubelle jaune", detail: "Emballages, papiers, journaux, magazines", moment: "matin", couleur: "#F5C400", texte: "#161616" },
};
export const COLLECTES = [
  // Ordures ménagères : lundi après-midi
  { d: "2026-11-16", s: "om" }, { d: "2026-11-30", s: "om" }, { d: "2026-12-14", s: "om" }, { d: "2026-12-28", s: "om" },
  // Emballages et papiers : mercredi matin
  { d: "2026-11-18", s: "emb" }, { d: "2026-11-25", s: "emb" }, { d: "2026-12-02", s: "emb" }, { d: "2026-12-09", s: "emb" },
  { d: "2026-12-16", s: "emb" }, { d: "2026-12-23", s: "emb" }, { d: "2026-12-30", s: "emb" },
].sort((a, b) => a.d.localeCompare(b.d));
